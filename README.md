# forge-sense

Time and space awareness for AI agents — know the time, track your pace, sense the weather.

LLM agents are blind to time and environment. They can't tell how long they've been working, what time it is, or what's happening outside. forge-sense gives agents a watch, a compass, and a window.

## Modes

forge-sense runs in two modes:

| Mode | Entry | Use case |
|------|-------|----------|
| **CLI** | `forge-sense <command>` | Direct terminal use, low context cost |
| **MCP** | stdio server via `src/index.ts` | Claude Code MCP integration |

## Commands

| Command | What it does |
|---------|--------------|
| `now` | Current time, date, weekday |
| `elapsed` | How long this session has been alive |
| `mark <name>` | Set a named time marker |
| `since <name>` | Time elapsed since a marker |
| `markers` | List all active markers |
| `place save <name>` | Save a location bookmark |
| `place list` | List saved places |
| `place remove <name>` | Remove a saved place |
| `weather <city>` | Current weather (requires `AMAP_KEY`) |

## Quick Start

**Requires**: [Bun](https://bun.sh)

```bash
git clone https://github.com/LinekForge/forge-sense.git
cd forge-sense && bun install
```

### CLI mode (recommended)

```bash
# Symlink to PATH
ln -s "$(pwd)/src/cli.ts" ~/.local/bin/forge-sense

# Use
forge-sense now
forge-sense mark "start coding"
forge-sense since "start coding"
forge-sense weather 杭州    # requires AMAP_KEY
```

### MCP mode

```bash
claude mcp add --scope user forge-sense -- bun run /path/to/forge-sense/src/index.ts
```

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `AMAP_KEY` | For `weather` only | Amap (高德) API key. Get one at [console.amap.com](https://console.amap.com/) |
| `FORGE_SENSE_PLACES` | No | Custom path for places.json (default: `~/.config/forge-sense/places.json`) |

## Place commands

```bash
forge-sense place save 家 --city 苏州 --note "home"
forge-sense place save 办公室 --city 上海 --coords "121.47,31.23"
forge-sense place list
forge-sense place remove 办公室
```

## Why

LLMs cannot estimate their own task duration — they don't know their inference speed, elapsed time, or token-to-second mapping. Giving agents time information can improve task completion rates significantly.

forge-sense lets agents actively perceive time and space, rather than guessing.

## Tech Stack

- Bun + TypeScript
- MCP SDK (`@modelcontextprotocol/sdk`) for MCP mode
- Amap API for weather (CLI mode only, opt-in)

## License

[MIT](LICENSE) — Linek & Forge
