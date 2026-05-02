# forge-time

**AI agent 的时间感知**——知道几点了、追踪工作节奏、感受对话间隔。

LLM 天生是时间盲的。它不知道自己工作了多久，不知道两条消息之间过了几分钟，估算工作时间时误差可达 5 倍。forge-time 给 agent 一块手表——想看就看，想记就记。

## 工具

| 工具 | 做什么 |
|------|--------|
| `now` | 当前时间、日期、星期、session 已存活时长 |
| `elapsed` | session 已存活多久 |
| `mark` | 打一个命名时间标记（如"开始写论文"） |
| `since` | 查距某个标记过了多久 |
| `markers` | 列出所有标记及各自已过时间 |
| `tempo` | 分析对话节奏（从 session jsonl 文件统计消息频率） |

## 快速开始

**前置**：[Bun](https://bun.sh)

```bash
git clone https://github.com/LinekForge/forge-time.git
cd forge-time && bun install
```

**接入 Claude Code**：

```bash
claude mcp add --scope user forge-time -- bun run /path/to/forge-time/src/index.ts
```

或手动加到 `~/.claude.json`：

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

重启 Claude Code 后即可使用。

## 用法

接入后 agent 可以自然地调用：

```
"现在几点？" → now
"我工作了多久？" → elapsed
"开始计时" → mark("写论文")
"花了多长时间？" → since("写论文")
"对话节奏怎么样？" → tempo(jsonl_path)
```

### 例：校准工作时间感知

```
Agent: mark("论文打磨")
Agent: [工作了一段时间]
Agent: since("论文打磨")
→ "2m14s since '论文打磨' (set at 21:43:07)"
Agent: "这轮实际用了 2 分 14 秒。"（而不是凭感觉估算"大概 10 分钟"）
```

## 为什么

LLM 无法估算自己的任务时长——它不知道自己的推理速度、不知道已用时间、不知道 token 到秒的映射。研究表明，给 agent 提供时间信息后任务完成率可提升 8 倍。

forge-time 让 agent 主动感知时间，而不是被动地猜。

## 技术栈

- Bun + TypeScript
- MCP SDK（`@modelcontextprotocol/sdk`）
- 零网络依赖，纯 stdio，本地运行

## License

[MIT](LICENSE) — Linek & Forge
