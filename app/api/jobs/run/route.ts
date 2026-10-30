/*
 * Local job-search run control (dev server, localhost only — see lib/jobs/guard).
 *   GET    ?offset=N  run state + log text appended since byte N
 *   POST             start scripts/jobs-run.mjs (409 if a run holds the lock)
 *   DELETE           cancel the running run (kills its process tree)
 */
import { guardApi, unsupported } from '@/lib/jobs/guard'
import { getConfig } from '@/lib/jobs/data'
import { activeLock, cancelRun, readLog, runStatus, startRun } from '@/lib/jobs/run'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const PUT = unsupported('GET, POST, DELETE')
export const PATCH = PUT
export const OPTIONS = PUT

function configError() {
  const config = getConfig()
  if (!config.dirOk) return 'JOB_SEARCH_DIR falta o no existe'
  if (!config.claudeBinOk) return 'CLAUDE_BIN falta o no existe'
  return null
}

export async function GET(req: Request) {
  const blocked = guardApi(req)
  if (blocked) return blocked
  const { dir, dirOk } = getConfig()
  if (!dirOk) return Response.json({ error: 'JOB_SEARCH_DIR falta o no existe' }, { status: 500 })

  const offset = Math.max(0, Number(new URL(req.url).searchParams.get('offset')) || 0)
  const lock = activeLock(dir)
  const log = readLog(dir, offset)
  return Response.json({
    running: lock !== null,
    lock,
    status: runStatus(dir),
    log: log.text,
    offset: log.offset,
    idleSeconds: lock && log.mtimeMs ? Math.round((Date.now() - log.mtimeMs) / 1000) : null,
  })
}

export async function POST(req: Request) {
  const blocked = guardApi(req, { mutating: true })
  if (blocked) return blocked
  const error = configError()
  if (error) return Response.json({ error }, { status: 500 })
  const { dir } = getConfig()
  if (activeLock(dir)) return Response.json({ error: 'Ya hay una corrida en curso' }, { status: 409 })

  const result = await startRun(dir)
  return result.ok ? Response.json(result) : Response.json(result, { status: 500 })
}

export async function DELETE(req: Request) {
  const blocked = guardApi(req, { mutating: true })
  if (blocked) return blocked
  const { dir, dirOk } = getConfig()
  if (!dirOk) return Response.json({ error: 'JOB_SEARCH_DIR falta o no existe' }, { status: 500 })
  const cancelled = await cancelRun(dir)
  return Response.json({ cancelled })
}
