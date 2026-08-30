'use client'

import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'

import GithubContributions from './github-contributions'

const LANG_KEY = 'vsg-lang'

type Lang = 'en' | 'es'

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * PLACEHOLDERS TO FILL WITH REAL INFO LATER (do not invent):
 *  - video.src        → the actual "How Pelotita works" clip (60–90s)
 *  - database.todo    → indexes, EXPLAIN/query plans, transactions, pooling
 *  - ownership.todo   → error tracking / alerting / structured logging stack
 *  - additional (Avi Salud) → whole section is scaffolding, content comes later
 * ─────────────────────────────────────────────────────────────────────────────
 */

const content = {
  en: {
    backHome: '← Back to portfolio',
    viewLive: 'pelotita.com.ar ↗',
    hero: {
      eyebrow: 'Case Study',
      title: 'Pelotita.',
      tagline: 'A live football platform I built and run solo — Next.js, self-hosted Postgres, Redis, and a custom WebSocket server on a VPS I administer.',
      live: 'Live in production',
      stats: [
        ['360', 'commits · 6 weeks'],
        ['10k+', 'matches processed'],
        ['32', 'tables migrated, zero loss'],
        ['1', 'engineer'],
      ] as [string, string][],
    },
    video: {
      eyebrow: 'Watch',
      title: 'How Pelotita works',
      src: '', // TODO: paste the 60–90s clip URL / file here
      placeholder: 'Video coming soon',
      caption:
        '60–90s walkthrough: the live product, how external football data is ingested, stored and pushed to users in real time, and how the infrastructure fits together.',
    },
    commits: {
      eyebrow: 'Proof of work',
      title: 'Six weeks, heads down.',
      headline: (total: string) => `${total} contributions in the last year`,
      caption:
        'The Pelotita build is 360 commits of that — close to a quarter of my GitHub year, concentrated into about six weeks as the only engineer.',
      stats: ([['360', 'commits on Pelotita'], ['~6', 'weeks'], ['1', 'engineer']]) as [string, string][],
      profile: 'github.com/valentinsg ↗',
    },
    built: {
      eyebrow: 'What I built',
      title: 'The product.',
      lead: 'Pelotita covers Argentina\'s top divisions, Europe\'s top 5 leagues and continental cups: live scores, standings, cup brackets, stats, editorial content, and a fantasy league ("Gran DT") with real-time drafting. Two-person team — I own product, architecture, database, and all engineering.',
      items: [
        'Next.js 16 App Router — frontend and API, raw-SQL data layer, no ORM',
        'Data ingestion from external football sources with a two-speed sync',
        'Self-hosted Postgres 18 + Redis on a VPS I provision and administer',
        'Custom WebSocket layer — live scores, standings, and the fantasy draft',
        'CI/CD pipeline, staging environment, production deploy and rollback path',
      ],
    },
    pipeline: {
      eyebrow: 'How it works',
      title: 'Data to user.',
      intro: 'External football data in, real-time updates out — every hop runs on infrastructure I operate.',
      steps: [
        ['ESPN / Promiedos', 'Unofficial scraped sources, hit only by the VPS — never the browser'],
        ['Sync jobs', 'Two-speed: general sweep every 1–2h, live sync only during match windows'],
        ['Postgres 18', 'Self-hosted on the app\'s VPS, localhost-only, zero egress cost'],
        ['Redis pub/sub', 'Sync job publishes only the matches that changed'],
        ['WebSocket process', 'Single instance, split from the clustered app'],
        ['Next.js 16', 'App Router, PM2 cluster ×2, behind Cloudflare'],
        ['User', 'Browser over HTTPS / WSS through a Cloudflare Tunnel'],
      ] as [string, string][],
      foot: 'Fantasy league data and authentication run on a separate Supabase Postgres.',
    },
    architecture: {
      eyebrow: 'Technical architecture',
      title: 'The stack, by layer.',
      layers: [
        ['Frontend', 'Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4'],
        ['Backend', 'Next.js API routes, raw pg data layer, sync jobs as crons on the VPS'],
        ['Database', 'Postgres 18 self-hosted (football data) · Supabase Postgres (auth + fantasy, 32 tables, RLS)'],
        ['Realtime', 'Redis pub/sub → dedicated single-instance WebSocket server (wss://ws.pelotita.com.ar)'],
        ['Infrastructure', 'Hetzner CX23 VPS (2 vCPU / 4 GB) · PM2 · Cloudflare CDN/TLS/Tunnel — no inbound ports open · GitHub Actions CI/CD · Cloudflare R2 backups'],
      ] as [string, string][],
      note: 'Football data comes from ESPN and Promiedos — unofficial, scraped, hit only by the VPS, never by the browser.',
    },
    database: {
      eyebrow: 'Database',
      title: 'PostgreSQL, up close.',
      lead: 'Postgres is the core of the platform, not a line in a stack list. Two databases: a self-hosted Postgres 18 for football data, and Supabase Postgres for auth and fantasy.',
      facts: [
        'Self-hosted Postgres 18 on the same VPS as the app — localhost-only, never exposed, zero egress cost.',
        'Accessed with raw pg. No ORM — hand-written SQL.',
        'Core self-hosted tables: football_snapshots, sync_log, api_usage.',
        'Supabase side: 32 tables, RLS policies, storage buckets, and auth.users.',
        'Integrity: FK from public.profiles → auth.users, the on_auth_user_created trigger, and triggers that write derived history rows.',
        'Migrations kept as SQL files; the production region move was done via a direct pg_dump with row counts verified identical (challenge 03).',
        'pg_dump --no-privileges silently drops role GRANTs — now a fixed step in the migration checklist.',
      ],
      todoTitle: 'To document — real detail to add later',
      todo: [
        'Indexing strategy and the queries it targets',
        'EXPLAIN / query plans for the hot paths',
        'Transaction boundaries in the sync jobs',
        'Query optimization and connection pooling configuration',
      ],
    },
    ownership: {
      eyebrow: 'Production ownership',
      title: 'Not just "wrote the code."',
      intro: 'Architecture → implementation → testing → deployment → monitoring → incident handling → iteration.',
      steps: [
        ['Architecture', 'Designed the full stack — edge, VPS, self-hosted Postgres/Redis, and a WebSocket process deliberately split from the clustered app.'],
        ['Implementation', 'Sole engineer across frontend, API, raw-pg data layer, sync jobs, and realtime fan-out.'],
        ['Testing', 'Validated the stack cutover and the DB migration against a staging URL and live matches before promoting.'],
        ['Deployment', 'A GitHub Action SSHes into the VPS, builds, and reloads the PM2 cluster on every push to master.'],
        ['Monitoring', 'UptimeRobot on the real HTTPS chain through Cloudflare; sync_log and api_usage track ingestion health.'],
        ['Incident handling', 'Diagnosed and fixed the Supabase egress near-outage, the silent realtime failure, and the data-provider suspension — solo, in production.'],
        ['Iteration', 'The same realtime layer now also powers live standings, fantasy drafting, and live chat.'],
      ] as [string, string][],
      todo: 'TODO: error tracking / alerting / structured logging stack — add specifics.',
    },
    challenges: {
      eyebrow: 'Three key engineering challenges',
      title: 'Owned end to end.',
      items: [
        {
          id: '01',
          tag: 'Production Infrastructure',
          title: 'Zero-downtime migration off Vercel to a self-hosted VPS',
          rows: [
            ['Problem', 'Vercel Hobby capped at 4h active CPU/month — likely already exceeded by 2-minute sync crons — and its free tier bars commercial use, blocking ads and paid plans.'],
            ['Decision', 'Vercel Pro was ruled out too: usage-based billing means an unpredictable bill on a traffic spike or a bug, unacceptable for a self-funded two-person project.'],
            ['Fix', 'New stack — Cloudflare (CDN/TLS/Tunnel) → Hetzner VPS running Next.js under PM2 → self-hosted Postgres + Redis — built and tested against a staging URL while Vercel kept serving production. Deploy pipeline rebuilt as a GitHub Action that SSHes in, builds, and reloads PM2 on every push to master. DNS was cut only after a full login → save lineup → live-sync cycle passed, with Vercel kept as a rollback path.'],
            ['Result', 'Zero downtime. Also caught a monitoring blind spot on the way — UptimeRobot was checking a bare IP on a closed port instead of the HTTPS chain through Cloudflare.'],
          ] as [string, string][],
          mapsTo: 'Maps to: owned production release process, solo',
        },
        {
          id: '02',
          tag: 'Realtime / Reliability',
          title: 'Cut managed services out of the hot path and built the realtime layer',
          rows: [
            ['Problem', 'Supabase\'s free tier (5 GB egress/month) was hours from throttling the production database to read-only. Separately, the fantasy draft had never worked — with no error surfaced anywhere.'],
            ['Root cause', 'Football data was pushed through Supabase Realtime as large JSONB snapshots to every visitor, and dev + prod shared one Supabase project so local reloads burned prod quota. The draft\'s Realtime subscription pointed at a table never added to the realtime publication — it subscribed to nothing.'],
            ['Fix', 'Moved football data to self-hosted Postgres on the app\'s VPS (localhost, no egress quota). Rebuilt realtime on Redis pub/sub feeding a dedicated single-instance WebSocket process, split from the clustered app so there\'s no ambiguity about which instance emits an event. Verified live against matches in progress before retiring the old path. Provisioned a separate dev Supabase project.'],
            ['Result', 'Supabase data volume and egress down close to an order of magnitude; the near-outage never recurred. The same layer now powers live scores, standings, and the fantasy draft.'],
          ] as [string, string][],
          mapsTo: 'Maps to: production & reliability · technical decision making',
        },
        {
          id: '03',
          tag: 'Production Database Migration',
          title: 'Live migration, 32 tables, zero data loss',
          rows: [
            ['Problem', 'A Supabase project\'s region is fixed at creation. Moving AWS regions meant migrating 32 tables, RLS policies, storage buckets, and auth.users — while the old database kept taking writes from crons and live users.'],
            ['Root cause', 'Things that would have become data loss: pg_dump --no-privileges (needed to avoid cross-project ownership conflicts) silently drops the GRANTs the app needs — caught only when live sync failed with "permission denied". auth.users has an FK from public.profiles that a --schema=public dump skips, along with the on_auth_user_created trigger. History-writing triggers had to be disabled before the bulk load or the replay would duplicate rows.'],
            ['Fix', 'Chose a direct pg_dump of the live database over hand-replaying six loose, undocumented SQL migration files in guessed order — a deliberate call to avoid an ambiguous path to prod data corruption.'],
            ['Result', 'All 32 tables, policies, buckets, and auth data migrated with row counts verified identical between old and new. No data loss.'],
          ] as [string, string][],
          mapsTo: 'Maps to: Postgres, deep',
        },
      ],
    },
    other: {
      eyebrow: 'Other engineering challenges',
      title: 'Also handled.',
      items: [
        {
          title: 'Rate-limit and cost-aware data ingestion',
          detail: 'API-Football hit a 100 req/day cap and suspended the account without warning. Switched to unofficial scraped sources (ESPN, Promiedos) with a two-speed sync: a general pass every 1–2h that skips competitions with nothing within ±3 days, and a live sync that reads stored snapshots first and only hits real APIs during a match\'s playing window.',
        },
        {
          title: 'Monitoring correctness',
          detail: 'UptimeRobot was probing a bare IP on a closed port; repointed at the real HTTPS chain through Cloudflare before it mattered.',
        },
      ],
    },
    scale: {
      eyebrow: 'Scale / results',
      title: 'Where it stands.',
      stats: [
        '10,000+ matches processed',
        "Argentina's top divisions + Europe's top 5 leagues + continental cups, tracked live, simultaneously",
        'Real users — accounts, live fantasy drafts, live chat, all on the same real-time layer',
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
    additional: {
      eyebrow: 'Companion case study',
      title: 'The other half of the role.',
      name: 'AVI Salud Admin',
      url: 'Internal ops panel · tech lead of a two-developer team',
      framing:
        'Pelotita proves product engineering, infrastructure, realtime, and production ownership. AVI Salud covers what Pelotita naturally does not: business software, operational workflows, non-technical users, authorization, and automation — on a shared production database, with a recovered 26-table Postgres schema and configurable RBAC enforced in RLS.',
      covers: ['Operational workflows', 'RBAC in RLS', 'Prod schema recovery', 'Migration discipline', 'Non-technical users', 'Business automation'],
      href: '/case-study/avi-salud',
      cta: 'Read the AVI Salud case study →',
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
      tagline: 'Una plataforma de fútbol en vivo que construí y opero solo — Next.js, Postgres self-hosteado, Redis y un servidor WebSocket propio en un VPS que administro yo.',
      live: 'En producción',
      stats: [
        ['360', 'commits · 6 semanas'],
        ['10k+', 'partidos procesados'],
        ['32', 'tablas migradas, cero pérdida'],
        ['1', 'developer'],
      ] as [string, string][],
    },
    video: {
      eyebrow: 'Mirá',
      title: 'Cómo funciona Pelotita',
      src: '', // TODO: pegar acá la URL / archivo del clip de 60–90s
      placeholder: 'Video en camino',
      caption:
        'Recorrido de 60–90s: el producto en vivo, cómo se ingieren, almacenan y envían los datos externos de fútbol a los usuarios en tiempo real, y cómo encaja la infraestructura.',
    },
    commits: {
      eyebrow: 'Prueba de trabajo',
      title: 'Seis semanas, a fondo.',
      headline: (total: string) => `${total} contribuciones en el último año`,
      caption:
        'El desarrollo de Pelotita son 360 commits de eso — cerca de un cuarto de mi año en GitHub, concentrado en unas seis semanas como único ingeniero.',
      stats: ([['360', 'commits en Pelotita'], ['~6', 'semanas'], ['1', 'developer']]) as [string, string][],
      profile: 'github.com/valentinsg ↗',
    },
    built: {
      eyebrow: 'Qué construí',
      title: 'El producto.',
      lead: 'Pelotita cubre las divisiones principales de Argentina, las 5 grandes ligas de Europa y copas continentales: resultados en vivo, tablas, llaves de copa, estadísticas, contenido editorial y una liga de fantasy ("Gran DT") con draft en tiempo real. Equipo de dos — yo soy dueño del producto, la arquitectura, la base de datos y todo el desarrollo.',
      items: [
        'Next.js 16 App Router — frontend y API, capa de datos en SQL crudo, sin ORM',
        'Ingesta de datos desde fuentes externas de fútbol con un sync de dos velocidades',
        'Postgres 18 + Redis self-hosteados en un VPS que provisiono y administro',
        'Capa de WebSocket propia — resultados en vivo, tablas y el draft de fantasy',
        'Pipeline de CI/CD, entorno de staging, deploy a producción y camino de rollback',
      ],
    },
    pipeline: {
      eyebrow: 'Cómo funciona',
      title: 'Del dato al usuario.',
      intro: 'Entran datos externos de fútbol, salen actualizaciones en tiempo real — cada salto corre sobre infra que opero yo.',
      steps: [
        ['ESPN / Promiedos', 'Fuentes no oficiales scrapeadas, a las que solo le pega el VPS — nunca el navegador'],
        ['Jobs de sync', 'Dos velocidades: barrido general cada 1–2h, sync en vivo solo durante ventanas de partido'],
        ['Postgres 18', 'Self-hosteado en el VPS de la app, tráfico localhost-only, cero costo de egress'],
        ['Redis pub/sub', 'El job de sync publica solo los partidos que cambiaron'],
        ['Proceso de WebSocket', 'Una sola instancia, separada del proceso clusterizado de la app'],
        ['Next.js 16', 'App Router, cluster de PM2 ×2, detrás de Cloudflare'],
        ['Usuario', 'Navegador sobre HTTPS / WSS a través de un Cloudflare Tunnel'],
      ] as [string, string][],
      foot: 'Los datos de la liga de fantasy y la autenticación corren en un Supabase Postgres aparte.',
    },
    architecture: {
      eyebrow: 'Arquitectura técnica',
      title: 'El stack, por capa.',
      layers: [
        ['Frontend', 'Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4'],
        ['Backend', 'API routes de Next.js, capa de datos con pg crudo, jobs de sync como crons en el VPS'],
        ['Base de datos', 'Postgres 18 self-hosteado (datos de fútbol) · Supabase Postgres (auth + fantasy, 32 tablas, RLS)'],
        ['Tiempo real', 'Redis pub/sub → servidor WebSocket dedicado de una sola instancia (wss://ws.pelotita.com.ar)'],
        ['Infraestructura', 'VPS Hetzner CX23 (2 vCPU / 4 GB) · PM2 · Cloudflare CDN/TLS/Tunnel — sin puertos de entrada abiertos · GitHub Actions CI/CD · backups en Cloudflare R2'],
      ] as [string, string][],
      note: 'Los datos de fútbol vienen de ESPN y Promiedos — no oficiales, scrapeados, a los que solo le pega el VPS, nunca el navegador.',
    },
    database: {
      eyebrow: 'Base de datos',
      title: 'PostgreSQL, de cerca.',
      lead: 'Postgres es el núcleo de la plataforma, no una línea en una lista de stack. Dos bases: un Postgres 18 self-hosteado para datos de fútbol, y Supabase Postgres para auth y fantasy.',
      facts: [
        'Postgres 18 self-hosteado en el mismo VPS que la app — tráfico localhost-only, nunca expuesto, cero costo de egress.',
        'Acceso con pg crudo. Sin ORM — SQL escrito a mano.',
        'Tablas centrales self-hosteadas: football_snapshots, sync_log, api_usage.',
        'Lado Supabase: 32 tablas, políticas de RLS, buckets de storage y auth.users.',
        'Integridad: FK de public.profiles → auth.users, el trigger on_auth_user_created, y triggers que escriben filas de historial derivado.',
        'Migraciones guardadas como archivos SQL; la mudanza de región de producción se hizo con un pg_dump directo con conteos de filas verificados idénticos (desafío 03).',
        'pg_dump --no-privileges borra en silencio los GRANT de rol — ahora es un paso fijo del checklist de migración.',
      ],
      todoTitle: 'Para documentar — detalle real a agregar más adelante',
      todo: [
        'Estrategia de índices y las queries que apuntan',
        'EXPLAIN / query plans para los caminos calientes',
        'Límites de transacción en los jobs de sync',
        'Optimización de queries y configuración de connection pooling',
      ],
    },
    ownership: {
      eyebrow: 'Ownership de producción',
      title: 'No solo "escribí el código."',
      intro: 'Arquitectura → implementación → testing → deploy → monitoreo → manejo de incidentes → iteración.',
      steps: [
        ['Arquitectura', 'Diseñé el stack completo — edge, VPS, Postgres/Redis self-hosteados, y un proceso de WebSocket separado a propósito del proceso clusterizado de la app.'],
        ['Implementación', 'Único ingeniero en frontend, API, capa de datos con pg crudo, jobs de sync y fan-out de tiempo real.'],
        ['Testing', 'Validé el corte de stack y la migración de la DB contra una URL de staging y partidos en vivo antes de promover.'],
        ['Deploy', 'Una GitHub Action entra por SSH al VPS, buildea y recarga el cluster de PM2 en cada push a master.'],
        ['Monitoreo', 'UptimeRobot sobre la cadena HTTPS real a través de Cloudflare; sync_log y api_usage siguen la salud de la ingesta.'],
        ['Manejo de incidentes', 'Diagnostiqué y resolví el casi-apagón por egress de Supabase, la falla silenciosa de tiempo real y la suspensión del proveedor de datos — solo, en producción.'],
        ['Iteración', 'La misma capa de tiempo real hoy potencia también tablas en vivo, draft de fantasy y chat en vivo.'],
      ] as [string, string][],
      todo: 'TODO: stack de error tracking / alerting / logging estructurado — agregar detalles.',
    },
    challenges: {
      eyebrow: 'Tres desafíos clave de ingeniería',
      title: 'De punta a punta.',
      items: [
        {
          id: '01',
          tag: 'Infraestructura de producción',
          title: 'Migración sin downtime de Vercel a un VPS self-hosteado',
          rows: [
            ['Problema', 'El plan Hobby de Vercel tenía un tope de 4h de CPU activa por mes — probablemente ya excedido por los crons de sync cada 2 minutos — y su plan gratis prohíbe el uso comercial, bloqueando ads y planes pagos.'],
            ['Decisión', 'Vercel Pro también se descartó: su facturación por uso implica una factura impredecible ante un pico de tráfico o un bug, inaceptable para un proyecto de dos personas bancado del bolsillo.'],
            ['Solución', 'Stack nuevo — Cloudflare (CDN/TLS/Tunnel) → VPS de Hetzner corriendo Next.js bajo PM2 → Postgres + Redis self-hosteados — construido y probado contra una URL de staging mientras Vercel seguía sirviendo producción. Pipeline de deploy reconstruido como una GitHub Action que entra por SSH, buildea y recarga PM2 en cada push a master. Recién corté el DNS después de validar un ciclo completo de login → guardar alineación → sync en vivo, con Vercel activo como plan de rollback.'],
            ['Resultado', 'Cero downtime. También detecté un punto ciego de monitoreo en el camino — UptimeRobot chequeaba una IP pelada en un puerto cerrado en vez de la cadena HTTPS a través de Cloudflare.'],
          ] as [string, string][],
          mapsTo: 'Alinea con: ownership del proceso de release en producción, solo',
        },
        {
          id: '02',
          tag: 'Tiempo real / Reliability',
          title: 'Saqué los servicios administrados del camino crítico y construí la capa de tiempo real',
          rows: [
            ['Problema', 'El plan gratis de Supabase (5 GB de egress/mes) estaba a horas de dejar la base de producción en solo lectura. Aparte, el draft de fantasy nunca había funcionado — sin ningún error visible en ningún lado.'],
            ['Causa raíz', 'Los datos de fútbol se enviaban por Supabase Realtime como snapshots grandes de JSONB a cada visitante, y dev + prod compartían un proyecto de Supabase así que cada recarga local quemaba cuota de prod. La suscripción de Realtime del draft apuntaba a una tabla nunca agregada a la publicación de realtime — se suscribía a nada.'],
            ['Solución', 'Moví los datos de fútbol a Postgres self-hosteado en el VPS de la app (localhost, sin cuota de egress). Reconstruí el tiempo real sobre Redis pub/sub alimentando un proceso de WebSocket dedicado de una sola instancia, separado del proceso clusterizado para que no haya ambigüedad sobre qué instancia emite cada evento. Verificado en vivo contra partidos en curso antes de dar de baja el camino viejo. Provisioné un proyecto de Supabase separado para dev.'],
            ['Resultado', 'Volumen de datos y egress de Supabase reducidos casi en un orden de magnitud; el casi-apagón nunca se repitió. La misma capa hoy potencia resultados en vivo, tablas y el draft de fantasy.'],
          ] as [string, string][],
          mapsTo: 'Alinea con: producción & reliability · toma de decisiones técnicas',
        },
        {
          id: '03',
          tag: 'Migración de base de datos en producción',
          title: 'Migración en vivo, 32 tablas, cero pérdida de datos',
          rows: [
            ['Problema', 'La región de un proyecto de Supabase no se puede cambiar después de creado. Mudarse de región de AWS implicaba migrar 32 tablas, políticas de RLS, buckets de storage y auth.users — mientras la base vieja seguía recibiendo escrituras de crons y usuarios en vivo.'],
            ['Causa raíz', 'Cosas que se habrían convertido en pérdida de datos: pg_dump --no-privileges (necesario para evitar conflictos de ownership entre proyectos) borra en silencio los GRANT que la app necesita — detectado recién cuando el sync en vivo falló con "permission denied". auth.users tiene una FK desde public.profiles que un dump de --schema=public no incluye, junto con el trigger on_auth_user_created. Los triggers que escriben historial había que deshabilitarlos antes de la carga masiva o el replay duplicaba filas.'],
            ['Solución', 'Elegí un pg_dump directo de la base viva en vez de replayear a mano seis archivos SQL de migración sueltos y sin documentar en el orden que suponía — una decisión deliberada para evitar un camino ambiguo hacia la corrupción de datos de producción.'],
            ['Resultado', 'Las 32 tablas, políticas, buckets y datos de auth migrados con conteos de filas verificados idénticos entre la base vieja y la nueva. Cero pérdida de datos.'],
          ] as [string, string][],
          mapsTo: 'Alinea con: Postgres, a fondo',
        },
      ],
    },
    other: {
      eyebrow: 'Otros desafíos de ingeniería',
      title: 'También resueltos.',
      items: [
        {
          title: 'Ingesta de datos consciente de rate limits y costos',
          detail: 'API-Football llegó a un tope de 100 requests/día y suspendió la cuenta sin previo aviso. Cambié a fuentes no oficiales scrapeadas (ESPN, Promiedos) con un sync de dos velocidades: un barrido general cada 1–2h que se saltea competiciones sin actividad en ±3 días, y un sync en vivo que lee snapshots guardados primero y solo pega contra las APIs reales durante la ventana de juego de un partido.',
        },
        {
          title: 'Correctitud del monitoreo',
          detail: 'UptimeRobot chequeaba una IP pelada en un puerto cerrado; lo reapunté a la cadena HTTPS real a través de Cloudflare antes de que importara.',
        },
      ],
    },
    scale: {
      eyebrow: 'Escala / resultados',
      title: 'Dónde está parado.',
      stats: [
        '10.000+ partidos procesados',
        'Divisiones principales de Argentina + las 5 grandes ligas de Europa + copas continentales, seguidas en vivo, simultáneamente',
        'Usuarios reales — cuentas, drafts de fantasy en vivo, chat en vivo, todo sobre la misma capa de tiempo real',
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
    additional: {
      eyebrow: 'Case study complementario',
      title: 'La otra mitad del rol.',
      name: 'AVI Salud Admin',
      url: 'Panel de operaciones interno · tech lead de un equipo de dos developers',
      framing:
        'Pelotita demuestra product engineering, infraestructura, tiempo real y ownership de producción. AVI Salud cubre lo que Pelotita naturalmente no: software de negocio, workflows operativos, usuarios no técnicos, autorización y automatización — sobre una base de datos de producción compartida, con un esquema Postgres de 26 tablas recuperado y RBAC configurable enforced en RLS.',
      covers: ['Workflows operativos', 'RBAC en RLS', 'Recuperación de esquema en prod', 'Disciplina de migraciones', 'Usuarios no técnicos', 'Automatización de negocio'],
      href: '/case-study/avi-salud',
      cta: 'Leer el case study de AVI Salud →',
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

      {/* 1 · HERO */}
      <section className="section-shell pb-16 pt-6 md:pb-20">
        <p className="eyebrow">{t.hero.eyebrow}</p>
        <h1 className="mt-6 section-title">{t.hero.title}</h1>
        <p className="work-intro mt-8">{t.hero.tagline}</p>
        <div className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <span className="status-dot" />
          <span>{t.hero.live}</span>
          <a href="https://pelotita.com.ar" target="_blank" rel="noreferrer" className="text-foreground transition-colors hover:text-primary">{t.viewLive}</a>
        </div>

        <div className="growth-stats max-w-3xl" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {t.hero.stats.map(stat => (
            <div key={stat[1]}><strong>{stat[0]}</strong><span>{stat[1]}</span></div>
          ))}
        </div>

        <figure className="case-hero-shot">
          <img src="/pelotita-home.png" alt="Pelotita live scores homepage" loading="lazy" />
        </figure>
      </section>

      {/* 1b · PROOF OF WORK — live GitHub contributions */}
      <section className="section-shell pb-16 md:pb-20">
        <GithubContributions labels={t.commits} />
      </section>

      {/* 2 · VIDEO — "How Pelotita works" */}
      <section className="border-y border-border bg-card">
        <div className="section-shell py-16 md:py-24">
          <p className="eyebrow">{t.video.eyebrow}</p>
          <h2 className="mt-6 section-title craft-title">{t.video.title}</h2>
          <div className="case-video">
            <div className="case-video-frame">
              {t.video.src ? (
                <video src={t.video.src} controls playsInline preload="metadata" />
              ) : (
                <div className="case-video-ph">
                  <span className="play" aria-hidden>▶</span>
                  <p>{t.video.placeholder}</p>
                </div>
              )}
            </div>
            <p className="case-video-caption">{t.video.caption}</p>
          </div>
        </div>
      </section>

      {/* 3 · WHAT I BUILT */}
      <section className="section-shell py-16 md:py-24">
        <p className="eyebrow">{t.built.eyebrow}</p>
        <h2 className="mt-6 section-title craft-title">{t.built.title}</h2>
        <p className="body-copy mt-8 max-w-3xl">{t.built.lead}</p>
        <ul className="fact-list max-w-3xl">
          {t.built.items.map(item => <li key={item}>{item}</li>)}
        </ul>
      </section>

      {/* 4 · HOW IT WORKS — visual pipeline */}
      <section className="border-y border-border bg-card">
        <div className="section-shell py-16 md:py-24">
          <p className="eyebrow">{t.pipeline.eyebrow}</p>
          <h2 className="mt-6 section-title craft-title">{t.pipeline.title}</h2>
          <p className="work-intro mt-8">{t.pipeline.intro}</p>
          <div className="pipeline">
            {t.pipeline.steps.map((step, index) => (
              <Fragment key={step[0]}>
                <div className="pipeline-step">
                  <p className="pipeline-step-label">{step[0]}</p>
                  <p className="pipeline-step-note">{step[1]}</p>
                </div>
                {index < t.pipeline.steps.length - 1 && <span className="pipeline-arrow" aria-hidden />}
              </Fragment>
            ))}
          </div>
          <p className="pipeline-foot">{t.pipeline.foot}</p>
        </div>
      </section>

      {/* 5 · TECHNICAL ARCHITECTURE */}
      <section className="section-shell py-16 md:py-24">
        <p className="eyebrow">{t.architecture.eyebrow}</p>
        <h2 className="mt-6 section-title craft-title">{t.architecture.title}</h2>
        <div className="layer-list">
          {t.architecture.layers.map(layer => (
            <div className="layer-row" key={layer[0]}>
              <span>{layer[0]}</span>
              <p>{layer[1]}</p>
            </div>
          ))}
        </div>
        <p className="arch-note" style={{ marginInline: 0, textAlign: 'left' }}>{t.architecture.note}</p>
      </section>

      {/* 6 · DATABASE / POSTGRESQL */}
      <section className="border-y border-border bg-card">
        <div className="section-shell py-16 md:py-24">
          <p className="eyebrow">{t.database.eyebrow}</p>
          <h2 className="mt-6 section-title craft-title">{t.database.title}</h2>
          <p className="body-copy mt-8 max-w-3xl">{t.database.lead}</p>
          <ul className="fact-list max-w-3xl">
            {t.database.facts.map(fact => <li key={fact}>{fact}</li>)}
          </ul>
          <div className="todo-block max-w-3xl">
            <h4>{t.database.todoTitle}</h4>
            <ul>
              {t.database.todo.map(item => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* 7 · PRODUCTION OWNERSHIP */}
      <section className="section-shell py-16 md:py-24">
        <p className="eyebrow">{t.ownership.eyebrow}</p>
        <h2 className="mt-6 section-title craft-title">{t.ownership.title}</h2>
        <p className="work-intro mt-8">{t.ownership.intro}</p>
        <div className="ownership-steps">
          {t.ownership.steps.map(step => (
            <div className="ownership-step" key={step[0]}>
              <span>{step[0]}</span>
              <p>{step[1]}</p>
            </div>
          ))}
        </div>
        <p className="todo-inline">{t.ownership.todo}</p>
      </section>

      {/* 8 · THREE KEY ENGINEERING CHALLENGES */}
      <section className="border-y border-border bg-card">
        <div className="section-shell py-16 md:py-24">
          <p className="eyebrow">{t.challenges.eyebrow}</p>
          <h2 className="mt-6 section-title craft-title">{t.challenges.title}</h2>
          <div className="mt-14">
            {t.challenges.items.map(incident => (
              <article className="incident-card" key={incident.id}>
                <div className="incident-head">
                  <span className="font-mono text-xs text-primary">{incident.id}</span>
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
                <p className="incident-mapsto">{incident.mapsTo}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 9 · OTHER ENGINEERING CHALLENGES */}
      <section className="section-shell py-16 md:py-24">
        <p className="eyebrow">{t.other.eyebrow}</p>
        <h2 className="mt-6 section-title craft-title">{t.other.title}</h2>
        <div className="mini-list max-w-3xl">
          {t.other.items.map(item => (
            <div className="mini-item" key={item.title}>
              <h4>{item.title}</h4>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10 · SCALE / RESULTS */}
      <section className="border-y border-border bg-card">
        <div className="section-shell py-16 md:py-24">
          <p className="eyebrow">{t.scale.eyebrow}</p>
          <h2 className="mt-6 section-title craft-title">{t.scale.title}</h2>
          <ul className="mt-10 flex flex-col gap-5 border-t border-border pt-8">
            {t.scale.stats.map(stat => (
              <li className="flex items-start gap-3 body-copy" key={stat}>
                <span className="mt-2 h-[.42rem] w-[.42rem] flex-none bg-primary" aria-hidden />
                <span>{stat}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 11 · STACK */}
      <section className="section-shell py-16 md:py-24">
        <p className="eyebrow">{t.stack.eyebrow}</p>
        <h2 className="mt-6 section-title craft-title">{t.stack.title}</h2>
        <div className="hub-categories mt-14">
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
      </section>

      {/* 12 · COMPANION CASE STUDY — AVI Salud */}
      <section className="border-y border-border bg-card">
        <div className="section-shell py-16 md:py-24">
          <p className="eyebrow">{t.additional.eyebrow}</p>
          <h2 className="mt-6 section-title craft-title">{t.additional.title}</h2>
          <div className="additional-card">
            <h3>{t.additional.name}</h3>
            <p className="additional-url">{t.additional.url}</p>
            <p className="additional-framing">{t.additional.framing}</p>
            <div className="additional-covers">
              {t.additional.covers.map(c => <span className="tag" key={c}>{c}</span>)}
            </div>
            <Link className="additional-cta" href={t.additional.href}>{t.additional.cta}</Link>
          </div>
        </div>
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
