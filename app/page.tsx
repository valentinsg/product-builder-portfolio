'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Check, Copy, Menu, X } from 'lucide-react'
import Lenis from 'lenis'

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const EMAIL = 'sanchezguevaravalentin@gmail.com'
const WHATSAPP = 'https://wa.me/5492236680041'
const LANG_KEY = 'vsg-lang'
const SECTION_IDS = ['top', 'work', 'process', 'growth', 'capabilities', 'notes', 'about', 'contact']

const images = {
  portrait: '/valentin-portrait.png',
  aviWeb: '/avi-salud-web.png',
  aviAdmin: '/avi-admin-redacted.png',
  abundanciaReceipts: '/abundancia-comprobantes-redacted.png',
  pelotita: '/pelotita-home.png',
  smithiiTools: '/tools.jpg',
  smithiiStaking: '/staking.jpg',
  smithiiSoftware: '/smithii-software.jpg',
  smithiiSoftwareTwo: '/smithii-software-2.jpg',
  smithiiSoftwareVideo: '/video-software.gif',
  smithiiStakingVideo: '/video-staking.gif',
  harmonicaEvandr: '/harmonica-evandr.png',
  harmonicaLuxe: '/harmonica-luxe-rejuvenate.png',
  harmonicaAgency: '/harmonica-agency.png',
  harmonicaAgencyServices: '/harmonica-agency-services.png',
  harmonicaTwoTails: '/harmonica-two-tails.png',
  harmonicaPenta: '/harmonica-penta.png',
  claridadCommunity: '/claridad-community-enhanced.png',
  claridadMap: '/claridad-map-enhanced.png',
  claridadIncidents: '/claridad-incidents-enhanced.png',
  stockeoLanding: '/stockeo-landing.png',
  stockeoDashboard: '/stockeo-dashboard-redacted.png',
  presidentialMenu: '/presidential-menu.png',
  presidentialGameplay: '/presidential-gameplay.png',
  felipe: '/chanchito-felipe-2021.png',
  bestseller: '/bestseller-2022.png',
  face: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1749159131628-xvOomONYtdEEGj03bRdHDNgDeK2xzG.jpeg',
  collage: '/about-collage-original.png',
  casino: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-gvq6EokusPLEKJE44Oab21QiCu0cH4.png',
  chat: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/imagen-I8MBRsWY4OxCDPfzCQCoUEK4ZIhsMh.png',
  busy: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/BusyStreetwear-v2Ulj5lymx6eAXvTbYuxlmdgoTL4OA.png',
  velmor: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Velmor-PPA0dC07gu8n6pEeyVSIJqIJoimkfj.png',
  health: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AviSalud-F8xLI6OQW8xf8fEMjx8ZxCD85FLBCu.png',
  wine: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sobrio-aoxHhYUeDRXxAEYK1xEjabSKGb8pCZ.png',
}

type Lang = 'en' | 'es'

const projectImages = [
  [images.aviWeb, images.aviAdmin],
  [images.casino, images.abundanciaReceipts],
  [images.pelotita],
  [images.harmonicaEvandr, images.harmonicaLuxe, images.harmonicaAgency, images.harmonicaAgencyServices, images.harmonicaTwoTails, images.harmonicaPenta],
  [images.smithiiTools, images.smithiiStaking, images.smithiiSoftware, images.smithiiSoftwareTwo, images.smithiiSoftwareVideo, images.smithiiStakingVideo],
  [images.claridadIncidents, images.claridadMap, images.claridadCommunity],
  [images.stockeoLanding, images.stockeoDashboard],
  [images.presidentialMenu, images.presidentialGameplay],
  [images.busy],
]

