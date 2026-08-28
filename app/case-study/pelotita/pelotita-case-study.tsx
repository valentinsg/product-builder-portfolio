import Link from 'next/link'

const heroStats: [string, string][] = [
  ['360', 'commits in 6 weeks, solo'],
  ['10k+', 'matches processed'],
  ['2', 'person team, 1 engineer'],
]

const archFlow = [
  { title: 'User', detail: 'Browser, over HTTPS' },
  { title: 'pelotita.com.ar', detail: 'Domain on NIC Argentina, DNS delegated to Cloudflare' },
  { title: 'Cloudflare (free)', detail: 'CDN + cache + TLS + Cloudflare Tunnel — no inbound ports open on the server. wss://ws.pelotita.com.ar routed through the same tunnel.' },
  { title: 'Hetzner VPS', detail: 'Next.js 16 under PM2, clustered ×2. CX23 — 2 vCPU / 4 GB, Falkenstein. Same box also runs Postgres, Redis, and the WebSocket process.' },
]

const archBranches = [
  { title: 'Postgres 18 (self-hosted)', detail: 'football_snapshots, sync_log, api_usage — localhost-only, never leaves the server, zero egress cost.' },
  { title: 'Redis → WebSocket', detail: 'Redis pub/sub feeds a dedicated, single-instance WebSocket process — powers live scores, standings, and the fantasy draft.' },
  { title: 'Supabase (São Paulo)', detail: 'Postgres + Auth + Realtime — fantasy league data and login only.' },
]

type Incident = {
  tag: string
  title: string
  rows: [string, string][]
}

const incidents: Incident[] = [
  {
    tag: 'Infra migration',
    title: 'Zero-downtime migration off Vercel to a self-hosted VPS',
    rows: [
      ['Problem', "Vercel's Hobby plan capped out at 4 hours of active CPU/month — likely already exceeded by crons syncing live data every 2 minutes — and its terms restrict the free tier to non-commercial use, a real problem once ads and paid plans go live."],
      ['Root cause', "Pro was ruled out too: usage-based billing means an unpredictable bill on a traffic spike or a bug, which isn't acceptable for a two-person project funding this out of pocket."],
      ['Fix', 'New stack — Cloudflare (CDN/TLS/Tunnel) → Hetzner VPS running Next.js under PM2 → self-hosted Postgres + Redis — built and tested against a staging URL while Vercel kept serving production. Deploy pipeline rebuilt from scratch as a GitHub Action that SSHes in, builds, and reloads PM2 on every push to master. Only cut DNS after a full login → save lineup → live-sync cycle passed on the new stack, with Vercel kept alive as a rollback path.'],
      ['Result', 'Zero downtime. Monitoring caught along the way, too — UptimeRobot was checking a bare IP on a closed port instead of the real HTTPS chain through Cloudflare; fixed before it mattered.'],
    ],
  },
  {
    tag: 'Incident response',
    title: 'Supabase egress about to go read-only',
    rows: [
      ['Problem', "Supabase's free tier (5 GB egress/month) was hours from throttling the production database to read-only."],
      ['Root cause', 'Football data was being pushed through Supabase Realtime as large JSONB snapshots to every visitor. Compounding it: dev and prod were pointed at the same Supabase project, so every local reload and manual test was burning production quota.'],
      ['Fix', 'Moved football data to a Postgres instance self-hosted on the same VPS as the app — same host, localhost-only traffic, doesn\'t count against any egress quota. Kept Supabase for fantasy data and auth only. Rebuilt real-time delivery on Redis pub/sub feeding a dedicated WebSocket server, verified live against real matches in progress before retiring the old path. Provisioned a separate dev Supabase project to stop the quota bleed.'],
      ['Result', "Supabase's data volume and egress cut by close to an order of magnitude. The near-outage never recurred."],
    ],
  },
  {
    tag: 'Systems design',
    title: 'Built the real-time layer myself after the managed one silently failed',
    rows: [
      ['Problem', 'The fantasy draft feature had never worked, with no error surfaced anywhere.'],
      ['Root cause', "Its Supabase Realtime subscription was on a table that had never actually been added to Supabase's realtime publication — it subscribed to nothing, and nothing told anyone."],
      ['Fix', "Rather than patch around the managed service, built a small dedicated real-time layer: the sync job publishes changed matches to Redis, and a single-instance WebSocket process — kept separate from the clustered app process so there's no ambiguity about which instance should push an event — fans it out to connected browsers."],
      ['Result', 'That same layer now also powers live fantasy drafting, live scores, and live standings.'],
    ],
  },
  {
    tag: 'Data migration',
    title: 'Live database migration, 32 tables, zero data loss',
    rows: [
      ['Problem', "A Supabase project's region can't be changed after creation. Moving to a different AWS region meant migrating 32 tables, RLS policies, storage buckets, and auth.users — while the old database kept taking writes from cron jobs and live users."],
      ['Root cause', 'Concrete things that had to be caught before they became data loss: pg_dump --no-privileges (needed to avoid ownership conflicts between projects) silently drops the GRANTs that let the app read/write at all — missed on the first pass, caught when live sync failed with "permission denied" against real data. auth.users has a foreign key from public.profiles that a --schema=public dump skips, along with the on_auth_user_created trigger. Triggers writing derived history rows needed disabling before the bulk load, or replaying the dump would have duplicated history.'],
      ['Fix', "Chose to pg_dump the live database directly instead of hand-replaying six loose, undocumented SQL migration files in the order I thought they'd been applied — a deliberate call to avoid an ambiguous, error-prone path to prod data corruption."],
      ['Result', 'All 32 tables, policies, buckets, and auth data migrated with row counts verified identical between old and new. No data loss.'],
    ],
  },
  {
    tag: 'Cost engineering',
    title: 'Rate-limit and cost-aware data ingestion',
    rows: [
      ['Problem', 'The original paid data provider (API-Football) hit a 100 req/day cap and eventually suspended the account without warning.'],
      ['Root cause', "The platform's core data feed depended on a single paid, rate-limited third party with no fallback."],
      ['Fix', 'Switched to unofficial, unauthenticated scraped sources (ESPN, Promiedos) with a deliberately two-speed sync: a general sync every 1-2 hours that skips any competition with nothing happening within ±3 days (plus a daily safety sweep so nothing goes stale), and a live sync that reads already-stored snapshots first — zero external calls — and only hits real APIs when a match is actually in its playing window.'],
      ['Result', 'Stays light on both the source and the infra while tracking multiple competitions live, simultaneously.'],
    ],
  },
]

