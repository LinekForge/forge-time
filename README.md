# forge-time

Time awareness for AI agents. Know the time, track your pace, feel the rhythm.

An MCP server that gives agents a sense of time — not just "what time is it" but "how long have I been working" and "what's the conversation rhythm like."

## Tools

| Tool | What it does |
|------|-------------|
| `now` | Current time, date, weekday, and session age |
| `elapsed` | How long this session has been alive |
| `mark` | Set a named time marker (e.g. "start writing essay") |
| `since` | Time elapsed since a marker was set |
| `markers` | List all active markers with elapsed times |
| `tempo` | Analyze conversation rhythm from session transcript |

## Install

```bash
# Clone
git clone https://github.com/LinekForge/forge-time.git
cd forge-time && bun install

# Add to Claude Code
claude mcp add forge-time bun run /path/to/forge-time/src/index.ts
```

Or add manually to `~/.claude.json`:

```json
{
  "mcpServers": {
    "forge-time": {
      "command": "bun",
      "args": ["run", "/path/to/forge-time/src/index.ts"]
    }
  }
}
```

## Usage

Once connected, the agent can call these tools naturally:

```
"What time is it?" → now
"How long have I been working?" → elapsed
"Start timing this task" → mark("writing essay")
"How long did that take?" → since("writing essay")
"What's the conversation rhythm?" → tempo(jsonl_path)
```

### Example: Self-calibrating work time

```
Agent: mark("论文打磨")
Agent: [does work for a while]
Agent: since("论文打磨")
→ "2m14s since '论文打磨' (set at 21:43:07)"
Agent: "这轮实际用了 2 分 14 秒。" (instead of guessing "about 10 minutes")
```

## Why

LLMs are temporally blind. They cannot estimate their own task duration — they lack access to elapsed generation time or the mapping from tokens to seconds. This leads to systematic overestimation of work time and underestimation of their own speed.

forge-time gives agents a clock they can check whenever they want.

## Stack

- Bun + TypeScript
- MCP SDK (`@modelcontextprotocol/sdk`)
- Zero external dependencies beyond MCP

## License

[MIT](LICENSE) — Linek & Forge
