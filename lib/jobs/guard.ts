/*
 * Access rules for the local job-search panel (/jobs and /api/jobs/*).
 * Dev server only, and only when reached as localhost / 127.0.0.1. In any
 * other build the panel 404s before touching the filesystem.
 */

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

export function isDev() {
  return process.env.NODE_ENV === 'development'
}

function hostnameOf(host: string | null) {
  if (!host) return null
  try {
    return new URL(`http://${host}`).hostname
  } catch {
    return null
  }
}

export function isLocalHost(host: string | null) {
  const name = hostnameOf(host)
  return name !== null && LOCAL_HOSTS.has(name)
}

const notFound = () => new Response('Not Found', { status: 404 })
const forbidden = () => new Response('Forbidden', { status: 403 })

/**
 * Handler for the methods a route does not support, so production answers
 * 404 for every method instead of Next's default 405.
 */
export function unsupported(allow: string) {
  return (req: Request) => guardApi(req) ?? new Response('Method Not Allowed', { status: 405, headers: { Allow: allow } })
}

/**
 * Returns a response to send instead of handling the request, or null when
 * the request may proceed. Mutating requests must also carry a same-host
 * localhost Origin, so a page on another site cannot POST to the dev server.
 */
export function guardApi(req: Request, { mutating = false } = {}): Response | null {
  if (!isDev()) return notFound()
  const host = req.headers.get('host')
  if (!isLocalHost(host)) return forbidden()
  if (mutating) {
    const origin = req.headers.get('origin')
    if (!origin) return forbidden()
    try {
      const o = new URL(origin)
      if (!LOCAL_HOSTS.has(o.hostname) || o.host !== host) return forbidden()
    } catch {
      return forbidden()
    }
  }
  return null
}
