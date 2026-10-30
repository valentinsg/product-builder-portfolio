// Where each job-search file lives in the private Vercel Blob store, next to
// its path inside the framework (JOB_SEARCH_DIR). Shared by scripts/jobs-blob.mjs
// (runner side) and lib/jobs/blob.ts (admin panel side).
export const BLOB_FILES = {
  seen: { blob: 'jobs/seen_jobs.json', local: 'job_scraper/seen_jobs.json' },
  kits: { blob: 'jobs/kits.json', local: 'reports/kits.json' },
  sent: { blob: 'jobs/sent.json', local: 'reports/sent.json' },
  profile: { blob: 'jobs/profile.md', local: 'CLAUDE.md' },
  status: { blob: 'jobs/last-run.json', local: 'reports/last-run.json' },
  log: { blob: 'jobs/last-run.log', local: 'reports/last-run.log' },
}