const stackGroups = [
  { name: 'Application', items: ['Next.js 16 (App Router, Turbopack)', 'React 19', 'TypeScript', 'Tailwind v4'] },
  { name: 'Data & Realtime', items: ['Postgres, self-hosted (raw pg, no ORM)', 'Supabase Postgres (auth/fantasy)', 'Redis (cache + pub/sub)', 'Custom WebSocket server'] },
  { name: 'Infrastructure & Ops', items: ['PM2', 'Cloudflare (CDN/TLS/Tunnel)', 'Hetzner Cloud (VPS)', 'GitHub Actions (CI/CD)', 'Cloudflare R2 (backups)'] },
]

const scaleStats = [
  '10,000+ matches processed',
  "Argentina's top divisions + Europe's top 5 leagues + continental cups, tracked live, simultaneously",
  'Real users — accounts, live fantasy drafts, live chat, all on the same real-time layer',
]

export default function PelotitaCaseStudy() {
  return (
    <main className="overflow-clip bg-background text-foreground min-h-svh">
      <header className="section-shell flex items-center justify-between py-8">
        <Link href="/" className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em]" aria-label="Back to portfolio">
          <span className="brand-mark">V</span>
          <span className="nav-link">← Back to portfolio</span>
        </Link>
        <a href="https://pelotita.com.ar" target="_blank" rel="noreferrer" className="nav-link">pelotita.com.ar ↗</a>
      </header>

      <section className="section-shell pb-20 pt-6 md:pb-28">
        <p className="eyebrow">Case Study</p>
        <h1 className="mt-6 section-title">Pelotita.</h1>
        <p className="work-intro mt-8">
          A live football platform I built and operate solo — Next.js, self-hosted Postgres, Redis, and a custom
          WebSocket server, all running on a VPS I administer myself.
        </p>
        <div className="mt-6 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <span className="status-dot" />
          <span>Live in production</span>
          <a href="https://pelotita.com.ar" target="_blank" rel="noreferrer" className="text-foreground transition-colors hover:text-primary">pelotita.com.ar ↗</a>
        </div>

        <div className="growth-stats max-w-2xl">
          {heroStats.map(stat => (
            <div key={stat[1]}><strong>{stat[0]}</strong><span>{stat[1]}</span></div>
          ))}
        </div>

        <figure className="case-hero-shot">
          <img src="/pelotita-home.png" alt="Pelotita live scores homepage" loading="lazy" />
        </figure>
      </section>

      <section className="section-shell pb-20 md:pb-28">
        <p className="eyebrow">What it is</p>
        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <p className="body-copy">
            Pelotita is a live football platform: live scores, standings, cup brackets, stats, editorial content, and
            a fantasy football league ("Gran DT") with real-time drafting. It covers Argentina's top divisions plus
            Europe's top 5 leagues and continental cups. The stated ambition is to compete with Promiedos, the
            dominant live-scores site in Argentina — this isn't a toy project, it's built to take real, sustained
            traffic and eventually carry ads and paid plans.
          </p>
          <p className="body-copy">
            Team of two: I own product, architecture, the database, and all engineering. A second person handles
            content and editorial. Everything below happened in production, with real users and real traffic, and I
            was the only engineer responsible for diagnosing it, deciding the fix, and shipping it — no team, no
            safety net.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="section-shell py-20 md:py-28">
          <p className="eyebrow">Architecture</p>
          <h2 className="mt-8 section-title craft-title">Request to render.</h2>
          <div className="arch-flow">
            {archFlow.map((node, index) => (
              <div key={node.title} className="w-full">
                <div className="arch-node">
                  <p className="arch-node-title">{node.title}</p>
                  <p className="arch-node-detail">{node.detail}</p>
                </div>
                {index < archFlow.length - 1 && <p className="arch-connector text-center">↓</p>}
              </div>
            ))}
            <p className="arch-connector text-center">↓</p>
            <div className="arch-branches">
              {archBranches.map(node => (
                <div key={node.title} className="arch-node">
                  <p className="arch-node-title">{node.title}</p>
                  <p className="arch-node-detail">{node.detail}</p>
                </div>
              ))}
            </div>
            <p className="arch-note">
              Football data itself comes from ESPN and Promiedos — unofficial, scraped sources hit only by the VPS,
              never by the browser.
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell py-20 md:py-28">
        <p className="eyebrow">Challenges solved</p>
        <h2 className="mt-8 section-title craft-title">Owned end to end.</h2>
        <p className="work-intro mt-8">Five things that broke, or almost broke, in production — and how I fixed them alone.</p>
        <div className="mt-16">
          {incidents.map((incident, index) => (
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
          <p className="eyebrow">Stack</p>
          <h2 className="mt-8 section-title craft-title">What it runs on.</h2>
          <div className="hub-categories mt-16">
            {stackGroups.map((group, index) => (
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
        <p className="eyebrow">Scale</p>
        <h2 className="mt-8 section-title craft-title">Where it stands.</h2>
        <ul className="mt-10 flex flex-col gap-5 border-t border-border pt-8">
          {scaleStats.map(stat => (
            <li className="flex items-start gap-3 body-copy" key={stat}>
              <span className="mt-2 h-[.42rem] w-[.42rem] flex-none bg-primary" aria-hidden />
              <span>{stat}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <div className="section-shell py-20 md:py-28">
          <p className="eyebrow">Get in touch</p>
          <h2 className="footer-title">Let's talk<br /><span>infrastructure.</span></h2>
          <div className="mt-12 flex flex-wrap gap-6">
            <a className="wsp-button" href="https://pelotita.com.ar" target="_blank" rel="noreferrer">View live → pelotita.com.ar</a>
            <Link className="wsp-button" href="/#contact">← Back to portfolio</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
