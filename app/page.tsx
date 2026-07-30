'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Check, Copy, Menu, X } from 'lucide-react'
import Lenis from 'lenis'
import Journey from '@/components/journey'
import HowIBuild from '@/components/how-i-build'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const EMAIL = 'sanchezguevaravalentin@gmail.com'
const WHATSAPP = 'https://wa.me/5492236680041'
const LANG_KEY = 'vsg-lang'
const SECTION_IDS = ['top', 'journey', 'build', 'about', 'contact']

const images = {
  portrait: '/valentin-portrait.png',
  face: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1749159131628-xvOomONYtdEEGj03bRdHDNgDeK2xzG.jpeg',
  collage: '/about-collage-original.png',
}

type Lang = 'en' | 'es'

const content = {
  en: {
    nav: [['Journey', '#journey'], ['How I build', '#build'], ['About', '#about'], ['Contact', '#contact']],
    minimap: { top: 'Home', journey: 'Journey', build: 'How I build', about: 'About', contact: 'Contact' } as Record<string, string>,
    available: 'Available for work',
    brand: 'Valentín / Product Builder',
    hero: {
      role: 'Full-Stack Engineer · Product Builder',
      location: 'Mar del Plata — Argentina',
      titleA: 'I build',
      titleB: 'products.',
      intro: 'I take ideas from a sketch to production: products, systems and businesses used by real people. Always learning, so what I build works well and scales without breaking.',
      ctaWork: 'View the journey',
      ctaThink: 'How I build',
    },
    about: {
      eyebrow: '03 — Who I really am',
      title: ['Code, music,', 'training and Boca.'],
      copy: 'I enjoy training, learning how businesses grow and gaming. I’m a bit of a music nerd — hip-hop culture in particular — and there’s always some side project of mine in the works.',
      nowLabel: 'Now building',
      now: [
        { label: 'Stockeo', href: 'https://mistock.estudiove.com' },
        { label: 'Pelotita', href: '' },
        { label: 'Estudio Ve', href: 'https://estudiove.com' },
        { label: 'Avi Salud', href: 'https://www.avisalud.com.ar/' },
        { label: 'Presidential Simulator', href: '' },
      ],
      exploringLabel: 'Cambridge B2',
      exploring: ['Preparing for the exam'],
      always: 'Boca Juniors fan 💙💛💙',
    },
    footer: {
      eyebrow: '04 — Let’s ship',
      title: ['Let’s build', 'something real.'],
      copy: 'Have an idea you want to bring to life, a product that’s stuck, or a team that needs an extra pair of hands? Write me. I always reply.',
      formCompany: 'Company or name',
      formCompanyPlaceholder: 'Who are you?',
      formEmail: 'Your email',
      formMessage: 'What are you working on?',
      formMessagePlaceholder: 'A short note is enough.',
      formSubmit: 'Write me a note',
      wsp: 'Chat on WhatsApp',
      backToTop: 'Back to top',
      subject: 'Portfolio note from',
    },
  },
  es: {
    nav: [['Recorrido', '#journey'], ['Cómo construyo', '#build'], ['Sobre mí', '#about'], ['Contacto', '#contact']],
    minimap: { top: 'Inicio', journey: 'Recorrido', build: 'Cómo construyo', about: 'Sobre mí', contact: 'Contacto' } as Record<string, string>,
    available: 'Disponible para proyectos',
    brand: 'Valentín / Product Builder',
    hero: {
      role: 'Ingeniero Full-Stack · Product Builder',
      location: 'Mar del Plata — Argentina',
      titleA: 'Construyo',
      titleB: 'productos.',
      intro: 'Llevo ideas del boceto a producción: productos, sistemas y negocios usados por personas reales. Siempre aprendiendo, para que lo que construyo funcione bien y pueda crecer sin romperse.',
      ctaWork: 'Ver el recorrido',
      ctaThink: 'Cómo construyo',
    },
    about: {
      eyebrow: '03 — Quién soy realmente',
      title: ['Código, música,', 'entrenamiento y Boca.'],
      copy: 'Disfruto entrenar, entender cómo crecen los negocios y jugar. Soy bastante melómano —la cultura del hip-hop en particular— y siempre tengo algún proyecto paralelo dando vueltas.',
      nowLabel: 'Construyendo ahora',
      now: [
        { label: 'Stockeo', href: 'https://mistock.estudiove.com' },
        { label: 'Pelotita', href: '' },
        { label: 'Estudio Ve', href: 'https://estudiove.com' },
        { label: 'Avi Salud', href: 'https://www.avisalud.com.ar/' },
        { label: 'Simulador presidencial', href: '' },
      ],
      exploringLabel: 'Cambridge B2',
      exploring: ['Preparando el examen'],
      always: 'Enfermo por Boca 💙💛💙',
    },
    footer: {
      eyebrow: '04 — Hagámoslo realidad',
      title: ['Construyamos', 'algo real.'],
      copy: '¿Tenés una idea dando vueltas, un producto trabado o un equipo que necesita manos? Escribime. Respondo siempre.',
      formCompany: 'Empresa o nombre',
      formCompanyPlaceholder: '¿Quién sos?',
      formEmail: 'Tu email',
      formMessage: '¿En qué estás trabajando?',
      formMessagePlaceholder: 'Con una nota breve alcanza.',
      formSubmit: 'Escribime',
      wsp: 'Hablemos por WhatsApp',
      backToTop: 'Volver arriba',
      subject: 'Nota desde el portfolio de',
    },
  },
} as const

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [language, setLanguage] = useState<Lang>('en')
  const [showLangModal, setShowLangModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeSection, setActiveSection] = useState('top')
  const lenisRef = useRef<Lenis | null>(null)

  const t = content[language]

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (fromUrl === 'en' || fromUrl === 'es') {
      setLanguage(fromUrl)
      window.localStorage.setItem(LANG_KEY, fromUrl)
      return
    }
    const stored = window.localStorage.getItem(LANG_KEY)
    if (stored === 'en' || stored === 'es') {
      setLanguage(stored)
    } else {
      setShowLangModal(true)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]')
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.04, rootMargin: '0px 0px 12% 0px' })
    const revealPassedNodes = () => nodes.forEach(node => {
      if (node.getBoundingClientRect().top < window.innerHeight * 1.12) {
        node.classList.add('is-visible')
        observer.unobserve(node)
      }
    })
    nodes.forEach(node => observer.observe(node))
    revealPassedNodes()
    const restoreTimer = window.setTimeout(revealPassedNodes, 600)
    window.addEventListener('scroll', revealPassedNodes, { passive: true })
    window.addEventListener('load', revealPassedNodes)
    return () => {
      observer.disconnect()
      window.clearTimeout(restoreTimer)
      window.removeEventListener('scroll', revealPassedNodes)
      window.removeEventListener('load', revealPassedNodes)
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.15 })
    lenisRef.current = lenis
    let frame = 0
    const loop = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(loop) }
    frame = requestAnimationFrame(loop)
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest?.('a[href^="#"]')
      if (!anchor) return
      const target = document.querySelector(anchor.getAttribute('href') || '')
      if (!target) return
      event.preventDefault()
      lenis.scrollTo(target as HTMLElement, { offset: -64 })
    }
    document.addEventListener('click', onClick)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('click', onClick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    const sections = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => entry.isIntersecting && setActiveSection(entry.target.id)),
      { rootMargin: '-40% 0px -55% 0px' },
    )
    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    if (!section) return
    if (lenisRef.current) lenisRef.current.scrollTo(section, { offset: id === 'top' ? 0 : -64 })
    else section.scrollIntoView({ behavior: 'smooth' })
  }

  const chooseLanguage = (lang: Lang) => {
    setLanguage(lang)
    window.localStorage.setItem(LANG_KEY, lang)
    setShowLangModal(false)
  }

  const copyEmail = async () => {
    await navigator.clipboard.writeText(EMAIL)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const sendNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const company = String(data.get('company') || '')
    const from = String(data.get('email') || '')
    const message = String(data.get('message') || '')
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`${t.footer.subject} ${company || from}`)}&body=${encodeURIComponent(`Company: ${company}\nEmail: ${from}\n\n${message}`)}`
  }

  const langToggle = (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button className={language === 'en' ? 'active' : ''} onClick={() => chooseLanguage('en')} aria-pressed={language === 'en'}>EN</button>
      <span aria-hidden>/</span>
      <button className={language === 'es' ? 'active' : ''} onClick={() => chooseLanguage('es')} aria-pressed={language === 'es'}>ES</button>
    </div>
  )

  return (
    <main className="overflow-clip bg-background text-foreground">
      {showLangModal && (
        <div className="lang-modal" role="dialog" aria-modal="true" aria-label="Choose your language / Elegí tu idioma">
          <div className="lang-modal-panel">
            <p className="eyebrow">Valentín / Product Builder</p>
            <h2>Choose your language<br /><span>Elegí tu idioma</span></h2>
            <div className="lang-modal-actions">
              <button onClick={() => chooseLanguage('en')}><strong>English</strong><span>Continue in English</span></button>
              <button onClick={() => chooseLanguage('es')}><strong>Español</strong><span>Continuar en español</span></button>
            </div>
          </div>
        </div>
      )}

      <nav className="minimap" aria-label="Section map">
        {SECTION_IDS.map(id => (
          <button key={id} className={activeSection === id ? 'active' : ''} onClick={() => scrollToSection(id)} aria-label={t.minimap[id]}>
            <span className="minimap-label">{t.minimap[id]}</span>
            <span className="minimap-bar" />
          </button>
        ))}
        <a className="minimap-wsp" href={WHATSAPP} target="_blank" rel="noreferrer" aria-label="WhatsApp"><WhatsAppIcon /></a>
      </nav>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <a href="#top" className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em]" aria-label="Valentín, back to top">
            <span className="brand-mark">V</span>
            <span className="hidden sm:inline">{t.brand}</span>
          </a>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {t.nav.map(([label, href]) => <a key={href} href={href} className="nav-link">{label}</a>)}
          </nav>
          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex"><span className="status-dot" />{t.available}</span>
            {langToggle}
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {menuOpen && (
          <nav className="flex flex-col border-t border-border bg-background px-5 py-6 md:hidden">
            {t.nav.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="mobile-link">{label}</a>)}
          </nav>
        )}
      </header>

      <section id="top" className="hero-section">
        <div className="hero-glow" />
        <div className="relative mx-auto flex min-h-svh max-w-[1440px] flex-col justify-end px-5 pb-16 pt-26 md:px-10 md:pb-28">
          <div className="hero-kicker font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground"><span>{t.hero.role}</span><span>{t.hero.location}</span></div>
          <div className="hero-grid">
            <div className="relative z-10 flex flex-col justify-center pb-2 md:pb-10">
              <h1 className="hero-title text-balance">{t.hero.titleA}<br /><span>{t.hero.titleB}</span></h1>
              <p className="hero-intro">{t.hero.intro}</p>
              <div className="hero-actions"><a href="#journey">{t.hero.ctaWork}</a><a href="#build">{t.hero.ctaThink}</a></div>
            </div>
            <figure className="hero-portrait" aria-label="Portrait of Valentín"><img src={images.portrait} alt="Portrait of Valentín" /></figure>
          </div>
        </div>
      </section>

      <Journey lang={language} />

      <HowIBuild lang={language} />

      <section id="about" className="about-section">
        <div className="section-shell py-28 md:py-40">
          <div className="grid gap-16 lg:grid-cols-12" data-reveal>
            <div className="lg:col-span-5">
              <p className="eyebrow">{t.about.eyebrow}</p>
              <h2 className="mt-10 section-title">{t.about.title[0]}<br />{t.about.title[1]}</h2>
              <p className="mt-8 body-copy">{t.about.copy}</p>
              <p className="mt-6 boca-line boca-line-desktop">{t.about.always}</p>
            </div>
            <figure className="about-collage lg:col-span-4"><img src={images.collage} alt="Personal collage showing work, travel, friends and interests" loading="lazy" /></figure>
            <p className="boca-line boca-line-mobile">{t.about.always}</p>
            <div className="currently flex flex-col justify-end gap-6 lg:col-span-3">
              <img className="about-face" src={images.face} alt="Portrait of Valentín" loading="lazy" />
              <div>
                <p className="eyebrow">{t.about.nowLabel}</p>
                <ul className="mt-4">{t.about.now.map(item => (
                  <li key={item.label}>{item.href ? <a href={item.href} target="_blank" rel="noreferrer">{item.label}<span aria-hidden>↗</span></a> : item.label}</li>
                ))}</ul>
              </div>
              <div>
                <p className="eyebrow">{t.about.exploringLabel}</p>
                <ul className="mt-4">{t.about.exploring.map(item => <li key={item}>{item}</li>)}</ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact" className="footer">
        <div className="section-shell py-24 md:py-36" data-reveal>
          <p className="eyebrow">{t.footer.eyebrow}</p>
          <h2 className="footer-title">{t.footer.title[0]}<br /><span>{t.footer.title[1]}</span></h2>
          <div className="contact-layout">
            <div>
              <p className="body-copy">{t.footer.copy}</p>
              <button onClick={copyEmail} className="email-button">{EMAIL} {copied ? <Check /> : <Copy />}</button>
              <a className="wsp-button" href={WHATSAPP} target="_blank" rel="noreferrer"><WhatsAppIcon />{t.footer.wsp}</a>
              <div className="mt-8 flex gap-6 font-mono text-xs uppercase tracking-[0.14em]">
                <a className="border-b border-border pb-1 transition-colors hover:border-primary hover:text-primary" href="https://www.linkedin.com/in/valent%C3%ADn-s-761910200/" target="_blank" rel="noreferrer">LinkedIn</a>
                <a className="border-b border-border pb-1 transition-colors hover:border-primary hover:text-primary" href="https://github.com/valentinsg" target="_blank" rel="noreferrer">GitHub</a>
              </div>
            </div>
            <form className="contact-form" onSubmit={sendNote}>
              <label>{t.footer.formCompany}<input name="company" autoComplete="organization" placeholder={t.footer.formCompanyPlaceholder} /></label>
              <label>{t.footer.formEmail}<input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>
              <label>{t.footer.formMessage}<textarea name="message" required rows={4} placeholder={t.footer.formMessagePlaceholder} /></label>
              <button type="submit">{t.footer.formSubmit}</button>
            </form>
          </div>
          <div className="mt-24 flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"><span>© 2026 Valentín Sánchez Guevara</span><a href="#top">{t.footer.backToTop}</a></div>
        </div>
      </footer>
    </main>
  )
}
