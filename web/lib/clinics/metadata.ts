export type ClinicMetadataRobots = {
  follow: boolean;
  index: boolean;
};

export function clinicMetadataRobots(clinic: { isPublished: boolean } | null): ClinicMetadataRobots {
  const shouldIndex = clinic?.isPublished ?? true;

  return {
    index: shouldIndex,
    follow: true,
  };
}
