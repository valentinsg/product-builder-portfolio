'use client'

/*
 * Local job-search panel: the shared job board plus a run panel that starts
 * scripts/jobs-run.mjs on this machine and tails its log.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { JobsBoard, btnGhost, btnPrimary } from '@/components/jobs/board'
import type { Config, JobsData } from '@/lib/jobs/data'

const IDLE_WARN_SECONDS = 180

type RunState = {
  running: boolean
  status: { status?: string; finished_at?: string; started_at?: string; denials?: string[] } | null
  idleSeconds: number | null
}

const STATUS_LABEL: Record<string, string> = {
  running: 'en curso',
  ok: 'terminó bien',
  error: 'terminó con error',
  cancelled: 'cancelada',
  timeout: 'cortada por timeout',
}

function RunPanel({ config }: { config: Config }) {
  const router = useRouter()
  const [state, setState] = useState<RunState>({ running: false, status: null, idleSeconds: null })
  const [log, setLog] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const offset = useRef(0)
  const wasRunning = useRef(false)
  const logRef = useRef<HTMLPreElement>(null)
  const canRun = config.dirOk && config.claudeBinOk

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/run?offset=${offset.current}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? res.statusText)
      if (json.offset < offset.current) setLog(json.log)
      else if (json.log) setLog(prev => prev + json.log)
      offset.current = json.offset
      setState({ running: json.running, status: json.status, idleSeconds: json.idleSeconds })
      if (wasRunning.current && !json.running) router.refresh()
      wasRunning.current = json.running
      if (json.running) setShowLog(true)
      return json.running as boolean
    } catch (e) {
      setError((e as Error).message)
      return false
    }
  }, [router])

  useEffect(() => {
    if (!config.dirOk) return
    let stop = false
    let timer: ReturnType<typeof setTimeout>
    const loop = async () => {
      const running = await poll()
      if (!stop) timer = setTimeout(loop, running ? 1500 : 10000)
    }
    loop()
    return () => {
      stop = true
      clearTimeout(timer)
    }
  }, [poll, config.dirOk])

  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log, showLog])

  const send = async (method: 'POST' | 'DELETE') => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/jobs/run', { method })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? res.statusText)
      if (method === 'POST') {
        offset.current = 0
        setLog('')
        setShowLog(true)
      }
      await poll()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const idleMin = state.idleSeconds !== null ? Math.floor(state.idleSeconds / 60) : 0
  const status = state.status?.status

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={!canRun || state.running || busy} onClick={() => send('POST')} className={`${btnPrimary} disabled:cursor-not-allowed disabled:opacity-40`}>
          {state.running ? 'Buscando…' : 'Buscar ofertas nuevas'}
        </button>
        {state.running && (
          <button type="button" disabled={busy} onClick={() => send('DELETE')} className={btnGhost}>
            Cancelar
          </button>
        )}
        <span className="text-sm text-muted-foreground">
          {status ? `Última corrida: ${STATUS_LABEL[status] ?? status}` : 'Sin corridas todavía'}
          {state.status?.finished_at && !state.running && ` · ${new Date(state.status.finished_at).toLocaleString('es-AR')}`}
        </span>
        {log && !state.running && (
          <button type="button" onClick={() => setShowLog(v => !v)} className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:underline">
            {showLog ? 'Ocultar log' : 'Ver log'}
          </button>
        )}
      </div>

      {!config.claudeBinOk && (
        <div className="mt-4 rounded border border-primary/50 bg-primary/10 p-3 text-sm leading-relaxed">
          <p className="font-medium text-primary">
            {config.claudeBin ? `CLAUDE_BIN no existe: ${config.claudeBin}` : 'Falta CLAUDE_BIN en .env.local'}. La búsqueda está deshabilitada.
          </p>
          {config.claudeBinFound && (
            <p className="mt-1 text-muted-foreground">
              Encontré el binario de la extensión de VS Code (cambia con cada actualización): <code className="break-all text-foreground">{config.claudeBinFound}</code>
            </p>
          )}
          <p className="mt-1 text-muted-foreground">
            Recomendado: instalar el CLI de Claude Code a nivel usuario (ruta estable) y apuntar CLAUDE_BIN a ese claude.exe.
          </p>
        </div>
      )}
      {!config.dirOk && <p className="mt-3 text-sm text-primary">JOB_SEARCH_DIR falta o no existe.</p>}
      {error && <p className="mt-3 text-sm text-primary">Error: {error}</p>}

      {state.running && state.idleSeconds !== null && state.idleSeconds >= IDLE_WARN_SECONDS && (
        <p className="mt-3 rounded border border-primary/50 bg-primary/10 p-3 text-sm">
          ⚠ Sin actividad hace {idleMin} min: puede estar esperando un permiso. Revisá el log. A los 15 min sin actividad se corta sola, o cancelala.
        </p>
      )}
      {!state.running && state.status?.denials && state.status.denials.length > 0 && (
        <div className="mt-3 rounded border border-primary/50 bg-primary/10 p-3 text-sm">
          <p className="font-medium text-primary">⛔ Permisos denegados en la última corrida:</p>
          <ul className="mt-1 list-disc pl-4 text-muted-foreground">
            {state.status.denials.map((d, i) => (
              <li key={i} className="break-all">
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showLog && log && (
        <pre ref={logRef} className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded border border-border bg-background p-3 font-mono text-xs leading-relaxed text-muted-foreground">
          {log}
        </pre>
      )}
    </section>
  )
}

export default function JobsClient({ data }: { data: JobsData }) {
  return <JobsBoard data={data} sentEndpoint="/api/jobs/sent" eyebrow="Panel local · solo en desarrollo" runPanel={<RunPanel config={data.config} />} />
}
