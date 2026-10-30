/*
 * Job-search runs from the admin panel. Admin session required.
 *   GET   latest GitHub Actions run + the log/state the runner uploaded to Blob
 *   POST  dispatch a new run (409 while one is queued or running)
 */
import { authorize } from '@/lib/admin/auth'
import { dispatchRun, githubConfigured, isActive, latestRun } from '@/lib/admin/github'
import { readRunProgress } from '@/lib/jobs/blob'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const blocked = authorize(req)
  if (blocked) return blocked
  const [run, progress] = await Promise.all([
    githubConfigured() ? latestRun().catch((e: Error) => ({ error: e.message })) : null,
    readRunProgress().catch(() => ({ status: null, log: '' })),
  ])
  return Response.json(
    { configured: githubConfigured(), run, ...progress },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(req: Request) {
  const blocked = authorize(req, { mutating: true })
  if (blocked) return blocked
  if (!githubConfigured()) return Response.json({ error: 'GitHub no está configurado' }, { status: 500 })
  try {
    if (isActive(await latestRun())) return Response.json({ error: 'Ya hay una corrida en curso' }, { status: 409 })
    await dispatchRun()
    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 })
  }
}
