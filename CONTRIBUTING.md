# Contributing

Thanks for wanting to contribute! Here's what you need to know.

## Local Development

```bash
git clone https://github.com/LinekForge/forge-sense.git
cd forge-sense
bun install
```

### CLI mode

```bash
bun src/cli.ts now
bun src/cli.ts mark "test"
bun src/cli.ts since "test"
```

### MCP mode

```bash
echo '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}},"id":1}' | bun run src/index.ts
```

## Reporting Bugs / Feature Requests

GitHub Issues. Please include:
- Bun version (`bun --version`)
- Claude Code version (`claude --version`) if using MCP mode
- Steps to reproduce

## PR Flow

1. Fork → branch
2. Make changes + verify locally (CLI commands work, MCP server starts)
3. PR description with motivation and change summary

## Security Issues

Do not open a public issue. Submit via [GitHub Security Advisory](https://github.com/LinekForge/forge-sense/security/advisories/new). See [SECURITY.md](SECURITY.md).

## License

MIT. By submitting a PR you agree your code is released under MIT.
