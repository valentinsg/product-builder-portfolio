'use client'

import { useEffect, useRef } from 'react'

type Lang = 'en' | 'es'

type JourneyEntry = {
  year: string
  label: string
  growth: string
  title: string
  type: string
  desc: string
  impact: string
  tags: string[]
  images: string[]
}

const content: Record<Lang, {
  eyebrow: string
  title: [string, string]
  copy: string
  impactLabel: string
  entries: JourneyEntry[]
}> = {
  en: {
    eyebrow: '01 — Selected journey',
    title: ['Learning by', 'shipping.'],
    copy: 'Nine products, one story: each thing I built changed what I was able to build next.',
    impactLabel: 'Impact',
    entries: [
      {
        year: '2023',
        label: 'First professional role',
        growth: 'From learning to code to shipping production apps used by real teams.',
        title: 'Smithii',
        type: 'Web3 product ecosystem',
        desc: 'Public token tools, internal management software and a staking builder inside a high-traffic Web3 ecosystem.',
        impact: 'Production applications built with an international team.',
        tags: ['Frontend', 'Web3', 'Product', 'Scrum'],
        images: ['/smithii-software.jpg', '/tools.jpg', '/staking.jpg'],
      },
      {
        year: '2023 — 2024',
        label: 'Building my own business',
        growth: 'From employee to founder: real users, real workflows, real stakes.',
        title: 'Busy',
        type: 'Streetwear brand',
        desc: 'A clothing brand built end to end — store, content, integrations, SEO and community.',
        impact: 'Ranked for local clothing searches without a physical shop.',
        tags: ['Commerce', 'SEO', 'Brand'],
        images: [],
      },
      {
        year: '2024',
        label: 'Solving real problems',
        growth: 'Learning to turn a problem into a focused product, fast.',
        title: 'Claridad',
        type: 'Community safety map',
        desc: 'Geolocated reports, communities and real-time alerts so neighborhoods can navigate safety.',
        impact: 'Tested in public and iterated through hackathons.',
        tags: ['Maps', 'APIs', 'Hackathons'],
        images: ['/claridad-map-enhanced.png', '/claridad-community-enhanced.png', '/claridad-incidents-enhanced.png'],
      },
      {
        year: '2024',
        label: 'Technical leadership',
        growth: 'From building features to owning architecture and UX across many products.',
        title: 'Harmonica',
        type: 'Product Engineer · Technical lead',
        desc: 'Technical lead for more than ten client products — from WordPress and Shopify stores to Next.js apps.',
        impact: 'Learned to lead, enter unfamiliar stacks and deliver without disrupting what worked.',
        tags: ['Leadership', 'WordPress', 'Shopify', 'Next.js'],
        images: ['/harmonica-agency.png', '/harmonica-penta.png', '/harmonica-luxe-rejuvenate.png', '/harmonica-evandr.png'],
      },
      {
        year: '2025',
        label: 'Business systems',
        growth: 'From interfaces to the systems that keep a whole operation running.',
        title: 'Abundancia',
        type: '24/7 operations platform',
        desc: 'Shifts, cash flow, tasks and internal communication for an operation that never stops, with AI automating repetitive work.',
        impact: 'Less manual work and clear traceability of every movement.',
        tags: ['Systems', 'AI', 'Automation'],
        images: ['/abundancia-comprobantes-redacted.png'],
      },
      {
        year: '2025',
        label: 'High-visibility delivery',
        growth: 'Delivering under the spotlight, with creative freedom and technical range.',
        title: 'Presidencial',
        type: 'Independent game',
        desc: 'A bizarre presidential simulator built with friends — game mechanics, systems design and collaboration.',
        impact: 'A high-visibility project, professionally delivered.',
        tags: ['Game Design', 'Systems'],
        images: ['/presidential-gameplay.png', '/presidential-menu.png'],
      },
      {
        year: '2025',
        label: 'First SaaS',
        growth: 'From services to software: product, payments and business decisions in one.',
        title: 'Stockeo',
        type: 'Inventory SaaS',
        desc: 'Inventory and business management for small shops, built with my studio partner.',
        impact: 'A real SaaS foundation with subscriptions and recurring revenue.',
        tags: ['Next.js', 'Java', 'Mercado Pago'],
        images: ['/stockeo-dashboard-redacted.png', '/stockeo-landing.png'],
      },
      {
        year: '2026',
        label: 'Real business impact',
        growth: 'Building products that change how real businesses and people operate.',
        title: 'AVI Salud',
        type: 'Healthcare platform',
        desc: 'Public website and internal operations system for a home healthcare company.',
        impact: 'A clearer experience for families and a more organized operation for the team.',
        tags: ['Web', 'Systems', 'Healthcare'],
        images: ['/avi-salud-web.png', '/avi-admin-redacted.png'],
      },
      {
        year: '2026',
        label: 'Product ownership',
        growth: 'Full ownership: my own product, my own business, my own roadmap.',
        title: 'Pelotita',
        type: 'Football platform · Own product',
        desc: 'Football results, normalized data and fantasy leagues between friends, with monetization built in.',
        impact: 'From idea to production — and to a business.',
        tags: ['Own product', 'Data', 'Scraping', 'AdSense'],
        images: ['/pelotita-home.png'],
      },
    ],
  },
  es: {
    eyebrow: '01 — Recorrido seleccionado',
    title: ['Aprender', 'lanzando.'],
    copy: 'Nueve productos, una historia: cada cosa que construí cambió lo que podía construir después.',
    impactLabel: 'Impacto',
    entries: [
      {
        year: '2023',
        label: 'Primer rol profesional',
        growth: 'De aprender a programar a lanzar aplicaciones en producción usadas por equipos reales.',
        title: 'Smithii',
        type: 'Ecosistema de productos Web3',
        desc: 'Herramientas públicas de tokens, software interno de gestión y un staking builder dentro de un ecosistema Web3 de alto tráfico.',
        impact: 'Aplicaciones en producción construidas con un equipo internacional.',
        tags: ['Frontend', 'Web3', 'Producto', 'Scrum'],
        images: ['/smithii-software.jpg', '/tools.jpg', '/staking.jpg'],
      },
      {
        year: '2023 — 2024',
        label: 'Mi propio negocio',
        growth: 'De empleado a fundador: usuarios reales, flujos reales, responsabilidad real.',
        title: 'Busy',
        type: 'Marca de streetwear',
        desc: 'Una marca de ropa construida de punta a punta: tienda, contenido, integraciones, SEO y comunidad.',
        impact: 'Rankeó en búsquedas de ropa locales sin local físico.',
        tags: ['Commerce', 'SEO', 'Marca'],
        images: [],
      },
      {
        year: '2024',
        label: 'Resolver problemas reales',
        growth: 'Aprender a convertir un problema en un producto enfocado, rápido.',
        title: 'Claridad',
        type: 'Mapa colaborativo de seguridad',
        desc: 'Reportes geolocalizados, comunidades y alertas en tiempo real para que los barrios no se muevan a ciegas.',
        impact: 'Probado en público e iterado en hackathons.',
        tags: ['Mapas', 'APIs', 'Hackathons'],
        images: ['/claridad-map-enhanced.png', '/claridad-community-enhanced.png', '/claridad-incidents-enhanced.png'],
      },
      {
        year: '2024',
        label: 'Liderazgo técnico',
        growth: 'De construir funcionalidades a hacerme cargo de arquitectura y UX en muchos productos.',
        title: 'Harmonica',
        type: 'Product Engineer · Liderazgo técnico',
        desc: 'Liderazgo técnico de más de diez productos: desde tiendas en WordPress y Shopify hasta apps con Next.js.',
        impact: 'Aprendí a liderar, entrar rápido en stacks ajenos y entregar sin frenar lo que ya funcionaba.',
        tags: ['Liderazgo', 'WordPress', 'Shopify', 'Next.js'],
        images: ['/harmonica-agency.png', '/harmonica-penta.png', '/harmonica-luxe-rejuvenate.png', '/harmonica-evandr.png'],
      },
      {
        year: '2025',
        label: 'Sistemas de negocio',
        growth: 'De las interfaces a los sistemas que sostienen una operación entera.',
        title: 'Abundancia',
        type: 'Plataforma para operaciones 24/7',
        desc: 'Turnos, caja, tareas y comunicación interna para una operación que no para nunca, con IA automatizando el trabajo repetitivo.',
        impact: 'Menos carga manual y trazabilidad clara de cada movimiento.',
        tags: ['Sistemas', 'IA', 'Automatización'],
        images: ['/abundancia-comprobantes-redacted.png'],
      },
      {
        year: '2025',
        label: 'Entrega de alta visibilidad',
        growth: 'Entregar bajo los reflectores, con libertad creativa y rango técnico.',
        title: 'Presidencial',
        type: 'Juego independiente',
        desc: 'Un bizarro simulador presidencial construido con amigos: mecánicas de juego, diseño de sistemas y colaboración.',
        impact: 'Un proyecto de alta visibilidad, entregado profesionalmente.',
        tags: ['Game Design', 'Sistemas'],
        images: ['/presidential-gameplay.png', '/presidential-menu.png'],
      },
      {
        year: '2025',
        label: 'Primer SaaS',
        growth: 'De servicios a software: producto, pagos y decisiones de negocio en uno.',
        title: 'Stockeo',
        type: 'SaaS de inventario',
        desc: 'Gestión de inventario y negocio para comercios chicos, construido con mi socio del estudio.',
        impact: 'Una base real de SaaS con suscripciones e ingresos recurrentes.',
        tags: ['Next.js', 'Java', 'Mercado Pago'],
        images: ['/stockeo-dashboard-redacted.png', '/stockeo-landing.png'],
      },
      {
        year: '2026',
        label: 'Impacto real en negocios',
        growth: 'Construir productos que cambian cómo operan negocios y personas reales.',
        title: 'AVI Salud',
        type: 'Plataforma de salud',
        desc: 'Sitio público y sistema interno de operaciones para una empresa de salud domiciliaria.',
        impact: 'Experiencia más clara para las familias y operación más ordenada para el equipo.',
        tags: ['Sitio web', 'Sistemas', 'Salud'],
        images: ['/avi-salud-web.png', '/avi-admin-redacted.png'],
      },
      {
        year: '2026',
        label: 'Ownership de producto',
        growth: 'Ownership total: mi propio producto, mi propio negocio, mi propio roadmap.',
        title: 'Pelotita',
        type: 'Plataforma de fútbol · Producto propio',
        desc: 'Resultados de fútbol, datos normalizados y ligas de fantasía entre amigos, con monetización integrada.',
        impact: 'De la idea a producción — y a un negocio.',
        tags: ['Producto propio', 'Datos', 'Scraping', 'AdSense'],
        images: ['/pelotita-home.png'],
      },
    ],
  },
}

