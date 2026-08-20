# Manual Cloudflare Setup

No Cloudflare API Token is required for this repository generation.

Create manually in Cloudflare Dashboard:
1. D1 database: rory-platform-db
2. Private R2 bucket: rory-platform-files
3. Worker: rory-platform-app
4. Email Worker: rory-platform-mail-router
5. Turnstile widget
6. Email Routing catch-all rule, later

Run database/0001_initial.sql in the D1 Console.
Then place the D1 ID in both wrangler.toml files.

Bind the application Worker to:
- rorygpk.online
- show.rorygpk.online
- chat.rorygpk.online
- complaint.rorygpk.online
- mail.rorygpk.online

Never commit secrets. Configure them in Cloudflare only:
SESSION_PEPPER
PASSWORD_PEPPER
CODE_PEPPER
TURNSTILE_SECRET
RESEND_API_KEY
MAIL_FROM
OWNER_EMAIL
OWNER_BOOTSTRAP_CODE
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
