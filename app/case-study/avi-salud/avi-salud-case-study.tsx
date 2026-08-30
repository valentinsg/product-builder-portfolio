'use client'

import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'

const LANG_KEY = 'vsg-lang'

type Lang = 'en' | 'es'

const content = {
  en: {
    backHome: '← Back to portfolio',
    companionNav: 'Companion: Pelotita ↗',
    hero: {
      eyebrow: 'Case Study',
      title: 'AVI Salud Admin.',
      tagline: 'Internal operations panel for a home-healthcare company in Mar del Plata, Argentina — scheduling, patients, care staff, plans and billing. Next.js 16 + Supabase, every mutation a server action. I was tech lead of a two-developer team.',
      context: 'Internal tool — no public URL',
      stats: [
        ['147', 'commits · 6 weeks'],
        ['26/26', 'tables RLS-enabled & audited'],
        ['286', 'CREATE POLICY statements'],
        ['90', 'server actions, all auth-guarded'],
      ] as [string, string][],
    },
    companion: {
      label: 'Read alongside',
      linkText: 'Pelotita — product engineering, infrastructure, realtime, production ownership',
      href: '/case-study/pelotita',
      note: 'Pelotita is the production-infrastructure and realtime story. AVI Salud is the business-software one: operational workflows, non-technical users, authorization, and automation on a shared production database.',
    },
    built: {
      eyebrow: 'What I built',
      title: 'The system.',
      lead: 'AVI Salud Admin replaced a workflow that had lived in Excel spreadsheets and WhatsApp threads for 1–3 non-technical office users. Next.js 16 App Router + React 19 + Supabase (Postgres, Auth, Storage). Everything in Spanish — file names, functions, variables, UI. No custom API layer: every mutation is a server action. As tech lead I owned the database and authorization architecture and set the conventions the repo runs on.',
      items: [
        'Recovered a 26-table production schema that had never been in version control (0-byte baseline files)',
        'Configurable RBAC — roles / permisos / rol_permisos — enforced in Row-Level Security',
        'WhatsApp turn-reminder pipeline — pg_cron + pg_net, per-turn timing computed in SQL',
        'Migration discipline for two developers shipping against one shared production database',
        'Refactor to a features / shared / app layout — ~1,039 aliased imports rewritten with git mv',
      ],
    },
    pipeline: {
      eyebrow: 'How it works',
      title: 'Two paths.',
      intro: 'The whole system is deliberately clock-free — except one job, where when it runs is the point.',
      tracks: [
        {
          label: 'Request path — every mutation',
          steps: [
            ['Office user', 'Desktop, daytime, multi-hour sessions'],
            ['Server action', 'Opens with requerirPerfil() / requerirPermiso(modulo, accion)'],
            ['Postgres + RLS', '26 tables, RLS on all of them; fine-grained checks on the 4 most sensitive'],
            ['Generated types', 'supabase gen types → Database type, zero as-unknown-as casts'],
            ['Server Components', 'Rendered on the server, no client API layer'],
          ] as [string, string][],
        },
        {
          label: 'Scheduled path — the one exception',
          steps: [
            ['pg_cron', 'Every 10 min (15-min minimum window, never misses a turn)'],
            ['Cron route', 'Authenticated; key + app URL from Supabase Vault by name'],
            ['Per-turn window', 'Haversine in SQL ÷ speed by transport mode, clamped 15–120 min'],
            ['notificaciones_whatsapp', 'UNIQUE (turno_id, tipo) — idempotency as a DB constraint'],
            ['WhatsApp provider', 'Stubbed — logs instead of sending, pending the business pick'],
          ] as [string, string][],
        },
      ],
      foot: '"Overdue" is derived, never stored. Recurring charges materialize themselves via an idempotent generar_cuotas(hasta) on entry to any /pagos route. If the app is open, the data is current.',
    },
    architecture: {
      eyebrow: 'Technical architecture',
      title: 'The stack, by layer.',
      layers: [
        ['Framework', 'Next.js 16 (App Router), React 19 — Server Components by default, server actions for every mutation, no custom API layer'],
        ['Database', 'Supabase Postgres — 26 tables, RLS on all of them, pg_cron + pg_net for the one scheduled job, Vault for secrets'],
        ['Auth', 'Supabase Auth + configurable RBAC (roles / permisos / rol_permisos), enforced in RLS on sensitive tables and in requerirPermiso() guards on every server action'],
        ['Types', 'supabase gen types → generated Database type; zero as-unknown-as casts, strict TypeScript, no any'],
        ['Storage', 'Supabase Storage (blog images, benefit assets) with RLS policies on storage.objects'],
        ['Tooling', 'No Docker — all DB work via pg_dump / psql against remote; tsc --noEmit + next build as the only automated safety net (no test suite)'],
        ['Migrations', '54 active + 24 archived, ~9,000 lines of SQL, hand-managed renumber-on-merge across two developers'],
      ] as [string, string][],
    },
    database: {
      eyebrow: 'Database / PostgreSQL',
      title: 'Inherited, then made safe.',
      lead: 'The hard part was not building features. It was inheriting a production database with no schema in version control and turning it into something a team could evolve safely, then designing an authorization model that holds up when "don\'t render the button" is not enough.',
      facts: [
        'Recovered a 26-table production schema from 0-byte baseline files — pg_dump schema-only (--schema=public, --no-owner --no-privileges) against production, written to the first timestamp in the migration series so the 24 existing incrementals\' FKs resolve.',
        'No Docker on the machine — ruled out db pull / db diff / db reset (all spin up a shadow container). All DB work done with pg_dump / psql against remote.',
        'Archived the 24 incremental migrations rather than rewrite them idempotent (~2,100 untested lines) — the recovered baseline already is today\'s complete schema.',
        'seed.sql rebuilt from production data (pg_dump --data-only --column-inserts, on conflict do nothing) — the migration files had drifted: null vs real plan prices, a hand-drawn zone polygon, a coberturas row in no file at all.',
        'RLS audited from pg_catalog — pg_class.relrowsecurity joined to pg_policy over all 26 tables. Result: 26/26 with RLS on and ≥1 policy, including the 7 core tables that were the blind spot.',
        'RBAC enforced in RLS — enum admin|usuario replaced by roles / permisos / rol_permisos; ~23 policies rewritten in one dependency-ordered migration (2 of them on storage.objects).',
        'SECURITY DEFINER helper functions with SET search_path = \'\' — without it, a privilege-escalation vector.',
        'Fine-grained private.tiene_permiso(modulo, accion) on the 4 most sensitive tables only — historia_clinica, movimientos, asignaciones, recurrencias. The other ~40 policies keep the coarse check on purpose.',
        'Column-level sensitivity (patient DNI) enforced in the application layer — a deliberate, documented call: RLS filters rows, not columns.',
      ],
    },
    ownership: {
      eyebrow: 'Production ownership',
      title: 'One shared database, two developers, no staging.',
      intro: 'Every non-obvious decision is documented with its "why" in docs/; the migrations themselves are commented essays.',
      steps: [
        ['Schema recovery', 'Turned 0-byte baseline files into one versioned 3,300-line baseline; wrote docs/base-de-datos.md with the recovery method and the manual seed step.'],
        ['Conventions', 'Set the repo\'s file roles and patterns (docs/patrones.md, docs/arquitectura.md) that the team now writes against.'],
        ['Migrations', 'Renumber-on-merge to keep db push linear; migration repair + db query -f when db push is blocked by a teammate\'s in-flight work; reentrant DDL where a file is applied by hand.'],
        ['Authorization', 'Every server action opens with requerirPerfil() / requerirPermiso() — AGENTS.md rule 8, because it was once missed; scripts/verificar-permisos.mjs validates the guards against the matrix.'],
        ['Refactor', 'Moved to features / shared / app — ~1,039 aliased imports rewritten, git mv throughout so git log --follow survives.'],
        ['Scheduled work', 'One cron job in the whole system; the migration documents why the "no cron" rule is broken exactly there, and docs/producto.md keeps the exception from becoming the norm.'],
      ] as [string, string][],
    },
    challenges: {
      eyebrow: 'Four key engineering challenges',
      title: 'Owned as tech lead.',
      items: [
        {
          id: '01',
          tag: 'PostgreSQL',
          title: 'Recovering an unversioned production schema — no Docker, no staging',
          rows: [
            ['Problem', 'Until 2026-08-09 the core schema (clientes, empleados, turnos, historial, proveedores, recurrencias, movimientos…) was not versioned — the *_remote.sql baseline files were 0 bytes. The database could not be reconstructed, RLS could not be audited from the repo, and there was no config.toml. Docker was unavailable, which rules out db pull / db diff / db reset.'],
            ['Decision', 'pg_dump schema-only against production, written to the first timestamp in the series so the 24 incrementals\' FKs resolve. Archived the 24 incrementals rather than hand-editing ~2,100 lines to idempotent. Rebuilt seed.sql from production data — the migrations had drifted from prod. Audited RLS directly from pg_catalog.'],
            ['Result', '26 tables, ~3,300 lines, one baseline. RLS audit clean — 26/26 tables RLS-enabled with ≥1 policy. docs/base-de-datos.md documents the method and the one open item: a full restore test against a throwaway project, blocked on the free-plan project limit, with the exact recipe to run when quota frees.'],
          ] as [string, string][],
          mapsTo: 'Maps to: Postgres deep · migrations against a production DB without breaking it',
        },
        {
          id: '02',
          tag: 'Authorization / RLS',
          title: 'Binary admin flag → configurable RBAC enforced in RLS',
          rows: [
            ['Problem', 'rol_usuario was admin | usuario, and ~23 RLS policies compared against the literal \'admin\'. The business needed real roles — Coordinación, Administración, Dirección — with a configurable matrix, and Dirección needed to see patient DNI that Coordinación should not.'],
            ['Decision', 'Phase 1: three tables (roles, permisos, rol_permisos) + perfiles.rol_id in one migration; SECURITY DEFINER helpers with SET search_path = \'\'; policies rewritten to call es_admin() before dropping the column they depended on; 2 storage.objects policies handled out of band; matrix seeded open as a labeled placeholder pending client sign-off. Phase 2: private.tiene_permiso(modulo, accion) on the 4 most sensitive tables only. Column-level sensitivity (DNI) enforced in the app layer — RLS filters rows, not columns.'],
            ['Result', 'Roles and permissions are editable from the panel. RLS is the floor under the 4 tables where a caller bug would be most expensive; the admin client bypasses RLS by design and only runs after a permission guard.'],
          ] as [string, string][],
          mapsTo: 'Maps to: RLS (big plus) · constraints and transactions, not ORM-abstracted',
        },
        {
          id: '03',
          tag: 'Release process',
          title: 'Shipping migrations on one shared database, two developers',
          rows: [
            ['Problem', 'supabase db push applies the whole local migrations chain — a file another branch already applied to the remote fails on "already exists", and two branches that both add a migration for the same timestamp collide on filename. No staging environment.'],
            ['Decision', 'Renumber-on-merge to keep db push linear. supabase db query -f + supabase migration repair when db push is blocked by a teammate\'s in-flight migrations (shipped the fine-grained-permissions migration this way). Reentrant DDL (CREATE TABLE IF NOT EXISTS / DROP POLICY IF EXISTS) where a migration is applied by hand repeatedly, with a comment saying why. A follow-up ALTER TABLE … ADD COLUMN IF NOT EXISTS migration for the column an early reentrant run never added.'],
            ['Result', '54 active + 24 archived migrations, ~9,000 lines of SQL, ~286 CREATE POLICY statements — evolved by two people against production over six weeks with no data loss and no unreconciled repo/remote drift.'],
          ] as [string, string][],
          mapsTo: 'Maps to: owned the entire release pipeline solo · idempotent deployment from doing it',
        },
        {
          id: '04',
          tag: 'Automation',
          title: 'Turn reminders: breaking the "no cron" rule, on purpose, once',
          rows: [
            ['Problem', 'The system is deliberately cron-free. But a turn reminder must fire when nobody has the panel open — an hour before a 6am home visit — and a fixed "one hour before" is wrong: the reminder should fire when the care worker needs to leave, which is 5 minutes for a nearby patient and 90 for a far one.'],
            ['Decision', 'Per-turn anticipation window computed in SQL — Haversine between empleado and cliente coordinates ÷ a speed keyed on medio_transporte, clamped 15–120 min, explicit fallback of 60 on missing data. Time math in SQL, not Node (turnos.hora is time without time zone; each window is a different length). Idempotency as a DB constraint — UNIQUE (turno_id, tipo). pg_cron + pg_net hitting an authenticated cron route every 10 min; secrets in Supabase Vault by name; WhatsApp provider stubbed.'],
            ['Result', 'The pipeline is code-complete and verified against the real schema (read-only); open items are an end-to-end browser run and the provider pick, both tracked. It is the only clock-driven piece in the system, and the migration explains why it is allowed to be.'],
          ] as [string, string][],
          mapsTo: 'Maps to: third-party integration scar tissue · mobile-web reality of field workers',
        },
      ],
    },
    limitations: {
      eyebrow: 'What is not done',
      title: 'And documented.',
      items: [
        {
          title: 'Full schema-reconstruction test',
          detail: 'A restore of the recovered baseline against a throwaway Supabase project — blocked on the free plan\'s two-project limit. The exact recipe is written down for when quota frees. A recovered baseline you have not restored is a file, not a backup.',
        },
        {
          title: 'Turn-reminder pipeline: last mile',
          detail: 'An end-to-end browser run and the WhatsApp provider choice (Twilio / 360dialog / Meta Cloud API). The business logic ships stubbed; tipo is a closed one-value vocabulary today, widened by a one-line migration when the other reminder events land.',
        },
        {
          title: 'No automated test suite',
          detail: 'tsc --noEmit + next build are the only automated safety net. Correctness leans on generated types, the permission check script, and commented migrations.',
        },
      ],
    },
    scale: {
      eyebrow: 'Scale & metrics',
      title: 'Where it stands.',
      stats: [
        '~6 weeks (2026-07-13 → 2026-08-24) · 147 commits · 2 developers, me as tech lead',
        '26 production tables recovered into a single versioned baseline (~3,300 lines) from 0-byte files',
        '54 active + 24 archived migrations · ~9,000 lines of SQL · ~286 CREATE POLICY · 26/26 tables RLS-audited via pg_catalog',
        '~490 TypeScript/TSX files, ~80,000 LOC in src/ · 90 server actions across 22 files, every one opening with an auth guard',
        '~12 tracked tickets · users: 1–3 non-technical office staff replacing Excel + WhatsApp',
        'Refactor to features / shared / app — ~1,039 aliased imports rewritten, git mv throughout, producing docs/patrones.md and docs/arquitectura.md',
      ],
    },
    stack: {
      eyebrow: 'Stack',
      title: 'What it runs on.',
      groups: [
        { name: 'Application', items: ['Next.js 16 (App Router)', 'React 19', 'Server Components', 'Server actions (no API layer)', 'Strict TypeScript, no any'] },
        { name: 'Data & Auth', items: ['Supabase Postgres (26 tables, RLS)', 'Configurable RBAC in RLS', 'Supabase Auth', 'Generated Database types', 'Supabase Vault'] },
        { name: 'Ops & Automation', items: ['pg_cron + pg_net', 'pg_dump / psql (no Docker)', '54 + 24 migrations', 'Supabase Storage', 'next build + tsc --noEmit'] },
      ],
    },
    footer: {
      eyebrow: 'Get in touch',
      title: ["Let's talk", 'systems.'],
      companion: 'Companion case study → Pelotita',
      backHome: '← Back to portfolio',
    },
  },
  es: {
    backHome: '← Volver al portfolio',
    companionNav: 'Complemento: Pelotita ↗',
    hero: {
      eyebrow: 'Case Study',
      title: 'AVI Salud Admin.',
      tagline: 'Panel de operaciones interno para una empresa de salud domiciliaria en Mar del Plata, Argentina — agenda, pacientes, personal de cuidado, planes y facturación. Next.js 16 + Supabase, cada mutación es un server action. Fui tech lead de un equipo de dos developers.',
      context: 'Herramienta interna — sin URL pública',
      stats: [
        ['147', 'commits · 6 semanas'],
        ['26/26', 'tablas con RLS, auditadas'],
        ['286', 'sentencias CREATE POLICY'],
        ['90', 'server actions, todas con guard'],
      ] as [string, string][],
    },
    companion: {
      label: 'Leer junto con',
      linkText: 'Pelotita — product engineering, infraestructura, tiempo real, ownership de producción',
      href: '/case-study/pelotita',
      note: 'Pelotita es la historia de infraestructura de producción y tiempo real. AVI Salud es la de software de negocio: workflows operativos, usuarios no técnicos, autorización y automatización sobre una base de datos de producción compartida.',
    },
    built: {
      eyebrow: 'Qué construí',
      title: 'El sistema.',
      lead: 'AVI Salud Admin reemplazó un flujo de trabajo que había vivido en planillas de Excel e hilos de WhatsApp para 1–3 usuarios de oficina no técnicos. Next.js 16 App Router + React 19 + Supabase (Postgres, Auth, Storage). Todo en español — nombres de archivos, funciones, variables, UI. Sin capa de API propia: cada mutación es un server action. Como tech lead fui dueño de la arquitectura de base de datos y autorización, y definí las convenciones sobre las que corre el repo.',
      items: [
        'Recuperé un esquema de producción de 26 tablas que nunca había estado versionado (archivos base de 0 bytes)',
        'RBAC configurable — roles / permisos / rol_permisos — enforced en Row-Level Security',
        'Pipeline de recordatorios de turno por WhatsApp — pg_cron + pg_net, timing por turno calculado en SQL',
        'Disciplina de migraciones para dos developers trabajando contra una única base de datos de producción compartida',
        'Refactor a un layout features / shared / app — ~1.039 imports con alias reescritos con git mv',
      ],
    },
    pipeline: {
      eyebrow: 'Cómo funciona',
      title: 'Dos caminos.',
      intro: 'Todo el sistema es deliberadamente sin reloj — salvo un job, donde el cuándo corre es justamente el punto.',
      tracks: [
        {
          label: 'Camino de request — cada mutación',
          steps: [
            ['Usuario de oficina', 'Desktop, de día, sesiones de varias horas'],
            ['Server action', 'Abre con requerirPerfil() / requerirPermiso(modulo, accion)'],
            ['Postgres + RLS', '26 tablas, RLS en todas; chequeos finos en las 4 más sensibles'],
            ['Tipos generados', 'supabase gen types → tipo Database, cero casts as-unknown-as'],
            ['Server Components', 'Renderizados en el servidor, sin capa de API cliente'],
          ] as [string, string][],
        },
        {
          label: 'Camino programado — la única excepción',
          steps: [
            ['pg_cron', 'Cada 10 min (ventana mínima de 15 min, nunca se pierde un turno)'],
            ['Ruta de cron', 'Autenticada; key + URL de la app desde Supabase Vault por nombre'],
            ['Ventana por turno', 'Haversine en SQL ÷ velocidad por medio de transporte, clamp 15–120 min'],
            ['notificaciones_whatsapp', 'UNIQUE (turno_id, tipo) — idempotencia como constraint de la DB'],
            ['Proveedor WhatsApp', 'Stub — loguea en vez de enviar, a la espera de la decisión de negocio'],
          ] as [string, string][],
        },
      ],
      foot: '"Vencido" es derivado, nunca almacenado. Los cargos recurrentes se materializan solos vía un generar_cuotas(hasta) idempotente al entrar a cualquier ruta /pagos. Si la app está abierta, el dato está al día.',
    },
    architecture: {
      eyebrow: 'Arquitectura técnica',
      title: 'El stack, por capa.',
      layers: [
        ['Framework', 'Next.js 16 (App Router), React 19 — Server Components por defecto, server actions para cada mutación, sin capa de API propia'],
        ['Base de datos', 'Supabase Postgres — 26 tablas, RLS en todas, pg_cron + pg_net para el único job programado, Vault para secrets'],
        ['Auth', 'Supabase Auth + RBAC configurable (roles / permisos / rol_permisos), enforced en RLS en tablas sensibles y en guards requerirPermiso() en cada server action'],
        ['Tipos', 'supabase gen types → tipo Database generado; cero casts as-unknown-as, TypeScript estricto, sin any'],
        ['Storage', 'Supabase Storage (imágenes de blog, assets de beneficios) con políticas de RLS en storage.objects'],
        ['Tooling', 'Sin Docker — todo el trabajo de DB vía pg_dump / psql contra remoto; tsc --noEmit + next build como única red de seguridad automatizada (sin test suite)'],
        ['Migraciones', '54 activas + 24 archivadas, ~9.000 líneas de SQL, renumber-on-merge a mano entre dos developers'],
      ] as [string, string][],
    },
    database: {
      eyebrow: 'Base de datos / PostgreSQL',
      title: 'Heredada, y después hecha segura.',
      lead: 'La parte difícil no fue construir features. Fue heredar una base de datos de producción sin esquema en control de versiones y convertirla en algo que un equipo pudiera evolucionar de forma segura, y después diseñar un modelo de autorización que aguante cuando "no renderizar el botón" no alcanza.',
      facts: [
        'Recuperé un esquema de producción de 26 tablas desde archivos base de 0 bytes — pg_dump schema-only (--schema=public, --no-owner --no-privileges) contra producción, escrito al primer timestamp de la serie de migraciones para que resuelvan las FK de las 24 incrementales existentes.',
        'Sin Docker en la máquina — descartó db pull / db diff / db reset (todos levantan un container shadow). Todo el trabajo de DB con pg_dump / psql contra remoto.',
        'Archivé las 24 migraciones incrementales en vez de reescribirlas idempotentes (~2.100 líneas sin testear) — la baseline recuperada ya es el esquema completo de hoy.',
        'seed.sql reconstruido desde datos de producción (pg_dump --data-only --column-inserts, on conflict do nothing) — los archivos de migración habían derivado: precios de plan null vs reales, un polígono de zona dibujado a mano, una fila de coberturas que no estaba en ningún archivo.',
        'RLS auditado desde pg_catalog — pg_class.relrowsecurity join a pg_policy sobre las 26 tablas. Resultado: 26/26 con RLS activado y ≥1 política, incluidas las 7 tablas core que eran el punto ciego.',
        'RBAC enforced en RLS — enum admin|usuario reemplazado por roles / permisos / rol_permisos; ~23 políticas reescritas en una migración ordenada por dependencias (2 de ellas sobre storage.objects).',
        'Funciones helper SECURITY DEFINER con SET search_path = \'\' — sin eso, un vector de escalada de privilegios.',
        'private.tiene_permiso(modulo, accion) fino solo en las 4 tablas más sensibles — historia_clinica, movimientos, asignaciones, recurrencias. Las otras ~40 políticas mantienen el chequeo grueso a propósito.',
        'Sensibilidad a nivel columna (DNI del paciente) enforced en la capa de aplicación — una decisión deliberada y documentada: RLS filtra filas, no columnas.',
      ],
    },
    ownership: {
      eyebrow: 'Ownership de producción',
      title: 'Una base compartida, dos developers, sin staging.',
      intro: 'Cada decisión no obvia está documentada con su "por qué" en docs/; las migraciones mismas son ensayos comentados.',
      steps: [
        ['Recuperación del esquema', 'Convertí archivos base de 0 bytes en una baseline versionada de 3.300 líneas; escribí docs/base-de-datos.md con el método de recuperación y el paso manual de seed.'],
        ['Convenciones', 'Definí los roles de archivo y patrones del repo (docs/patrones.md, docs/arquitectura.md) contra los que el equipo escribe hoy.'],
        ['Migraciones', 'Renumber-on-merge para mantener db push lineal; migration repair + db query -f cuando db push está bloqueado por trabajo en vuelo de un compañero; DDL reentrante donde un archivo se aplica a mano.'],
        ['Autorización', 'Cada server action abre con requerirPerfil() / requerirPermiso() — regla 8 de AGENTS.md, porque una vez se pasó por alto; scripts/verificar-permisos.mjs valida los guards contra la matriz.'],
        ['Refactor', 'Pasé a features / shared / app — ~1.039 imports con alias reescritos, git mv en todo para que git log --follow sobreviva.'],
        ['Trabajo programado', 'Un solo cron job en todo el sistema; la migración documenta por qué se rompe la regla "sin cron" exactamente ahí, y docs/producto.md evita que la excepción se vuelva norma.'],
      ] as [string, string][],
    },
    challenges: {
      eyebrow: 'Cuatro desafíos clave de ingeniería',
      title: 'Como tech lead.',
      items: [
        {
          id: '01',
          tag: 'PostgreSQL',
          title: 'Recuperar un esquema de producción sin versionar — sin Docker, sin staging',
          rows: [
            ['Problema', 'Hasta el 2026-08-09 el esquema core (clientes, empleados, turnos, historial, proveedores, recurrencias, movimientos…) no estaba versionado — los archivos base *_remote.sql eran de 0 bytes. La base no se podía reconstruir, el RLS no se podía auditar desde el repo, y no había config.toml. Docker no estaba disponible, lo que descarta db pull / db diff / db reset.'],
            ['Decisión', 'pg_dump schema-only contra producción, escrito al primer timestamp de la serie para que resuelvan las FK de las 24 incrementales. Archivé las 24 incrementales en vez de editar a mano ~2.100 líneas a idempotente. Reconstruí seed.sql desde datos de producción — las migraciones habían derivado de prod. Audité RLS directo desde pg_catalog.'],
            ['Resultado', '26 tablas, ~3.300 líneas, una baseline. Auditoría de RLS limpia — 26/26 tablas con RLS y ≥1 política. docs/base-de-datos.md documenta el método y el único ítem abierto: un test completo de restore contra un proyecto descartable, bloqueado por el límite de proyectos del plan free, con la receta exacta para cuando se libere cuota.'],
          ] as [string, string][],
          mapsTo: 'Alinea con: Postgres a fondo · migraciones contra una DB de producción sin romperla',
        },
        {
          id: '02',
          tag: 'Autorización / RLS',
          title: 'Flag binario de admin → RBAC configurable enforced en RLS',
          rows: [
            ['Problema', 'rol_usuario era admin | usuario, y ~23 políticas de RLS comparaban contra el literal \'admin\'. El negocio necesitaba roles reales — Coordinación, Administración, Dirección — con una matriz configurable, y Dirección necesitaba ver el DNI del paciente que Coordinación no debía ver.'],
            ['Decisión', 'Fase 1: tres tablas (roles, permisos, rol_permisos) + perfiles.rol_id en una migración; helpers SECURITY DEFINER con SET search_path = \'\'; políticas reescritas para llamar a es_admin() antes de dropear la columna de la que dependían; 2 políticas de storage.objects manejadas aparte; matriz seedeada abierta como placeholder etiquetado a la espera del OK del cliente. Fase 2: private.tiene_permiso(modulo, accion) solo en las 4 tablas más sensibles. Sensibilidad a nivel columna (DNI) enforced en la capa de app — RLS filtra filas, no columnas.'],
            ['Resultado', 'Los roles y sus permisos se editan desde el panel. RLS es el piso bajo las 4 tablas donde un bug en un caller saldría más caro; el cliente admin bypasea RLS por diseño y solo corre después de un guard de permiso.'],
          ] as [string, string][],
          mapsTo: 'Alinea con: RLS (big plus) · constraints y transacciones, no abstraídas por un ORM',
        },
        {
          id: '03',
          tag: 'Proceso de release',
          title: 'Enviar migraciones sobre una base compartida, dos developers',
          rows: [
            ['Problema', 'supabase db push aplica toda la cadena local de migraciones — un archivo que otra rama ya aplicó al remoto falla con "already exists", y dos ramas que agregan una migración para el mismo timestamp colisionan en el nombre. Sin entorno de staging.'],
            ['Decisión', 'Renumber-on-merge para mantener db push lineal. supabase db query -f + supabase migration repair cuando db push está bloqueado por migraciones en vuelo de un compañero (así se envió la migración de permisos finos). DDL reentrante (CREATE TABLE IF NOT EXISTS / DROP POLICY IF EXISTS) donde una migración se aplica a mano varias veces, con un comentario que explica por qué. Una migración de seguimiento ALTER TABLE … ADD COLUMN IF NOT EXISTS para la columna que una corrida reentrante temprana nunca agregó.'],
            ['Resultado', '54 migraciones activas + 24 archivadas, ~9.000 líneas de SQL, ~286 sentencias CREATE POLICY — evolucionadas por dos personas contra producción en seis semanas, sin pérdida de datos y sin drift repo/remoto sin reconciliar.'],
          ] as [string, string][],
          mapsTo: 'Alinea con: ownership del pipeline de release completo, solo · deployment idempotente de hacerlo',
        },
        {
          id: '04',
          tag: 'Automatización',
          title: 'Recordatorios de turno: romper la regla "sin cron", a propósito, una vez',
          rows: [
            ['Problema', 'El sistema es deliberadamente sin cron. Pero un recordatorio de turno tiene que dispararse cuando nadie tiene el panel abierto — una hora antes de una visita domiciliaria de las 6am — y un fijo "una hora antes" está mal: el recordatorio debe dispararse cuando el trabajador de cuidado necesita salir, que son 5 minutos para un paciente cerca y 90 para uno lejos.'],
            ['Decisión', 'Ventana de anticipación por turno calculada en SQL — Haversine entre coordenadas de empleado y cliente ÷ una velocidad según medio_transporte, con clamp 15–120 min y fallback explícito de 60 ante datos faltantes. Cálculo de tiempo en SQL, no en Node (turnos.hora es time without time zone; cada ventana tiene un largo distinto). Idempotencia como constraint de la DB — UNIQUE (turno_id, tipo). pg_cron + pg_net pegándole a una ruta de cron autenticada cada 10 min; secrets en Supabase Vault por nombre; proveedor de WhatsApp stubeado.'],
            ['Resultado', 'El pipeline está code-complete y verificado contra el esquema real (solo lectura); los ítems abiertos son una corrida end-to-end en el browser y la elección del proveedor, ambos trackeados. Es la única pieza guiada por reloj del sistema, y la migración explica por qué se le permite serlo.'],
          ] as [string, string][],
          mapsTo: 'Alinea con: cicatrices de integración con terceros · realidad mobile-web de los trabajadores de campo',
        },
      ],
    },
    limitations: {
      eyebrow: 'Lo que no está hecho',
      title: 'Y documentado.',
      items: [
        {
          title: 'Test completo de reconstrucción del esquema',
          detail: 'Un restore de la baseline recuperada contra un proyecto Supabase descartable — bloqueado por el límite de dos proyectos del plan free. La receta exacta está escrita para cuando se libere cuota. Una baseline recuperada que no restauraste es un archivo, no un backup.',
        },
        {
          title: 'Pipeline de recordatorios: última milla',
          detail: 'Una corrida end-to-end en el browser y la elección del proveedor de WhatsApp (Twilio / 360dialog / Meta Cloud API). La lógica de negocio se envía stubeada; tipo es un vocabulario cerrado de un solo valor hoy, ampliable con una migración de una línea cuando lleguen los otros eventos de recordatorio.',
        },
        {
          title: 'Sin test suite automatizada',
          detail: 'tsc --noEmit + next build son la única red de seguridad automatizada. La correctitud se apoya en tipos generados, el script de chequeo de permisos y migraciones comentadas.',
        },
      ],
    },
    scale: {
      eyebrow: 'Escala & métricas',
      title: 'Dónde está parado.',
      stats: [
        '~6 semanas (2026-07-13 → 2026-08-24) · 147 commits · 2 developers, yo como tech lead',
        '26 tablas de producción recuperadas en una única baseline versionada (~3.300 líneas) desde archivos de 0 bytes',
        '54 migraciones activas + 24 archivadas · ~9.000 líneas de SQL · ~286 CREATE POLICY · 26/26 tablas auditadas vía pg_catalog',
        '~490 archivos TypeScript/TSX, ~80.000 LOC en src/ · 90 server actions en 22 archivos, cada uno abriendo con un guard de auth',
        '~12 tickets trackeados · usuarios: 1–3 empleados de oficina no técnicos reemplazando Excel + WhatsApp',
        'Refactor a features / shared / app — ~1.039 imports con alias reescritos, git mv en todo, produciendo docs/patrones.md y docs/arquitectura.md',
      ],
    },
    stack: {
      eyebrow: 'Stack',
      title: 'Sobre qué corre.',
      groups: [
        { name: 'Aplicación', items: ['Next.js 16 (App Router)', 'React 19', 'Server Components', 'Server actions (sin capa de API)', 'TypeScript estricto, sin any'] },
        { name: 'Datos & Auth', items: ['Supabase Postgres (26 tablas, RLS)', 'RBAC configurable en RLS', 'Supabase Auth', 'Tipos Database generados', 'Supabase Vault'] },
        { name: 'Ops & Automatización', items: ['pg_cron + pg_net', 'pg_dump / psql (sin Docker)', '54 + 24 migraciones', 'Supabase Storage', 'next build + tsc --noEmit'] },
      ],
    },
    footer: {
      eyebrow: 'Hablemos',
      title: ['Hablemos de', 'sistemas.'],
      companion: 'Case study complementario → Pelotita',
      backHome: '← Volver al portfolio',
    },
  },
} as const

