'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const LANG_KEY = 'vsg-lang'

type Lang = 'en' | 'es'

const content = {
  en: {
    backHome: '← Back to portfolio',
    viewLive: 'pelotita.com.ar ↗',
    hero: {
      eyebrow: 'Case Study',
      title: 'Pelotita.',
      tagline: 'A live football platform I built and operate solo — Next.js, self-hosted Postgres, Redis, and a custom WebSocket server, all running on a VPS I administer myself.',
      live: 'Live in production',
      stats: [['360', 'commits in 6 weeks, solo'], ['10k+', 'matches processed'], ['2', 'person team, 1 engineer']] as [string, string][],
    },
    overview: {
      eyebrow: 'What it is',
      paragraphs: [
        'Pelotita is a live football platform: live scores, standings, cup brackets, stats, editorial content, and a fantasy football league ("Gran DT") with real-time drafting. It covers Argentina\'s top divisions plus Europe\'s top 5 leagues and continental cups. The stated ambition is to compete with Promiedos, the dominant live-scores site in Argentina — this isn\'t a toy project, it\'s built to take real, sustained traffic and eventually carry ads and paid plans.',
        'Team of two: I own product, architecture, the database, and all engineering. A second person handles content and editorial. Everything below happened in production, with real users and real traffic, and I was the only engineer responsible for diagnosing it, deciding the fix, and shipping it — no team, no safety net.',
      ],
    },
    architecture: {
      eyebrow: 'Architecture',
      title: 'Request to render.',
      flow: [
        { title: 'User', detail: 'Browser, over HTTPS' },
        { title: 'pelotita.com.ar', detail: 'Domain on NIC Argentina, DNS delegated to Cloudflare' },
        { title: 'Cloudflare (free)', detail: 'CDN + cache + TLS + Cloudflare Tunnel — no inbound ports open on the server. wss://ws.pelotita.com.ar routed through the same tunnel.' },
        { title: 'Hetzner VPS', detail: 'Next.js 16 under PM2, clustered ×2. CX23 — 2 vCPU / 4 GB, Falkenstein. Same box also runs Postgres, Redis, and the WebSocket process.' },
      ],
      branches: [
        { title: 'Postgres 18 (self-hosted)', detail: 'football_snapshots, sync_log, api_usage — localhost-only, never leaves the server, zero egress cost.' },
        { title: 'Redis → WebSocket', detail: 'Redis pub/sub feeds a dedicated, single-instance WebSocket process — powers live scores, standings, and the fantasy draft.' },
        { title: 'Supabase (São Paulo)', detail: 'Postgres + Auth + Realtime — fantasy league data and login only.' },
      ],
      note: 'Football data itself comes from ESPN and Promiedos — unofficial, scraped sources hit only by the VPS, never by the browser.',
    },
    challenges: {
      eyebrow: 'Challenges solved',
      title: 'Owned end to end.',
      intro: 'Five things that broke, or almost broke, in production — and how I fixed them alone.',
      items: [
        {
          tag: 'Infra migration',
          title: 'Zero-downtime migration off Vercel to a self-hosted VPS',
          rows: [
            ['Problem', "Vercel's Hobby plan capped out at 4 hours of active CPU/month — likely already exceeded by crons syncing live data every 2 minutes — and its terms restrict the free tier to non-commercial use, a real problem once ads and paid plans go live."],
            ['Root cause', "Pro was ruled out too: usage-based billing means an unpredictable bill on a traffic spike or a bug, which isn't acceptable for a two-person project funding this out of pocket."],
            ['Fix', 'New stack — Cloudflare (CDN/TLS/Tunnel) → Hetzner VPS running Next.js under PM2 → self-hosted Postgres + Redis — built and tested against a staging URL while Vercel kept serving production. Deploy pipeline rebuilt from scratch as a GitHub Action that SSHes in, builds, and reloads PM2 on every push to master. Only cut DNS after a full login → save lineup → live-sync cycle passed on the new stack, with Vercel kept alive as a rollback path.'],
            ['Result', 'Zero downtime. Monitoring caught along the way, too — UptimeRobot was checking a bare IP on a closed port instead of the real HTTPS chain through Cloudflare; fixed before it mattered.'],
          ] as [string, string][],
        },
        {
          tag: 'Incident response',
          title: 'Supabase egress about to go read-only',
          rows: [
            ['Problem', "Supabase's free tier (5 GB egress/month) was hours from throttling the production database to read-only."],
            ['Root cause', 'Football data was being pushed through Supabase Realtime as large JSONB snapshots to every visitor. Compounding it: dev and prod were pointed at the same Supabase project, so every local reload and manual test was burning production quota.'],
            ['Fix', 'Moved football data to a Postgres instance self-hosted on the same VPS as the app — same host, localhost-only traffic, doesn\'t count against any egress quota. Kept Supabase for fantasy data and auth only. Rebuilt real-time delivery on Redis pub/sub feeding a dedicated WebSocket server, verified live against real matches in progress before retiring the old path. Provisioned a separate dev Supabase project to stop the quota bleed.'],
            ['Result', "Supabase's data volume and egress cut by close to an order of magnitude. The near-outage never recurred."],
          ] as [string, string][],
        },
        {
          tag: 'Systems design',
          title: 'Built the real-time layer myself after the managed one silently failed',
          rows: [
            ['Problem', 'The fantasy draft feature had never worked, with no error surfaced anywhere.'],
            ['Root cause', "Its Supabase Realtime subscription was on a table that had never actually been added to Supabase's realtime publication — it subscribed to nothing, and nothing told anyone."],
            ['Fix', "Rather than patch around the managed service, built a small dedicated real-time layer: the sync job publishes changed matches to Redis, and a single-instance WebSocket process — kept separate from the clustered app process so there's no ambiguity about which instance should push an event — fans it out to connected browsers."],
            ['Result', 'That same layer now also powers live fantasy drafting, live scores, and live standings.'],
          ] as [string, string][],
        },
        {
          tag: 'Data migration',
          title: 'Live database migration, 32 tables, zero data loss',
          rows: [
            ['Problem', "A Supabase project's region can't be changed after creation. Moving to a different AWS region meant migrating 32 tables, RLS policies, storage buckets, and auth.users — while the old database kept taking writes from cron jobs and live users."],
            ['Root cause', 'Concrete things that had to be caught before they became data loss: pg_dump --no-privileges (needed to avoid ownership conflicts between projects) silently drops the GRANTs that let the app read/write at all — missed on the first pass, caught when live sync failed with "permission denied" against real data. auth.users has a foreign key from public.profiles that a --schema=public dump skips, along with the on_auth_user_created trigger. Triggers writing derived history rows needed disabling before the bulk load, or replaying the dump would have duplicated history.'],
            ['Fix', "Chose to pg_dump the live database directly instead of hand-replaying six loose, undocumented SQL migration files in the order I thought they'd been applied — a deliberate call to avoid an ambiguous, error-prone path to prod data corruption."],
            ['Result', 'All 32 tables, policies, buckets, and auth data migrated with row counts verified identical between old and new. No data loss.'],
          ] as [string, string][],
        },
        {
          tag: 'Cost engineering',
          title: 'Rate-limit and cost-aware data ingestion',
          rows: [
            ['Problem', 'The original paid data provider (API-Football) hit a 100 req/day cap and eventually suspended the account without warning.'],
            ['Root cause', "The platform's core data feed depended on a single paid, rate-limited third party with no fallback."],
            ['Fix', 'Switched to unofficial, unauthenticated scraped sources (ESPN, Promiedos) with a deliberately two-speed sync: a general sync every 1-2 hours that skips any competition with nothing happening within ±3 days (plus a daily safety sweep so nothing goes stale), and a live sync that reads already-stored snapshots first — zero external calls — and only hits real APIs when a match is actually in its playing window.'],
            ['Result', 'Stays light on both the source and the infra while tracking multiple competitions live, simultaneously.'],
          ] as [string, string][],
        },
      ],
    },
    stack: {
      eyebrow: 'Stack',
      title: 'What it runs on.',
      groups: [
        { name: 'Application', items: ['Next.js 16 (App Router, Turbopack)', 'React 19', 'TypeScript', 'Tailwind v4'] },
        { name: 'Data & Realtime', items: ['Postgres, self-hosted (raw pg, no ORM)', 'Supabase Postgres (auth/fantasy)', 'Redis (cache + pub/sub)', 'Custom WebSocket server'] },
        { name: 'Infrastructure & Ops', items: ['PM2', 'Cloudflare (CDN/TLS/Tunnel)', 'Hetzner Cloud (VPS)', 'GitHub Actions (CI/CD)', 'Cloudflare R2 (backups)'] },
      ],
    },
    scale: {
      eyebrow: 'Scale',
      title: 'Where it stands.',
      stats: [
        '10,000+ matches processed',
        "Argentina's top divisions + Europe's top 5 leagues + continental cups, tracked live, simultaneously",
        'Real users — accounts, live fantasy drafts, live chat, all on the same real-time layer',
      ],
    },
    footer: {
      eyebrow: 'Get in touch',
      title: ["Let's talk", 'infrastructure.'],
      viewLive: 'View live → pelotita.com.ar',
      backHome: '← Back to portfolio',
    },
  },
  es: {
    backHome: '← Volver al portfolio',
    viewLive: 'pelotita.com.ar ↗',
    hero: {
      eyebrow: 'Case Study',
      title: 'Pelotita.',
      tagline: 'Una plataforma de fútbol en vivo que construí y opero solo — Next.js, Postgres self-hosteado, Redis y un servidor WebSocket propio, todo corriendo en un VPS que administro yo.',
      live: 'En producción',
      stats: [['360', 'commits en 6 semanas, solo'], ['10k+', 'partidos procesados'], ['2', 'personas en el equipo, 1 developer']] as [string, string][],
    },
    overview: {
      eyebrow: 'Qué es',
      paragraphs: [
        'Pelotita es una plataforma de fútbol en vivo: resultados en tiempo real, tablas de posiciones, llaves de copas, estadísticas, contenido editorial y una liga de fantasy football ("Gran DT") con draft en tiempo real. Cubre las divisiones principales de Argentina más las 5 grandes ligas de Europa y copas continentales. La ambición declarada es competir con Promiedos, el sitio de resultados en vivo dominante en Argentina — no es un proyecto de juguete, está construido para soportar tráfico real y sostenido, y eventualmente llevar ads y planes pagos.',
        'Equipo de dos personas: yo soy dueño del producto, la arquitectura, la base de datos y todo el desarrollo. La segunda persona se encarga del contenido y lo editorial. Todo lo que sigue pasó en producción, con usuarios y tráfico reales, y fui el único ingeniero responsable de diagnosticarlo, decidir la solución y llevarla a producción — sin equipo, sin red de contención.',
      ],
    },
    architecture: {
      eyebrow: 'Arquitectura',
      title: 'De la request al render.',
      flow: [
        { title: 'Usuario', detail: 'Navegador, sobre HTTPS' },
        { title: 'pelotita.com.ar', detail: 'Dominio en NIC Argentina, DNS delegado a Cloudflare' },
        { title: 'Cloudflare (gratis)', detail: 'CDN + cache + TLS + Cloudflare Tunnel — sin puertos de entrada abiertos en el servidor. wss://ws.pelotita.com.ar viaja por el mismo túnel.' },
        { title: 'VPS de Hetzner', detail: 'Next.js 16 bajo PM2, clusterizado ×2. CX23 — 2 vCPU / 4 GB, Falkenstein. El mismo servidor corre también Postgres, Redis y el proceso de WebSocket.' },
      ],
      branches: [
        { title: 'Postgres 18 (self-hosted)', detail: 'football_snapshots, sync_log, api_usage — tráfico localhost-only, nunca sale del servidor, cero costo de egress.' },
        { title: 'Redis → WebSocket', detail: 'Redis pub/sub alimenta un proceso de WebSocket dedicado, de una sola instancia — potencia resultados en vivo, tablas y el draft de fantasy.' },
        { title: 'Supabase (São Paulo)', detail: 'Postgres + Auth + Realtime — solo datos de la liga de fantasy y login.' },
      ],
      note: 'Los datos de fútbol en sí vienen de ESPN y Promiedos — fuentes no oficiales, scrapeadas, a las que solo le pega el VPS, nunca el navegador.',
    },
    challenges: {
      eyebrow: 'Desafíos resueltos',
      title: 'De punta a punta.',
      intro: 'Cinco cosas que se rompieron, o casi se rompen, en producción — y cómo las resolví solo.',
      items: [
        {
          tag: 'Migración de infra',
          title: 'Migración sin downtime de Vercel a un VPS self-hosteado',
          rows: [
            ['Problema', 'El plan Hobby de Vercel tenía un tope de 4 horas de CPU activa por mes — probablemente ya excedido por los crons que sincronizaban datos en vivo cada 2 minutos — y sus términos restringen el plan gratis a uso no comercial, un problema real en cuanto se activaran ads o planes pagos.'],
            ['Causa raíz', 'Vercel Pro también se descartó: su facturación por uso implica una factura impredecible ante un pico de tráfico o un bug, algo inaceptable para un proyecto de dos personas bancado de su bolsillo.'],
            ['Solución', 'Stack nuevo — Cloudflare (CDN/TLS/Tunnel) → VPS de Hetzner corriendo Next.js bajo PM2 → Postgres + Redis self-hosteados — construido y probado contra una URL de staging mientras Vercel seguía sirviendo producción. Pipeline de deploy reconstruido desde cero como una GitHub Action que entra por SSH, builda y recarga PM2 en cada push a master. Recién corté el DNS después de validar un ciclo completo de login → guardar alineación → sync en vivo en el stack nuevo, con Vercel activo como plan de rollback.'],
            ['Resultado', 'Cero downtime. El monitoreo también se corrigió en el camino — UptimeRobot estaba chequeando una IP pelada en un puerto cerrado en vez de la cadena HTTPS real a través de Cloudflare; arreglado antes de que importara.'],
          ] as [string, string][],
        },
        {
          tag: 'Respuesta a incidentes',
          title: 'Egress de Supabase a horas de pasar a solo lectura',
          rows: [
            ['Problema', 'El plan gratis de Supabase (5 GB de egress/mes) estaba a horas de dejar la base de datos de producción en modo solo lectura.'],
            ['Causa raíz', 'Los datos de fútbol se enviaban por Supabase Realtime como snapshots grandes de JSONB a cada visitante. Sumado a eso: dev y prod apuntaban al mismo proyecto de Supabase, así que cada recarga local y cada prueba manual quemaba cuota de producción.'],
            ['Solución', 'Moví los datos de fútbol a un Postgres self-hosteado en el mismo VPS que la app — mismo servidor, tráfico localhost-only, no cuenta contra ninguna cuota de egress. Dejé Supabase solo para datos de fantasy y auth. Reconstruí la entrega en tiempo real sobre Redis pub/sub alimentando un servidor WebSocket dedicado, verificado en vivo contra partidos reales antes de dar de baja el camino viejo. Provisioné un proyecto de Supabase separado para desarrollo, para frenar el sangrado de cuota.'],
            ['Resultado', 'Volumen de datos y egress de Supabase reducidos casi en un orden de magnitud. El casi-apagón nunca se repitió.'],
          ] as [string, string][],
        },
        {
          tag: 'Diseño de sistemas',
          title: 'Construí la capa de tiempo real yo mismo, después de que la administrada fallara en silencio',
          rows: [
            ['Problema', 'El draft de fantasy nunca había funcionado, sin ningún error visible en ningún lado.'],
            ['Causa raíz', 'Su suscripción de Supabase Realtime apuntaba a una tabla que nunca había sido agregada a la publicación de realtime de Supabase — se suscribía a nada, y nada se lo avisaba a nadie.'],
            ['Solución', 'En vez de parchar el servicio administrado, construí una capa de tiempo real chica y propia: el job de sync publica los partidos que cambiaron en Redis, y un proceso de WebSocket de una sola instancia — separado del proceso clusterizado de la app para que no haya ambigüedad sobre qué instancia debe emitir cada evento — lo reenvía a los navegadores conectados.'],
            ['Resultado', 'Esa misma capa hoy potencia el draft de fantasy en vivo, los resultados en vivo y las tablas en vivo.'],
          ] as [string, string][],
        },
        {
          tag: 'Migración de datos',
          title: 'Migración de base de datos en vivo, 32 tablas, cero pérdida de datos',
          rows: [
            ['Problema', 'La región de un proyecto de Supabase no se puede cambiar después de creado. Mudarse a otra región de AWS implicaba migrar 32 tablas, políticas de RLS, buckets de storage y auth.users — mientras la base vieja seguía recibiendo escrituras de crons y usuarios en vivo.'],
            ['Causa raíz', 'Cosas concretas que había que atrapar antes de que se convirtieran en pérdida de datos: pg_dump --no-privileges (necesario para evitar conflictos de ownership entre proyectos) borra en silencio los GRANT que le permiten a la app leer/escribir — no lo vi en el primer intento, lo detecté cuando el sync en vivo falló con "permission denied" contra datos reales. auth.users tiene una foreign key desde public.profiles que un dump de --schema=public no incluye, junto con el trigger on_auth_user_created. Los triggers que escriben filas de historial derivado había que deshabilitarlos antes de la carga masiva, o replayear el dump duplicaba el historial.'],
            ['Solución', 'Decidí hacer pg_dump directo de la base viva en vez de replayear a mano seis archivos SQL de migración sueltos en el orden en que creía que se habían aplicado — una decisión deliberada para evitar un camino ambiguo y propenso a error hacia la corrupción de datos de producción.'],
            ['Resultado', 'Las 32 tablas, políticas, buckets y datos de auth migrados con conteos de filas verificados idénticos entre la base vieja y la nueva. Cero pérdida de datos.'],
          ] as [string, string][],
        },
        {
          tag: 'Optimización de costos',
          title: 'Ingesta de datos consciente de rate limits y costos',
          rows: [
            ['Problema', 'El proveedor de datos pago original (API-Football) tenía un tope de 100 requests/día y eventualmente suspendió la cuenta sin previo aviso.'],
            ['Causa raíz', 'El feed de datos central de la plataforma dependía de un único tercero pago y rate-limited, sin fallback.'],
            ['Solución', 'Cambié a fuentes no oficiales, sin autenticación, scrapeadas (ESPN, Promiedos) con un sync deliberadamente de dos velocidades: un sync general cada 1-2 horas que se salta cualquier competición sin actividad en una ventana de ±3 días (más un barrido diario de seguridad para que nada quede desactualizado), y un sync en vivo que primero lee snapshots ya guardados — cero llamadas externas — y solo pega contra las APIs reales cuando detecta que un partido está efectivamente en su ventana de juego.'],
            ['Resultado', 'Se mantiene liviano tanto para la fuente como para la infra, mientras sigue múltiples competiciones en vivo, simultáneamente.'],
          ] as [string, string][],
        },
      ],
    },
    stack: {
      eyebrow: 'Stack',
      title: 'Sobre qué corre.',
      groups: [
        { name: 'Aplicación', items: ['Next.js 16 (App Router, Turbopack)', 'React 19', 'TypeScript', 'Tailwind v4'] },
        { name: 'Datos & Tiempo real', items: ['Postgres, self-hosted (pg crudo, sin ORM)', 'Supabase Postgres (auth/fantasy)', 'Redis (cache + pub/sub)', 'Servidor WebSocket propio'] },
        { name: 'Infraestructura & Ops', items: ['PM2', 'Cloudflare (CDN/TLS/Tunnel)', 'Hetzner Cloud (VPS)', 'GitHub Actions (CI/CD)', 'Cloudflare R2 (backups)'] },
      ],
    },
    scale: {
      eyebrow: 'Escala',
      title: 'Dónde está parado.',
      stats: [
        '10.000+ partidos procesados',
        'Divisiones principales de Argentina + las 5 grandes ligas de Europa + copas continentales, seguidas en vivo, simultáneamente',
        'Usuarios reales — cuentas, drafts de fantasy en vivo, chat en vivo, todo sobre la misma capa de tiempo real',
      ],
    },
    footer: {
      eyebrow: 'Hablemos',
      title: ['Hablemos de', 'infraestructura.'],
      viewLive: 'Ver en vivo → pelotita.com.ar',
      backHome: '← Volver al portfolio',
    },
  },
} as const

