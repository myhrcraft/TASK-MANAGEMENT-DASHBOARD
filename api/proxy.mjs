// Server side: passes the app's requests on to Supabase.
// The Supabase URL and key come from environment variables and never reach the browser.
const ALLOWED = {
  tasks: ["GET", "POST", "PATCH", "DELETE"],
  list_items: ["GET", "POST", "PATCH", "DELETE"],
  app_settings: ["GET", "PATCH"],
  "rpc/replace_all": ["POST"]
};
const PASS_UP = ["accept", "content-type", "prefer"];
const PASS_DOWN = ["content-type", "content-range"];
const MAX_BODY = 4_000_000;

const fail = (status, message) => Response.json({ message }, { status, headers: { "cache-control": "no-store" } });

async function handle(request) {
  const base = process.env.SUPABASE_URL, key = process.env.SUPABASE_KEY;
  if (!base || !key) return fail(500, "Server setup is not finished: add SUPABASE_URL and SUPABASE_KEY.");

  const url = new URL(request.url);
  const path = url.pathname.startsWith("/rest/v1/") ? url.pathname.slice(9) : url.searchParams.get("__path") || "";
  url.searchParams.delete("__path");
  if (!Object.hasOwn(ALLOWED, path) || !ALLOWED[path].includes(request.method)) return fail(404, "Not found");

  // only this site's own pages may call this
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return fail(403, "Not allowed");

  let body;
  if (request.method === "POST" || request.method === "PATCH") {
    if (!(request.headers.get("content-type") || "").startsWith("application/json")) return fail(415, "JSON only");
    body = await request.text();
    if (body.length > MAX_BODY) return fail(413, "Too much data in one request.");
  }

  const headers = { apikey: key };
  if (key.startsWith("eyJ")) headers.authorization = "Bearer " + key;   // legacy anon key
  for (const h of PASS_UP) { const v = request.headers.get(h); if (v) headers[h] = v; }

  let res, text;
  try {
    res = await fetch(`${base.replace(/\/+$/, "")}/rest/v1/${path}${url.search}`, { method: request.method, headers, body });
    text = await res.text();
  } catch {
    return fail(502, "fetch failed");
  }
  const out = { "cache-control": "no-store" };
  for (const h of PASS_DOWN) { const v = res.headers.get(h); if (v) out[h] = v; }
  return new Response(res.status === 204 ? null : text, { status: res.status, headers: out });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
