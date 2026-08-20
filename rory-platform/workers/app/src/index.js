const SITES = new Set(["control", "show", "chat", "complaint", "mail"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function secure(response) {
  const headers = new Headers(response.headers);

  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https://images.unsplash.com data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; object-src 'none'"
  );
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-site");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

function siteFromHost(hostname, rootDomain) {
  const host = hostname.toLowerCase();

  if (host === rootDomain) return "control";

  const prefix = host.replace(`.${rootDomain}`, "");
  return SITES.has(prefix) ? prefix : "control";
}

async function maintenanceState(env) {
  try {
    const result = await env.DB.prepare(
      "SELECT key, value FROM settings WHERE key IN ('maintenance_mode', 'maintenance_message')"
    ).all();

    const values = Object.fromEntries(
      result.results.map((item) => [item.key, item.value])
    );

    return {
      enabled: values.maintenance_mode === "1",
      message: values.maintenance_message || "正在检修，稍后再来！"
    };
  } catch {
    return {
      enabled: true,
      message: "正在检修，稍后再来！"
    };
  }
}

function maintenancePage(message) {
  return new Response(
    `<!doctype html>
    <html lang="zh-CN">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Maintenance</title>
      <style>
        body{margin:0;min-height:100vh;display:grid;place-items:center;background:#17202a;color:#f4f1eb;font-family:Arial,sans-serif}
        main{width:min(620px,88vw);padding:42px;background:#25313b;border-top:7px solid #0f766e}
        h1{margin:0 0 16px;font-size:32px}
        p{line-height:1.75;color:#dfdbd1}
      </style>
    </head>
    <body>
      <main>
        <h1>正在检修，稍后再来！</h1>
        <p>${escapeHtml(message)}</p>
        <p>Maintenance is in progress. Please return shortly.</p>
      </main>
    </body>
    </html>`,
    {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Retry-After": "300"
      }
    }
  );
}

async function api(request, env) {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return json({ ok: true, service: "rory-platform-app", time: Date.now() });
  }

  if (url.pathname === "/api/config") {
    return json({
      turnstileSiteKey: env.TURNSTILE_SITE_KEY || "",
      githubOAuthConfigured: Boolean(
        env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
      ),
      googleOAuthConfigured: Boolean(
        env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      )
    });
  }

  return json({ error: "NOT_FOUND" }, 404);
}

async function serveStatic(request, env) {
  const url = new URL(request.url);
  const assetUrl = new URL(request.url);
  const site = siteFromHost(url.hostname, env.ROOT_DOMAIN);

  if (assetUrl.pathname === "/" || assetUrl.pathname === "/index.html") {
    assetUrl.pathname = `/${site}/index.html`;
  }

  return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/api/health") {
        return secure(await api(request, env));
      }

      const maintenance = await maintenanceState(env);

      if (maintenance.enabled) {
        return secure(
          url.pathname.startsWith("/api/")
            ? json({ error: "MAINTENANCE_MODE" }, 503)
            : maintenancePage(maintenance.message)
        );
      }

      if (url.pathname.startsWith("/api/")) {
        return secure(await api(request, env));
      }

      return secure(await serveStatic(request, env));
    } catch (error) {
      console.error("Rory Platform worker error", error);
      return secure(json({ error: "INTERNAL_ERROR" }, 500));
    }
  }
};
