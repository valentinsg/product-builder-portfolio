#!/usr/bin/env node
/*
 * Syncs job-search state between the framework (JOB_SEARCH_DIR) and the
 * private Vercel Blob store the admin panel reads. Needs BLOB_READ_WRITE_TOKEN
 * (environment or .env.local).
 *
 *   node scripts/jobs-blob.mjs pull   Blob → framework: seen_jobs, kits, sent.
 *                                     Overwritten files are copied first to
 *                                     reports/blob-pull-backup/.
 *   node scripts/jobs-blob.mjs push   framework → Blob: seen_jobs, kits, profile,
 *                                     last run. Never sent.json: the admin panel
 *                                     owns it.
 *   node scripts/jobs-blob.mjs seed   push, plus sent.json. First upload only.
 *
 * jobs-run.mjs calls pull before a run and push after it when the token is set.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { get, put } from '@vercel/blob'
import { BLOB_FILES } from '../lib/jobs/blob-paths.mjs'

const PUSHED = ['seen', 'kits', 'profile', 'status', 'log']
const PULLED = ['seen', 'kits', 'sent']

async function readBlob(pathname) {
  const res = await get(pathname, { access: 'private', useCache: false })
  if (!res || res.statusCode !== 200) return null
  return Buffer.from(await new Response(res.stream).arrayBuffer())
}

async function upload(dir, name) {
  const { blob, local } = BLOB_FILES[name]
  const file = path.join(dir, local)
  if (!fs.existsSync(file)) return false
  await put(blob, fs.readFileSync(file), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: blob.endsWith('.json') ? 'application/json' : 'text/plain; charset=utf-8',
    cacheControlMaxAge: 60,
  })
  return true
}

export async function pull(dir) {
  const backup = path.join(dir, 'reports', 'blob-pull-backup')
  const pulled = []
  for (const name of PULLED) {
    const { blob, local } = BLOB_FILES[name]
    const data = await readBlob(blob)
    if (!data) continue
    const file = path.join(dir, local)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    if (fs.existsSync(file)) {
      fs.mkdirSync(backup, { recursive: true })
      fs.copyFileSync(file, path.join(backup, path.basename(file)))
    }
    const tmp = `${file}.${process.pid}.tmp`
    fs.writeFileSync(tmp, data)
    fs.renameSync(tmp, file)
    pulled.push(name)
  }
  return pulled
}

export async function push(dir, { includeSent = false } = {}) {
  const pushed = []
  for (const name of includeSent ? [...PUSHED, 'sent'] : PUSHED) {
    if (await upload(dir, name)) pushed.push(name)
  }
  return pushed
}

/** Live progress for the admin panel: the log and run state only. */
export async function pushProgress(dir) {
  await upload(dir, 'log')
  await upload(dir, 'status')
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
  if (!process.env.JOB_SEARCH_DIR || !process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      process.loadEnvFile(path.join(root, '.env.local'))
    } catch {}
  }
  const dir = process.env.JOB_SEARCH_DIR?.trim()
  const cmd = process.argv[2]
  if (!dir || !fs.existsSync(dir)) {
    console.error('JOB_SEARCH_DIR falta o no existe')
    process.exit(2)
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Falta BLOB_READ_WRITE_TOKEN')
    process.exit(2)
  }
  if (cmd === 'pull') console.log('pull:', (await pull(dir)).join(', ') || '(nada en Blob)')
  else if (cmd === 'push') console.log('push:', (await push(dir)).join(', '))
  else if (cmd === 'seed') console.log('seed:', (await push(dir, { includeSent: true })).join(', '))
  else {
    console.error('Uso: node scripts/jobs-blob.mjs pull|push|seed')
    process.exit(2)
  }
}
