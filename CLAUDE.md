# CLAUDE.md — Mi Stack

## Contexto del proyecto
Este repo (`product-builder-portfolio` / `valentinsg-portoflio`, Next.js) ya tiene una sección "Capabilities" con una pestaña "Tools" al lado. **Ese es el lugar donde va el Hub — extendé esa pestaña existente, no crees una sección nueva.** El plan completo, con todo el razonamiento detrás de cada decisión, está en `docs/roadmap-mi-stack.md` — leelo antes de arrancar a codear.

Importante: la sección "Notes on building" ya tiene la filosofía de Valentín en su propia voz — es la semilla de Método/Principios, no hay que inventarla de cero, hay que ampliarla. La sección "Work" (Abundancia, Harmonica, Smithii, Claridad, MiStock, Presidential, Busy) ya cubre Evidencia por completo, no tocar.

Nota técnica: todas las secciones (Capabilities, Work, Notes on building, Principles) viven inline dentro de `app/page.tsx` (un solo archivo grande), no en rutas/archivos separados.

## Estructura de Mi Stack (4 capas)
1. Herramientas (incluye el Hub funcional, ver abajo) — vive en la pestaña **Tools** existente
2. Skills técnicos
3. Método/Principios — ya sembrado en "Notes on building", ampliar ahí
4. Evidencia — ya completo en "Work", no tocar

## Estado actual
**Fase 1 completa con v1 en sus tres piezas (2026-07-12):**
1. **Graphify** — CLI instalado globalmente (`uv tool install graphifyy`), skill de Claude Code instalado (`graphify install --platform claude`, da el comando `/graphify`), hook de git instalado en este repo (`graphify hook install`) y grafo inicial generado (`graphify update .`). Guía de uso completa en `docs/graphify.md`; el detalle de cómo se hizo (para replicar en otro repo) está en `docs/roadmap-mi-stack.md`. `graphify-out/` está en `.gitignore`.
2. **Lista curada de APIs/herramientas** — grid de categorías dentro de la pestaña Tools existente en Capabilities (`app/page.tsx`, array `hub` en `content.en.capabilities` / `content.es.capabilities`). Consolidado de contenido ya existente, sin inventar nada — sumar entradas nuevas ahí a medida que aparecen.
3. **Registry de componentes `vstack`** — `registry.json` en la raíz, instalable vía `npx shadcn add <url>`. Hoy solo tiene el scaffold estándar (`utils`, `button`); ver `docs/registry.md` para agregar componentes propios.

**Fase 2 — 2/3 piezas hechas (2026-07-12):**
1. **Skills técnicos** — tercera pestaña "Skills" en el toggle de Capabilities, nivel por tecnología. Los niveles (Expert/Advanced/Familiar) son una inferencia mía a partir del resto del contenido de la página, no una autoevaluación de Valentín — pendiente que él la revise.
2. **Evidencia** — se agregó "Avi Salud" (`https://www.avisalud.com.ar/`) a "Now building" en About, con data real sacada de `lib/projects.ts` del repo de Estudio Ve.
3. **Método/Principios** — sin arrancar. Necesita la voz real de Valentín, no debe inventarse.

**Fase 3 — hecha (2026-07-12).** Página `/moodboard` (`app/moodboard/page.tsx` + `app/moodboard/moodboard-client.tsx`), 9 categorías por tipo de feature, solo links (sin rehostear imágenes de terceros por derechos de autor). Cross-link desde el Hub de Tools en Capabilities. Bilingüe, mismo `localStorage` key que la home.

## Directorios de trabajo adicionales
Este entorno tiene acceso a `C:\Users\Usuario\Documents\Estudio-Ve---Website` (el sitio de Estudio Ve) como directorio adicional — sirve para sacar data real de proyectos/clientes cuando el roadmap pida linkear "trabajo en Estudio Ve" (ej. `lib/projects.ts` tiene la lista de proyectos con links y descripciones reales). Preferir esa fuente antes que inventar contenido sobre proyectos de Estudio Ve.

## Decisiones ya tomadas (no las vuelvas a preguntar)
- El Hub es público — parte de mostrar identidad de builder, no una herramienta privada
- Contenido estático (lista, docs, moodboard) vive en este mismo repo, sin API — se agrega una API solo si en el futuro hace falta compartir el mismo contenido con otro proyecto (ej. Estudio VE)
- El registry de componentes se resuelve con `registry.json` en la raíz de este mismo repo — shadcn permite convertir cualquier repo público de GitHub en un registry instalable, sin hostear nada aparte. Nombre decidido: `vstack`
- El Notion es un proyecto personal, separado de Estudio VE — no forma parte de este roadmap
- Graphify: el CLI y el skill de Claude Code se instalan UNA VEZ por máquina, no por repo. El hook de git (`graphify hook install`) sí se repite en cada repo nuevo. `graphify-out/` no se versiona.

## Cómo trabajar en este proyecto
- Actualizá los checkboxes de `docs/roadmap-mi-stack.md` a medida que se completan tareas
- Si surge una decisión de arquitectura nueva, anotala en ese mismo archivo antes de seguir
- Fase 2 (Skills, Método/Principios, Evidencia) y Fase 3 (Moodboard) esperan a que la Fase 1 tenga al menos una pieza terminada
