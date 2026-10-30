/*
 * Triggers and reads the job-search GitHub Actions workflow in the private
 * framework repo. Env:
 *   JOBS_GITHUB_REPO       owner/name of the framework repo
 *   JOBS_GITHUB_TOKEN      fine-grained token, that repo only, Actions: read & write
 *   JOBS_GITHUB_WORKFLOW   workflow file (default job-search.yml)
 *   JOBS_GITHUB_REF        branch to run (default master)
 */

export type WorkflowRun = {
  id: number
  status: string
  conclusion: string | null
  url: string
  event: string
  createdAt: string
  updatedAt: string
}

function config() {
  const repo = process.env.JOBS_GITHUB_REPO?.trim() ?? ''
  const token = process.env.JOBS_GITHUB_TOKEN?.trim() ?? ''
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo) || !token) return null
  return {
    repo,
    token,
    workflow: process.env.JOBS_GITHUB_WORKFLOW?.trim() || 'job-search.yml',
    ref: process.env.JOBS_GITHUB_REF?.trim() || 'master',
  }
}

export function githubConfigured() {
  return config() !== null
}

async function call(path: string, init: RequestInit = {}) {
  const c = config()
  if (!c) throw new Error('Falta JOBS_GITHUB_REPO o JOBS_GITHUB_TOKEN')
  const res = await fetch(`https://api.github.com/repos/${c.repo}/actions/workflows/${encodeURIComponent(c.workflow)}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${c.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return res
}

export async function latestRun(): Promise<WorkflowRun | null> {
  const json = await (await call('/runs?per_page=1')).json()
  const r = json?.workflow_runs?.[0]
  if (!r) return null
  return {
    id: r.id,
    status: r.status,
    conclusion: r.conclusion,
    url: r.html_url,
    event: r.event,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export async function dispatchRun() {
  const c = config()
  if (!c) throw new Error('Falta JOBS_GITHUB_REPO o JOBS_GITHUB_TOKEN')
  await call('/dispatches', { method: 'POST', body: JSON.stringify({ ref: c.ref }) })
}

export const isActive = (run: WorkflowRun | null) => run !== null && run.status !== 'completed'
