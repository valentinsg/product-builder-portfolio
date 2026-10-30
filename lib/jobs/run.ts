/*
 * Control side of scripts/jobs-run.mjs for the /api/jobs/run route: reads the
 * lock and log the runner writes, starts it detached, and cancels it by
 * killing its process tree. The runner owns the lock; this only reads it and
 * clears it when its PID is gone.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { jobPaths, writeJsonAtomic } from './data'

const MAX_INITIAL_LOG = 200_000

type Lock = { pid: number; started_at: string }

function isAlive(pid: number) {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return (e as NodeJS.ErrnoException).code === 'EPERM'
  }
}

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as T
  } catch {
    return null
  }
}

/** The live lock, or null. A lock whose process is gone is removed. */
export function activeLock(dir: string): Lock | null {
  const p = jobPaths(dir)
  const lock = readJson<Lock>(p.lock)
  if (!lock) return null
  if (isAlive(lock.pid)) return lock
  fs.rmSync(p.lock, { force: true })
  const status = readJson<Record<string, unknown>>(p.status)
  if (status?.status === 'running') {
    writeJsonAtomic(p.status, { ...status, status: 'error', finished_at: new Date().toISOString(), summary: 'El proceso terminó sin cerrar la corrida.' })
  }
  return null
}

export function runStatus(dir: string) {
  return readJson<Record<string, unknown>>(jobPaths(dir).status)
}

/** Log text from a byte offset, cut at the last complete line. */
export function readLog(dir: string, offset: number) {
  const file = jobPaths(dir).log
  let fd: number
  try {
    fd = fs.openSync(file, 'r')
  } catch {
    return { text: '', offset: 0, mtimeMs: null as number | null }
  }
  try {
    const { size, mtimeMs } = fs.fstatSync(fd)
    let start = offset > size ? 0 : offset
    if (start === 0 && size > MAX_INITIAL_LOG) start = size - MAX_INITIAL_LOG
    const buf = Buffer.alloc(size - start)
    fs.readSync(fd, buf, 0, buf.length, start)
    const end = buf.lastIndexOf(0x0a) + 1
    return { text: buf.subarray(0, end).toString('utf8'), offset: start + end, mtimeMs }
  } finally {
    fs.closeSync(fd)
  }
}

/**
 * Starts the runner detached and waits until it holds the lock, so the panel
 * never polls in the gap between spawn and lock. Resolves with an error
 * message if the runner exits first (bad config, or another run won the lock).
 */
export function startRun(dir: string): Promise<{ ok: true; pid: number } | { ok: false; error: string }> {
  const runner = path.join(/*turbopackIgnore: true*/ process.cwd(), 'scripts', 'jobs-run.mjs')
  const child = spawn(process.execPath, [runner], {
    cwd: process.cwd(),
    env: process.env,
    detached: true,
    shell: false,
    stdio: ['ignore', 'ignore', 'pipe'],
    windowsHide: true,
  })
  let stderr = ''
  child.stderr?.setEncoding('utf8').on('data', (d: string) => (stderr += d))

  return new Promise(resolve => {
    const started = Date.now()
    const finish = (r: { ok: true; pid: number } | { ok: false; error: string }) => {
      clearInterval(timer)
      child.stderr?.destroy()
      child.unref()
      resolve(r)
    }
    child.on('exit', code => finish({ ok: false, error: stderr.trim() || `El runner terminó con código ${code}` }))
    child.on('error', e => finish({ ok: false, error: e.message }))
    const timer = setInterval(() => {
      const lock = readJson<Lock>(jobPaths(dir).lock)
      if (lock?.pid === child.pid) finish({ ok: true, pid: child.pid! })
      else if (Date.now() - started > 10_000) finish({ ok: false, error: 'El runner no tomó el lock en 10 s' })
    }, 200)
  })
}

function killTree(pid: number): Promise<void> {
  if (process.platform !== 'win32') {
    try {
      process.kill(-pid, 'SIGTERM')
    } catch {}
    return Promise.resolve()
  }
  return new Promise(resolve => {
    const k = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true, shell: false })
    k.on('exit', () => resolve())
    k.on('error', () => resolve())
  })
}

export async function cancelRun(dir: string) {
  const lock = activeLock(dir)
  if (!lock) return false
  await killTree(lock.pid)
  const p = jobPaths(dir)
  fs.appendFileSync(p.log, `[${new Date().toTimeString().slice(0, 8)}] ■ Cancelada desde el panel\n`)
  const status = readJson<Record<string, unknown>>(p.status) ?? {}
  writeJsonAtomic(p.status, { ...status, status: 'cancelled', finished_at: new Date().toISOString() })
  fs.rmSync(p.lock, { force: true })
  return true
}
