/*
 * Shapes the job-search framework's files for the job board: read from disk
 * (JOB_SEARCH_DIR, the local /jobs panel) or handed in from the private Blob
 * store (the admin panel, see lib/jobs/blob). Every field coming from
 * a posting is untrusted: values are coerced to plain strings here and only
 * ever rendered as text; links are kept only when they are http(s).
 *
 * The turbopackIgnore hints keep these runtime-only paths out of file tracing;
 * without them the build traces the whole project into the serverless bundle.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CV_BASE = 'https://github.com/valentinsg/product-builder-portfolio/blob/main/'

export type Link = { label: string; url: string }

export type Kit = {
  key: string
  score: number | null
  verdict: string
  title: string
  company: string
  where: string
  url: string | null
  altUrls: Link[]
  cvFile: string
  cvUrl: string | null
  messageLang: string
  spokenEnglish: boolean
  chips: string[]
  why: string[]
  watch: string[]
  message: string
  location: string
  locationVerdict: string
  languageNote: string
}

export type Row = {
  key: string
  score: number | null
  verdict: string
  title: string
  company: string
  url: string | null
  location: string
  locationVerdict: string
  languageGate: string
  firstGap: string
}

export type FormField = { label: string; value: string; note: string }

export type Config = {
  dir: string
  dirOk: boolean
  claudeBin: string
  claudeBinOk: boolean
  claudeBinFound: string | null
}

/** What the job board renders, wherever the files came from (disk or Blob). */
export type BoardData = {
  generatedAt: string
  kits: Kit[]
  ranked: Row[]
  discarded: Row[]
  otherStatuses: Record<string, number>
  sent: Record<string, string>
  identity: FormField[]
  errors: string[]
}

export type JobsData = BoardData & { config: Config }

/** Raw framework files: parsed seen_jobs.json, kits.json, sent.json and CLAUDE.md text. */
export type RawJobs = { seen: unknown; kits: unknown; sent: unknown; claudeMd: string | null }

const str =(v: unknown) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '')
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const strList = (v: unknown) => (Array.isArray(v) ? v.map(str).filter(Boolean) : [])

export function safeUrl(v: unknown): string | null {
  const s = str(v).trim()
  if (!s) return null
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : null
  } catch {
    return null
  }
}

export function jobPaths(dir: string) {
  return {
    seen: path.join(/*turbopackIgnore: true*/ dir, 'job_scraper', 'seen_jobs.json'),
    kits: path.join(/*turbopackIgnore: true*/ dir, 'reports', 'kits.json'),
    sent: path.join(/*turbopackIgnore: true*/ dir, 'reports', 'sent.json'),
    claudeMd: path.join(/*turbopackIgnore: true*/ dir, 'CLAUDE.md'),
    settings: path.join(/*turbopackIgnore: true*/ dir, '.claude', 'settings.json'),
    lock: path.join(/*turbopackIgnore: true*/ dir, 'reports', 'run.lock'),
    log: path.join(/*turbopackIgnore: true*/ dir, 'reports', 'last-run.log'),
    status: path.join(/*turbopackIgnore: true*/ dir, 'reports', 'last-run.json'),
  }
}

function isFile(p: string) {
  try {
    return fs.statSync(/*turbopackIgnore: true*/ p).isFile()
  } catch {
    return false
  }
}

function isDir(p: string) {
  try {
    return fs.statSync(/*turbopackIgnore: true*/ p).isDirectory()
  } catch {
    return false
  }
}

/** Newest Claude Code binary bundled with the VS Code extension, offered as a hint only. */
function findExtensionClaude(): string | null {
  const extDir = path.join(/*turbopackIgnore: true*/ os.homedir(), '.vscode', 'extensions')
  try {
    const candidates = fs
      .readdirSync(extDir)
      .filter(name => name.startsWith('anthropic.claude-code-'))
      .map(name => path.join(/*turbopackIgnore: true*/ extDir, name, 'resources', 'native-binary', process.platform === 'win32' ? 'claude.exe' : 'claude'))
      .filter(isFile)
    return candidates.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0] ?? null
  } catch {
    return null
  }
}

