# vstack — registry de componentes

`registry.json` en la raíz de este repo convierte `product-builder-portfolio` en un registry instalable de shadcn/ui, sin hostear nada aparte de GitHub.

## Instalar un componente en otro proyecto

```bash
npx shadcn add https://raw.githubusercontent.com/valentinsg/product-builder-portfolio/main/registry.json
```

Trae el `registry.json` completo; el CLI de shadcn resuelve `registryDependencies` solo (ej. pedir `button` también instala `utils`).

## Inventario actual

| Item | Tipo | Qué es |
|---|---|---|
| `utils` | `registry:lib` | El helper `cn` (clsx + tailwind-merge) — `lib/utils.ts` |
| `button` | `registry:ui` | Botón con variantes, sobre `@base-ui/react` — `components/ui/button.tsx` |

Ambos son el scaffold estándar de shadcn, no componentes propios todavía — sirven para dejar la infraestructura andando. La idea es que acá vayan cayendo utilidades de diseño/UX propias a medida que se escriban (ver `docs/roadmap-mi-stack.md`, Fase 1 pieza 3).

## Agregar un componente nuevo

1. Escribir el componente en `components/ui/` (o donde corresponda) como se haría normalmente en este repo.
2. Agregar una entrada en `registry.json` → `items`:
   ```json
   {
     "name": "mi-componente",
     "type": "registry:ui",
     "title": "Mi Componente",
     "description": "Qué hace, en una línea.",
     "dependencies": ["paquete-npm-si-hace-falta"],
     "registryDependencies": ["utils"],
     "files": [{ "path": "components/ui/mi-componente.tsx", "type": "registry:ui" }]
   }
   ```
3. Validar el JSON (`node -e "JSON.parse(require('fs').readFileSync('registry.json','utf8'))"`) antes de commitear.

## Decisiones

- **Nombre:** `vstack` — conecta con "Mi Stack", el nombre del roadmap general.
- **Sin build step:** no se usa `npx shadcn build` (eso genera `public/r/*.json` para self-hosting). Point-and-add directo al `registry.json` crudo de GitHub alcanza mientras el registry viva en este mismo repo.
- Si el registry crece mucho, se puede migrar a un repo propio más adelante — no bloquea nada mientras tanto.
