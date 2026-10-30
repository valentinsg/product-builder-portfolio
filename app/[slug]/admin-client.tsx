'use client'

/*
 * Private admin panel UI: login form, and the shared job board with a run
 * panel that dispatches the GitHub Actions workflow and shows the progress
 * the runner uploads to Blob.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExtLink, JobsBoard, btnGhost, btnPrimary } from '@/components/jobs/board'
import type { BoardData } from '@/lib/jobs/data'

export function AdminLogin({ slug }: { slug: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, password }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? res.statusText)
      router.refresh()
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <main className="section-shell grid min-h-svh place-items-center py-12">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6">
        <p className="eyebrow">Panel privado</p>
        <input
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full rounded border border-border bg-background px-3 py-2.5 text-base outline-none focus:border-primary"
        />
        <button type="submit" disabled={busy || !password} className={`${btnPrimary} w-full disabled:opacity-40`}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
        {error && <p className="text-sm text-primary">{error}</p>}
      </form>
    </main>
  )
}

type Run = { status: string; conclusion: string | null; url: string; event: string; createdAt: string; updatedAt: string }
type RunInfo = {
  configured: boolean
  run: Run | { error: string } | null
  status: { status?: string; finished_at?: string; summary?: string; denials?: string[] } | null
  log: string
}

function runLabel(run: Run) {
  if (run.status === 'queued' || run.status === 'waiting' || run.status === 'pending') return 'en cola'
  if (run.status !== 'completed') return 'en curso'
  if (run.conclusion === 'success') return 'terminó bien'
  if (run.conclusion === 'cancelled') return 'cancelada'
  return `terminó con ${run.conclusion ?? 'error'}`
}

function CloudRunPanel() {
  const router = useRouter()
  const [info, setInfo] = useState<RunInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [pending, setPending] = useState(false)
  // Set when a run is dispatched: GitHub lists it only after a few seconds, and
  // until then the latest run shown is the previous, finished one.
  const pendingSince = useRef<number | null>(null)
  const wasActive = useRef(false)
  const logRef = useRef<HTMLPreElement>(null)

  const run = info?.run && !('error' in info.run) ? info.run : null
  const active = pending || (run !== null && run.status !== 'completed')

  const poll = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/run', { cache: 'no-store' })
      if (res.status === 401) return router.refresh()
      const json: RunInfo = await res.json()
      setInfo(json)
      const r = json.run && !('error' in json.run) ? json.run : null
      const since = pendingSince.current
      if (since !== null && ((r && Date.parse(r.createdAt) >= since - 30_000) || Date.now() - since > 120_000)) {
        pendingSince.current = null
        setPending(false)
      }
      const nowActive = pendingSince.current !== null || (r !== null && r.status !== 'completed')
      if (wasActive.current && !nowActive) router.refresh()
      wasActive.current = nowActive
    } catch (e) {
      setError((e as Error).message)
    }
  }, [router])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let stop = false
    const loop = async () => {
      await poll()
      if (!stop) timer = setTimeout(loop, wasActive.current || pending ? 10_000 : 60_000)
    }
    loop()
    return () => {
      stop = true
      clearTimeout(timer)
    }
  }, [poll, pending])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [info?.log, showLog])

  const start = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/run', { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? res.statusText)
      pendingSince.current = Date.now()
      setPending(true)
      wasActive.current = true
      setShowLog(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.refresh()
  }

  const denials = info?.status?.denials ?? []

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={!info?.configured || active || busy} onClick={start} className={`${btnPrimary} disabled:cursor-not-allowed disabled:opacity-40`}>
          {active ? 'Buscando…' : 'Buscar ofertas nuevas'}
        </button>
        <span className="text-sm text-muted-foreground">
          {pending ? 'Arrancando…' : run ? `Última corrida: ${runLabel(run)} · ${new Date(run.createdAt).toLocaleString('es-AR')}` : 'Sin corridas todavía'}
        </span>
        <div className="ml-auto flex gap-3 text-sm">
          {info?.log && (
            <button type="button" onClick={() => setShowLog(v => !v)} className="text-muted-foreground underline-offset-4 hover:underline">
              {showLog ? 'Ocultar log' : 'Ver log'}
            </button>
          )}
          {run && (
            <ExtLink href={run.url} className="text-muted-foreground underline-offset-4 hover:underline">
              GitHub ↗
            </ExtLink>
          )}
          <button type="button" onClick={logout} className={`${btnGhost} px-2.5 py-1`}>
            Salir
          </button>
        </div>
      </div>

      {info && !info.configured && <p className="mt-3 text-sm text-primary">Falta configurar JOBS_GITHUB_REPO / JOBS_GITHUB_TOKEN en Vercel.</p>}
      {info?.run && 'error' in info.run && <p className="mt-3 text-sm text-primary">GitHub: {info.run.error}</p>}
      {error && <p className="mt-3 text-sm text-primary">Error: {error}</p>}
      {active && <p className="mt-3 text-sm text-muted-foreground">Corre en GitHub Actions (10 a 20 min). El log se actualiza cada minuto; podés cerrar la página.</p>}

      {!active && denials.length > 0 && (
        <div className="mt-3 rounded border border-primary/50 bg-primary/10 p-3 text-sm">
          <p className="font-medium text-primary">⛔ Permisos denegados en la última corrida:</p>
          <ul className="mt-1 list-disc pl-4 text-muted-foreground">
            {denials.map((d, i) => (
              <li key={i} className="break-all">
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showLog && info?.log && (
        <pre ref={logRef} className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded border border-border bg-background p-3 font-mono text-[.7rem] leading-relaxed text-muted-foreground">
          {info.log}
        </pre>
      )}
    </section>
  )
}

export function AdminBoard({ data }: { data: BoardData }) {
  return <JobsBoard data={data} sentEndpoint="/api/admin/sent" eyebrow="Panel privado" runPanel={<CloudRunPanel />} />
}
