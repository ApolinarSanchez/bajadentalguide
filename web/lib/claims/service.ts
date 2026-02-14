import { ClinicClaimRequestStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { logEvent } from "@/lib/events";
import { validateClinicClaimRequest } from "@/lib/claims/validateClaimRequest";

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

export async function submitClinicClaimRequest(args: {
  clinicSlug: string;
  payload: unknown;
  sessionId?: string | null;
}): Promise<BaseServiceResult<{ claimRequestId: string }>> {
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

  const validated = validateClinicClaimRequest(args.payload);
  if (!validated.ok) {
    return {
      ok: false,
      status: 400,
      errors: validated.errors,
    };
  }

  const claimRequest = await db.clinicClaimRequest.create({
    data: {
      clinicId: clinic.id,
      name: validated.value.name,
      email: validated.value.email,
      role: validated.value.role,
      message: validated.value.message,
      status: ClinicClaimRequestStatus.PENDING,
    },
    select: {
      id: true,
    },
  });

  await logEvent({
    sessionId: args.sessionId,
    clinicId: clinic.id,
    eventName: "clinic_claim_request_submit",
    metadata: {
      claimRequestId: claimRequest.id,
    },
  });

  return {
    ok: true,
    status: 201,
    data: {
      claimRequestId: claimRequest.id,
    },
  };
}

export async function processClinicClaimRequest(args: {
  claimRequestId: string;
  adminSessionId?: string | null;
}): Promise<BaseServiceResult<{ claimRequestId: string; clinicId: string }>> {
  if (!args.claimRequestId.trim()) {
    return {
      ok: false,
      status: 400,
      errors: ["Missing claim request id."],
    };
  }

  const claimRequest = await db.clinicClaimRequest.findUnique({
    where: {
      id: args.claimRequestId,
    },
    select: {
      id: true,
      clinicId: true,
      status: true,
    },
  });

  if (!claimRequest) {
    return {
      ok: false,
      status: 404,
      errors: ["Claim request not found."],
    };
  }

  if (claimRequest.status === ClinicClaimRequestStatus.PROCESSED) {
    return {
      ok: true,
      status: 200,
      data: {
        claimRequestId: claimRequest.id,
        clinicId: claimRequest.clinicId,
      },
    };
  }

  await db.clinicClaimRequest.update({
    where: {
      id: claimRequest.id,
    },
    data: {
      status: ClinicClaimRequestStatus.PROCESSED,
    },
  });

  await logEvent({
    sessionId: args.adminSessionId,
    clinicId: claimRequest.clinicId,
    eventName: "clinic_claim_request_process",
    metadata: {
      claimRequestId: claimRequest.id,
    },
  });

  return {
    ok: true,
    status: 200,
    data: {
      claimRequestId: claimRequest.id,
      clinicId: claimRequest.clinicId,
    },
  };
}
