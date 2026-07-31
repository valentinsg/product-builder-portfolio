# Roadmap — Mi Stack

## Descubrimiento clave (portfolio real revisado)
El portfolio (`valentinsg-portoflio.vercel.app`) ya tiene buena parte de esto en germen:
- La sección **Capabilities** ya tiene una pestaña **Tools** al lado — es el lugar natural para el Hub, no hace falta crear una sección nueva
- **"Notes on building"** ya contiene la filosofía de Valentín en su propia voz (el stack importa menos que el problema, los 6 pasos de su proceso: Understand → Design → Build → Launch → Learn → Improve) — es la semilla real de Método/Principios, solo falta ampliarla
- **Work** (Abundancia, Harmonica, Smithii, Claridad, MiStock, Presidential, Busy) ya cubre la capa de Evidencia por completo — sin trabajo pendiente

Nota técnica: todas estas secciones viven inline dentro de un único `app/page.tsx` (585 líneas) — no son archivos/rutas separadas. Confirmado al correr la detección de archivos de graphify (ver Fase 1).

Conclusión: el trabajo real es **extender la pestaña Tools existente** con el Hub (lista curada, componentes, Graphify), no crear una sección nueva desde cero.

## Visión
Una página que muestre quién sos como builder — no solo qué herramientas usás, sino cómo pensás y qué construiste con ellas. Vive probablemente dentro de `product-builder-portfolio`, como una sección más de lo que ya tenés andando.

---

## Fase 0 — Definición (ya cerrada en esta charla)
- [x] El stack se piensa en 4 capas: **Herramientas**, **Skills técnicos**, **Método/Principios**, **Evidencia**
- [x] La capa de Herramientas incluye un **Hub funcional**, pensado como **público** — es parte de mostrar tu identidad de builder, no una herramienta privada
- [x] Referencias de inspiración encontradas: Cult UI (formato instalable, copiar y pegar) y design-skills-joaco (índice de skills + ejemplos reales construidos con ellas)

---

## Fase 1 — Hub funcional (MVP)
Tres piezas identificadas — **las tres tienen al menos un primer paso andando (2026-07-12).**

1. **Integración con Graphify** ✅ **hecho** — CLI instalado globalmente en la máquina vía `uv tool`, hook de git configurado en este repo, grafo inicial generado. Ver "Cómo se hizo" abajo para replicarlo en otros repos, y `docs/graphify.md` para la guía completa de uso día a día.
2. **Lista curada de APIs y herramientas** ✅ **v1 hecho** — integrada dentro de la pestaña Tools existente en Capabilities (`app/page.tsx`), como un grid de categorías (Build, Product & design, AI, Ship & measure, Explore, Visual references, Builder inspiration) con los tools/APIs/referencias que ya estaban documentados en Capabilities y en este roadmap. No se inventó contenido nuevo — es una consolidación. **Pendiente:** sumar entradas nuevas a medida que aparezcan (hoy vive inline en el array `hub` de `content.en.capabilities` / `content.es.capabilities`).
3. **Librería propia de componentes UX** ✅ **scaffold hecho, nombre: `vstack`** — `registry.json` en la raíz, instalable con `npx shadcn add <url-cruda-del-registry.json-en-github>`. Hoy solo tiene el scaffold estándar de shadcn (`utils`, `button`) para dejar la infraestructura probada; ver `docs/registry.md` para cómo se agregan componentes propios de acá en adelante.

### Graphify — cómo se hizo (para replicar en otro repo)

**Instalación del CLI (una sola vez por máquina, no por repo):**
```powershell
py -m pip install --user uv
# agrega uv al PATH del usuario si hace falta (Scripts de Python), luego:
uv tool install graphifyy
uv tool update-shell   # agrega ~/.local/bin (los ejecutables graphify/graphify-mcp) al PATH
```
Reiniciar la shell para que el PATH actualizado tome efecto.

**Skill de Claude Code (una sola vez por máquina):** da el comando `/graphify` en cualquier proyecto.
```powershell
graphify install --platform claude
```
Esto escribe el skill en `~/.claude/skills/graphify/` y una sección en `~/.claude/CLAUDE.md` global.

**Por repo — hook de git (se repite en cada proyecto nuevo):**
```bash
graphify hook install
```
Instala `post-commit` y `post-checkout` en `.git/hooks/`. El hook corre `_rebuild_code` (solo AST, sin LLM, sin subagentes) en background después de cada commit, así el grafo se mantiene al día solo. Verificar con `graphify hook status`.

**Grafo inicial:** si el repo es chico, `graphify` avisa si "no lo necesitás" (corpus que entra en una sola ventana de contexto). Para sembrar el `graph.json` sin gastar tokens en extracción semántica (LLM), alcanza con el mismo comando liviano que usa el hook:
```bash
graphify update .
```
Para el pipeline completo con extracción semántica de docs/imágenes (dispara subagentes), usar `/graphify .` desde Claude Code.

**`.gitignore`:** se agregó `graphify-out/` — son artefactos regenerables y `.graphify_python` guarda una ruta absoluta específica de la máquina, no debe versionarse.

> Pendiente: meter estos pasos en un template/boilerplate para no repetirlos a mano en cada proyecto nuevo.

