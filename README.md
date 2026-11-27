# Chada Tech website

Static, mobile-first site: plain HTML/CSS/JS, no build step needed to host it. Forms save to Supabase; payments go through Paystack payment links.

## Files

```
index.html                  Home
free-class/index.html       Free class registration  → class_registrations
thanks/class/index.html     "You're in!" + WhatsApp community + Add to calendar (.ics)
inner-circle/index.html     Tracks, what members get, curriculum, founding offer
join/index.html             /join/?track=business|professional|student → memberships → Paystack
thanks/join/index.html      After payment (Paystack redirect) or waitlist
reply-kit/index.html        Customer Reply Kit (runs in the browser) → reply_kit_leads
privacy/ refund/            Policies (NDPA 2023 / GDPR)
admin/index.html            Team admin (magic-link sign-in, Mark paid, CSV, copy numbers)
404.html                    Not-found page
assets/js/config.js         ← THE ONLY FILE YOU EDIT (all [CONFIRM] values)
assets/js/app.js            Shared code (forms, phone normalising, Supabase inserts, analytics)
assets/js/pages.js          Free class, join, thank-you logic
assets/js/replykit.js       Reply Kit questions, templates, gating, copy buttons
assets/js/admin.js          Admin page
assets/js/vendor/supabase.js  Supabase client (admin page only)
assets/css/style.css        Brand styles
assets/img/                 Logos from the logo pack (unchanged)
favicon.ico, icon-*.png, og-image.png, site.webmanifest, robots.txt, .nojekyll
supabase.sql                Run once in Supabase
tools/build.py              Regenerates the HTML pages if you change the shared header/footer
```

## 1. Supabase (DONE: project `chada-tech-site`, eu-west-1)

Already created, SQL run, keys in config.js, josephokeoma07@gmail.com added as admin. Steps below are only for reference or a fresh project.

1. Go to supabase.com → **New project** (name: `chada-tech-site`, region: **eu-west** is closest to Nigeria). Save the database password somewhere safe.
2. **SQL Editor → New query** → paste all of `supabase.sql` → **Run**.
3. In the same editor, add the team's admin emails (Joseph and Ope):
   ```sql
   insert into public.admins (email) values ('joseph@…'), ('ope@…');
   ```
4. **Authentication → URL Configuration**: set **Site URL** to your site address and add `https://YOUR-SITE/admin/` to **Redirect URLs** (so the magic link comes back to the admin page).
5. **Project Settings → API**: copy the **Project URL** and the **publishable** key (`sb_publishable_…`, or the legacy `anon` key). Paste both into `assets/js/config.js`.
   Never paste the `service_role` / secret key anywhere in this site.

## 2. Fill in config.js

Open `assets/js/config.js` and fill every empty value: class time, WhatsApp community link, business WhatsApp number, contact email, LinkedIn, socials, Paystack links per track. Prices, refund days and track status (open/waitlist) are there too.

**Paystack:** create one Payment Page per open track. On each page add a custom field "WhatsApp number" and set the **Redirect URL** to `https://YOUR-SITE/thanks/join/`.
If a track's `paystackLink` is empty, sign-ups are still saved and the visitor is told you'll send the payment link on WhatsApp.

**Next monthly free class:** change only the 5 lines under `freeClass`.

## 3. Host it

### GitHub Pages
1. Create a repo `chada-tech-site` on the Okiejoedev account. Upload everything in this folder (keep the folder structure, including `.nojekyll`).
2. Repo **Settings → Pages → Deploy from a branch → main / (root)** → Save.
3. Site goes live at `https://chadatech.com/` in about a minute.
4. Custom domain: Settings → Pages → Custom domain → enter it, add the DNS records GitHub shows, tick **Enforce HTTPS**.

### Netlify (easiest)
1. app.netlify.com → **Add new site → Deploy manually** → drag this whole folder onto the page. Done.
2. Or connect the GitHub repo (no build command, publish directory = `/`) so every push redeploys.
3. **Domain management → Add a domain**; HTTPS is automatic.

### When the domain changes
Link previews (WhatsApp cards) and the 404 page use the full site address. It is set to `https://chadatech.com`. When you move to your own domain, either run
`python3 tools/build.py --url https://your-domain` or find-and-replace that address across the `.html` files.

## 4. Admin

Open `/admin/`, enter your email, click the link in your inbox. Only emails in the `admins` table can see data.
- **Mark paid** (check Paystack first) sets paid date, renewal date (+3 months) and the Founding Member flag for the first 10 Business members. The "places left" counter on the site updates automatically.
- **Only opted in to updates** + **Copy WhatsApp numbers** = your broadcast list (only people who ticked the updates box).
- **Export CSV** exports the rows shown.

## 5. Analytics and UTM tags

Set `analytics.provider` in config.js (`plausible`, `umami` or `ga4`). Events tracked: `class_registered`, `join_pending`, `join_waitlist`, `kit_started`, `kit_completed`, `kit_unlocked`, `kit_copy`, `kit_cta_inner_circle`.
Add `?utm_source=instagram&utm_campaign=free-class` to every link you post. The source is saved with each sign-up (the `source` column).