const content = {
  en: {
    nav: [['Work', '#work'], ['Process', '#process'], ['Notes', '#notes'], ['About', '#about']],
    minimap: { top: 'Home', notes: 'Notes', work: 'Work', process: 'Process', growth: 'Journey', capabilities: 'Capabilities', about: 'About', contact: 'Contact' } as Record<string, string>,
    available: 'Available for work',
    brand: 'Valentín / Product Builder',
    hero: {
      role: 'Full-Stack Engineer · Product Builder',
      location: 'Mar del Plata — Argentina',
      titleA: 'I build',
      titleB: 'products.',
      intro: 'I enjoy making ideas work and turning them into products, systems or even businesses. I am always learning something new and growing as a developer so that what I build works well and can scale without breaking.',
      ctaWork: 'View projects',
      ctaThink: 'How I work',
    },
    notes: {
      eyebrow: '05 — How it started',
      titleTop: ['First came calculators', 'and very simple websites.'],
      titleAccent: ['Then came', 'projects for other people.'],
      copyA: 'I started learning with friends, online courses and small experiments: calculators, exercises and a website about Felipe the Pig. I tried to get into Soy Henry, did not make it, and later enrolled at UTN.',
      copyB: 'University did not quite click for me, so I kept learning while working part-time. I used what little I earned to pay for English lessons and spent every free hour building for people I knew. Bestseller came from that period. In 2023, Smithii finally arrived: my first experience inside a software company.',
      artifactCalculator: 'Calculator with browser prompts — practice, 2021',
      artifactFelipe: 'Felipe the Pig — early experiment, 2021',
      artifactBestseller: 'Bestseller Group — first client project, 2022',
      principles: ['Understand', 'Choose', 'Build', 'Ship', 'Measure', 'Learn', 'Iterate', 'Listen'],
    },
    process: {
      eyebrow: '02 — How I work',
      title: ['From idea', 'to production.'],
      copy: 'I shaped this process by launching products, making mistakes and learning to keep them running while people were already using them. These six steps guide how I work, with the nuances each project requires.',
      steps: [
        ['01', 'Listen and understand', 'What problem do we actually want to solve?'],
        ['02', 'Design the experience', 'Make the main path clear before adding more.'],
        ['03', 'Build the system', 'Choose the right tools and connect the pieces.'],
        ['04', 'Launch early', 'A real product teaches more than a perfect draft.'],
        ['05', 'Learn from users', 'Gather feedback and see where the product helps or gets in the way.'],
        ['06', 'Improve continuously', 'Keep what works. Change what does not.'],
      ],
    },
    work: {
      eyebrow: '01 — Selected work',
      title: ['Selected', 'projects.'],
      copy: 'A few of the products and systems I have worked on.',
      outcomeLabel: 'Outcome',
      projects: [
        { title: 'Avi Salud', type: 'Healthcare website & operations system', tags: ['Web', 'Systems', 'Healthcare'], statement: 'The same care experience, outside and behind the scenes.', body: 'With Estudio Ve, we built both the public website and an internal system for a home healthcare company in Mar del Plata. The website organizes care plans, providers, benefits and educational content; the system centralizes appointments, routines, clients, employees and financial movements.', outcome: 'A clearer experience for families and a more organized operation for the team.' },
        { title: 'Abundancia', type: '24/7 entertainment operations platform', tags: ['Product', 'Systems', 'AI', 'Automation'], statement: 'Shifts, cash flow, tasks and communication for an operation that runs around the clock.', body: 'I built a management platform for a 24/7 entertainment operation, connecting shifts, tasks, chats, cash movements, promotions and internal communication. We also use AI to automate data-entry bots, financial records and repetitive processes that previously depended on the team.', outcome: 'The team can track shifts, owners, receipts and balances from one place, with less manual work and clear traceability of who did what.' },
        { title: 'Pelotita', type: 'Football results & fantasy leagues', tags: ['Own product', 'Data', 'Scraping', 'AdSense'], statement: 'Organized football data, up-to-date results and fantasy leagues.', body: 'Pelotita gathers results from different sources, normalizes teams, tournaments and matches, and uses that foundation to power fantasy leagues between friends. Behind it are scraping pipelines, optimizations that keep everything fast as the data grows and a monetization strategy built around AdSense.', outcome: 'A fast, reliable football platform with monetization considered as part of the product.' },
        { title: 'Harmonica', type: 'Product Engineer · Technical lead', tags: ['Leadership', 'WordPress', 'Shopify', 'Next.js', 'SEO'], statement: 'More than ten clients, more than ten businesses and the technical responsibility to move them forward.', body: 'At Harmonica I worked as a Product Engineer and took the technical lead on projects for more than ten clients. I built, maintained and improved everything from WordPress and Shopify stores to Next.js products across e-commerce, wellness, personal brands and corporate sites. I coordinated priorities, technical decisions and delivery while keeping several websites healthy at once.', outcome: 'I learned to lead, communicate with clients, enter unfamiliar stacks quickly and deliver without disrupting what was already working.' },
        { title: 'Smithii', type: 'Web3 product ecosystem', tags: ['Frontend', 'Web3', 'Product', 'Scrum'], statement: 'Building for a large user base changes how you think about every decision.', body: 'I spent almost two years inside a Web3 ecosystem that never stood still. I worked on public tools for creating tokens, liquidity, airdrops and more; the internal management software; and a staking builder that we launched as its own product. It meant a lot of frontend, blockchain integrations, high-volume usage and data flows that had to stay fast and reliable. I also learned to work as part of a Scrum team, organize delivery in Jira and coordinate features end to end.', outcome: 'I learned to navigate complex products, optimize before problems surfaced and build as a team without losing sight of the user.' },
        { title: 'Claridad', type: 'Community safety map', tags: ['Maps', 'APIs', 'Hackathons'], statement: 'A map so neighborhoods do not have to navigate safety blindly.', body: 'In a small team, we built a collaborative safety product with geolocated reports, communities, real-time alerts and a panic button. It combined location data with multiple APIs; we took it to hackathons, tested it in public and kept iterating on both the product and its reach.', outcome: 'A useful civic product shaped through teamwork, APIs and fast iteration.' },
        { title: 'Stockeo', type: 'Inventory SaaS', tags: ['Next.js', 'Java', 'Mercado Pago'], statement: 'My first SaaS, built with my studio partner.', body: 'Stockeo started as a practical way for Estudio Ve to create recurring income. We built a Java backend, a Next.js frontend and Mercado Pago subscriptions around a simple inventory workflow for small businesses.', outcome: 'A real SaaS foundation with product, payments and business decisions included.' },
        { title: 'Presidential Simulator', type: 'Independent game', tags: ['Game Design', 'Systems', 'Hobby'], statement: 'The game of my life—or at least the strangest one.', body: 'A bizarre presidential game I am building with friends. It is a hobby, a creative outlet and a very large technical challenge where I am learning about game mechanics, collaboration and systems design.', outcome: 'A place to experiment freely and learn things commercial work rarely teaches.' },
        { title: 'Busy', type: 'Streetwear brand', tags: ['Commerce', 'SEO', 'Brand'], statement: 'My first business taught me more than a course could.', body: 'I created and ran a clothing brand: the store, content, APIs, design and events. Without a physical shop, Busy ranked for clothing searches in Mar del Plata and even appeared in AI search results.', outcome: 'Hands-on experience across business, integration, SEO, design and community.' },
      ],
    },
    growth: {
      eyebrow: '03 — Growth',
      title: ['The milestones', 'that shaped me.'],
      copy: 'Coding fundamentals, my first professional role, the pace of agency work and my own products: a few milestones that shaped how I work.',
      stats: [['3+', 'professional years'], ['15+', 'projects in production'], ['5+', 'industries']],
      timeline: [
        ['2020', 'Programming Foundations', 'Discovered programming through free online courses. Started building websites for friends and local businesses.'],
        ['2021', 'University & English', 'Started studying Programming at UTN while improving my English and continuing to build projects for people I knew.'],
        ['2023', 'First Professional Role', 'Joined Smithii as a developer, working on production products and collaborating with international teams.'],
        ['2025', 'Ontological Coaching', 'Completed my Ontological Coaching certification, strengthening my communication, active listening and problem-framing skills.'],
        ['2026', 'Building My Own Products', 'Started building my own products through Estudio Ve, focusing on ownership, product thinking and long-term businesses.'],
      ],
    },
    capabilities: {
      eyebrow: '04 — Capabilities',
      title: ['What I bring', 'to a product or team.'],
      viewOffer: 'Capabilities',
      viewTools: 'Tools',
      groups: [
        { name: 'Build', offer: 'Engineering, end to end · Frontend & backend · Databases & auth · Integrations & automation', tools: 'TypeScript · React · Next.js · Node.js · Java · PostgreSQL · Neon · Supabase · WordPress · Shopify · REST APIs' },
        { name: 'Shape', offer: 'Product thinking · Technical leadership · User flows · System design · Teamwork · Scrum · LLM integrations', tools: 'Notion · FigJam · Figma · Jira · ChatGPT · Claude · Cursor' },
        { name: 'Improve', offer: 'Performance · SEO · Analytics · CI/CD · Testing', tools: 'Lighthouse · Google Analytics 4 · Search Console · GitHub Actions · Playwright' },
        { name: 'Explore', offer: 'Web3 products · Real-time systems · Interactive maps · Game development', tools: 'LLM APIs · WebSockets · Realtime databases · Map APIs · Game systems' },
      ],
      hubTitle: 'The toolkit, by use case',
      hub: [
        { name: 'Build', items: [{ label: 'TypeScript' }, { label: 'React' }, { label: 'Next.js' }, { label: 'Node.js' }, { label: 'Java' }, { label: 'PostgreSQL' }, { label: 'Neon' }, { label: 'Supabase' }, { label: 'WordPress' }, { label: 'Shopify' }, { label: 'REST APIs' }] },
        { name: 'Product, design & delivery', items: [{ label: 'Notion' }, { label: 'FigJam' }, { label: 'Figma' }, { label: 'Jira' }, { label: 'Scrum' }] },
        { name: 'AI', items: [{ label: 'ChatGPT' }, { label: 'Claude' }, { label: 'Cursor' }, { label: 'Graphify' }] },
        { name: 'Ship & measure', items: [{ label: 'Lighthouse' }, { label: 'Google Analytics 4' }, { label: 'Search Console' }, { label: 'GitHub Actions' }, { label: 'Playwright' }] },
        { name: 'Explore', items: [{ label: 'LLM APIs' }, { label: 'WebSockets' }, { label: 'Realtime databases' }, { label: 'Map APIs' }, { label: 'Game systems' }] },
        { name: 'Visual references', items: [{ label: 'Mobbin', href: 'https://mobbin.com' }, { label: 'Component Gallery', href: 'https://component.gallery/design-systems/' }, { label: 'Saaspo', href: 'https://saaspo.com' }, { label: 'Landing.love', href: 'https://landing.love' }, { label: 'Craftwork', href: 'https://craftwork.design/curated/websites' }, { label: 'Navbar Gallery', href: 'https://navbar.gallery' }, { label: 'CTA Gallery', href: 'https://cta.gallery' }, { label: 'Rebrand Gallery', href: 'https://rebrand.gallery' }, { label: 'Hugeicons', href: 'https://hugeicons.com' }, { label: 'MeiGen', href: 'https://www.meigen.ai' }] },
        { name: 'Builder inspiration', items: [{ label: 'Cult UI', href: 'https://www.cult-ui.com/' }, { label: 'design-skills-joaco', href: 'https://design-skills-joaco.vercel.app' }, { label: 'revpdf.com', href: 'https://revpdf.com' }, { label: 'Obscura', href: 'https://github.com/h4ckf0r0day/obscura' }, { label: 'Starlight', href: 'https://starlight.astro.build/es' }] },
      ],
    },
    about: {
      eyebrow: '06 — Who I really am',
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
      eyebrow: '07 — Let’s ship',
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
    nav: [['Proyectos', '#work'], ['Proceso', '#process'], ['Ideas', '#notes'], ['Sobre mí', '#about']],
    minimap: { top: 'Inicio', notes: 'Ideas', work: 'Proyectos', process: 'Proceso', growth: 'Recorrido', capabilities: 'Capacidades', about: 'Sobre mí', contact: 'Contacto' } as Record<string, string>,
    available: 'Disponible para proyectos',
    brand: 'Valentín / Product Builder',
    hero: {
      role: 'Ingeniero Full-Stack · Product Builder',
      location: 'Mar del Plata — Argentina',
      titleA: 'Construyo',
      titleB: 'productos.',
      intro: 'Me gusta hacer funcionar ideas y convertirlas en productos, sistemas o incluso negocios. Siempre estoy aprendiendo algo nuevo y mejorando como desarrollador para que lo que construyo funcione bien y pueda crecer sin romperse.',
      ctaWork: 'Ver proyectos',
      ctaThink: 'Cómo trabajo',
    },
    notes: {
      eyebrow: '05 — Cómo empecé',
      titleTop: ['Primero fueron calculadoras', 'y webs bastante simples.'],
      titleAccent: ['Después vinieron', 'los proyectos para otros.'],
      copyA: 'Empecé aprendiendo con amigos, cursos online y proyectos bastante simples: calculadoras, ejercicios y una web sobre el Chanchito Felipe. Intenté entrar a Soy Henry, no quedé, y después me anoté en la UTN.',
      copyB: 'La facultad no terminó de engancharme, así que seguí aprendiendo mientras trabajaba medio tiempo. Con lo poco que ganaba pagaba inglés y, en cada rato libre, programaba para conocidos. De ahí salió Bestseller. En 2023 por fin llegó Smithii, mi primera experiencia dentro de una empresa de software.',
      artifactCalculator: 'Calculadora por alertas — práctica, 2021',
      artifactFelipe: 'Chanchito Felipe — experimento inicial, 2021',
      artifactBestseller: 'Bestseller Group — primer proyecto para un conocido, 2022',
      principles: ['Entender', 'Elegir', 'Construir', 'Lanzar', 'Medir', 'Aprender', 'Iterar', 'Escuchar'],
    },
    process: {
      eyebrow: '02 — Cómo trabajo',
      title: ['De la idea', 'a producción.'],
      copy: 'Fui armando este proceso a medida que lanzaba productos, cometía errores y aprendía a sostenerlos con usuarios adentro. Son seis pasos que ordenan mi forma de trabajar, con los matices que pide cada proyecto.',
      steps: [
        ['01', 'Escuchar y comprender el problema', '¿Qué problema queremos resolver de verdad?'],
        ['02', 'Diseñar la experiencia', 'Dejar claro el camino principal antes de agregar más.'],
        ['03', 'Construir el sistema', 'Elegir las herramientas correctas y conectar las piezas.'],
        ['04', 'Lanzar temprano', 'Un producto real enseña más que un borrador perfecto.'],
        ['05', 'Aprender de los usuarios', 'Recibir feedback, ver dónde el producto ayuda y dónde molesta.'],
        ['06', 'Mejorar continuamente', 'Conservar lo que funciona. Cambiar lo que no.'],
      ],
    },
    work: {
      eyebrow: '01 — Proyectos seleccionados',
      title: ['Proyectos', 'seleccionados.'],
      copy: 'Algunos de los productos y sistemas en los que trabajé.',
      outcomeLabel: 'El resultado',
      projects: [
        { title: 'Avi Salud', type: 'Sitio web y sistema para salud', tags: ['Sitio web', 'Sistemas', 'Salud'], statement: 'La misma experiencia de cuidado, afuera y detrás de escena.', body: 'Desde Estudio Ve construimos el sitio público y un sistema interno para una empresa de salud domiciliaria de Mar del Plata. El sitio ordena planes, cartilla, prestaciones y contenido educativo; el sistema centraliza turnos, rutinas, clientes, empleados y movimientos de dinero.', outcome: 'Una experiencia más clara para las familias y una operación más ordenada para el equipo.' },
        { title: 'Abundancia', type: 'Plataforma para operaciones de entretenimiento 24/7', tags: ['Producto', 'Sistemas', 'IA', 'Automatización'], statement: 'Turnos, caja, tareas y comunicación para una operación que funciona las 24 horas.', body: 'Construí una plataforma de gestión para una operación de entretenimiento 24/7: turnos, tareas, chats, movimientos de caja, promociones y comunicación interna. También usamos IA para automatizar bots de carga, registros financieros y procesos repetitivos que antes dependían del equipo.', outcome: 'El equipo puede seguir turnos, responsables, comprobantes y balances desde un mismo lugar, con menos carga manual y trazabilidad clara de quién hizo cada movimiento.' },
        { title: 'Pelotita', type: 'Resultados de fútbol y ligas de fantasía', tags: ['Producto propio', 'Datos', 'Scraping', 'AdSense'], statement: 'Datos del fútbol ordenados, resultados al día y ligas de fantasía.', body: 'Pelotita reúne resultados de distintas fuentes, normaliza equipos, torneos y partidos, y usa esa base para crear ligas de fantasía entre amigos. Detrás hay scraping, optimizaciones para que todo siga rápido a medida que crecen los datos y una estrategia de monetización con AdSense.', outcome: 'Una plataforma de fútbol rápida y confiable, con la monetización pensada como parte del producto.' },
        { title: 'Harmonica', type: 'Product Engineer · Liderazgo técnico', tags: ['Liderazgo', 'WordPress', 'Shopify', 'Next.js', 'SEO'], statement: 'Más de diez clientes, más de diez negocios y la responsabilidad técnica de llevarlos adelante.', body: 'En Harmonica trabajé como Product Engineer y asumí el liderazgo técnico de proyectos para más de diez clientes. Construí, mantuve y mejoré desde tiendas en WordPress y Shopify hasta productos con Next.js: e-commerce, wellness, marcas personales y sitios corporativos. Coordiné prioridades, decisiones técnicas y entregas mientras sostenía varios sitios al mismo tiempo.', outcome: 'Aprendí a liderar, comunicarme con clientes, entrar rápido en stacks ajenos y entregar sin frenar lo que ya estaba funcionando.' },
        { title: 'Smithii', type: 'Ecosistema de productos Web3', tags: ['Frontend', 'Web3', 'Producto', 'Scrum'], statement: 'Construir para usuarios masivos cambia la forma de pensar cada decisión.', body: 'Pasé casi dos años metido en un ecosistema Web3 que no paraba quieto. Trabajé en las herramientas públicas para crear tokens, liquidez, airdrops y más; en el software interno de gestión; y en un staking builder que lanzamos como producto propio. Mucho frontend, integraciones blockchain, usuarios masivos y flujos de datos que tenían que mantenerse rápidos y confiables. También aprendí a trabajar en equipo con Scrum, organizar entregas en Jira y coordinar funcionalidades de punta a punta.', outcome: 'Aprendí a moverme en productos complejos, optimizar antes de que aparezcan los problemas y construir en equipo sin perder de vista al usuario.' },
        { title: 'Claridad', type: 'Mapa colaborativo de seguridad', tags: ['Mapas', 'APIs', 'Hackathons'], statement: 'Un mapa para que los barrios no tengan que moverse a ciegas.', body: 'En un equipo chico construimos un producto de seguridad colaborativa con reportes geolocalizados, comunidades, alertas en tiempo real y un botón de pánico. Combinamos datos de ubicación con varias APIs, lo llevamos a hackathons, probamos la idea en público y seguimos iterando sobre el producto y su alcance.', outcome: 'Un producto cívico útil, moldeado por trabajo en equipo, APIs e iteración rápida.' },
        { title: 'Stockeo', type: 'SaaS de inventario', tags: ['Next.js', 'Java', 'Mercado Pago'], statement: 'Mi primer SaaS, construido con mi socio del estudio.', body: 'Stockeo nació como una forma práctica de generar ingresos recurrentes para Estudio Ve. Construimos un backend en Java, un frontend en Next.js y suscripciones con Mercado Pago alrededor de un flujo simple de inventario para comercios chicos.', outcome: 'Una base real de SaaS con decisiones de producto, pagos y negocio incluidas.' },
        { title: 'Simulador presidencial', type: 'Juego independiente', tags: ['Game Design', 'Sistemas', 'Hobby'], statement: 'El juego de mi vida, o al menos el más raro.', body: 'Un juego presidencial bizarro que estoy construyendo con amigos. Es un hobby, una salida creativa y un desafío técnico enorme donde aprendo sobre mecánicas de juego, colaboración y diseño de sistemas.', outcome: 'Un lugar para experimentar con libertad y aprender cosas que el trabajo comercial rara vez enseña.' },
        { title: 'Busy', type: 'Marca de streetwear', tags: ['Commerce', 'SEO', 'Marca'], statement: 'Mi primer negocio me enseñó más que cualquier curso.', body: 'Creé y manejé una marca de ropa: la tienda, el contenido, las APIs, el diseño y los eventos. Sin local físico, Busy rankeó en búsquedas de ropa en Mar del Plata y hasta apareció en resultados de búsqueda con IA.', outcome: 'Experiencia real en negocio, integraciones, SEO, diseño y comunidad.' },
      ],
    },
    growth: {
      eyebrow: '03 — Recorrido',
      title: ['Los hitos que', 'me fueron formando.'],
      copy: 'Las bases del código, mi primer trabajo profesional, el ritmo de agencia y mis propios productos: algunos de los hitos que marcaron mi forma de trabajar.',
      stats: [['3+', 'años profesionales'], ['15+', 'proyectos en producción'], ['5+', 'industrias']],
      timeline: [
        ['2020', 'Primeras bases', 'Descubrí la programación con cursos online gratuitos. Empecé haciendo webs para amigos y negocios locales.'],
        ['2021', 'Universidad e inglés', 'Empecé a estudiar Programación en la UTN mientras mejoraba mi inglés y seguía haciendo trabajos para conocidos.'],
        ['2023', 'Primer trabajo profesional', 'Entré a Smithii como desarrollador, trabajando en productos en producción con equipos internacionales.'],
        ['2025', 'Coaching Ontológico', 'Completé mi certificación en Coaching Ontológico: comunicación, escucha activa y encuadre de problemas.'],
        ['2026', 'Mis propios productos', 'Empecé a construir mis propios productos desde Estudio Ve, con foco en ownership, producto y negocios a largo plazo.'],
      ],
    },
    capabilities: {
      eyebrow: '04 — Capacidades',
      title: ['Lo que aporto', 'a un producto o equipo.'],
      viewOffer: 'Capacidades',
      viewTools: 'Herramientas',
      groups: [
        { name: 'Construir', offer: 'Ingeniería de punta a punta · Frontend y backend · Bases de datos y auth · Integraciones y automatizaciones', tools: 'TypeScript · React · Next.js · Node.js · Java · PostgreSQL · Neon · Supabase · WordPress · Shopify · REST APIs' },
        { name: 'Dar forma', offer: 'Visión de producto · Liderazgo técnico · Flujos de usuario · Diseño de sistemas · Trabajo en equipo · Scrum · Integraciones con LLMs', tools: 'Notion · FigJam · Figma · Jira · ChatGPT · Claude · Cursor' },
        { name: 'Mejorar', offer: 'Performance · SEO · Analytics · CI/CD · Testing', tools: 'Lighthouse · Google Analytics 4 · Search Console · GitHub Actions · Playwright' },
        { name: 'Explorar', offer: 'Productos Web3 · Sistemas en tiempo real · Mapas interactivos · Desarrollo de juegos', tools: 'APIs de LLMs · WebSockets · Bases de datos realtime · APIs de mapas · Sistemas de juego' },
      ],
      hubTitle: 'La caja de herramientas, por caso de uso',
      hub: [
        { name: 'Construir', items: [{ label: 'TypeScript' }, { label: 'React' }, { label: 'Next.js' }, { label: 'Node.js' }, { label: 'Java' }, { label: 'PostgreSQL' }, { label: 'Neon' }, { label: 'Supabase' }, { label: 'WordPress' }, { label: 'Shopify' }, { label: 'REST APIs' }] },
        { name: 'Producto, diseño y entregas', items: [{ label: 'Notion' }, { label: 'FigJam' }, { label: 'Figma' }, { label: 'Jira' }, { label: 'Scrum' }] },
        { name: 'IA', items: [{ label: 'ChatGPT' }, { label: 'Claude' }, { label: 'Cursor' }, { label: 'Graphify' }] },
        { name: 'Lanzar y medir', items: [{ label: 'Lighthouse' }, { label: 'Google Analytics 4' }, { label: 'Search Console' }, { label: 'GitHub Actions' }, { label: 'Playwright' }] },
        { name: 'Explorar', items: [{ label: 'APIs de LLMs' }, { label: 'WebSockets' }, { label: 'Bases de datos realtime' }, { label: 'APIs de mapas' }, { label: 'Sistemas de juego' }] },
        { name: 'Referencias visuales', items: [{ label: 'Mobbin', href: 'https://mobbin.com' }, { label: 'Component Gallery', href: 'https://component.gallery/design-systems/' }, { label: 'Saaspo', href: 'https://saaspo.com' }, { label: 'Landing.love', href: 'https://landing.love' }, { label: 'Craftwork', href: 'https://craftwork.design/curated/websites' }, { label: 'Navbar Gallery', href: 'https://navbar.gallery' }, { label: 'CTA Gallery', href: 'https://cta.gallery' }, { label: 'Rebrand Gallery', href: 'https://rebrand.gallery' }, { label: 'Hugeicons', href: 'https://hugeicons.com' }, { label: 'MeiGen', href: 'https://www.meigen.ai' }] },
        { name: 'Inspiración de builders', items: [{ label: 'Cult UI', href: 'https://www.cult-ui.com/' }, { label: 'design-skills-joaco', href: 'https://design-skills-joaco.vercel.app' }, { label: 'revpdf.com', href: 'https://revpdf.com' }, { label: 'Obscura', href: 'https://github.com/h4ckf0r0day/obscura' }, { label: 'Starlight', href: 'https://starlight.astro.build/es' }] },
      ],
    },
    about: {
      eyebrow: '06 — Quién soy realmente',
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
      eyebrow: '07 — Hagámoslo realidad',
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
  const [activeStep, setActiveStep] = useState(0)
  const [copied, setCopied] = useState(false)
  const [capabilityView, setCapabilityView] = useState<'offer' | 'tools'>('offer')
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
              <div className="hero-actions"><a href="#work">{t.hero.ctaWork}</a><a href="#process">{t.hero.ctaThink}</a></div>
            </div>
            <figure className="hero-portrait" aria-label="Portrait of Valentín"><img src={images.portrait} alt="Valentín wearing a dark hoodie" /></figure>
          </div>
        </div>
      </section>

      <section id="work" className="pt-14 pb-28 md:pt-24 md:pb-44">
        <div className="section-shell" data-reveal>
          <p className="eyebrow">{t.work.eyebrow}</p>
          <div className="mt-10 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <h2 className="section-title">{t.work.title[0]}<br />{t.work.title[1]}</h2>
            <p className="work-intro">{t.work.copy}</p>
          </div>
        </div>
        <div className="mt-24 flex flex-col gap-32 md:mt-40 md:gap-52">
          {t.work.projects.map((project, index) => (
            <article key={project.title} className="project section-shell">
              <div className="project-heading"><span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, '0')}</span><p className="eyebrow">{project.type}</p></div>
              <div className={`project-layout ${index % 2 ? 'project-reverse' : ''}`}>
                <div className="project-copy">
                  <h3 className={project.title.length > 18 ? 'project-title-long' : ''}>{project.title}</h3>
                  <p className="project-statement">{project.statement}</p>
                  <p className="body-copy">{project.body}</p>
                  <div className="project-outcome"><span>{t.work.outcomeLabel}</span><p>{project.outcome}</p></div>
                  <div className="flex flex-wrap gap-2">{project.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
                </div>
                <figure className={`project-media ${projectImages[index].length > 2 ? 'project-media-gallery' : projectImages[index].length > 1 ? 'project-media-pair' : ''}`}>
                  {projectImages[index].map((src, imageIndex) => <img src={src} alt={`${project.title} project visual ${imageIndex + 1}`} loading="lazy" key={src} />)}
                  <figcaption>{String(index + 1).padStart(2, '0')} / {String(t.work.projects.length).padStart(2, '0')}</figcaption>
                </figure>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="process" className="border-y border-border bg-card">
        <div className="section-shell py-28 md:py-40" data-reveal>
          <p className="eyebrow">{t.process.eyebrow}</p>
          <div className="mt-16 grid gap-16 lg:grid-cols-12 lg:gap-20">
            <div className="flex flex-col justify-between lg:col-span-5">
              <div>
                <h2 className="section-title process-title">{t.process.title[0]}<br />{t.process.title[1]}</h2>
                <p className="mt-8 max-w-md body-copy process-copy">{t.process.copy}</p>
              </div>
              <div className="process-display"><span>{t.process.steps[activeStep][0]}</span><h3>{t.process.steps[activeStep][1]}</h3><p>{t.process.steps[activeStep][2]}</p></div>
            </div>
            <ol className="process-list lg:col-span-7">
              {t.process.steps.map((step, index) => (
                <li key={step[0]}>
                  <button className={`process-row ${activeStep === index ? 'active' : ''}`} onMouseEnter={() => setActiveStep(index)} onFocus={() => setActiveStep(index)} onClick={() => setActiveStep(index)}>
                    <span>{step[0]}</span><strong>{step[1]}</strong><span className="process-arrow">+</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="growth" className="impact-section">
        <div className="section-shell py-28 md:py-40" data-reveal>
          <p className="eyebrow">{t.growth.eyebrow}</p>
          <div className="mt-16 grid gap-16 lg:grid-cols-2">
            <div className="flex flex-col justify-center gap-12">
              <h2 className="section-title">{t.growth.title[0]}<br /><span>{t.growth.title[1]}</span></h2>
              <div>
                <p className="body-copy max-w-md">{t.growth.copy}</p>
                <div className="growth-stats">
                  {t.growth.stats.map(stat => (
                    <div key={stat[1]}><strong>{stat[0]}</strong><span>{stat[1]}</span></div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              {t.growth.timeline.map(item => (
                <div className="timeline-row" key={item[0]}><span>{item[0]}</span><div><h3>{item[1]}</h3><p>{item[2]}</p></div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="section-shell py-28 md:py-44" data-reveal>
        <div className="capabilities-header">
          <div>
            <p className="eyebrow">{t.capabilities.eyebrow}</p>
            <h2 className="mt-12 section-title">{t.capabilities.title[0]}<br />{t.capabilities.title[1]}</h2>
          </div>
          <div className="capability-toggle" aria-label="Capability view">
            <button className={capabilityView === 'offer' ? 'active' : ''} onClick={() => setCapabilityView('offer')}>{t.capabilities.viewOffer}</button>
            <button className={capabilityView === 'tools' ? 'active' : ''} onClick={() => setCapabilityView('tools')}>{t.capabilities.viewTools}</button>
          </div>
        </div>
        <div className="capabilities">
          {t.capabilities.groups.map((group, index) => (
            <div className="capability-row" key={group.name}><span>0{index + 1}</span><h3>{group.name}</h3><p>{group[capabilityView]}</p></div>
          ))}
        </div>
        {capabilityView === 'tools' && (
          <div className="hub-grid">
            <p className="eyebrow">{t.capabilities.hubTitle}</p>
            <div className="hub-categories">
              {t.capabilities.hub.map(category => (
                <div className="hub-category" key={category.name}>
                  <h4>{category.name}</h4>
                  <div className="hub-tags">
                    {category.items.map(item =>
                      'href' in item && item.href ? (
                        <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="tag hub-tag-link">{item.label}</a>
                      ) : (
                        <span key={item.label} className="tag">{item.label}</span>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section id="notes" className="section-shell pt-28 pb-14 md:pt-44 md:pb-20" data-reveal>
        <p className="eyebrow">{t.notes.eyebrow}</p>
        <div className="mt-16 grid gap-16 md:grid-cols-12">
          <h2 className="manifesto md:col-span-8">{t.notes.titleTop[0]}<br />{t.notes.titleTop[1]}<br /><span>{t.notes.titleAccent[0]}<br />{t.notes.titleAccent[1]}</span></h2>
          <div className="flex flex-col justify-center gap-8 md:col-span-4">
            <p className="notes-copy">{t.notes.copyA}</p>
            <p className="notes-copy">{t.notes.copyB}</p>
          </div>
        </div>
        <div id="early-work" className="origin-artifacts">
          <article className="origin-code-card">
            <div className="origin-code-meta"><span>{t.notes.artifactCalculator}</span></div>
            <pre><code>{`class Calculadora {
  sumar(num1, num2) {
    return parseInt(num1) + parseInt(num2);
  }

  raizCuadrada(num) {
    return Math.sqrt(num);
  }
}

alert("¿Qué operación deseas realizar?");`}</code></pre>
          </article>
          <figure className="origin-artifact origin-artifact-felipe">
            <img src={images.felipe} alt="Felipe the Pig early website from 2021" loading="lazy" />
            <figcaption><span>{t.notes.artifactFelipe}</span></figcaption>
          </figure>
          <figure className="origin-artifact origin-artifact-bestseller">
            <img src={images.bestseller} alt="Bestseller Group crypto exchange landing page from 2022" loading="lazy" />
            <figcaption><span>{t.notes.artifactBestseller}</span></figcaption>
          </figure>
        </div>
        <div className="principles-marquee">
          <div className="principles-track">
            <div className="principles-group">{t.notes.principles.map(principle => <span key={principle}>{principle}<i>/</i></span>)}</div>
            <div className="principles-group" aria-hidden>{t.notes.principles.map(principle => <span key={principle}>{principle}<i>/</i></span>)}</div>
          </div>
        </div>
      </section>

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
