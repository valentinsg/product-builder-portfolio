import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  metadataBase: new URL('https://valentinsg-portoflio.vercel.app'),
  alternates: { canonical: '/' },
  title: 'Valentín Sánchez Guevara — Product Builder & Full-Stack Engineer',
  description:
    'Full-stack engineer and product builder from Mar del Plata, Argentina. I design, build and ship digital products end to end with React, Next.js, TypeScript, Node.js and Java — from the first idea to software running in production.',
  keywords: [
    'Valentín Sánchez Guevara',
    'Product Builder',
    'Full-Stack Engineer',
    'Full-Stack Developer',
    'React',
    'Next.js',
    'TypeScript',
    'Node.js',
    'Software Engineer Argentina',
    'Mar del Plata',
    'Remote Developer',
  ],
  authors: [{ name: 'Valentín Sánchez Guevara' }],
  creator: 'Valentín Sánchez Guevara',
  openGraph: {
    title: 'Valentín Sánchez Guevara — Product Builder & Full-Stack Engineer',
    description:
      'I build digital products that people enjoy using — from the first rough idea to software running in production.',
    type: 'website',
    url: '/',
    locale: 'en_US',
    alternateLocale: 'es_AR',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#090909',
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Valentín Sánchez Guevara',
  jobTitle: 'Full-Stack Engineer & Product Builder',
  url: 'https://valentinsg-portoflio.vercel.app',
  email: 'mailto:sanchezguevaravalentin@gmail.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Mar del Plata', addressCountry: 'AR' },
  sameAs: ['https://www.linkedin.com/in/valent%C3%ADn-s-761910200/', 'https://github.com/valentinsg'],
  knowsAbout: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Java', 'PostgreSQL', 'Product Development', 'SEO'],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
