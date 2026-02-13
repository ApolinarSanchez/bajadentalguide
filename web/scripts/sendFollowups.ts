import { runFollowupJobs } from "../lib/email/followupRunner";

async function main() {
  const result = await runFollowupJobs();
  console.log(`followup sent=${result.sent} skipped=${result.skipped}`);
}

main().catch((error) => {
  console.error("Followup job failed", error);
  process.exit(1);
});
