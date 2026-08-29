/*
 * Live GitHub contribution calendar for the Pelotita case study.
 *
 * Source order:
 *  1. GitHub GraphQL API — authoritative, counts private contributions.
 *     Needs env GITHUB_TOKEN (classic PAT, scope `read:user`; add `repo`
 *     if you want private-repo commits reflected and have "Include private
 *     contributions on my profile" enabled).
 *  2. jogruber contributions proxy — no auth, public activity only. Fallback
 *     so the widget still works before the token is configured.
 *
 * Response is normalized to: { ok, total, days: [{ date, level }] } with
 * level 0–4. Cached for a day (ISR) — this does not need to be second-accurate.
 */

export const revalidate = 86400

const USER = 'valentinsg'

type Day = { date: string; level: number }
type Payload = { ok: true; total: number; days: Day[] } | { ok: false }

const LEVEL_FROM_ENUM: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

async function fromGitHub(): Promise<Payload | null> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return null

  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionLevel } }
          }
        }
      }
    }`

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { login: USER } }),
      next: { revalidate },
    })
    if (!res.ok) return null
    const json = await res.json()
    const cal = json?.data?.user?.contributionsCollection?.contributionCalendar
    if (!cal) return null
    const days: Day[] = cal.weeks.flatMap((w: { contributionDays: { date: string; contributionLevel: string }[] }) =>
      w.contributionDays.map(d => ({ date: d.date, level: LEVEL_FROM_ENUM[d.contributionLevel] ?? 0 })),
    )
    return { ok: true, total: cal.totalContributions, days }
  } catch {
    return null
  }
}

async function fromProxy(): Promise<Payload | null> {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`, {
      next: { revalidate },
    })
    if (!res.ok) return null
    const json = await res.json()
    const contributions: { date: string; count: number; level: number }[] = json?.contributions ?? []
    if (!contributions.length) return null
    const total = json?.total?.lastYear ?? contributions.reduce((sum, d) => sum + d.count, 0)
    return { ok: true, total, days: contributions.map(d => ({ date: d.date, level: d.level })) }
  } catch {
    return null
  }
}

export async function GET() {
  const data = (await fromGitHub()) ?? (await fromProxy())
  return Response.json(data ?? { ok: false })
}
