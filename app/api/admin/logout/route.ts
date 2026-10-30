import { sameOrigin, sessionCookie } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response('Forbidden', { status: 403 })
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': sessionCookie('', 0) } })
}
