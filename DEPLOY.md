# HR Task Tracker: deploy guide (Supabase + GitHub + Vercel, login chara)

| Jinis | Kothay |
|---|---|
| Website (Vercel sudhu eita serve kore) | `public/` |
| Server function (key ekhane env theke ashe) | `api/` |
| Database SQL | `supabase/` |
| Vercel setting + security header | `vercel.json` |
| Original offline file (bodlano hoy nai) | `HR_Task_Tracker_Dashboard_1.11.26_1.html` |

> **Mone rakhun:** login nai. Website link je pabe, se sob task dekhte, bodlate ar delete korte parbe.
> Link sudhu dorkari manush ke din, ar niyomito **Backup** nin.

## 1. Supabase

1. supabase.com > **New project** (ei kajer jonno notun). Region: Singapore ba Mumbai.
2. **SQL Editor** e porpor Run:
   - `supabase/01_schema.sql` (table)
   - `supabase/02_sample_data.sql` (24 sample task + list)
3. **Project Settings > API Keys / Data API** theke **Project URL** ar **Publishable key** (ba legacy `anon`) nin.
   Egula kono code file e jabe na; local e `.env.local`, live e Vercel er Environment Variables.
   `secret` / `service_role` key lagbe na.

## 2. GitHub

Change push korte: `git add -A`, `git commit -m "..."`, `git push`. Vercel nijei notun version tulbe.
`.env.local` git e jay na (`.gitignore` e ache).

## 3. Vercel

1. vercel.com > **Add New > Project** > GitHub repo import. Framework Preset **Other**.
2. Deploy er age **Environment Variables** e duita din (Sensitive on):
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
3. **Deploy**. Pore variable bodlale **Redeploy** lagbe.

## Local e chalano

`.env.example` copy kore `.env.local` nam din, value boshan, tarpor `run-local.cmd` double-click. Data live database er.

## 4. Real data

- Purono HTML e real data thakle: oi file e **Backup** > live app e **Restore** (sob task ar list replace hobe).
- Notun shuru korle: **Lists > Clear All Tasks**.
- Supabase Free plan e automatic backup nai, ar onek din use na hole project pause hoy.
