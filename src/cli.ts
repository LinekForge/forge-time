#!/usr/bin/env bun

const PLACES_FILE = `${process.env.HOME}/.claude/places.json`;
const MARKERS_FILE = `/tmp/forge-sense-markers.json`;

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

async function loadJSON(path: string): Promise<any> {
  try { return JSON.parse(await Bun.file(path).text()); } catch { return {}; }
}

async function saveJSON(path: string, data: any) {
  await Bun.write(path, JSON.stringify(data, null, 2));
}

const [cmd, ...args] = process.argv.slice(2);

switch (cmd) {
  case "now": {
    const now = new Date();
    console.log(`${formatTime(now)} ${formatDate(now)}`);
    break;
  }

  case "elapsed": {
    const markers = await loadJSON(MARKERS_FILE);
    const start = markers.__session_start;
    if (!start) { console.log("No session start recorded. Run: forge-sense mark __session_start"); break; }
    console.log(`Session alive ${formatDuration(Date.now() - start)} (since ${formatTime(new Date(start))})`);
    break;
  }

  case "mark": {
    const name = args.join(" ");
    if (!name) { console.log("Usage: forge-sense mark <name>"); break; }
    const markers = await loadJSON(MARKERS_FILE);
    markers[name] = Date.now();
    await saveJSON(MARKERS_FILE, markers);
    console.log(`Marker "${name}" set at ${formatTime(new Date())}`);
    break;
  }

  case "since": {
    const name = args.join(" ");
    if (!name) { console.log("Usage: forge-sense since <name>"); break; }
    const markers = await loadJSON(MARKERS_FILE);
    const start = markers[name];
    if (!start) {
      const available = Object.keys(markers).filter(k => !k.startsWith("__"));
      console.log(`Marker "${name}" not found.${available.length ? ` Available: ${available.join(", ")}` : ""}`);
      break;
    }
    console.log(`${formatDuration(Date.now() - start)} since "${name}" (set at ${formatTime(new Date(start))})`);
    break;
  }

  case "markers": {
    const markers = await loadJSON(MARKERS_FILE);
    const entries = Object.entries(markers).filter(([k]) => !k.startsWith("__"));
    if (entries.length === 0) { console.log("No markers set."); break; }
    const now = Date.now();
    for (const [name, start] of entries) {
      console.log(`${name}: ${formatDuration(now - (start as number))} ago (set at ${formatTime(new Date(start as number))})`);
    }
    break;
  }

  case "place": {
    const sub = args[0];
    const places: any[] = await loadJSON(PLACES_FILE).then((d: any) => Array.isArray(d) ? d : []);

    if (sub === "save") {
      const name = args[1];
      if (!name) { console.log("Usage: forge-sense place save <name> [--city X] [--note X] [--coords X]"); break; }
      const city = args.indexOf("--city") > -1 ? args[args.indexOf("--city") + 1] : "";
      const note = args.indexOf("--note") > -1 ? args[args.indexOf("--note") + 1] : "";
      const coords = args.indexOf("--coords") > -1 ? args[args.indexOf("--coords") + 1] : "";
      places.push({ name, city, coords, note, saved_at: formatTime(new Date()), saved_date: formatDate(new Date()) });
      await saveJSON(PLACES_FILE, places);
      console.log(`Saved "${name}"${city ? ` (${city})` : ""}${note ? ` — ${note}` : ""}`);
    } else if (sub === "list") {
      if (places.length === 0) { console.log("No saved places."); break; }
      for (let i = 0; i < places.length; i++) {
        const p = places[i];
        let line = `${i + 1}. ${p.name}`;
        if (p.city) line += ` (${p.city})`;
        if (p.note) line += ` — ${p.note}`;
        if (p.saved_date) line += ` [${p.saved_date}]`;
        console.log(line);
      }
    } else if (sub === "remove") {
      const name = args[1];
      if (!name) { console.log("Usage: forge-sense place remove <name>"); break; }
      const idx = places.findIndex((p: any) => p.name === name);
      if (idx === -1) { console.log(`Place "${name}" not found.`); break; }
      places.splice(idx, 1);
      await saveJSON(PLACES_FILE, places);
      console.log(`Removed "${name}".`);
    } else {
      console.log("Usage: forge-sense place [save|list|remove]");
    }
    break;
  }

  case "weather": {
    const city = args.join(" ") || "苏州";
    const AMAP_KEY = process.env.AMAP_KEY || "26aee0e3fe72bc9007c4afc0757640a6";
    const cityMap: Record<string, string> = { "苏州": "320500", "上海": "310000", "北京": "110000", "杭州": "330100", "南京": "320100", "扬州": "321000", "无锡": "320200", "常州": "320400", "深圳": "440300", "广州": "440100" };
    const adcode = cityMap[city];
    if (!adcode) {
      const res = await fetch(`https://restapi.amap.com/v3/config/district?keywords=${encodeURIComponent(city)}&key=${AMAP_KEY}&subdistrict=0`);
      const data = await res.json() as any;
      const code = data.districts?.[0]?.adcode;
      if (!code) { console.log(`City "${city}" not found.`); break; }
      const wres = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?city=${code}&key=${AMAP_KEY}`);
      const wdata = await wres.json() as any;
      const w = wdata.lives?.[0];
      if (!w) { console.log("Weather data unavailable."); break; }
      console.log(`${w.city} · ${w.weather} · ${w.temperature}°C · 湿度${w.humidity}% · ${w.winddirection}风${w.windpower}级`);
    } else {
      const res = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${AMAP_KEY}`);
      const data = await res.json() as any;
      const w = data.lives?.[0];
      if (!w) { console.log("Weather data unavailable."); break; }
      console.log(`${w.city} · ${w.weather} · ${w.temperature}°C · 湿度${w.humidity}% · ${w.winddirection}风${w.windpower}级`);
    }
    break;
  }

  default:
    console.log(`forge-sense v0.2.0

Usage:
  forge-sense now              Current time, date, weekday
  forge-sense elapsed          Session alive time
  forge-sense mark <name>      Set a time marker
  forge-sense since <name>     Time since a marker
  forge-sense markers          List all markers
  forge-sense place save <name> [--city X] [--note X] [--coords X]
  forge-sense place list       List saved places
  forge-sense place remove <name>
  forge-sense weather [city]   Current weather (default: 苏州)`);
}
