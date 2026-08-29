'use client'

import { useEffect, useState } from 'react'

type Day = { date: string; level: number }
type ApiResponse = { ok: boolean; total?: number; days?: Day[] }

export type ContributionsLabels = {
  eyebrow: string
  title: string
  headline: (total: string) => string
  caption: string
  stats: [string, string][]
  profile: string
}

function padStart(days: Day[]): (Day | null)[] {
  if (!days.length) return days
  const firstWeekday = new Date(days[0].date + 'T00:00:00Z').getUTCDay()
  return [...Array<null>(firstWeekday).fill(null), ...days]
}

export default function GithubContributions({ labels }: { labels: ContributionsLabels }) {
  const [data, setData] = useState<ApiResponse | null>(null)

  useEffect(() => {
    let alive = true
    fetch('/api/github-contributions')
      .then(r => r.json())
      .then((d: ApiResponse) => alive && setData(d))
      .catch(() => alive && setData({ ok: false }))
    return () => {
      alive = false
    }
  }, [])

  const live = data?.ok && data.days && data.days.length > 0
  const cells = live ? padStart(data!.days!) : []

  return (
    <div>
      <p className="eyebrow">{labels.eyebrow}</p>
      <h2 className="mt-6 section-title craft-title">{labels.title}</h2>

      <div className="growth-stats max-w-3xl" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {labels.stats.map(stat => (
          <div key={stat[1]}>
            <strong>{stat[0]}</strong>
            <span>{stat[1]}</span>
          </div>
        ))}
      </div>

      {live && (
        <div className="gh-block">
          <p className="gh-headline">{labels.headline(data!.total!.toLocaleString('en-US'))}</p>
          <div className="gh-cal-scroll">
            <div className="gh-cal" role="img" aria-label={labels.headline(String(data!.total))}>
              {cells.map((day, i) =>
                day ? (
                  <span key={day.date} className="gh-cell" data-l={day.level} title={`${day.date}`} />
                ) : (
                  <span key={`pad-${i}`} className="gh-cell gh-cell-pad" />
                ),
              )}
            </div>
          </div>
          <p className="gh-caption">{labels.caption}</p>
        </div>
      )}

      <a
        className="gh-profile"
        href="https://github.com/valentinsg"
        target="_blank"
        rel="noreferrer"
      >
        {labels.profile}
      </a>
    </div>
  )
}
