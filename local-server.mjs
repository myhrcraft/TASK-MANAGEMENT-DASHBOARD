// Local preview: serves public/ and api/ on this PC only, with the same headers as Vercel.
// Reads SUPABASE_URL and SUPABASE_KEY from .env.local (that file is never sent to GitHub).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";
import * as proxy from "./api/proxy.mjs";

const PORT = 4010, URL_ = `http://localhost:${PORT}/`, HERE = import.meta.dirname;
const ROOT = path.join(HERE, "public"), ENV = path.join(HERE, ".env.local");
if (fs.existsSync(ENV)) process.loadEnvFile(ENV);
const headers = Object.fromEntries(
  JSON.parse(fs.readFileSync(path.join(HERE, "vercel.json"), "utf8")).headers[0].headers.map(h => [h.key, h.value]));
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const openBrowser = () => { if (process.argv.includes("--open")) exec(`start "" "${URL_}"`); };

async function api(req, res) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const run = proxy[req.method];
  if (!run) { res.writeHead(405).end(); return; }
  const r = await run(new Request(new URL(req.url, URL_), {
    method: req.method, headers: req.headers, body: chunks.length ? Buffer.concat(chunks) : undefined }));
  res.writeHead(r.status, { ...headers, ...Object.fromEntries(r.headers) });
  res.end(Buffer.from(await r.arrayBuffer()));
}

http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, URL_).pathname); } catch { res.writeHead(400).end(); return; }
  if (p.startsWith("/rest/v1/")) { api(req, res).catch(e => { console.error(e.message); res.writeHead(500).end(); }); return; }
  const file = path.join(ROOT, p === "/" ? "index.html" : p);
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end("Not found"); return; }
  res.writeHead(200, { ...headers, "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}).on("error", e => {
  if (e.code === "EADDRINUSE") { console.log("Already running: " + URL_); openBrowser(); }
  else { console.error(e.message); process.exitCode = 1; }
}).listen(PORT, "localhost", () => { console.log("HR Task Tracker: " + URL_ + "\nClose this window to stop."); openBrowser(); });