export default function Journey({ lang }: { lang: Lang }) {
  const t = content[lang]
  const trackRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)

  // Scroll-linked line fill (transform only, GPU friendly)
  useEffect(() => {
    const fill = fillRef.current
    if (!fill) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fill.style.transform = 'scaleY(1)'
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const total = Math.max(rect.height - window.innerHeight * 0.45, 1)
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - rect.top) / total))
      fill.style.transform = `scaleY(${progress})`
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Node activation as entries cross the viewport center
  useEffect(() => {
    const entries = trackRef.current?.querySelectorAll('.journey-entry')
    if (!entries) return
    const observer = new IntersectionObserver(
      list => list.forEach(item => item.isIntersecting && item.target.classList.add('is-active')),
      { rootMargin: '-42% 0px -42% 0px' },
    )
    entries.forEach(entry => observer.observe(entry))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="journey" className="journey-section">
      <div className="section-shell journey-head" data-reveal>
        <p className="eyebrow">{t.eyebrow}</p>
        <div className="mt-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <h2 className="section-title">{t.title[0]}<br /><span>{t.title[1]}</span></h2>
          <p className="journey-intro">{t.copy}</p>
        </div>
      </div>

      <div className="section-shell journey-track" ref={trackRef}>
        <div className="journey-line" aria-hidden>
          <div className="journey-line-fill" ref={fillRef} />
        </div>
        {t.entries.map((entry, index) => (
          <article key={entry.title} className={`journey-entry ${index % 2 ? 'journey-alt' : ''}`} data-reveal>
            <div className="journey-meta">
              <span className="journey-node" aria-hidden />
              <span className="journey-year">{entry.year}</span>
              <h3 className="journey-label">{entry.label}</h3>
              <p className="journey-growth">{entry.growth}</p>
            </div>
            <div className="journey-card">
              {entry.images.length > 0 ? (
                <figure className="journey-media">
                  <img src={entry.images[0]} alt={`${entry.title} — main product screenshot`} loading="lazy" />
                  {entry.images.length > 1 && (
                    <div className="journey-thumbs">
                      {entry.images.slice(1, 4).map(src => (
                        <img key={src} src={src} alt={`${entry.title} — additional screenshot`} loading="lazy" />
                      ))}
                    </div>
                  )}
                </figure>
              ) : (
                <div className="journey-monogram" aria-hidden>
                  <span>{entry.title.charAt(0)}</span>
                  <p>{entry.type}</p>
                </div>
              )}
              <div className="journey-card-body">
                <p className="eyebrow">{entry.type}</p>
                <h4>{entry.title}</h4>
                <p className="journey-desc">{entry.desc}</p>
                <p className="journey-impact"><span>{t.impactLabel}</span>{entry.impact}</p>
                <div className="flex flex-wrap gap-2">{entry.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
