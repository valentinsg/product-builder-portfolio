# Graphify — cómo instalarlo y usarlo

Graphify convierte una carpeta de código/docs en un grafo de conocimiento navegable (`graphify-out/graph.json`), pensado para que un asistente de IA (Claude Code, Cursor, etc.) entienda un repo grande sin tener que leer todo el código cada vez.

Esta guía es para instalarlo desde cero en una máquina nueva o repetir el setup en un repo nuevo.

---

## 1. Instalación en la máquina (una sola vez, no por repo)

Requiere Python. En Windows, si `python` tira el error del alias de la Microsoft Store, usar el launcher `py`:

```powershell
py --version          # confirmar que hay Python
py -m pip --version   # confirmar que pip funciona
```

### 1.1 Instalar `uv`

```powershell
py -m pip install --user uv
```

Esto instala `uv.exe` en `%APPDATA%\Python\Python<version>\Scripts`. Si `uv --version` no funciona después, agregar esa carpeta al PATH del usuario:

```powershell
$scriptsDir = "$env:APPDATA\Python\Python314\Scripts"  # ajustar la versión si difiere
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$userPath;$scriptsDir", "User")
```

Reiniciar la terminal para que el PATH nuevo tome efecto.

### 1.2 Instalar el CLI de graphify

```powershell
uv tool install graphifyy
uv tool update-shell
```

`uv tool update-shell` agrega `C:\Users\<usuario>\.local\bin` (donde quedan `graphify.exe` y `graphify-mcp.exe`) al PATH del usuario. De nuevo, reiniciar la terminal después.

Verificar:

```powershell
graphify --version
```

### 1.3 Instalar el skill de Claude Code

Esto da el comando `/graphify` disponible en **cualquier proyecto** donde uses Claude Code, sin tener que repetirlo por repo:

```powershell
graphify install --platform claude
```

Escribe el skill en `~/.claude/skills/graphify/` y agrega una sección a `~/.claude/CLAUDE.md` global.

---

## 2. Setup por repo (se repite en cada proyecto nuevo)

Parado en la raíz del repo (con `.git` inicializado):

### 2.1 Hook de git — actualización automática

```bash
graphify hook install
```

Instala `post-commit` y `post-checkout` en `.git/hooks/`. Después de cada commit, reconstruye el grafo **solo con AST** (sin LLM, sin costo, sin subagentes) en background — el commit no se bloquea esperando.

Verificar estado:

```bash
graphify hook status
```

Desinstalar si hace falta:

```bash
graphify hook uninstall
```

### 2.2 Generar el grafo inicial

Dos caminos, según cuánto contenido no-código (docs, papers, imágenes) tenga el repo:

**Opción A — solo código, rápido, sin LLM** (igual al comando que corre el hook):
```bash
graphify update .
```

**Opción B — pipeline completo**, con extracción semántica de docs/imágenes vía subagentes de Claude Code (más lento, dispara Agent calls):
```
/graphify .
```
desde dentro de una sesión de Claude Code.

Si el repo es chico, `graphify` avisa si "no lo necesitás" (corpus que entra en una sola ventana de contexto) — en ese caso, alcanza con la Opción A para que el hook tenga algo que mantener actualizado a medida que el repo crece.

### 2.3 `.gitignore`

Agregar `graphify-out/` — son artefactos regenerables, y `.graphify_python` dentro guarda una ruta absoluta específica de esta máquina, así que no tiene sentido versionarlo:

```
graphify-out/
```

---

## 3. Uso día a día

Con el grafo ya construido (`graphify-out/graph.json` existe):

```bash
graphify query "¿cómo se conecta X con Y?"      # búsqueda BFS sobre el grafo
graphify path "ModuloA" "ModuloB"                 # camino más corto entre dos nodos
graphify explain "NombreDeModulo"                 # explicación en lenguaje simple de un nodo y sus vecinos
```

Desde Claude Code, lo mismo funciona como slash command: `/graphify query "..."`, y para preguntas en lenguaje natural sobre el codebase alcanza con preguntar directamente — el skill detecta que ya existe `graphify-out/graph.json` y consulta el grafo en vez de reconstruirlo.

Para reconstruir manualmente después de cambios grandes (el hook ya lo hace solo en cada commit, esto es para forzarlo fuera de un commit):

```bash
graphify update .
```

---

## 4. Troubleshooting

- **`uv` / `graphify` "no se reconoce como comando"**: el PATH se actualizó pero la terminal actual no lo relee. Cerrar y abrir una terminal nueva, o usar la ruta completa al `.exe` (`%APPDATA%\Python\Python<ver>\Scripts\uv.exe`, `C:\Users\<usuario>\.local\bin\graphify.exe`).
- **El hook no corre nada tras un commit**: revisar el log en `~/.cache/graphify-rebuild.log`. El hook corre en background y detached, así que un fallo no aparece en la terminal del commit.
- **No hace falta ninguna API key** para el uso básico (código + hook). Solo si querés extracción semántica de docs/imágenes vía Gemini en vez de subagentes, se puede setear `GEMINI_API_KEY` o `GOOGLE_API_KEY`.

---

## Referencia rápida de comandos

| Comando | Qué hace |
|---|---|
| `uv tool install graphifyy` | Instala el CLI (una vez por máquina) |
| `graphify install --platform claude` | Instala el skill `/graphify` en Claude Code (una vez por máquina) |
| `graphify hook install` | Instala hooks de git en el repo actual (por repo) |
| `graphify hook status` | Chequea si los hooks están instalados |
| `graphify update .` | Reconstruye el grafo solo con código, sin LLM |
| `/graphify .` | Pipeline completo con extracción semántica (desde Claude Code) |
| `graphify query "..."` | Pregunta sobre el grafo ya construido |
| `graphify path "A" "B"` | Camino más corto entre dos nodos |
| `graphify explain "X"` | Explicación de un nodo y sus vecinos |
