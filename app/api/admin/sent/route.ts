/*
 * Marks a job as sent (or not) in the private Blob store's sent.json,
 * as { "<key>": "YYYY-MM-DD" }. Admin session required.
 */
import { authorize } from '@/lib/admin/auth'
import { setSent } from '@/lib/jobs/blob'
import { isValidKey } from '@/lib/jobs/data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const blocked = authorize(req, { mutating: true })
  if (blocked) return blocked
  let body: { key?: unknown; sent?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }
  if (!isValidKey(body.key) || typeof body.sent !== 'boolean') {
    return Response.json({ error: 'Se espera { key, sent: boolean }' }, { status: 400 })
  }
  try {
    return Response.json({ ok: true, date: await setSent(body.key, body.sent) })
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 })
  }
}
