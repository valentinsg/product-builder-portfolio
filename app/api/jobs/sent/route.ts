/*
 * Marks a job as sent (or not) in <JOB_SEARCH_DIR>/reports/sent.json as
 * { "<key>": "YYYY-MM-DD" }. Dev server, localhost only — see lib/jobs/guard.
 */
import { guardApi, unsupported } from '@/lib/jobs/guard'
import { getConfig, isValidKey, jobPaths, readSent, writeJsonAtomic } from '@/lib/jobs/data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = unsupported('POST')
export const PUT = GET
export const PATCH = GET
export const DELETE = GET
export const OPTIONS = GET

export async function POST(req: Request) {
  const blocked = guardApi(req, { mutating: true })
  if (blocked) return blocked
  const { dir, dirOk } = getConfig()
  if (!dirOk) return Response.json({ error: 'JOB_SEARCH_DIR falta o no existe' }, { status: 500 })

  let body: { key?: unknown; sent?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }
  if (!isValidKey(body.key) || typeof body.sent !== 'boolean') {
    return Response.json({ error: 'Se espera { key, sent: boolean }' }, { status: 400 })
  }

  const file = jobPaths(dir).sent
  const errors: string[] = []
  const sent = readSent(file, errors)
  if (errors.length) return Response.json({ error: errors[0] }, { status: 500 })

  if (body.sent) sent[body.key] = new Date().toLocaleDateString('sv-SE')
  else delete sent[body.key]
  writeJsonAtomic(file, sent)
  return Response.json({ ok: true, date: sent[body.key] ?? null })
}
