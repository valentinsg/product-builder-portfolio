import type { Metadata } from 'next'
import PelotitaCaseStudy from './pelotita-case-study'

export const metadata: Metadata = {
  title: 'Pelotita — Case Study | Valentín Sánchez Guevara',
  description:
    'How I built and solo-operate Pelotita, a live football platform on a self-hosted VPS — architecture, real production incidents, and the infrastructure decisions behind them.',
  alternates: { canonical: '/case-study/pelotita' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Pelotita — Case Study',
    description: 'A live football platform I built and operate solo, end to end, in production.',
    type: 'article',
    url: '/case-study/pelotita',
    images: ['/pelotita-home.png'],
  },
}

export default function PelotitaCaseStudyPage() {
  return <PelotitaCaseStudy />
}
