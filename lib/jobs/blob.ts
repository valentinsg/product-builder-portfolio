/*
 * Admin panel side of the private Blob store: reads the job-search files the
 * runner uploads (scripts/jobs-blob.mjs) and owns sent.json. Reads bypass the
 * CDN cache so a fresh run or a just-toggled "Enviada" shows immediately.
 */
import { get, put } from '@vercel/blob'
import { BLOB_FILES } from './blob-paths.mjs'
import { sanitizeSent, shapeJobsData, type BoardData } from './data'

type FileName = keyof typeof BLOB_FILES

async function readText(name: FileName): Promise<string | null> {
  const res = await get(BLOB_FILES[name].blob, { access: 'private', useCache: false })
  if (!res || res.statusCode !== 200) return null
  return await new Response(res.stream).text()
}

async function readJson(name: FileName, errors: string[]): Promise<unknown> {
  const text = await readText(name)
  if (text === null) return null
  try {
    return JSON.parse(text)
  } catch {
    errors.push(`${BLOB_FILES[name].blob} no es JSON válido`)
    return null
  }
}

export async function loadBoardFromBlob(): Promise<BoardData> {
  const errors: string[] = []
  try {
    const [seen, kits, sent, claudeMd] = await Promise.all([
      readJson('seen', errors),
      readJson('kits', errors),
      readJson('sent', errors),
      readText('profile'),
    ])
    if (!kits) errors.push('Todavía no hay kits en el storage: corré una búsqueda o subilos desde la PC (node scripts/jobs-blob.mjs seed).')
    return shapeJobsData({ seen, kits, sent, claudeMd }, errors)
  } catch (e) {
    errors.push(`No pude leer el storage: ${(e as Error).message}`)
    return shapeJobsData({ seen: null, kits: null, sent: null, claudeMd: null }, errors)
  }
}

export async function setSent(key: string, sent: boolean) {
  const errors: string[] = []
  const current = sanitizeSent(await readJson('sent', errors))
  if (errors.length) throw new Error(errors[0])
  if (sent) current[key] = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Buenos_Aires' })
  else delete current[key]
  await put(BLOB_FILES.sent.blob, JSON.stringify(current, null, 2) + '\n', {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  })
  return current[key] ?? null
}

/** Run state and the tail of the log, as the runner last uploaded them. */
export async function readRunProgress(maxLog = 30_000) {
  const errors: string[] = []
  const [status, log] = await Promise.all([readJson('status', errors), readText('log')])
  return { status: status as Record<string, unknown> | null, log: log ? log.slice(-maxLog) : '' }
}
