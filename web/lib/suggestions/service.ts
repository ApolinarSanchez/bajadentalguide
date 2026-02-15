import { ClinicEditSuggestionStatus } from "@prisma/client";
import { logEvent } from "@/lib/events";
import { applySuggestionToClinic } from "@/lib/suggestions/applySuggestionToClinic";
import { db } from "@/lib/db";
import { validateClinicEditSuggestion } from "@/lib/suggestions/validateSuggestion";

type BaseServiceResult<T = void> =
  | {
      ok: true;
      status: number;
      data: T;
    }
  | {
      ok: false;
      status: number;
      errors: string[];
    };

export async function submitClinicEditSuggestion(args: {
  clinicSlug: string;
  payload: unknown;
  sessionId?: string | null;
}): Promise<BaseServiceResult<{ suggestionId: string }>> {
  const normalizedSlug = args.clinicSlug.trim();
  if (!normalizedSlug) {
    return {
      ok: false,
      status: 400,
      errors: ["Missing clinic slug."],
    };
  }

  const clinic = await db.clinic.findUnique({
    where: {
      slug: normalizedSlug,
    },
    select: {
      id: true,
    },
  });

  if (!clinic) {
    return {
      ok: false,
      status: 404,
      errors: ["Clinic not found."],
    };
  }

  const validated = validateClinicEditSuggestion(args.payload);
  if (!validated.ok) {
    return {
      ok: false,
      status: 400,
      errors: validated.errors,
    };
  }

  const suggestion = await db.clinicEditSuggestion.create({
    data: {
      clinicId: clinic.id,
      suggestedPhone: validated.value.suggestedPhone,
      suggestedWhatsapp: validated.value.suggestedWhatsapp,
      suggestedWebsiteUrl: validated.value.suggestedWebsiteUrl,
      suggestedYelpUrl: validated.value.suggestedYelpUrl,
      suggestedNote: validated.value.suggestedNote,
      contactEmail: validated.value.contactEmail,
      status: ClinicEditSuggestionStatus.PENDING,
    },
    select: {
      id: true,
    },
  });

  await logEvent({
    sessionId: args.sessionId,
    clinicId: clinic.id,
    eventName: "clinic_edit_suggestion_submit",
    metadata: {
      suggestionId: suggestion.id,
    },
  });

  return {
    ok: true,
    status: 201,
    data: {
      suggestionId: suggestion.id,
    },
  };
}

export async function applyClinicEditSuggestion(args: {
  suggestionId: string;
  adminSessionId?: string | null;
}): Promise<BaseServiceResult<{ suggestionId: string; clinicId: string }>> {
  if (!args.suggestionId.trim()) {
    return {
      ok: false,
      status: 400,
      errors: ["Missing suggestion id."],
    };
  }

  const suggestion = await db.clinicEditSuggestion.findUnique({
    where: {
      id: args.suggestionId,
    },
    select: {
      id: true,
      clinicId: true,
      status: true,
      suggestedPhone: true,
      suggestedWhatsapp: true,
      suggestedWebsiteUrl: true,
      suggestedYelpUrl: true,
    },
  });

  if (!suggestion) {
    return {
      ok: false,
      status: 404,
      errors: ["Suggestion not found."],
    };
  }

  if (suggestion.status === ClinicEditSuggestionStatus.APPLIED) {
    return {
      ok: true,
      status: 200,
      data: {
        suggestionId: suggestion.id,
        clinicId: suggestion.clinicId,
      },
    };
  }

  if (suggestion.status === ClinicEditSuggestionStatus.REJECTED) {
    return {
      ok: false,
      status: 409,
      errors: ["Suggestion was already rejected."],
    };
  }

  const clinic = await db.clinic.findUnique({
    where: {
      id: suggestion.clinicId,
    },
    select: {
      phone: true,
      whatsapp: true,
      websiteUrl: true,
      yelpUrl: true,
      isPublished: true,
    },
  });

  if (!clinic) {
    return {
      ok: false,
      status: 404,
      errors: ["Clinic not found."],
    };
  }

  const clinicUpdates = applySuggestionToClinic(clinic, suggestion);
  const hasClinicUpdates = Object.keys(clinicUpdates).length > 0;

  await db.$transaction(async (tx) => {
    if (hasClinicUpdates) {
      await tx.clinic.update({
        where: {
          id: suggestion.clinicId,
        },
        data: clinicUpdates,
      });
    }

    await tx.clinicEditSuggestion.update({
      where: {
        id: suggestion.id,
      },
      data: {
        status: ClinicEditSuggestionStatus.APPLIED,
      },
    });
  });

  await logEvent({
    sessionId: args.adminSessionId,
    clinicId: suggestion.clinicId,
    eventName: "clinic_edit_suggestion_apply",
    metadata: {
      suggestionId: suggestion.id,
      updatedFields: Object.keys(clinicUpdates),
    },
  });

  return {
    ok: true,
    status: 200,
    data: {
      suggestionId: suggestion.id,
      clinicId: suggestion.clinicId,
    },
  };
}

export async function rejectClinicEditSuggestion(args: {
  suggestionId: string;
  adminSessionId?: string | null;
}): Promise<BaseServiceResult<{ suggestionId: string; clinicId: string }>> {
  if (!args.suggestionId.trim()) {
    return {
      ok: false,
      status: 400,
      errors: ["Missing suggestion id."],
    };
  }

  const suggestion = await db.clinicEditSuggestion.findUnique({
    where: {
      id: args.suggestionId,
    },
    select: {
      id: true,
      clinicId: true,
      status: true,
    },
  });

  if (!suggestion) {
    return {
      ok: false,
      status: 404,
      errors: ["Suggestion not found."],
    };
  }

  if (suggestion.status === ClinicEditSuggestionStatus.REJECTED) {
    return {
      ok: true,
      status: 200,
      data: {
        suggestionId: suggestion.id,
        clinicId: suggestion.clinicId,
      },
    };
  }

  if (suggestion.status === ClinicEditSuggestionStatus.APPLIED) {
    return {
      ok: false,
      status: 409,
      errors: ["Suggestion was already applied."],
    };
  }

  await db.clinicEditSuggestion.update({
    where: {
      id: suggestion.id,
    },
    data: {
      status: ClinicEditSuggestionStatus.REJECTED,
    },
  });

  await logEvent({
    sessionId: args.adminSessionId,
    clinicId: suggestion.clinicId,
    eventName: "clinic_edit_suggestion_reject",
    metadata: {
      suggestionId: suggestion.id,
    },
  });

  return {
    ok: true,
    status: 200,
    data: {
      suggestionId: suggestion.id,
      clinicId: suggestion.clinicId,
    },
  };
}