export function getConfig(): Config {
  const dir = process.env.JOB_SEARCH_DIR?.trim() ?? ''
  const claudeBin = process.env.CLAUDE_BIN?.trim() ?? ''
  const claudeBinOk = claudeBin !== '' && isFile(claudeBin)
  return {
    dir,
    dirOk: dir !== '' && isDir(dir),
    claudeBin,
    claudeBinOk,
    claudeBinFound: claudeBinOk ? null : findExtensionClaude(),
  }
}

function readJson(file: string, errors: string[], optional = false): unknown {
  try {
    return JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ file, 'utf8'))
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code
    if (!(optional && code === 'ENOENT')) errors.push(`No pude leer ${file}: ${code ?? (e as Error).message}`)
    return null
  }
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
}

const KEY_RE = /^[\w.-]{1,200}$/

export function isValidKey(key: unknown): key is string {
  return typeof key === 'string' && KEY_RE.test(key)
}

export function sanitizeSent(v: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, date] of Object.entries(asRecord(v))) {
    if (isValidKey(k) && typeof date === 'string') out[k] = date
  }
  return out
}

export function readSent(file: string, errors: string[] = []): Record<string, string> {
  return sanitizeSent(readJson(file, errors, true))
}

/** Write via a temp file in the same directory, then rename over the target. */
export function writeJsonAtomic(file: string, data: unknown) {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`
  fs.writeFileSync(/*turbopackIgnore: true*/ tmp, JSON.stringify(data, null, 2) + '\n', 'utf8')
  try {
    fs.renameSync(/*turbopackIgnore: true*/ tmp, file)
  } catch (e) {
    fs.rmSync(/*turbopackIgnore: true*/ tmp, { force: true })
    throw e
  }
}

function altLinks(v: unknown): Link[] {
  if (!Array.isArray(v)) return []
  const links: Link[] = []
  v.forEach((item, i) => {
    const rec = asRecord(item)
    const url = safeUrl(typeof item === 'string' ? item : rec.url)
    if (url) links.push({ label: str(rec.label) || `Link alternativo ${i + 1}`, url })
  })
  return links
}

function cvUrl(file: string) {
  return /^[\w.-]+\.(pdf|html)$/.test(file) ? CV_BASE + encodeURIComponent(file) : null
}

const LABELS: Record<string, string> = {
  Name: 'Nombre',
  Location: 'Ubicación',
  Email: 'Email',
  Phone: 'Teléfono',
  Status: 'Situación',
  'Salary floor': 'Pretensión salarial',
}
const SKIP_LABELS = new Set(['CV language', 'Languages'])

function stripMd(s: string) {
  return s.replace(/\*\*|`/g, '').trim()
}

/** Splits "main text (aside)" so the copy button copies only the main part. */
function field(label: string, raw: string): FormField {
  const value = stripMd(raw)
  const paren = value.match(/^(.+?)\s+\((.+)\)\.?(.*)$/)
  if (paren) return { label, value: paren[1].trim(), note: [paren[2], paren[3]].map(s => s.trim()).filter(Boolean).join(' · ') }
  return { label, value, note: '' }
}

function contactField(part: string): FormField {
  const v = part.trim()
  if (v.includes('@')) return { label: 'Email', value: v, note: '' }
  if (/^\+?[\d\s()-]{7,}$/.test(v)) return { label: 'Teléfono', value: v, note: '' }
  const url = /^https?:\/\//.test(v) ? v : `https://${v}`
  const label = /linkedin\./i.test(v) ? 'LinkedIn' : /github\./i.test(v) ? 'GitHub' : 'Portfolio'
  return { label, value: url, note: '' }
}

/** Parses "### Identity" in the framework's CLAUDE.md into copyable form fields. */
export function parseIdentity(md: string): FormField[] {
  const section = md.match(/^###\s+Identity\s*$([\s\S]*?)(?=^#{1,3}\s)/m)?.[1]
  if (!section) return []
  const fields: FormField[] = []
  for (const line of section.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/)) {
    const bullet = line.match(/^\s*-\s+\*\*(.+?):\*\*\s*(.*)$/)
    if (bullet) {
      const [, label, value] = bullet
      if (SKIP_LABELS.has(label) || !value.trim() || /^not recorded$/i.test(value.trim())) continue
      if (label === 'Contact') fields.push(...value.split('·').filter(p => p.trim()).map(contactField))
      else fields.push(field(LABELS[label] ?? label, value))
      continue
    }
    const row = line.match(/^\s*\|(.+)\|\s*$/)
    if (row) {
      const [lang, level] = row[1].split('|').map(c => c.trim())
      if (!lang || !level || lang === 'Language' || /^-+$/.test(lang)) continue
      const sentence = stripMd(level).split(/\.\s/)[0].replace(/\.$/, '')
      fields.push({ label: `Idioma: ${stripMd(lang)}`, value: sentence, note: '' })
    }
  }
  return fields
}

