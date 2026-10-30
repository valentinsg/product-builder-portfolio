/*
 * Access control for the private job-search admin panel.
 *
 * Two factors, both from env vars (never in this public repo):
 *   ADMIN_SLUG            the panel lives at /<ADMIN_SLUG>; any other path 404s
 *   ADMIN_PASSWORD        checked once per device, then a signed cookie
 *   ADMIN_SESSION_SECRET  ≥32 chars, signs the cookie
 * The cookie is an expiry plus an HMAC keyed by secret and password, so
 * changing either one signs every device out. Unconfigured = panel off (404).
 */
import crypto from 'node:crypto'
import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'jobs_admin'
const MAX_AGE_S = 30 * 24 * 60 * 60

// Per-instance brute-force brake. Serverless instances do not share it, so the
// real protection is a long random password; this only slows a single client.
const MAX_FAILS = 5
const LOCK_MS = 15 * 60 * 1000
const failures = new Map<string, { count: number; first: number; until: number }>()

function env() {
  const slug = process.env.ADMIN_SLUG?.trim() ?? ''
  const password = process.env.ADMIN_PASSWORD ?? ''
  const secret = process.env.ADMIN_SESSION_SECRET ?? ''
  return slug && password && secret.length >= 32 ? { slug, password, secret } : null
}

export function adminEnabled() {
  return env() !== null
}

function sameText(a: string, b: string) {
  const ha = crypto.createHash('sha256').update(a).digest()
  const hb = crypto.createHash('sha256').update(b).digest()
  return crypto.timingSafeEqual(ha, hb)
}

export function slugMatches(slug: string) {
  const e = env()
  return e !== null && sameText(slug, e.slug)
}

function sign(exp: number, e: { secret: string; password: string }) {
  return crypto.createHmac('sha256', `${e.secret}\0${e.password}`).update(String(exp)).digest('base64url')
}

function validToken(token: string | undefined) {
  const e = env()
  if (!e || !token) return false
  const [expRaw, sig] = token.split('.')
  const exp = Number(expRaw)
  if (!Number.isFinite(exp) || exp < Date.now() || !sig) return false
  return sameText(sig, sign(exp, e))
}

/** For server components. */
export async function isAuthed() {
  return validToken((await cookies()).get(SESSION_COOKIE)?.value)
}

/** For route handlers: valid session cookie and, on writes, a same-origin request. */
export function authorize(req: Request, { mutating = false } = {}): Response | null {
  if (!adminEnabled()) return new Response('Not Found', { status: 404 })
  const token = req.headers
    .get('cookie')
    ?.split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1)
  if (!validToken(token)) return Response.json({ error: 'Sesión vencida: volvé a entrar' }, { status: 401 })
  if (mutating && !sameOrigin(req)) return new Response('Forbidden', { status: 403 })
  return null
}

export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (!origin || !host) return false
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

export function clientKey(req: Request) {
  return req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

/** Checks slug + password with a lockout; returns a Set-Cookie value on success. */
export function login(slug: string, password: string, who: string): { ok: true; cookie: string } | { ok: false; status: number; error: string } {
  const e = env()
  if (!e) return { ok: false, status: 404, error: 'Not Found' }
  const now = Date.now()
  const f = failures.get(who)
  if (f && f.until > now) return { ok: false, status: 429, error: 'Demasiados intentos. Probá en 15 minutos.' }

  if (!sameText(slug, e.slug) || !sameText(password, e.password)) {
    const fresh = f !== undefined && now - f.first < LOCK_MS
    const count = (fresh ? f.count : 0) + 1
    failures.set(who, { count, first: fresh ? f.first : now, until: count >= MAX_FAILS ? now + LOCK_MS : 0 })
    return { ok: false, status: 401, error: 'Contraseña incorrecta' }
  }
  failures.delete(who)
  const exp = now + MAX_AGE_S * 1000
  return { ok: true, cookie: sessionCookie(`${exp}.${sign(exp, e)}`, MAX_AGE_S) }
}

export function sessionCookie(value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${SESSION_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Strict${secure}`
}
