#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const sessionStart = Date.now();
const markers = new Map<string, number>();

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m < 60) return `${m}m${rs}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h${rm}m${rs}s`;
}

function formatTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDate(date: Date): string {
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${date.getFullYear()}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")} ${weekdays[date.getDay()]}`;
}

const server = new McpServer({
  name: "forge-time",
  version: "0.1.0",
});

server.tool(
  "now",
  "Get the current time, date, and weekday.",
  {},
  async () => {
    const now = new Date();
    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          time: formatTime(now),
          date: formatDate(now),
          epoch: Math.floor(now.getTime() / 1000),
          session_age: formatDuration(now.getTime() - sessionStart),
        }),
      }],
    };
  }
);

server.tool(
  "elapsed",
  "Get how long this session has been alive.",
  {},
  async () => {
    const ms = Date.now() - sessionStart;
    return {
      content: [{
        type: "text" as const,
        text: `Session alive for ${formatDuration(ms)} (since ${formatTime(new Date(sessionStart))})`,
      }],
    };
  }
);

server.tool(
  "mark",
  "Set a named time marker. Use this to track how long a task takes.",
  {
    name: z.string().describe("Name of the marker, e.g. 'start writing essay'"),
  },
  async ({ name }) => {
    markers.set(name, Date.now());
    return {
      content: [{
        type: "text" as const,
        text: `Marker "${name}" set at ${formatTime(new Date())}`,
      }],
    };
  }
);

server.tool(
  "since",
  "Get elapsed time since a named marker was set.",
  {
    name: z.string().describe("Name of the marker to check"),
  },
  async ({ name }) => {
    const start = markers.get(name);
    if (!start) {
      const available = markers.size > 0
        ? `Available markers: ${Array.from(markers.keys()).join(", ")}`
        : "No markers set yet.";
      return {
        content: [{
          type: "text" as const,
          text: `Marker "${name}" not found. ${available}`,
        }],
      };
    }
    const ms = Date.now() - start;
    return {
      content: [{
        type: "text" as const,
        text: `${formatDuration(ms)} since "${name}" (set at ${formatTime(new Date(start))})`,
      }],
    };
  }
);

server.tool(
  "markers",
  "List all active time markers with their elapsed times.",
  {},
  async () => {
    if (markers.size === 0) {
      return {
        content: [{
          type: "text" as const,
          text: "No markers set.",
        }],
      };
    }
    const now = Date.now();
    const lines = Array.from(markers.entries()).map(([name, start]) => {
      return `${name}: ${formatDuration(now - start)} ago (set at ${formatTime(new Date(start))})`;
    });
    return {
      content: [{
        type: "text" as const,
        text: lines.join("\n"),
      }],
    };
  }
);

server.tool(
  "tempo",
  "Analyze conversation rhythm by reading the session's jsonl file. Returns message frequency over recent time windows.",
  {
    jsonl_path: z.string().optional().describe("Path to the session .jsonl file. If omitted, returns a hint to provide it."),
    window_minutes: z.number().optional().describe("Time window in minutes to analyze (default: 60)"),
  },
  async ({ jsonl_path, window_minutes }) => {
    if (!jsonl_path) {
      return {
        content: [{
          type: "text" as const,
          text: "Provide jsonl_path (your session transcript path) to analyze conversation rhythm.",
        }],
      };
    }

    try {
      const file = Bun.file(jsonl_path);
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());

      const windowMs = (window_minutes || 60) * 60 * 1000;
      const cutoff = Date.now() - windowMs;

      let userCount = 0;
      let assistantCount = 0;
      let totalInWindow = 0;

      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          const ts = entry.timestamp ? new Date(entry.timestamp).getTime() : 0;
          if (ts < cutoff) continue;
          totalInWindow++;
          if (entry.type === "user") userCount++;
          if (entry.type === "assistant") assistantCount++;
        } catch {}
      }

      const windowMin = (window_minutes || 60);
      const turnsPerMin = totalInWindow > 0 ? (totalInWindow / windowMin).toFixed(1) : "0";

      let rhythm: string;
      const tpm = parseFloat(turnsPerMin);
      if (tpm === 0) rhythm = "静默";
      else if (tpm < 0.5) rhythm = "稀疏";
      else if (tpm < 2) rhythm = "平稳";
      else if (tpm < 5) rhythm = "密集";
      else rhythm = "高频";

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            window: `${windowMin}min`,
            total_turns: totalInWindow,
            user_turns: userCount,
            assistant_turns: assistantCount,
            turns_per_minute: turnsPerMin,
            rhythm,
          }),
        }],
      };
    } catch (err: any) {
      return {
        content: [{
          type: "text" as const,
          text: `Error reading jsonl: ${err.message}`,
        }],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
