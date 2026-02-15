export type ClinicMetadataRobots = {
  follow: boolean;
  index: boolean;
};

export function clinicMetadataRobots(clinic: { isPublished: boolean } | null): ClinicMetadataRobots {
  const shouldIndex = clinic?.isPublished ?? false;

  return {
    index: shouldIndex,
    follow: true,
  };
}
