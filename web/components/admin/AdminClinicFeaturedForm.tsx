type AdminClinicFeaturedFormProps = {
  clinic: {
    id: string;
    isFeatured: boolean;
    featuredRank: number | null;
  };
  action: (formData: FormData) => Promise<void>;
};

export function AdminClinicFeaturedForm({ clinic, action }: AdminClinicFeaturedFormProps) {
  return (
    <form action={action} className="row">
      <input type="hidden" name="clinicId" value={clinic.id} />
      <label className="checkboxLabel">
        <input type="checkbox" name="isFeatured" value="1" defaultChecked={clinic.isFeatured} />
        Featured
      </label>
      <label className="field">
        <span>Rank</span>
        <input
          type="number"
          name="featuredRank"
          min={0}
          inputMode="numeric"
          defaultValue={clinic.featuredRank ?? ""}
          className="inputSm"
          aria-label={`Featured rank for clinic ${clinic.id}`}
        />
      </label>
      <button type="submit" className="btn btnSecondary btnSm">
        Save
      </button>
    </form>
  );
}
