/* ===========================================================================
   compass-centre-content — save Worker
   ---------------------------------------------------------------------------
   Commits compass-centres.json to GitHub on the tool's behalf, so the GitHub
   token never reaches a browser and is never in the repo.

   Deploy on Cloudflare Workers. Set these in the Worker's settings:

     Secrets   GITHUB_TOKEN   a fine-grained PAT, this repo only,
                              Contents: Read and write, nothing else
               SAVE_KEY       any long random string you give to staff
                              (not needed if the Worker sits behind
                              Cloudflare Access — see ALLOW_ACCESS below)

     Variables REPO           compassoffices/compass-centre-content
               BRANCH         main
               FILE           compass-centres.json
               ORIGIN         https://compassoffices.github.io
                              (or https://compassoffices.io — comma-separate
                              several)
               ALLOW_ACCESS   "1" to accept a Cloudflare Access session
                              instead of SAVE_KEY

   Rotating the credential is one secret in Cloudflare. Nothing else changes.
   ======================================================================== */

const API = "https://api.github.com";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
    const ok = allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": ok ? origin : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Save-Key",
      "Access-Control-Allow-Credentials": "true",   /* the tool sends the Access cookie */
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, cors);
    if (!ok) return json({ error: "Origin not allowed" }, 403, cors);

    /* Behind Cloudflare Access the signed-in session is proof enough.
       Otherwise the caller must present the shared save key. */
    const viaAccess = env.ALLOW_ACCESS === "1" &&
                      !!request.headers.get("Cf-Access-Jwt-Assertion");
    if (!viaAccess) {
      const key = request.headers.get("X-Save-Key") || "";
      if (!env.SAVE_KEY || key !== env.SAVE_KEY) {
        return json({ error: "Wrong or missing save key" }, 401, cors);
      }
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "Body was not JSON" }, 400, cors); }

    const content = body.data;
    if (!content || typeof content !== "object" || !content.centres) {
      return json({ error: "Expected { data: { centres: {...} }, message }" }, 400, cors);
    }
    const message = String(body.message || "Update centre content").slice(0, 300);

    const repo = env.REPO, branch = env.BRANCH || "main";
    const file = env.FILE || "compass-centres.json";
    const url = `${API}/repos/${repo}/contents/${encodeURIComponent(file)}`;
    const head = {
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "compass-centre-content"
    };

    /* the current file's blob SHA — GitHub needs it to replace rather than reject */
    let sha;
    const cur = await fetch(`${url}?ref=${encodeURIComponent(branch)}`, { headers: head });
    if (cur.status === 200) sha = (await cur.json()).sha;
    else if (cur.status !== 404) {
      return json({ error: "Could not read the current file", status: cur.status }, 502, cors);
    }

    const text = JSON.stringify(content, null, 1);
    const put = await fetch(url, {
      method: "PUT",
      headers: { ...head, "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: b64(text),
        branch,
        ...(sha ? { sha } : {})
      })
    });

    if (!put.ok) {
      const detail = await put.text();
      return json({ error: "GitHub refused the commit", status: put.status,
                    detail: detail.slice(0, 400) }, 502, cors);
    }
    const done = await put.json();
    return json({
      ok: true,
      commit: done.commit && done.commit.sha ? done.commit.sha.slice(0, 7) : "",
      url: done.commit && done.commit.html_url ? done.commit.html_url : ""
    }, 200, cors);
  }
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  });
}
/* base64 that survives Chinese, Japanese and Vietnamese text */
function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
