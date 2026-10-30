import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { isDev, isLocalHost } from '@/lib/jobs/guard'
import { readJobsData } from '@/lib/jobs/data'
import JobsClient from './jobs-client'

// Local job-search panel. Dev server only, reached as localhost: everywhere
// else it is a 404 and reads nothing. Not linked from the site.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Búsqueda laboral (local)',
  robots: { index: false, follow: false },
}

export default async function JobsPage() {
  if (!isDev()) notFound()
  if (!isLocalHost((await headers()).get('host'))) notFound()
  return <JobsClient data={readJobsData()} />
}
