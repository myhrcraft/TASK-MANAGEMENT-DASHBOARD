"use strict";
// Data layer: loads and saves through this site's own server (api/proxy.mjs), which holds the
// Supabase key. No key is in the browser. No login. The UI lives in app.js.

let sb = null;          // Supabase client
let loaded = false;     // true once the first load has succeeded
let pending = 0;        // writes in progress
let gen = 0;            // bumped by every write, so an older read can't overwrite newer data
let needRefresh = false;
const REFRESH_MS = 60000;

// list rows with their database ids (S.members etc. hold just the names)
const LK = { members: [], assigners: [], functions: [] };
const COL = {
  id: "id", seq: "seq", task: "task", ad: "assigned_date", by: "assigned_by", fn: "job_function",
  due: "due_date", cd: "completion_date", a1: "assigned_to_1", a2: "assigned_to_2", a3: "assigned_to_3",
  pr: "priority", pct: "pct", rem: "remarks", created: "created_at"
};
const NULLABLE = ["ad", "due", "cd"];

function fromRow(r) {
  const t = {};
  for (const k in COL) t[k] = r[COL[k]] ?? "";
  t.updated = r.updated_at || "";
  return t;
}
function toRow(t) {
  const r = {};
  for (const k in COL) {
    if (!(k in t)) continue;
    if ((k === "seq" || k === "created" || k === "id") && t[k] === "") continue;
    r[COL[k]] = NULLABLE.includes(k) ? (t[k] || null) : t[k];
  }
  return r;
}

function chk(res) { if (res.error) throw res.error; return res.data; }
function errText(e) {
  const m = String(e?.message || e || "");
  if (/failed to fetch|networkerror|load failed|fetch failed/i.test(m)) return "No connection. The change was not saved.";
  if (e?.code === "23505") return "That name is already used.";
  if (e?.code === "23514") return "Not saved: a value is too long or not allowed.";
  return "Not saved: " + m;
}

// ---------- writes (one at a time, in order) ----------
let chain = Promise.resolve();
function run(fn) {
  pending++; gen++;
  const p = chain.then(fn).then(v => ({ ok: true, v }), e => ({ ok: false, e }));
  chain = p;
  return p.then(async r => {
    pending--; gen++;
    if (r.ok) setSync("");
    else { console.error(r.e); setSync("Not saved"); toast(errText(r.e)); needRefresh = true; }
    if (needRefresh && !pending) await refresh(true);
    return r;
  });
}
async function dbInsert(t) { return fromRow(chk(await sb.from("tasks").insert(toRow(t)).select().single())); }
async function dbPatch(id, patch) {
  const d = chk(await sb.from("tasks").update(toRow(patch)).eq("id", id).select());
  if (!d.length) throw new Error("the task was deleted by someone else.");
  return fromRow(d[0]);
}
async function dbDelete(id) { chk(await sb.from("tasks").delete().eq("id", id).select("id")); }
async function dbReplace(p) { chk(await sb.rpc("replace_all", { p })); }
async function dbListAdd(row) { return chk(await sb.from("list_items").insert(row).select().single()); }
async function dbListRename(id, name) {
  const d = chk(await sb.from("list_items").update({ name }).eq("id", id).select("id"));
  if (!d.length) throw new Error("this entry was removed by someone else.");
}
async function dbListDelete(id) { chk(await sb.from("list_items").delete().eq("id", id).select("id")); }
async function dbReportDate(d) { chk(await sb.from("app_settings").update({ report_date: d || null }).eq("id", 1).select("id")); }

// ---------- reads ----------
async function loadAll() {
  const g = gen, tasks = [];
  for (let a = 0; ; a += 1000) {
    const d = chk(await sb.from("tasks").select("*").order("seq").order("id").range(a, a + 999));
    tasks.push(...d.map(fromRow));
    if (d.length < 1000) break;
  }
  const lists = chk(await sb.from("list_items").select("*").order("id"));
  const set = chk(await sb.from("app_settings").select("report_date").eq("id", 1).maybeSingle());
  if (g !== gen || pending) return false;              // something was saved meanwhile; this copy is stale
  const before = JSON.stringify([S, LK]);
  S.tasks = tasks;
  for (const k in LK) {
    LK[k] = lists.filter(x => x.kind === k).map(x => ({ id: x.id, name: x.name }));
    S[k] = LK[k].map(x => x.name);
  }
  S.reportDate = set?.report_date || "";
  return JSON.stringify([S, LK]) !== before;
}

function typing() {
  const a = document.activeElement;
  return !!a && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName) && !!a.closest("#tt,#s-lists");
}
async function refresh(force) {
  if (!loaded) return;
  if (pending) { if (force) needRefresh = true; return; }
  if (!force && typing()) return;
  needRefresh = false;
  try {
    const changed = await loadAll();
    if (!pending) setSync("");
    if ((changed && !typing()) || force) show();
  } catch (e) { console.error(e); setSync("Offline"); }
}
setInterval(() => { if (document.visibilityState === "visible") refresh(false); }, REFRESH_MS);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") refresh(false); });
addEventListener("online", () => refresh(false));
addEventListener("beforeunload", e => { if (pending) e.preventDefault(); });

// shown in the header only when something is wrong
function setSync(s) { const el = document.getElementById("sync"); el.textContent = s; el.hidden = !s; }

async function boot() {
  const box = document.getElementById("loadMsg");
  try {
    sb = sb || supabase.createClient(location.origin, "server", { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    await loadAll();
    loaded = true; box.hidden = true; show();
  } catch (e) {
    console.error(e);
    box.textContent = /setup/i.test(e?.message) ? e.message + " " : "Could not load data. Check the connection. ";
    const b = document.createElement("button"); b.className = "btn"; b.textContent = "Try again";
    b.onclick = () => { box.textContent = "Loading…"; boot(); };
    box.append(b);
  }
}