export function readJobsData(): JobsData {
  const config = getConfig()
  const errors: string[] = []
  if (!config.dirOk) {
    errors.push(config.dir ? `JOB_SEARCH_DIR no existe: ${config.dir}` : 'Falta JOB_SEARCH_DIR en .env.local')
    return { config, ...shapeJobsData({ seen: null, kits: null, sent: null, claudeMd: '' }, errors) }
  }
  const p = jobPaths(config.dir)
  let claudeMd: string | null = null
  try {
    claudeMd = fs.readFileSync(/*turbopackIgnore: true*/ p.claudeMd, 'utf8')
  } catch {
    errors.push(`No pude leer ${p.claudeMd}`)
  }
  const raw: RawJobs = {
    seen: readJson(p.seen, errors),
    kits: readJson(p.kits, errors),
    sent: readJson(p.sent, errors, true),
    claudeMd,
  }
  return { config, ...shapeJobsData(raw, errors) }
}

/** Shapes raw framework files into board data. Pure: no I/O. */
export function shapeJobsData(raw: RawJobs, errors: string[] = []): BoardData {
  const seen = asRecord(asRecord(raw.seen).seen)
  const kitsFile = asRecord(raw.kits)
  const sent = sanitizeSent(raw.sent)

  let identity: FormField[] = []
  if (raw.claudeMd !== null) {
    identity = parseIdentity(raw.claudeMd)
    if (!identity.length && raw.claudeMd) errors.push('No encontré la sección "### Identity" en CLAUDE.md del framework')
  }

  const kitKeys = new Set<string>()
  const kits: Kit[] = (Array.isArray(kitsFile.jobs) ? kitsFile.jobs : [])
    .map(asRecord)
    .filter(j => str(j.key))
    .map(j => {
      const key = str(j.key)
      kitKeys.add(key)
      const s = asRecord(seen[key])
      const cvFile = str(j.cv_file)
      return {
        key,
        score: num(j.score) ?? num(s.rank_score),
        verdict: str(j.verdict),
        title: str(j.title) || str(s.title),
        company: str(j.company) || str(s.company),
        where: str(j.where),
        url: safeUrl(j.url) ?? safeUrl(s.url),
        altUrls: altLinks(j.alt_urls),
        cvFile,
        cvUrl: cvUrl(cvFile),
        messageLang: str(j.message_lang),
        spokenEnglish: j.spoken_english_flag === true,
        chips: strList(j.chips),
        why: strList(j.why),
        watch: strList(j.watch),
        message: str(j.message),
        location: str(s.location),
        locationVerdict: str(s.location_verdict),
        languageNote: str(s.language_note),
      }
    })
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1))

  const ranked: Row[] = []
  const discarded: Row[] = []
  const otherStatuses: Record<string, number> = {}
  for (const [key, value] of Object.entries(seen)) {
    const s = asRecord(value)
    const status = str(s.status) || 'sin estado'
    if (status !== 'ranked') {
      otherStatuses[status] = (otherStatuses[status] ?? 0) + 1
      continue
    }
    if (kitKeys.has(key)) continue
    const row: Row = {
      key,
      score: num(s.rank_score),
      verdict: str(s.rank_verdict),
      title: str(s.title),
      company: str(s.company),
      url: safeUrl(s.url),
      location: str(s.location),
      locationVerdict: str(s.location_verdict),
      languageGate: str(s.language_gate),
      firstGap: strList(s.gaps)[0] ?? '',
    }
    ;(row.locationVerdict === 'FAIL' ? discarded : ranked).push(row)
  }
  const byScore = (a: Row, b: Row) => (b.score ?? -1) - (a.score ?? -1)
  ranked.sort(byScore)
  discarded.sort(byScore)

  return { generatedAt: str(kitsFile.generated_at), kits, ranked, discarded, otherStatuses, sent, identity, errors }
}
