# Contributing to forge-time

谢谢想 contribute！下面是基本约定。

## 本地开发

```bash
git clone https://github.com/LinekForge/forge-time.git
cd forge-time
bun install
bun run src/index.ts   # 启动 MCP server（stdin/stdout）
```

## 测试

MCP server 通过 stdin 接收 JSON-RPC 消息：

```bash
echo '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}},"id":1}' | bun run src/index.ts
```

## 报 Bug / 提需求

GitHub Issues。请带：
- 复现步骤
- Bun 版本（`bun --version`）
- Claude Code 版本（`claude --version`）

## PR 流程

1. Fork → branch
2. 改 + 本地验证 MCP server 能启动
3. PR 描述带：动机、改动概要

## 安全问题

不要发 public issue。通过 [GitHub Security Advisory](https://github.com/LinekForge/forge-time/security/advisories/new) 提交 private report，详见 [SECURITY.md](SECURITY.md)。

## License

MIT。提交 PR 即同意你的代码以 MIT 开源。
