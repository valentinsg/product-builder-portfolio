'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const LANG_KEY = 'vsg-lang'

type Lang = 'en' | 'es'

const content = {
  en: {
    eyebrow: 'Moodboard',
    title: ['Visual references,', 'by feature type.'],
    intro: 'Real screens, components and sites, organized by what they solve — not by tool. Check here before designing anything new.',
    backHome: 'Back to portfolio',
    categories: [
      { name: 'Navbars', description: 'Real navbar patterns from live products.', links: [{ label: 'Navbar Gallery', href: 'https://navbar.gallery' }] },
      { name: 'Calls to action', description: 'CTA patterns and button copy from real products.', links: [{ label: 'CTA Gallery', href: 'https://cta.gallery' }] },
      { name: 'Landing pages', description: 'SaaS landing pages and general landing inspiration.', links: [{ label: 'Saaspo', href: 'https://saaspo.com' }, { label: 'Landing.love', href: 'https://landing.love' }] },
      { name: 'Whole sites', description: 'Curated full sites worth a closer look.', links: [{ label: 'Craftwork — Curated Websites', href: 'https://craftwork.design/curated/websites' }] },
      { name: 'Design system components', description: 'Real components from real design systems.', links: [{ label: 'Component Gallery', href: 'https://component.gallery/design-systems/' }] },
      { name: 'Mobile & web screens', description: 'Real screens from live mobile and web apps.', links: [{ label: 'Mobbin', href: 'https://mobbin.com' }] },
      { name: 'Rebrands', description: 'Brand refresh case studies.', links: [{ label: 'Rebrand Gallery', href: 'https://rebrand.gallery' }] },
      { name: 'Icons', description: 'Icon library for product UI.', links: [{ label: 'Hugeicons', href: 'https://hugeicons.com' }] },
      { name: 'AI image prompts', description: 'Prompts for generating images/video with AI (GPT Image, Nano Banana, Seedance) — for when you need illustrations or hero art.', links: [{ label: 'MeiGen', href: 'https://www.meigen.ai' }] },
    ],
  },
  es: {
    eyebrow: 'Moodboard',
    title: ['Referencias visuales,', 'por tipo de feature.'],
    intro: 'Pantallas, componentes y sitios reales, organizados por lo que resuelven — no por herramienta. Revisar acá antes de diseñar algo nuevo.',
    backHome: 'Volver al portfolio',
    categories: [
      { name: 'Navbars', description: 'Patrones reales de navbars de productos en producción.', links: [{ label: 'Navbar Gallery', href: 'https://navbar.gallery' }] },
      { name: 'Calls to action', description: 'Patrones de CTAs y copy de botones de productos reales.', links: [{ label: 'CTA Gallery', href: 'https://cta.gallery' }] },
      { name: 'Landing pages', description: 'Landing pages de SaaS e inspiración general de landings.', links: [{ label: 'Saaspo', href: 'https://saaspo.com' }, { label: 'Landing.love', href: 'https://landing.love' }] },
      { name: 'Sitios completos', description: 'Sitios completos curados, para mirar con más detalle.', links: [{ label: 'Craftwork — Curated Websites', href: 'https://craftwork.design/curated/websites' }] },
      { name: 'Componentes de design systems', description: 'Componentes reales de design systems reales.', links: [{ label: 'Component Gallery', href: 'https://component.gallery/design-systems/' }] },
      { name: 'Pantallas móviles y web', description: 'Pantallas reales de apps móviles y web en producción.', links: [{ label: 'Mobbin', href: 'https://mobbin.com' }] },
      { name: 'Rebrands', description: 'Casos de rebrand.', links: [{ label: 'Rebrand Gallery', href: 'https://rebrand.gallery' }] },
      { name: 'Iconos', description: 'Librería de iconos para UI de producto.', links: [{ label: 'Hugeicons', href: 'https://hugeicons.com' }] },
      { name: 'Prompts de imágenes IA', description: 'Prompts para generar imágenes/video con IA (GPT Image, Nano Banana, Seedance) — para cuando necesitás ilustraciones o heroes generados.', links: [{ label: 'MeiGen', href: 'https://www.meigen.ai' }] },
    ],
  },
} as const

export default function MoodboardClient() {
  const [language, setLanguage] = useState<Lang>('en')

  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_KEY)
    if (stored === 'en' || stored === 'es') setLanguage(stored)
  }, [])

  const t = content[language]

  const chooseLanguage = (lang: Lang) => {
    setLanguage(lang)
    window.localStorage.setItem(LANG_KEY, lang)
  }

  return (
    <main className="overflow-clip bg-background text-foreground min-h-svh">
      <header className="section-shell flex items-center justify-between py-8">
        <Link href="/" className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em]" aria-label={t.backHome}>
          <span className="brand-mark">V</span>
          <span className="nav-link">← {t.backHome}</span>
        </Link>
        <div className="lang-toggle" role="group" aria-label="Language">
          <button className={language === 'en' ? 'active' : ''} onClick={() => chooseLanguage('en')} aria-pressed={language === 'en'}>EN</button>
          <span aria-hidden>/</span>
          <button className={language === 'es' ? 'active' : ''} onClick={() => chooseLanguage('es')} aria-pressed={language === 'es'}>ES</button>
        </div>
      </header>

      <section className="section-shell pb-28 pt-6 md:pb-40">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="mt-6 section-title">{t.title[0]}<br />{t.title[1]}</h1>
        <p className="mt-8 max-w-xl body-copy">{t.intro}</p>

        <div className="moodboard-grid">
          {t.categories.map(category => (
            <div className="moodboard-card" key={category.name}>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <div className="moodboard-links">
                {category.links.map(link => (
                  <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="tag hub-tag-link">{link.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
