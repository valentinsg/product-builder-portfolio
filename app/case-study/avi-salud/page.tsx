import type { Metadata } from 'next'
import AviSaludCaseStudy from './avi-salud-case-study'

export const metadata: Metadata = {
  title: 'AVI Salud Admin — Case Study | Valentín Sánchez Guevara',
  description:
    'Tech lead on AVI Salud Admin, an internal operations panel for a home-healthcare company — recovering an unversioned production Postgres schema, configurable RBAC enforced in RLS, and migration discipline on a shared production database.',
  alternates: { canonical: '/case-study/avi-salud' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'AVI Salud Admin — Case Study',
    description:
      'Business software, operational workflows, authorization, and automation on a shared production database. Companion to the Pelotita case study.',
    type: 'article',
    url: '/case-study/avi-salud',
  },
}

export default function AviSaludCaseStudyPage() {
  return <AviSaludCaseStudy />
}
