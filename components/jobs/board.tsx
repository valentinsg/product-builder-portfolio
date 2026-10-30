'use client'

/*
 * Job board shared by the local /jobs panel and the private admin panel.
 * All job text comes from scraped postings and is untrusted: it is rendered
 * only as React text children, never as HTML, and links arrive pre-filtered
 * to http(s) by lib/jobs/data.
 */
import { useEffect, useMemo, useState } from 'react'
import type { BoardData, FormField, Kit, Row } from '@/lib/jobs/data'

export function ExtLink({ href, className, children }: { href: string | null; className?: string; children: React.ReactNode }) {
  if (!href) return <span className="text-muted-foreground">sin link</span>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setDone(true)
      setTimeout(() => setDone(false), 1500)
    } catch {
      window.prompt('Copiá manualmente:', text)
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`shrink-0 rounded border px-3 py-1.5 font-mono text-[.68rem] uppercase tracking-wider transition ${
        done ? 'border-primary text-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
      }`}
    >
      {done ? 'Copiado ✓' : label}
    </button>
  )
}

function Chip({ children, alert = false }: { children: React.ReactNode; alert?: boolean }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-xs ${
        alert ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border text-muted-foreground'
      }`}
    >
      {children}
    </span>
  )
}

const btn =
  'inline-flex items-center justify-center gap-1.5 rounded px-3.5 py-2 font-mono text-[.68rem] uppercase tracking-wider transition'
export const btnPrimary = `${btn} bg-primary text-primary-foreground hover:opacity-90`
export const btnGhost = `${btn} border border-border text-muted-foreground hover:border-primary hover:text-foreground`

function verdictLabel(v: string) {
  const s = v.toLowerCase()
  if (s.startsWith('strong')) return 'Encaje fuerte'
  if (s.startsWith('good')) return 'Buen encaje'
  if (s.startsWith('moderate')) return 'Encaje medio'
  if (s.startsWith('weak')) return 'Encaje débil'
  if (s.startsWith('poor')) return 'Encaje pobre'
  return v || 'sin veredicto'
}

function KitCard({ kit, sentDate, onToggle }: { kit: Kit; sentDate: string | null; onToggle: (sent: boolean) => void }) {
  const locationAlert = kit.locationVerdict && kit.locationVerdict !== 'PASS'
  return (
    <article className={`rounded-lg border border-border bg-card p-4 transition sm:p-5 ${sentDate ? 'opacity-55' : ''}`}>
      <header className="flex items-start gap-3 sm:gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/60 font-mono text-base text-primary sm:h-12 sm:w-12 sm:text-lg">
          {kit.score ?? '–'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">{verdictLabel(kit.verdict)}</p>
          <h3 className="mt-1 text-lg font-medium leading-tight sm:text-xl">{kit.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {kit.company}
            {kit.where && <> · {kit.where}</>}
          </p>
        </div>
      </header>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {kit.spokenEnglish && <Chip alert>⚠ Inglés hablado</Chip>}
        {locationAlert && <Chip alert>⚠ Ubicación: {kit.location || kit.where || kit.locationVerdict}</Chip>}
        {kit.chips.map((c, i) => (
          <Chip key={i} alert={c.startsWith('⚠')}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <ExtLink href={kit.url} className={btnPrimary}>
          Postularme ↗
        </ExtLink>
        {kit.altUrls.map((l, i) => (
          <ExtLink key={i} href={l.url} className={btnGhost}>
            {l.label} ↗
          </ExtLink>
        ))}
        {kit.cvUrl && (
          <ExtLink href={kit.cvUrl} className={btnGhost}>
            CV {kit.cvFile.replace(/^Valentin_Sanchez_Guevara_CV_/, '').replace(/\.\w+$/, '')} ↗
          </ExtLink>
        )}
        <label
          className={`${btn} cursor-pointer border ${sentDate ? 'border-primary text-primary' : 'border-border text-muted-foreground'} ml-auto`}
        >
          <input type="checkbox" checked={Boolean(sentDate)} onChange={e => onToggle(e.target.checked)} className="h-3.5 w-3.5 accent-[var(--primary)]" />
          {sentDate ? `Enviada ${sentDate.slice(5)}` : 'Enviada'}
        </label>
      </div>

      {kit.message && (
        <section className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">Mensaje · {kit.messageLang.toUpperCase() || '?'}</p>
            <CopyButton text={kit.message} />
          </div>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded border border-border bg-background p-3 font-sans text-sm leading-relaxed text-muted-foreground">
            {kit.message}
          </pre>
        </section>
      )}

      <details className="group mt-4">
        <summary className="cursor-pointer list-none eyebrow">
          <span className="group-open:hidden">+ Por qué encaja / ojo con</span>
          <span className="hidden group-open:inline">− Por qué encaja / ojo con</span>
        </summary>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <section>
            <p className="eyebrow">Por qué encaja</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed">
              {kit.why.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </section>
          <section>
            <p className="eyebrow">Ojo con</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground">
              {kit.watch.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </section>
        </div>
      </details>
    </article>
  )
}

function JobsTable({ rows, discarded }: { rows: Row[]; discarded: boolean }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground">Nada que mostrar con estos filtros.</p>
  const detail = (r: Row) => (
    <>
      {discarded && <span className="block text-foreground">Ubicación: {r.location || 'sin dato'}</span>}
      {r.firstGap}
    </>
  )
  return (
    <>
      <ul className="space-y-2 md:hidden">
        {rows.map(r => (
          <li key={r.key} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-start gap-3">
              <span className="font-mono text-primary">{r.score ?? '–'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{r.title}</p>
                <p className="text-xs text-muted-foreground">
                  {r.company} · {verdictLabel(r.verdict)}
                  {r.languageGate && r.languageGate !== 'PASS' && <span className="text-primary"> · ⚠ Inglés</span>}
                </p>
              </div>
              <ExtLink href={r.url} className="text-sm text-primary">
                Ver ↗
              </ExtLink>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{detail(r)}</p>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-card">
            <tr className="eyebrow">
              <th className="px-3 py-2 font-normal">Puntaje</th>
              <th className="px-3 py-2 font-normal">Rol</th>
              <th className="px-3 py-2 font-normal">Empresa</th>
              <th className="px-3 py-2 font-normal">Link</th>
              <th className="px-3 py-2 font-normal">{discarded ? 'Motivo' : 'Primer gap'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.key} className="border-t border-border align-top">
                <td className="px-3 py-2 font-mono">
                  {r.score ?? '–'}
                  <div className="text-[.65rem] text-muted-foreground">{verdictLabel(r.verdict)}</div>
                </td>
                <td className="px-3 py-2">
                  {r.title}
                  {r.languageGate && r.languageGate !== 'PASS' && (
                    <div className="mt-1">
                      <Chip alert>⚠ Inglés</Chip>
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{r.company}</td>
                <td className="px-3 py-2">
                  <ExtLink href={r.url} className="text-primary hover:underline">
                    Ver ↗
                  </ExtLink>
                </td>
                <td className="max-w-xl px-3 py-2 text-muted-foreground">{detail(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function IdentityBlock({ fields }: { fields: FormField[] }) {
  if (!fields.length) return null
  return (
    <details className="rounded-lg border border-border bg-card p-4">
      <summary className="cursor-pointer eyebrow">Datos para formularios</summary>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {fields.map((f, i) => (
          <div key={i} className="flex items-start justify-between gap-3 rounded border border-border px-3 py-2">
            <div className="min-w-0">
              <p className="font-mono text-[.65rem] uppercase tracking-wider text-muted-foreground">{f.label}</p>
              <p className="break-words text-sm">{f.value}</p>
              {f.note && <p className="mt-0.5 text-xs text-muted-foreground">{f.note}</p>}
            </div>
            <CopyButton text={f.value} />
          </div>
        ))}
      </div>
    </details>
  )
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label
      className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
        checked ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground'
      }`}
    >
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
      {children}
    </label>
  )
}