export default function PelotitaCaseStudy() {
  const [language, setLanguage] = useState<Lang>('en')

  useEffect(() => {
    const stored = window.localStorage.getItem(LANG_KEY)
    if (stored === 'en' || stored === 'es') setLanguage(stored)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

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
          <span className="nav-link">{t.backHome}</span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="https://pelotita.com.ar" target="_blank" rel="noreferrer" className="nav-link">{t.viewLive}</a>
          <div className="lang-toggle" role="group" aria-label="Language">
            <button className={language === 'en' ? 'active' : ''} onClick={() => chooseLanguage('en')} aria-pressed={language === 'en'}>EN</button>
            <span aria-hidden>/</span>
            <button className={language === 'es' ? 'active' : ''} onClick={() => chooseLanguage('es')} aria-pressed={language === 'es'}>ES</button>
          </div>
        </div>
      </header>

      <section className="section-shell pb-20 pt-6 md:pb-28">
        <p className="eyebrow">{t.hero.eyebrow}</p>
        <h1 className="mt-6 section-title">{t.hero.title}</h1>
        <p className="work-intro mt-8">{t.hero.tagline}</p>
        <div className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <span className="status-dot" />
          <span>{t.hero.live}</span>
          <a href="https://pelotita.com.ar" target="_blank" rel="noreferrer" className="text-foreground transition-colors hover:text-primary">{t.viewLive}</a>
        </div>

        <div className="growth-stats max-w-2xl">
          {t.hero.stats.map(stat => (
            <div key={stat[1]}><strong>{stat[0]}</strong><span>{stat[1]}</span></div>
          ))}
        </div>

        <figure className="case-hero-shot">
          <img src="/pelotita-home.png" alt="Pelotita live scores homepage" loading="lazy" />
        </figure>
      </section>

      <section className="section-shell pb-20 md:pb-28">
        <p className="eyebrow">{t.overview.eyebrow}</p>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {t.overview.paragraphs.map((paragraph, index) => (
            <p className="body-copy" key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="section-shell py-20 md:py-28">
          <p className="eyebrow">{t.architecture.eyebrow}</p>
          <h2 className="mt-8 section-title craft-title">{t.architecture.title}</h2>
          <div className="arch-flow">
            {t.architecture.flow.map((node, index) => (
              <div key={node.title} className="w-full">
                <div className="arch-node">
                  <p className="arch-node-title">{node.title}</p>
                  <p className="arch-node-detail">{node.detail}</p>
                </div>
                {index < t.architecture.flow.length - 1 && <p className="arch-connector text-center">↓</p>}
              </div>
            ))}
            <p className="arch-connector text-center">↓</p>
            <div className="arch-branches">
              {t.architecture.branches.map(node => (
                <div key={node.title} className="arch-node">
                  <p className="arch-node-title">{node.title}</p>
                  <p className="arch-node-detail">{node.detail}</p>
                </div>
              ))}
            </div>
            <p className="arch-note">{t.architecture.note}</p>
          </div>
        </div>
      </section>

      <section className="section-shell py-20 md:py-28">
        <p className="eyebrow">{t.challenges.eyebrow}</p>
        <h2 className="mt-8 section-title craft-title">{t.challenges.title}</h2>
        <p className="work-intro mt-8">{t.challenges.intro}</p>
        <div className="mt-16">
          {t.challenges.items.map((incident, index) => (
            <article className="incident-card" key={incident.title}>
              <div className="incident-head">
                <span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, '0')}</span>
                <span className="tag">{incident.tag}</span>
              </div>
              <h3 className="incident-title">{incident.title}</h3>
              <div className="incident-rows">
                {incident.rows.map(row => (
                  <div className="incident-row" key={row[0]}>
                    <span>{row[0]}</span>
                    <p>{row[1]}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="section-shell py-20 md:py-28">
          <p className="eyebrow">{t.stack.eyebrow}</p>
          <h2 className="mt-8 section-title craft-title">{t.stack.title}</h2>
          <div className="hub-categories mt-16">
            {t.stack.groups.map((group, index) => (
              <div className={`hub-card hub-card-${index}`} key={group.name}>
                <div className="hub-card-header">
                  <span className="hub-card-dot" />
                  <h4>{group.name}</h4>
                </div>
                <div className="hub-tags">
                  {group.items.map(item => <span className="tag" key={item}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20 md:py-28">
        <p className="eyebrow">{t.scale.eyebrow}</p>
        <h2 className="mt-8 section-title craft-title">{t.scale.title}</h2>
        <ul className="mt-10 flex flex-col gap-5 border-t border-border pt-8">
          {t.scale.stats.map(stat => (
            <li className="flex items-start gap-3 body-copy" key={stat}>
              <span className="mt-2 h-[.42rem] w-[.42rem] flex-none bg-primary" aria-hidden />
              <span>{stat}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <div className="section-shell py-20 md:py-28">
          <p className="eyebrow">{t.footer.eyebrow}</p>
          <h2 className="footer-title">{t.footer.title[0]}<br /><span>{t.footer.title[1]}</span></h2>
          <div className="mt-12 flex flex-wrap gap-6">
            <a className="wsp-button" href="https://pelotita.com.ar" target="_blank" rel="noreferrer">{t.footer.viewLive}</a>
            <Link className="wsp-button" href="/#contact">{t.footer.backHome}</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
