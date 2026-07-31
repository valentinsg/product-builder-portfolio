import type { Metadata } from 'next'
import MoodboardClient from './moodboard-client'

export const metadata: Metadata = {
  title: 'Moodboard — Valentín Sánchez Guevara',
  description: 'Visual references organized by feature type — navbars, CTAs, landing pages, components, icons and more. A reference to check before designing anything new.',
  alternates: { canonical: '/moodboard' },
  robots: { index: true, follow: true },
}

export default function MoodboardPage() {
  return <MoodboardClient />
}
