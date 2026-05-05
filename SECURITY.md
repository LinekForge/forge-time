# Security Policy

## 报告漏洞

发现安全问题请**不要**直接 PR 或 public issue。

**唯一报告渠道**：GitHub Security Advisory—— 到 [https://github.com/LinekForge/forge-sense/security/advisories/new](https://github.com/LinekForge/forge-sense/security/advisories/new) 提交 private advisory。

我们尽量在 7 天内回复，30 天内提供 fix 或缓解方案。

## 安全模型

forge-sense 有两种运行模式：

### MCP Server 模式（`src/index.ts`）

由 Claude Code CLI 作为子进程 spawn。

- 无网络通信：不监听任何端口，不发送任何网络请求
- 无文件写入（时间标记存在进程内存中）
- 无持久状态：进程退出时所有数据清零
- `tempo` 工具读取 session jsonl 文件（只读），路径由调用方传入
- `place_save` 写入 `~/.config/forge-sense/places.json`（唯一写操作）

### CLI 模式（`src/cli.ts`）

独立命令行工具，直接在终端运行。

- **有网络通信**：`weather` 命令请求高德地图 API（`restapi.amap.com`���查询天气
- **有文件写入**：`mark` 写 `/tmp/forge-sense-markers.json`，`place save` 写 `~/.config/forge-sense/places.json`
- API key 通过环境变量 `AMAP_KEY` 传入，不存储在代码或配置文件中

### 环境变量

| 变量 | 用途 | 必须 |
|------|------|------|
| `AMAP_KEY` | ��德地图 API key（仅 weather 命令） | weather 命令必须 |
| `FORGE_SENSE_PLACES` | 自定义 places.json 路径 | 可选 |

## 升级 / Patch

订阅 [GitHub Releases](https://github.com/LinekForge/forge-sense/releases)。
