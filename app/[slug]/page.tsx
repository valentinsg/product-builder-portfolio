import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { adminEnabled, isAuthed, slugMatches } from '@/lib/admin/auth'
import { loadBoardFromBlob } from '@/lib/jobs/blob'
import { AdminBoard, AdminLogin } from './admin-client'

// Private job-search panel. Lives at /<ADMIN_SLUG> (env var, not in this
// repo); every other top-level path that reaches here is a plain 404, and so
// is this one when the admin env vars are not set. See lib/admin/auth.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Panel',
  robots: { index: false, follow: false, nocache: true },
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!adminEnabled() || !slugMatches(slug)) notFound()
  if (!(await isAuthed())) return <AdminLogin slug={slug} />
  return <AdminBoard data={await loadBoardFromBlob()} />
}