**Dónde vive todo (decidido):**
- Páginas de "Mi Stack" (identidad, moodboard, docs) → dentro de `product-builder-portfolio`, como rutas normales de Next.js
- Registry de componentes → vive en la raíz de este mismo repo vía `registry.json` (shadcn permite convertir cualquier repo público de GitHub en un registry instalable, sin hostear nada aparte: `npx shadcn add <link-a-tu-registry.json>`) — ✅ hecho, ver `docs/registry.md`
- Si el registry crece mucho, se puede migrar a un repo propio más adelante — no bloquea el arranque
- **Nombre decidido:** `vstack`

---

## Fase 2 — Mi Stack completo
- [x] **Skills técnicos** ✅ **hecho (2026-07-12)** — tercera pestaña "Skills" en el toggle de Capabilities (`app/page.tsx`, `content.en/es.capabilities.skills`), agrupada por las mismas 4 categorías (Build/Shape/Improve/Explore) con nivel por tecnología (Expert/Advanced/Familiar). **Los niveles son una inferencia mía a partir de lo que ya contaba el resto de la página** (años, qué tecnologías aparecen en casi todos los proyectos vs. solo en uno, lenguaje tipo "growing"/"learning" en Web3 y Presidential) — no son una autoevaluación tuya. Revisar y ajustar si algo no refleja cómo te ves.
- [ ] **Método/Principios** — la que más te distingue de un stack genérico. Responde "¿cómo pensás vos?", no qué usás. Ejemplos: "prefiero tener el código propio antes que depender de una librería pesada", "documento antes de escalar", "uso IA para acelerar, no para reemplazar criterio". Se va a ir escribiendo sola a medida que avance el resto — no bloquea nada. **Sin arrancar** — necesita tu voz real, no la mía.
- [x] **Evidencia** ✅ **hecho (2026-07-12)** — se agregó "Avi Salud" a la lista "Now building" del About (`https://www.avisalud.com.ar/`), con la descripción real sacada de `lib/projects.ts` en el repo de Estudio Ve: presencia digital y flujo de consulta para una empresa de cuidado domiciliario. El resto de "trabajo en Estudio Ve" ya estaba linkeado (`estudiove.com`).

---

## Fase 3 — Moodboard visual
- [x] Referencias visuales por tipo de feature, para consultar antes de diseñar algo nuevo ✅ **hecho (2026-07-12)**
- [x] Vive como página propia — `app/moodboard/page.tsx` (server, exporta metadata) + `app/moodboard/moodboard-client.tsx` (client, toggle de idioma con el mismo `localStorage` key `vsg-lang` que la home). 9 categorías por tipo de feature (Navbars, Calls to action, Landing pages, Whole sites, Design system components, Mobile & web screens, Rebrands, Icons, AI image prompts), cada una linkeando a las fuentes de abajo.
- Cross-link agregado desde el Hub de Tools (Capabilities → pestaña Tools → debajo de "Visual references"/"Builder inspiration") hacia `/moodboard`.
- **Solo links, sin imágenes hosteadas** — no se scrapean/rehostean screenshots de Mobbin/Saaspo/etc. por derechos de autor. Si en el futuro se quiere el estilo Pinterest real (screenshots curados propios), es una pieza aparte que requiere ir guardando capturas manualmente.

**Fuentes ya recolectadas:**
- [Mobbin](https://mobbin.com) — pantallas reales de apps móviles y web
- [Component Gallery](https://component.gallery/design-systems/) — componentes de design systems reales
- [Saaspo](https://saaspo.com) — landing pages de SaaS
- [Landing.love](https://landing.love) — inspiración de landings
- [Craftwork — Curated Websites](https://craftwork.design/curated/websites) — sitios curados
- [Navbar Gallery](https://navbar.gallery) — navbars
- [CTA Gallery](https://cta.gallery) — calls to action
- [Rebrand Gallery](https://rebrand.gallery) — rebrands
- [Hugeicons](https://hugeicons.com) — librería de iconos

**Sub-categoría: prompts de imágenes IA**
- [MeiGen](https://www.meigen.ai) — galería de prompts para generar imágenes/video con IA (GPT Image, Nano Banana, Seedance). Distinto de las referencias de UI de arriba — sirve para cuando necesites generar ilustraciones o heroes con IA.

---

## Backlog / Ideas a evaluar (todavía sin encajar)
- **Notion propio** — decidido: es personal, no herramienta de Estudio VE. Sin fecha todavía, se retoma cuando el Hub esté más avanzado
- **revpdf.com** — buena referencia de producto indie bien ejecutado (offline, sin cuenta, freemium); no confirmado que sea open source

## Fuera de Mi Stack (proyecto aparte, no bloquea este roadmap)
- **[ai-job-search](https://github.com/MadsLorentzen/ai-job-search)** — framework armado sobre Claude Code para buscar trabajo: evalúa ofertas, arma CV y carta a medida, prepara entrevistas. Útil como herramienta personal, pero no tiene que ver con mostrar identidad de builder — queda anotado para retomar cuando quieras, por separado.

---

## Inspiración recolectada
- [Cult UI](https://www.cult-ui.com/) — componentes shadcn/ui instalables + patrones de agentes de IA
- [design-skills-joaco](https://design-skills-joaco.vercel.app) — índice personal de skills de diseño + ejemplos generados
- Graphify — knowledge graph para mejorar el contexto de asistentes de IA en un repo
- [revpdf.com](https://revpdf.com) — editor de PDF offline, referencia de producto indie
- [Obscura](https://github.com/h4ckf0r0day/obscura) — motor de navegador headless (Rust) para scraping y automatización de agentes IA, con servidor MCP incluido
- [Starlight](https://starlight.astro.build/es) — framework de Astro para sitios de documentación; candidato natural para documentar el Hub o la integración de Graphify
