'use client'

type Lang = 'en' | 'es'

const content: Record<Lang, {
  eyebrow: string
  title: [string, string]
  copy: string
  steps: { num: string; name: string; desc: string; chips: string[] }[]
}> = {
  en: {
    eyebrow: '02 — How I build products',
    title: ['Idea to', 'production.'],
    copy: 'Four steps, shaped by launching products and keeping them alive with real users inside.',
    steps: [
      { num: '01', name: 'Discover', desc: 'Understanding problems, users and goals.', chips: ['Product thinking', 'User research', 'Active listening'] },
      { num: '02', name: 'Design', desc: 'Creating flows, interfaces and technical decisions.', chips: ['Figma', 'User flows', 'System design'] },
      { num: '03', name: 'Build', desc: 'Frontend, backend, integrations and infrastructure.', chips: ['TypeScript', 'React · Next.js', 'Node.js', 'PostgreSQL', 'APIs'] },
      { num: '04', name: 'Improve', desc: 'Iterating based on feedback and usage.', chips: ['SEO', 'Analytics', 'CI/CD', 'Testing'] },
    ],
  },
  es: {
    eyebrow: '02 — Cómo construyo productos',
    title: ['De la idea', 'a producción.'],
    copy: 'Cuatro pasos, formados lanzando productos y sosteniéndolos con usuarios adentro.',
    steps: [
      { num: '01', name: 'Descubrir', desc: 'Entender problemas, usuarios y objetivos.', chips: ['Visión de producto', 'Investigación', 'Escucha activa'] },
      { num: '02', name: 'Diseñar', desc: 'Crear flujos, interfaces y decisiones técnicas.', chips: ['Figma', 'Flujos de usuario', 'Diseño de sistemas'] },
      { num: '03', name: 'Construir', desc: 'Frontend, backend, integraciones e infraestructura.', chips: ['TypeScript', 'React · Next.js', 'Node.js', 'PostgreSQL', 'APIs'] },
      { num: '04', name: 'Mejorar', desc: 'Iterar a partir del feedback y el uso.', chips: ['SEO', 'Analytics', 'CI/CD', 'Testing'] },
    ],
  },
}

export default function HowIBuild({ lang }: { lang: Lang }) {
  const t = content[lang]
  return (
    <section id="build" className="build-section">
      <div className="section-shell" data-reveal>
        <p className="eyebrow">{t.eyebrow}</p>
        <div className="build-head">
          <h2 className="section-title">{t.title[0]}<br /><span>{t.title[1]}</span></h2>
          <p className="build-copy">{t.copy}</p>
        </div>
        <ol className="build-grid">
          {t.steps.map(step => (
            <li key={step.num} className="build-step">
              <span className="build-num">{step.num}</span>
              <h3>{step.name}</h3>
              <p>{step.desc}</p>
              <div className="build-chips">{step.chips.map(chip => <span key={chip}>{chip}</span>)}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