export default function AviSaludCaseStudy() {
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
          <Link href="/case-study/pelotita" className="nav-link">{t.companionNav}</Link>
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
          <span>{t.hero.context}</span>
        </div>

        <div className="growth-stats max-w-3xl" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {t.hero.stats.map(stat => (
            <div key={stat[1]}><strong>{stat[0]}</strong><span>{stat[1]}</span></div>
          ))}
        </div>

        <div className="companion">
          <span className="companion-label">{t.companion.label}</span>
          <Link href={t.companion.href} className="companion-link">{t.companion.linkText}</Link>
          <p className="companion-note">{t.companion.note}</p>
        </div>
      </section>

      {/* 2 · WHAT I BUILT */}
      <section className="border-y border-border bg-card">
        <div className="section-shell py-16 md:py-24">
          <p className="eyebrow">{t.built.eyebrow}</p>
          <h2 className="mt-6 section-title craft-title">{t.built.title}</h2>
          <p className="body-copy mt-8 max-w-3xl">{t.built.lead}</p>
          <ul className="fact-list max-w-3xl">
            {t.built.items.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </section>

      {/* 3 · HOW IT WORKS */}
      <section className="section-shell py-16 md:py-24">
        <p className="eyebrow">{t.pipeline.eyebrow}</p>
        <h2 className="mt-6 section-title craft-title">{t.pipeline.title}</h2>
        <p className="work-intro mt-8">{t.pipeline.intro}</p>
        {t.pipeline.tracks.map(track => (
          <div className="pipeline-track" key={track.label}>
            <p className="pipeline-track-label">{track.label}</p>
            <div className="pipeline">
              {track.steps.map((step, index) => (
                <Fragment key={step[0]}>
                  <div className="pipeline-step">
                    <p className="pipeline-step-label">{step[0]}</p>
                    <p className="pipeline-step-note">{step[1]}</p>
                  </div>
                  {index < track.steps.length - 1 && <span className="pipeline-arrow" aria-hidden />}
                </Fragment>
              ))}
            </div>
          </div>
        ))}
        <p className="pipeline-foot">{t.pipeline.foot}</p>
      </section>

      {/* 4 · TECHNICAL ARCHITECTURE */}
      <section className="border-y border-border bg-card">
        <div className="section-shell py-16 md:py-24">
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
        </div>
      </section>

      {/* 5 · DATABASE / POSTGRESQL */}
      <section className="section-shell py-16 md:py-24">
        <p className="eyebrow">{t.database.eyebrow}</p>
        <h2 className="mt-6 section-title craft-title">{t.database.title}</h2>
        <p className="body-copy mt-8 max-w-3xl">{t.database.lead}</p>
        <ul className="fact-list max-w-3xl">
          {t.database.facts.map(fact => <li key={fact}>{fact}</li>)}
        </ul>
      </section>

      {/* 6 · PRODUCTION OWNERSHIP */}
      <section className="border-y border-border bg-card">
        <div className="section-shell py-16 md:py-24">
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
        </div>
      </section>

      {/* 7 · KEY ENGINEERING CHALLENGES */}
      <section className="section-shell py-16 md:py-24">
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
      </section>

      {/* 8 · WHAT IS NOT DONE */}
      <section className="border-y border-border bg-card">
        <div className="section-shell py-16 md:py-24">
          <p className="eyebrow">{t.limitations.eyebrow}</p>
          <h2 className="mt-6 section-title craft-title">{t.limitations.title}</h2>
          <div className="mini-list max-w-3xl">
            {t.limitations.items.map(item => (
              <div className="mini-item" key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9 · SCALE & METRICS */}
      <section className="section-shell py-16 md:py-24">
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
      </section>

      {/* 10 · STACK */}
      <section className="border-y border-border bg-card">
        <div className="section-shell py-16 md:py-24">
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
        </div>
      </section>

      <footer className="footer">
        <div className="section-shell py-20 md:py-28">
          <p className="eyebrow">{t.footer.eyebrow}</p>
          <h2 className="footer-title">{t.footer.title[0]}<br /><span>{t.footer.title[1]}</span></h2>
          <div className="mt-12 flex flex-wrap gap-6">
            <Link className="wsp-button" href="/case-study/pelotita">{t.footer.companion}</Link>
            <Link className="wsp-button" href="/#contact">{t.footer.backHome}</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
