/*
 * POST { slug, password } → session cookie for the job-search admin panel.
 * See lib/admin/auth for the access model.
 */
import { clientKey, login, sameOrigin } from '@/lib/admin/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response('Forbidden', { status: 403 })
  let body: { slug?: unknown; password?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'JSON inválido' }, { status: 400 })
  }
  if (typeof body.slug !== 'string' || typeof body.password !== 'string') {
    return Response.json({ error: 'Faltan datos' }, { status: 400 })
  }
  const result = login(body.slug, body.password, clientKey(req))
  if (!result.ok) {
    // Flat delay on failure so guessing is slow even across instances.
    await new Promise(r => setTimeout(r, 800))
    return Response.json({ error: result.error }, { status: result.status })
  }
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': result.cookie, 'Cache-Control': 'no-store' } })
}
