# Security Policy

## 报告漏洞

发现安全问题请**不要**直接 PR 或 public issue。

**唯一报告渠道**：GitHub Security Advisory—— 到 [https://github.com/LinekForge/forge-time/security/advisories/new](https://github.com/LinekForge/forge-time/security/advisories/new) 提交 private advisory。

我们尽量在 7 天内回复，30 天内提供 fix 或缓解方案。

## 安全模型

forge-time 是一个 **stdio MCP server**，由 Claude Code CLI 作为子进程 spawn。

- 无网络通信：不监听任何端口，不发送任何网络请求
- 无文件写入：不写入任何用户文件（markers 存在进程内存中）
- 无持久状态：进程退出时所有数据清零
- `tempo` 工具读取 session jsonl 文件（只读），路径由调用方传入

## 升级 / Patch

订阅 [GitHub Releases](https://github.com/LinekForge/forge-time/releases)。