export function JobsBoard({
  data,
  sentEndpoint,
  eyebrow,
  runPanel,
}: {
  data: BoardData
  sentEndpoint: string
  eyebrow: string
  runPanel: React.ReactNode
}) {
  const [sent, setSent] = useState<Record<string, string>>(data.sent)
  const [strong, setStrong] = useState(false)
  const [noEnglish, setNoEnglish] = useState(false)
  const [unsent, setUnsent] = useState(false)
  const [sentError, setSentError] = useState<string | null>(null)

  useEffect(() => setSent(data.sent), [data.sent])

  const toggleSent = async (key: string, value: boolean) => {
    const prev = sent
    setSent(s => {
      const next = { ...s }
      if (value) next[key] = new Date().toLocaleDateString('sv-SE')
      else delete next[key]
      return next
    })
    setSentError(null)
    try {
      const res = await fetch(sentEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, sent: value }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? res.statusText)
      if (json.date) setSent(s => ({ ...s, [key]: json.date }))
    } catch (e) {
      setSent(prev)
      setSentError(`No se guardó "Enviada": ${(e as Error).message}`)
    }
  }

  const kits = useMemo(
    () =>
      data.kits.filter(
        k =>
          (!strong || k.verdict.toLowerCase().startsWith('strong')) &&
          (!noEnglish || !k.spokenEnglish) &&
          (!unsent || !sent[k.key]),
      ),
    [data.kits, strong, noEnglish, unsent, sent],
  )
  const rowFilter = (r: Row) =>
    (!strong || r.verdict.toLowerCase().startsWith('strong')) && (!noEnglish || !r.languageGate || r.languageGate === 'PASS')
  const ranked = data.ranked.filter(rowFilter)
  const discarded = data.discarded.filter(rowFilter)
  const sentCount = data.kits.filter(k => sent[k.key]).length
  const others = Object.entries(data.otherStatuses)

  return (
    <main className="section-shell space-y-6 py-8 sm:space-y-8 sm:py-12">
      <header>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-4xl font-medium tracking-tight md:text-5xl">Búsqueda laboral</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {data.kits.length} con kit ({sentCount} enviadas) · {data.ranked.length} rankeadas sin kit · {data.discarded.length} descartadas por ubicación
          {others.length > 0 && <> · {others.map(([s, n]) => `${n} ${s}`).join(', ')}</>}
          {data.generatedAt && <> · kits {data.generatedAt}</>}
        </p>
      </header>

      {data.errors.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-primary/50 bg-primary/10 p-4 text-sm text-primary">
          {data.errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      {runPanel}
      <IdentityBlock fields={data.identity} />

      <div className="sticky top-0 z-10 -mx-5 flex gap-2 overflow-x-auto bg-background/90 px-5 py-2 backdrop-blur sm:mx-0 sm:flex-wrap sm:px-0">
        <Toggle checked={unsent} onChange={setUnsent}>
          Sin enviar
        </Toggle>
        <Toggle checked={strong} onChange={setStrong}>
          Encaje fuerte
        </Toggle>
        <Toggle checked={noEnglish} onChange={setNoEnglish}>
          Sin alerta de inglés
        </Toggle>
      </div>
      {sentError && <p className="text-sm text-primary">{sentError}</p>}

      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-2xl font-medium">
          Con kit <span className="text-muted-foreground">· {kits.length}</span>
        </h2>
        {kits.length === 0 && <p className="text-sm text-muted-foreground">Nada que mostrar con estos filtros.</p>}
        {kits.map(k => (
          <KitCard key={k.key} kit={k} sentDate={sent[k.key] ?? null} onToggle={v => toggleSent(k.key, v)} />
        ))}
      </section>

      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-2xl font-medium">
          Resto de las rankeadas <span className="text-muted-foreground">· {ranked.length}</span>
        </h2>
        <JobsTable rows={ranked} discarded={false} />
      </section>

      <section className="space-y-3 sm:space-y-4">
        <h2 className="text-2xl font-medium">
          Descartadas por ubicación <span className="text-muted-foreground">· {discarded.length}</span>
        </h2>
        <JobsTable rows={discarded} discarded />
      </section>
    </main>
  )
}
