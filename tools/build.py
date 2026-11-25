#!/usr/bin/env python3
"""Generates the static HTML pages for the Chada Tech site.
Run from the repo root:  python3 tools/build.py  [--url https://your-domain]
You only need this if you change shared layout (header/footer/head). Day-to-day values live in assets/js/config.js.
"""
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_URL = "https://okiejoedev.github.io/chada-tech-site"
if "--url" in sys.argv:
    SITE_URL = sys.argv[sys.argv.index("--url") + 1].rstrip("/")
VER = "2"

OG_TITLE = "Chada Tech: learn to use AI on your phone"
OG_DESC = "Free live class Sat 28 Nov. Reply faster, sell more and get paid with AI."

def head(title, desc, path, R, noindex=False, og_title=None, og_desc=None):
    url = SITE_URL + "/" + path
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
{'<meta name="robots" content="noindex,nofollow">' if noindex else ''}
<meta name="theme-color" content="#042D6A">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Chada Tech">
<meta property="og:title" content="{og_title or OG_TITLE}">
<meta property="og:description" content="{og_desc or OG_DESC}">
<meta property="og:image" content="{SITE_URL}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{R}favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="{R}icon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="{R}icon-16.png">
<link rel="apple-touch-icon" href="{R}icon-180.png">
<link rel="manifest" href="{R}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{R}assets/css/style.css?v={VER}">
</head>
"""

MENU_SVG = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'

def header(R):
    return f"""<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="logo" href="{R or './'}" aria-label="Chada Tech home"><img src="{R}assets/img/chada-tech-logo-horizontal-navy.svg" alt="Chada Tech" width="145" height="40"></a>
    <nav class="nav" aria-label="Main">
      <a href="{R}free-class/">Free class</a>
      <a href="{R}inner-circle/">Inner Circle</a>
      <a href="{R}reply-kit/">Free Reply Kit</a>
      <a href="{R}#faq">FAQ</a>
      <a class="btn btn-sm" href="{R}free-class/">Join the free class</a>
    </nav>
    <button class="menu-btn" aria-label="Open menu" aria-expanded="false">{MENU_SVG}</button>
  </div>
  <div class="mobile-nav">
    <a href="{R}free-class/">Free class</a>
    <a href="{R}inner-circle/">Inner Circle</a>
    <a href="{R}reply-kit/">Free Reply Kit</a>
    <a href="{R}#faq">FAQ</a>
    <a class="btn" href="{R}free-class/">Join the free class</a>
  </div>
</header>
"""

def footer(R, bar=True, extra_js=""):
    sticky = f"""<div class="sticky-bar"><a class="btn" href="{R}free-class/">Join the free class</a></div>""" if bar else ""
    return f"""<footer class="site-footer">
  <div class="wrap">
    <div class="fgrid">
      <div>
        <img class="flogo" src="{R}assets/img/chada-tech-logo-horizontal-white.svg" alt="Chada Tech" width="145" height="40">
        <p>Learn to use AI on your phone to reply faster, sell more and get paid. Live classes every Saturday.</p>
      </div>
      <div>
        <h4>Learn</h4>
        <ul>
          <li><a href="{R}free-class/">Free class</a></li>
          <li><a href="{R}inner-circle/">Inner Circle</a></li>
          <li><a href="{R}reply-kit/">Free Customer Reply Kit</a></li>
          <li><a href="#" data-c-href="whatsappCommunityLink" target="_blank" rel="noopener">WhatsApp community</a></li>
        </ul>
      </div>
      <div data-follow>
        <h4>Follow</h4>
        <ul>
          <li><a href="#" data-c-href="socials.instagram" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="#" data-c-href="socials.tiktok" target="_blank" rel="noopener">TikTok</a></li>
          <li><a href="#" data-c-href="socials.facebook" target="_blank" rel="noopener">Facebook</a></li>
          <li><a href="#" data-c-href="socials.x" target="_blank" rel="noopener">X</a></li>
        </ul>
      </div>
    </div>
    <div class="copy">© <span data-year>2026</span> Chada Tech · <a href="{R}privacy/">Privacy notice</a> · <a href="{R}refund/">Refund policy</a></div>
  </div>
</footer>
{sticky}
<script src="{R}assets/js/config.js?v={VER}"></script>
<script src="{R}assets/js/app.js?v={VER}"></script>
{extra_js}
</body>
</html>
"""

def consent(R, prefix=""):
    return f"""<label class="check"><input type="checkbox" name="consent_privacy" required> <span>I agree to Chada Tech using my details to register me and contact me about this, as explained in the <a href="{R}privacy/" target="_blank">Privacy notice</a>.</span></label>
<label class="check"><input type="checkbox" name="consent_updates"> <span>Send me free AI tips and class updates on WhatsApp. I can stop any time by replying STOP.</span></label>"""

HONEYPOT = '<div class="hp" aria-hidden="true"><label>Company<input type="text" name="company" tabindex="-1" autocomplete="off"></label></div>'

PHONE_FIELD = """<div class="field"><label for="whatsapp">WhatsApp number</label>
<input id="whatsapp" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="0801 234 5678" required>
<div class="err-msg">Enter a Nigerian WhatsApp number, e.g. 0801 234 5678 or +234 801 234 5678.</div></div>"""

def page(path, html):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(html)

CHECK_SVG = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'

# ------------------------------------------------------------------ HOME
def home():
    R = ""
    faq = [
        ("Is this legit?", "Yes. See the full curriculum, the tutor and the prices before you pay. You pay only through our official Paystack link, never into a personal account."),
        ("What do I need?", "A phone and data. A laptop is optional."),
        ("How do classes work?", "Live on Google Meet every Saturday. We share our screen and show every step. You get the recording and a short task after each class."),
        ("What if I miss a class?", "Watch the recording and ask questions in the members' group."),
        ("I'm new to AI. Is that okay?", "Yes. We start from zero."),
        ("How do I pay?", "Through Paystack: card, bank transfer or USSD."),
        ("Can I get a refund?", 'Yes, within <span data-c="refundDays">7</span> days of your first class. See the <a href="refund/">refund policy</a>.'),
        ("How long is membership?", "3 months per payment."),
    ]
    faq_html = "\n".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in faq)
    return head("Chada Tech: learn to use AI on your phone", "Live online classes that show you how to use AI on your phone to reply faster, sell more and get paid. Free class Saturday 28 November.", "", R) + '<body class="has-bar" data-page="home">\n' + header(R) + f"""
<main id="main">
<section class="hero bg-navy">
  <img class="wm" src="assets/img/chada-tech-icon-white.svg" alt="" aria-hidden="true">
  <div class="wrap hero-grid">
    <div>
      <span class="label">Chada Tech Community</span>
      <h1>Use AI on your phone to <span class="hl">reply faster</span>, sell more and get paid.</h1>
      <p class="sub">Live online classes that show you exactly how, step by step, with free tools you already have.</p>
      <div class="btns">
        <a class="btn" href="free-class/">Join the free class, <span data-c="freeClass.shortLabel">Sat 28 Nov</span></a>
        <a class="btn btn-ghost" href="inner-circle/">See the Inner Circle</a>
      </div>
    </div>
    <div class="phone" aria-label="A WhatsApp chat where a customer asks how much and gets an instant reply">
      <div class="screen">
        <div class="bar"><span class="av"><img src="assets/img/chada-tech-icon-navy.svg" alt="" width="22" height="22"></span><span>Ada's Fabrics<small>online</small></span></div>
        <div class="chat">
          <span class="chip">TODAY</span>
          <div class="msg in">Good evening. How much?<span class="t">7:42 pm</span></div>
          <div class="msg out">Hi! Thanks for asking 😊 Our Ankara 2-piece sets cost ₦18,000 to ₦35,000. Which one caught your eye? Send me a screenshot and I'll confirm the exact price.<span class="t">7:42 pm</span></div>
          <div class="msg in">This green one 👇 Do you deliver to Abuja?<span class="t">7:43 pm</span></div>
          <div class="msg out">Yes, we do! 🚚 2 to 4 days, from ₦4,500. Where should we send yours?<span class="t">7:43 pm</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <span class="label">Problems we fix</span>
    <h2>Small daily jobs, done in seconds.</h2>
    <div class="grid grid-4 compact mt2">
      <div class="card"><div class="icon-dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12z"/><path d="M12 8v4l2.5 1.5"/></svg></div><h3>Reply ‘How much?’ in 10 seconds</h3><p>Ready replies for the questions customers ask every day.</p></div>
      <div class="card"><div class="icon-dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg></div><h3>Turn a phone photo into a sale flyer</h3><p>Clean product photos and flyers, made on your phone.</p></div>
      <div class="card"><div class="icon-dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 19V5l10 14V5"/><path d="M4 10h16M4 14h16"/></svg></div><h3>Know your profit on every sale</h3><p>Simple pricing that covers your costs and pays you.</p></div>
      <div class="card"><div class="icon-dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg></div><h3>Keep simple records without a notebook</h3><p>Track sales and orders with AI, in minutes a day.</p></div>
    </div>
  </div>
</section>

<section class="section bg-grey">
  <div class="wrap narrow center">
    <span class="label">Free tool</span>
    <h2>Free Customer Reply Kit</h2>
    <p class="lead">Answer 6 questions. Get ready-to-send replies for your customers, free.</p>
    <a class="btn" href="reply-kit/">Get my free replies</a>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <span class="label">How it works</span>
    <h2>Start free. Learn live. Use it the same day.</h2>
    <div class="steps mt2">
      <div class="card"><h3>Join the free community and class</h3><p>Come to the free live class and join our WhatsApp community.</p></div>
      <div class="card"><h3>Join the Inner Circle</h3><p>A live class every Saturday, one useful AI skill at a time.</p></div>
      <div class="card"><h3>Use it the same day</h3><p>Every class ends with a short task, so the setup works on your own phone.</p></div>
    </div>
  </div>
</section>

<section class="section bg-navy" id="tracks">
  <div class="wrap">
    <span class="label">The Inner Circle</span>
    <h2>One useful AI skill every Saturday, live.</h2>
    <p class="lead">Founding cohort starts <span data-c="cohortStartLabel">Saturday 5 December 2026</span>.</p>
    <span class="places hidden" data-places></span>
    {TRACKS_HTML(R)}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <span class="label">Curriculum</span>
    <h2>The 4-week starter course</h2>
    <p class="lead">Business track. Every class ends with the setup working on your own phone.</p>
    {CURRICULUM_HTML}
  </div>
</section>

<section class="section bg-grey">
  <div class="wrap">
    <div class="grid grid-2" style="align-items:center">
      <div>
        <span class="label">Your tutor</span>
        <h2>Joseph Okeoma</h2>
        <p><strong>Chada Tech Tutor.</strong> Joseph has spent 4 years training people in tech. He teaches by live screen share, so you see every tap and every step.</p>
        <a class="btn btn-ghost" href="#" data-c-href="tutorLinkedIn" target="_blank" rel="noopener">See Joseph on LinkedIn</a>
      </div>
      <div class="card center" style="padding:48px 28px">
        <img src="assets/img/chada-tech-icon-navy.svg" alt="" width="96" height="96" style="margin:0 auto 16px;width:96px" loading="lazy">
        <p class="mb0"><strong>Live on Google Meet</strong><br>Every Saturday · recordings included</p>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <span class="label">Why trust us</span>
    <h2>Everything out in the open.</h2>
    <div class="grid grid-3 mt2">
      <div class="card"><h3>Published curriculum</h3><p>See every class before you pay.</p></div>
      <div class="card"><h3>Clear prices</h3><p>One price per track, every 3 months. No hidden fees.</p></div>
      <div class="card"><h3>Pay only through our Paystack link</h3><p>Never into a personal account.</p></div>
      <div class="card"><h3><span data-c="refundDays">7</span>-day refund</h3><p>Full refund within <span data-c="refundDays">7</span> days of your first class.</p></div>
      <div class="card"><h3>Free class first</h3><p>Try a live class before you decide.</p></div>
      <div class="card"><h3>Recordings of every class</h3><p>Missed a Saturday? Watch it later.</p></div>
    </div>
  </div>
</section>

<section class="section bg-grey hidden" id="testimonials">
  <div class="wrap">
    <span class="label">Member results</span>
    <h2>What members say</h2>
    <div class="grid grid-3 mt2" id="testimonial-list"></div>
  </div>
</section>

<section class="section bg-grey" id="faq">
  <div class="wrap narrow">
    <span class="label">FAQ</span>
    <h2>Questions people ask</h2>
    {faq_html}
  </div>
</section>

<section class="section bg-navy center">
  <div class="wrap narrow">
    <h2>Start free this Saturday.</h2>
    <p class="lead"><span data-c="freeClass.dateLabel">Saturday 28 November 2026</span> · <span data-c="freeClass.timeLabel"></span> · Google Meet</p>
    <a class="btn" href="free-class/">Join the free class</a>
  </div>
</section>
</main>
""" + footer(R, extra_js=f'<script src="assets/js/pages.js?v={VER}"></script>')

def TRACKS_HTML(R):
    return f"""<div class="grid grid-3 mt2">
      <div class="track">
        <span class="badge" data-track-badge="business">Open</span>
        <h3>Business</h3>
        <p class="for">You sell, run a business or are starting one.</p>
        <p class="price" data-price="business">₦50,000</p>
        <p class="per">per 3 months · <span data-month="business"></span></p>
        <ul><li>A 50-minute live class every Saturday</li><li>Recording, handout and a practical task</li><li>Your Customer Reply Kit set up with you in Week 1</li><li>Monthly AI update</li><li>Founding members keep this price at renewal</li></ul>
        <a class="btn" data-track-btn="business" href="{R}join/?track=business">Join the Business track</a>
      </div>
      <div class="track">
        <span class="badge" data-track-badge="professional">Waitlist</span>
        <h3>Professional</h3>
        <p class="for">You work, or you're between jobs.</p>
        <p class="price" data-price="professional">₦20,000</p>
        <p class="per">per 3 months · <span data-month="professional"></span></p>
        <ul><li>Live Saturday classes for work</li><li>Recordings and practical tasks</li><li>Monthly AI update</li></ul>
        <a class="btn btn-ghost" data-track-btn="professional" href="{R}join/?track=professional">Join the waitlist</a>
      </div>
      <div class="track">
        <span class="badge" data-track-badge="student">Waitlist</span>
        <h3>Student</h3>
        <p class="for">You're a student (proof needed).</p>
        <p class="price" data-price="student">₦10,000</p>
        <p class="per">per 3 months · <span data-month="student"></span></p>
        <ul><li>Live Saturday classes for study and side income skills</li><li>Recordings and practical tasks</li><li>Monthly AI update</li></ul>
        <a class="btn btn-ghost" data-track-btn="student" href="{R}join/?track=student">Join the waitlist</a>
      </div>
    </div>"""

CURRICULUM_HTML = """<div class="table-wrap mt2"><table class="curr">
<thead><tr><th>Class</th><th>Date</th><th>Topic</th><th>You leave with</th></tr></thead>
<tbody>
<tr><td>Class 1</td><td data-l="Date">Sat 5 Dec 2026</td><td data-l="Topic"><strong>Put your WhatsApp on autopilot</strong></td><td data-l="You leave with">Quick replies, greeting and away messages, catalogue and a short link with a ready first message, using your Reply Kit</td></tr>
<tr><td>Class 2</td><td data-l="Date">Sat 12 Dec</td><td data-l="Topic"><strong>Turn posts and comments into orders</strong></td><td data-l="You leave with">Captions that sell, a week of posts scheduled in Meta Business Suite, and a plan to move comments into DMs</td></tr>
<tr><td>Class 3</td><td data-l="Date">Sat 19 Dec</td><td data-l="Topic"><strong>Get paid and track orders</strong></td><td data-l="You leave with">A Paystack payment link or free storefront, a payment message and a simple sales record done with AI</td></tr>
<tr><td>Class 4</td><td data-l="Date">Sat 9 Jan 2027</td><td data-l="Topic"><strong>Product photos, flyers and pricing for profit</strong></td><td data-l="You leave with">Clean product photos, 3 flyers, and a lowest-price check for your top products</td></tr>
</tbody></table></div>
<p class="small mt2">No classes on Sat 26 Dec and Sat 2 Jan (holidays). After Week 4, a new practical topic every Saturday.</p>"""

# ------------------------------------------------------------------ FREE CLASS
def free_class():
    R = "../"
    return head("Free live AI class, Sat 28 Nov | Chada Tech", "Free live class: use AI to reply customers, make a flyer and sell more. Saturday 28 November on Google Meet.", "free-class/", R) + '<body data-page="free-class">\n' + header(R) + f"""
<main id="main">
<section class="section bg-grey" style="padding-top:40px">
  <div class="wrap">
    <div class="grid grid-2" style="align-items:start;gap:40px">
      <div>
        <span class="label">Free live class</span>
        <h1>Free live class: use AI to reply customers, make a flyer and sell more.</h1>
        <div class="details-card" style="background:#fff">
          <dl>
            <dt>Date</dt><dd data-c="freeClass.dateLabel">Saturday 28 November 2026</dd>
            <dt>Time</dt><dd data-c="freeClass.timeLabel"></dd>
            <dt>Where</dt><dd>Google Meet</dd>
            <dt>Length</dt><dd><span data-c="freeClass.minutes">45</span> minutes</dd>
            <dt>Price</dt><dd>Free</dd>
          </dl>
        </div>
        <p><strong>You'll leave with:</strong> ready replies for your customers, a sale flyer made from a phone photo, and answers to your questions.</p>
        <p><strong>Bring:</strong> your phone, data and one product photo.</p>
      </div>
      <form class="form-card" id="class-form" novalidate>
        <h2 style="font-size:1.5rem">Register free</h2>
        <div class="form-alert" role="alert"></div>
        <div class="field"><label for="full_name">Full name</label><input id="full_name" name="full_name" type="text" autocomplete="name" maxlength="80" required><div class="err-msg">Please enter your name.</div></div>
        {PHONE_FIELD}
        <div class="field"><label for="what_they_do">What do you sell or do?</label><input id="what_they_do" name="what_they_do" type="text" maxlength="120" placeholder="e.g. fashion, food, skincare, I'm a student" required><div class="err-msg">Tell us what you sell or do.</div></div>
        <div class="field"><label for="email">Email <span class="opt">(optional, for the recording link)</span></label><input id="email" name="email" type="email" autocomplete="email" maxlength="120"><div class="err-msg">That email doesn't look right.</div></div>
        <div class="field"><label for="heard_from">How did you hear about us? <span class="opt">(optional)</span></label>
          <select id="heard_from" name="heard_from"><option value="">Choose one</option><option>Instagram</option><option>TikTok</option><option>WhatsApp status</option><option>Facebook</option><option>A friend</option><option>Other</option></select></div>
        {consent(R)}
        {HONEYPOT}
        <button class="btn btn-block mt2" type="submit">Register for the free class</button>
        <p class="small mt2 mb0">Free. No payment, no account.</p>
      </form>
    </div>
  </div>
</section>
</main>
""" + footer(R, bar=False, extra_js=f'<script src="{R}assets/js/pages.js?v={VER}"></script>')

def thanks_class():
    R = "../../"
    return head("You're in! | Chada Tech", "You're registered for the free Chada Tech class.", "thanks/class/", R, noindex=True) + '<body data-page="thanks-class">\n' + header(R) + f"""
<main id="main">
<section class="section">
  <div class="wrap narrow center">
    <div class="tick">{CHECK_SVG}</div>
    <h1>You're in!</h1>
    <p class="lead"><span data-c="freeClass.dateLabel">Saturday 28 November 2026</span>, <span data-c="freeClass.timeLabel"></span>, on Google Meet.</p>
    <div class="btns" style="justify-content:center">
      <a class="btn" href="#" data-c-href="whatsappCommunityLink" target="_blank" rel="noopener" id="wa-community">Join the WhatsApp community</a>
      <a class="btn btn-ghost" href="#" id="gcal" target="_blank" rel="noopener">Add to Google Calendar</a>
      <button class="btn btn-ghost" type="button" id="ics">Download calendar file (.ics)</button>
    </div>
    <div class="details-card" style="text-align:left">
      <p id="meet-line" class="mb0">We'll send the class link in the WhatsApp community and to your WhatsApp on the day.</p>
    </div>
    <p class="notice" data-if-set="businessWhatsapp">Save our number <strong data-c="businessWhatsapp"></strong> so you don't miss the link.</p>
    <p class="mt2"><strong>While you wait:</strong> <a href="{R}reply-kit/">get your free Customer Reply Kit</a>.</p>
  </div>
</section>
</main>
""" + footer(R, bar=False, extra_js=f'<script src="{R}assets/js/pages.js?v={VER}"></script>')

# ------------------------------------------------------------------ INNER CIRCLE
def inner_circle():
    R = "../"
    return head("The Inner Circle | Chada Tech", "The Inner Circle: one useful AI skill every Saturday, live. Business track open now; founding cohort starts 5 December.", "inner-circle/", R, og_title="The Inner Circle: one useful AI skill every Saturday, live", og_desc="Live classes every Saturday on Google Meet. Founding cohort starts Sat 5 Dec.") + '<body class="has-bar" data-page="inner-circle">\n' + header(R) + f"""
<main id="main">
<section class="hero bg-navy">
  <img class="wm" src="{R}assets/img/chada-tech-icon-white.svg" alt="" aria-hidden="true">
  <div class="wrap" style="position:relative">
    <span class="label">The Inner Circle</span>
    <h1>The Inner Circle: one useful AI skill <span class="hl">every Saturday</span>, live.</h1>
    <p class="sub">Paid once every 3 months. Founding cohort starts <span data-c="cohortStartLabel">Saturday 5 December 2026</span>.</p>
    <span class="places hidden" data-places></span>
    {TRACKS_HTML(R)}
  </div>
</section>

<section class="section">
  <div class="wrap">
    <span class="label">What Business members get</span>
    <h2>Every week, something that works on your phone.</h2>
    <div class="grid grid-3 mt2">
      <div class="card"><h3>Live class every Saturday</h3><p>50 minutes on Google Meet, with live screen share.</p></div>
      <div class="card"><h3>The recording</h3><p>Watch again any time, or catch up if you miss a class.</p></div>
      <div class="card"><h3>A short handout</h3><p>The steps from each class, written down.</p></div>
      <div class="card"><h3>One practical task</h3><p>Posted in the members' WhatsApp group after every class.</p></div>
      <div class="card"><h3>Your Customer Reply Kit</h3><p>Set up with you in Week 1.</p></div>
      <div class="card"><h3>Monthly AI update</h3><p>New free tools worth knowing, explained simply.</p></div>
    </div>
  </div>
</section>

<section class="section bg-grey">
  <div class="wrap">
    <span class="label">Curriculum</span>
    <h2>The 4-week starter course</h2>
    {CURRICULUM_HTML}
  </div>
</section>

<section class="section">
  <div class="wrap narrow">
    <span class="label">Founding offer</span>
    <h2>The first <span data-c="foundingPlaces">10</span> Business members keep today's price.</h2>
    <p>Join as one of the first <span data-c="foundingPlaces">10</span> Business members and you keep today's price at every renewal, plus a "Founding Member" badge.</p>
    <span class="places on-white hidden" data-places></span>
    <h2 class="mt2" style="font-size:1.5rem">Refund</h2>
    <p>Full refund if you ask within <span data-c="refundDays">7</span> days of your first class. <a href="{R}refund/">Read the refund policy</a>.</p>
    <h2 class="mt2" style="font-size:1.5rem">Questions</h2>
    <details><summary>How do I pay?</summary><p>Through our official Paystack page: card, bank transfer or USSD. Never into a personal account.</p></details>
    <details><summary>How long is membership?</summary><p>3 months per payment.</p></details>
    <details><summary>What do I need?</summary><p>A phone and data. A laptop is optional.</p></details>
    <details><summary>What if I miss a class?</summary><p>Watch the recording and ask questions in the members' group.</p></details>
    <details><summary>I'm new to AI. Is that okay?</summary><p>Yes. We start from zero.</p></details>
    <div class="btns"><a class="btn" href="{R}join/?track=business">Join the Business track</a><a class="btn btn-ghost" href="{R}free-class/">Try the free class first</a></div>
  </div>
</section>
</main>
""" + footer(R, extra_js=f'<script src="{R}assets/js/pages.js?v={VER}"></script>')

def join():
    R = "../"
    return head("Join the Inner Circle | Chada Tech", "Join the Chada Tech Inner Circle.", "join/", R) + '<body data-page="join">\n' + header(R) + f"""
<main id="main">
<section class="section bg-grey" style="padding-top:40px">
  <div class="wrap" style="max-width:640px">
    <a href="{R}inner-circle/" class="small">← All tracks</a>
    <h1 class="mt2" id="join-title">Join the Business track</h1>
    <p class="lead" id="join-sub"></p>
    <form class="form-card" id="join-form" novalidate>
      <div class="form-alert" role="alert"></div>
      <div class="field"><label for="full_name">Full name</label><input id="full_name" name="full_name" type="text" autocomplete="name" maxlength="80" required><div class="err-msg">Please enter your name.</div></div>
      {PHONE_FIELD}
      <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" maxlength="120" required><div class="err-msg">Please enter a valid email (Paystack needs it for your receipt).</div></div>
      <div class="field"><label for="what_they_do">What do you sell or do?</label><input id="what_they_do" name="what_they_do" type="text" maxlength="120" placeholder="e.g. fashion, food, skincare" required><div class="err-msg">Tell us what you sell or do.</div></div>
      <div class="field hidden" id="proof-field"><label for="proof">Proof of studentship</label><input id="proof" name="proof" type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"><div class="hint">Student ID or admission letter. JPG, PNG or PDF, max 5 MB. Kept private and deleted 30 days after we check it.</div><div class="err-msg">Please add a JPG, PNG or PDF under 5 MB.</div></div>
      {consent(R)}
      {HONEYPOT}
      <button class="btn btn-block mt2" type="submit" id="join-btn">Continue to payment</button>
      <p class="small mt2 mb0" id="join-note">Next, you'll pay securely on our official Paystack page (card, bank transfer or USSD).</p>
    </form>
  </div>
</section>
</main>
""" + footer(R, bar=False, extra_js=f'<script src="{R}assets/js/pages.js?v={VER}"></script>')

def thanks_join():
    R = "../../"
    return head("Thank you | Chada Tech", "Thank you for joining the Chada Tech Inner Circle.", "thanks/join/", R, noindex=True) + '<body data-page="thanks-join">\n' + header(R) + f"""
<main id="main">
<section class="section">
  <div class="wrap narrow center">
    <div class="tick">{CHECK_SVG}</div>
    <div id="paid-msg">
      <h1>Thank you!</h1>
      <p class="lead">Payment received? We'll add you to the members' WhatsApp group within 12 hours.</p>
    </div>
    <div id="wait-msg" class="hidden">
      <h1>You're on the list.</h1>
      <p class="lead">We'll message you on WhatsApp when your track opens.</p>
    </div>
    <p data-if-set="businessWhatsapp">Questions: <a href="#" data-c-href="businessWhatsappIntl" target="_blank" rel="noopener"><span data-c="businessWhatsapp"></span></a></p>
    <div class="btns" style="justify-content:center">
      <a class="btn" href="{R}reply-kit/">Get your free Customer Reply Kit</a>
      <a class="btn btn-ghost" href="#" data-c-href="whatsappCommunityLink" target="_blank" rel="noopener">Join the WhatsApp community</a>
    </div>
  </div>
</section>
</main>
""" + footer(R, bar=False, extra_js=f'<script src="{R}assets/js/pages.js?v={VER}"></script>')

# ------------------------------------------------------------------ REPLY KIT
def reply_kit():
    R = "../"
    q = lambda n: f'<div class="kit-step" data-step="{n}">'
    return head("Free Customer Reply Kit | Chada Tech", "Answer 6 questions. Get ready-to-send WhatsApp replies for your customers, free.", "reply-kit/", R, og_title="Free Customer Reply Kit: your WhatsApp replies, ready in 2 minutes", og_desc="Answer 6 questions. Get ready-to-send replies for your customers, free.") + '<body data-page="reply-kit">\n' + header(R) + f"""
<main id="main">
<section class="section bg-grey" style="padding-top:40px">
  <div class="kit-shell wrap" style="padding:0 20px">
    <div id="kit-intro">
      <span class="label">Free Customer Reply Kit</span>
      <h1>Reply faster, sound professional, and stop typing the same answers every day.</h1>
      <p class="lead">Answer 6 short questions (about 2 minutes). Get ready-to-send WhatsApp replies in your tone, plus greeting and away messages, a business description, a payment message, a delivery policy and your own order link.</p>
      <button class="btn" id="kit-start">Start: it's free</button>
      <p class="small mt2">Works on weak data. Your bank details never leave your phone.</p>
    </div>

    <form id="kit-form" class="form-card hidden" novalidate autocomplete="on">
      <div class="progress"><span id="kit-prog"></span></div>
      <div class="step-count" id="kit-count">Question 1 of 6</div>

      {q(1)}<h2 style="font-size:1.4rem">Your business</h2>
        <div class="field"><label for="k_biz">Business name</label><input id="k_biz" name="biz" type="text" maxlength="80" placeholder="e.g. Ada's Fabrics" required><div class="err-msg">Add your business name.</div></div>
        <div class="field"><label for="k_item">What do you sell?</label><input id="k_item" name="item" type="text" maxlength="120" placeholder="ready-to-wear dresses" required><div class="hint">Write it as you'd say it in a sentence: "Our ready-to-wear dresses cost…"</div><div class="err-msg">Tell us what you sell.</div></div>
      </div>
      {q(2)}<h2 style="font-size:1.4rem">Who buys from you</h2>
        <div class="field"><label for="k_buyers">Your customers</label><input id="k_buyers" name="buyers" type="text" maxlength="120" placeholder="working women in Lagos" required><div class="err-msg">Describe who buys from you.</div></div>
      </div>
      {q(3)}<h2 style="font-size:1.4rem">Your prices</h2>
        <div class="row2">
          <div class="field"><label for="k_min">Lowest price (₦)</label><input id="k_min" name="min" type="text" inputmode="numeric" placeholder="5,000" required><div class="err-msg">Add your lowest price.</div></div>
          <div class="field"><label for="k_max">Highest (₦) <span class="opt">optional</span></label><input id="k_max" name="max" type="text" inputmode="numeric" placeholder="25,000"></div>
        </div>
      </div>
      {q(4)}<h2 style="font-size:1.4rem">Delivery</h2>
        <div class="field"><label for="k_city">Your city</label><input id="k_city" name="city" type="text" maxlength="60" placeholder="Lagos" required><div class="err-msg">Add your city.</div></div>
        <div class="row2">
          <div class="field"><label for="k_fee_city">City fee (₦)</label><input id="k_fee_city" name="fee_city" type="text" inputmode="numeric" placeholder="2,000" required><div class="err-msg">Add a fee.</div></div>
          <div class="field"><label for="k_time_city">City time</label><input id="k_time_city" name="time_city" type="text" placeholder="1 to 2 days" required><div class="err-msg">Add a time.</div></div>
        </div>
        <span class="legend">Do you deliver outside your city?</span>
        <div class="choice-grid" style="margin-bottom:16px">
          <label class="choice"><input type="radio" name="out" value="yes" checked> Yes</label>
          <label class="choice"><input type="radio" name="out" value="no"> No</label>
        </div>
        <div class="row2" id="out-fields">
          <div class="field"><label for="k_time_other">Time outside</label><input id="k_time_other" name="time_other" type="text" placeholder="2 to 4 days"><div class="err-msg">Add a time.</div></div>
          <div class="field"><label for="k_fee_other">Fee from (₦)</label><input id="k_fee_other" name="fee_other" type="text" inputmode="numeric" placeholder="4,500"><div class="err-msg">Add a fee.</div></div>
        </div>
      </div>
      {q(5)}<h2 style="font-size:1.4rem">Payment and hours</h2>
        <span class="legend">How can customers pay?</span>
        <div class="choice-grid field" id="pay-field">
          <label class="choice"><input type="checkbox" name="pay" value="bank transfer" checked> Bank transfer</label>
          <label class="choice"><input type="checkbox" name="pay" value="payment link"> Payment link (Paystack or similar)</label>
          <label class="choice"><input type="checkbox" name="pay" value="POS on delivery"> POS on delivery</label>
          <label class="choice"><input type="checkbox" name="pay" value="pay on pickup"> Pay on pickup</label>
          <div class="err-msg" style="grid-column:1/-1">Tick at least one.</div>
        </div>
        <div class="field"><label for="k_hours">Opening hours</label><input id="k_hours" name="hours" type="text" value="8am to 8pm, Monday to Saturday"></div>
        <details style="background:var(--grey)"><summary>Add bank details (optional)</summary>
          <p class="small">Kept on this phone only. Never sent or saved anywhere.</p>
          <div class="field"><label for="k_bank">Bank name</label><input id="k_bank" name="bank_name" type="text" autocomplete="off" data-local></div>
          <div class="field"><label for="k_acct">Account number</label><input id="k_acct" name="acct_no" type="text" inputmode="numeric" autocomplete="off" data-local></div>
          <div class="field"><label for="k_acctname">Account name</label><input id="k_acctname" name="acct_name" type="text" autocomplete="off" data-local></div>
        </details>
      </div>
      {q(6)}<h2 style="font-size:1.4rem">Your tone</h2>
        <div class="choice-grid" style="grid-template-columns:1fr;margin-bottom:16px">
          <label class="choice"><input type="radio" name="tone" value="friendly" checked> <span><strong>Friendly</strong> · warm, with a smile 😊</span></label>
          <label class="choice"><input type="radio" name="tone" value="professional"> <span><strong>Professional</strong> · polite and formal</span></label>
          <label class="choice"><input type="radio" name="tone" value="casual"> <span><strong>Casual</strong> · relaxed, a little Pidgin</span></label>
        </div>
        <label class="check"><input type="checkbox" name="original"> <span>I sell original branded items</span></label>
      </div>

      <div class="kit-nav">
        <button type="button" class="btn btn-ghost" id="kit-back">Back</button>
        <button type="submit" class="btn" id="kit-next">Next</button>
      </div>
    </form>

    <div id="kit-results" class="hidden">
      <span class="label">Your Customer Reply Kit</span>
      <h1 style="font-size:clamp(1.7rem,6vw,2.4rem)" id="res-title">Your replies are ready</h1>
      <div class="seg" role="group" aria-label="Tone">
        <button type="button" data-tone="friendly">Friendly</button>
        <button type="button" data-tone="professional">Professional</button>
        <button type="button" data-tone="casual">Casual</button>
      </div>

      <div id="preview" class="mt2"></div>

      <form id="unlock-form" class="lock-card hidden" novalidate>
        <h3>Unlock your full kit, free</h3>
        <p style="color:#D6E2F5">7 more replies, greeting and away messages, your business description, payment message, delivery policy and your own order link.</p>
        <div class="form-alert" role="alert"></div>
        <div class="field"><label for="u_first">First name</label><input id="u_first" name="first_name" type="text" maxlength="60" autocomplete="given-name" required><div class="err-msg">Add your first name.</div></div>
        <div class="field"><label for="whatsapp">WhatsApp number</label><input id="whatsapp" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="0801 234 5678" required><div class="err-msg">Enter a Nigerian WhatsApp number, e.g. 0801 234 5678.</div></div>
        {consent(R)}
        {HONEYPOT}
        <button class="btn btn-block btn-white" type="submit">Show my full kit</button>
      </form>

      <div id="full" class="hidden">
        <div class="tabs" role="tablist">
          <button type="button" class="on" data-tab="replies">Replies</button>
          <button type="button" data-tab="profile">Profile and messages</button>
          <button type="button" data-tab="policy">Policy</button>
        </div>
        <div class="tabpane on" id="tab-replies"></div>
        <div class="tabpane" id="tab-profile"></div>
        <div class="tabpane" id="tab-policy">
          <p class="small">An example. Change any rule to match how you really work, then copy.</p>
          <textarea id="policy-text" rows="12" style="min-height:300px"></textarea>
          <button type="button" class="copy-btn" id="policy-copy">Copy policy</button>
        </div>

        <div class="btns">
          <button type="button" class="btn" id="copy-all">Copy all</button>
          <a class="btn btn-ghost" id="send-wa" href="#" target="_blank" rel="noopener">Send to my WhatsApp</a>
          <button type="button" class="btn btn-ghost" id="sound-me">Make it sound more like me</button>
        </div>
        <p class="small mt2" id="sound-note">Copies a ready prompt with your replies, then opens ChatGPT. Paste it in, add 3 messages you've sent customers before, and you're done.</p>

        <div class="howto">
          <h3>How to save these in WhatsApp Business</h3>
          <ol>
            <li>Open WhatsApp Business → <strong>Settings</strong> → <strong>Business tools</strong>.</li>
            <li><strong>Quick replies:</strong> tap +, paste a reply and use the shortcut shown (e.g. <span class="shortcut">/price</span>). In a chat, type / to use it.</li>
            <li><strong>Greeting message</strong> and <strong>Away message</strong>: paste the messages from the Profile tab.</li>
            <li><strong>Business profile:</strong> paste your business description.</li>
            <li><strong>Catalog:</strong> add each product with a short description.</li>
          </ol>
        </div>

        <div class="cta-card">
          <h3>Want us to set this up with you, live?</h3>
          <p style="color:#D6E2F5">Join the Inner Circle: Class 1 is <strong style="color:#fff">Put your WhatsApp on autopilot</strong>.</p>
          <div class="btns"><a class="btn btn-white" href="{R}inner-circle/" id="cta-ic">Join the Inner Circle</a><a class="btn btn-ghost" href="{R}free-class/">Join the free class</a></div>
        </div>
        <p class="center mt2"><button type="button" class="copy-btn" id="kit-restart">Start again with new answers</button></p>
      </div>
    </div>
  </div>
</section>
</main>
""" + footer(R, bar=False, extra_js=f'<script src="{R}assets/js/replykit.js?v={VER}"></script>')

# ------------------------------------------------------------------ PRIVACY / REFUND
def privacy():
    R = "../"
    return head("Privacy notice | Chada Tech", "How Chada Tech collects and uses your personal data.", "privacy/", R) + '<body data-page="privacy">\n' + header(R) + f"""
<main id="main">
<section class="section">
  <div class="wrap narrow prose">
    <span class="label">Privacy notice</span>
    <h1>How we use your details</h1>
    <p class="small">Last updated 25 November 2026. This notice follows the Nigeria Data Protection Act 2023 (NDPA), and the EU GDPR where it applies to you.</p>
    <h2>1. Who we are</h2>
    <p>Chada Tech (the Chada Tech Community, part of Chada Digital), Nigeria.<span data-if-set="contactEmail"> Contact: <a href="#" data-c-href="contactEmail"><span data-c="contactEmail"></span></a>.</span></p>
    <h2>2. What we collect</h2>
    <ul>
      <li>Your name, WhatsApp number and email.</li>
      <li>What you sell or do, and how you heard about us.</li>
      <li>For the Student track: a proof of studentship (student ID or admission letter).</li>
      <li>For the Reply Kit: your first name, WhatsApp number, business name, what you sell, city and chosen tone. <strong>The bank details you type into the Reply Kit never leave your phone.</strong> We never see or store them.</li>
    </ul>
    <h2>3. Why we use it (and our legal basis)</h2>
    <ul>
      <li>To register you for a class, process your payment and add you to classes and groups (to carry out what you asked for, and your consent).</li>
      <li>To send free AI tips and class updates on WhatsApp, <strong>only if you ticked the box</strong> to agree. Reply STOP any time to stop them.</li>
    </ul>
    <h2>4. Who processes it for us</h2>
    <p>Supabase (our database), Paystack (payments) and our website host. They process data only on our instructions. Some of these providers may store data outside Nigeria, with safeguards required by law. <strong>We never sell your data.</strong></p>
    <h2>5. How long we keep it</h2>
    <ul>
      <li>Free class and Reply Kit sign-ups: 12 months.</li>
      <li>Member and payment records: <span data-c="memberRecordsRetention">as long as the law requires</span>.</li>
      <li>Student proofs: deleted 30 days after we check them.</li>
    </ul>
    <h2>6. Your rights</h2>
    <p>You can ask to see, correct or delete your data, object to how we use it, or withdraw your consent at any time. <span data-if-set="businessWhatsapp">Message us on WhatsApp at <a href="#" data-c-href="businessWhatsappIntl"><span data-c="businessWhatsapp"></span></a>. </span><span data-if-set="contactEmail">Email <a href="#" data-c-href="contactEmail"><span data-c="contactEmail"></span></a>. </span><span data-if-missing="businessWhatsapp">Send us a message on any of our social pages or in the WhatsApp community. </span>You can also complain to the Nigeria Data Protection Commission (NDPC).</p>
    <h2>7. Security</h2>
    <p>Our database only lets visitors add a registration. Only signed-in Chada Tech team admins can read it. Student proofs are stored in a private folder.</p>
    <h2>8. Cookies and analytics</h2>
    <p>We use a privacy-friendly visit counter to see which pages and posts bring visitors. The Reply Kit remembers on your own device that you've unlocked it, so you don't fill the form again.</p>
  </div>
</section>
</main>
""" + footer(R, bar=False)

def refund():
    R = "../"
    return head("Refund policy | Chada Tech", "Chada Tech Inner Circle refund policy.", "refund/", R) + '<body data-page="refund">\n' + header(R) + f"""
<main id="main">
<section class="section">
  <div class="wrap narrow prose">
    <span class="label">Refund policy</span>
    <h1>Full refund within <span data-c="refundDays">7</span> days of your first class</h1>
    <p>If the Inner Circle isn't right for you, ask for a refund within <span data-c="refundDays">7</span> days of your first class and we'll refund you in full.</p>
    <h2>How to ask</h2>
    <ol>
      <li>Message us on WhatsApp<span data-if-set="businessWhatsapp"> at <a href="#" data-c-href="businessWhatsappIntl"><span data-c="businessWhatsapp"></span></a></span> with your name and your Paystack payment reference.</li>
      <li>We confirm within 2 working days.</li>
      <li>Refunds go back through Paystack to the card or account you paid with, within 5 to 10 working days.</li>
    </ol>
    <h2>Good to know</h2>
    <ul>
      <li>Membership runs for 3 months per payment.</li>
      <li>After the <span data-c="refundDays">7</span>-day window, your membership continues until the end of the 3 months you paid for.</li>
      <li>We only ever take payment through our official Paystack page. If anyone asks you to pay into a personal account for Chada Tech, don't. Tell us.</li>
    </ul>
  </div>
</section>
</main>
""" + footer(R, bar=False)

# ------------------------------------------------------------------ ADMIN
def admin():
    R = "../"
    return head("Admin | Chada Tech", "Chada Tech team admin.", "admin/", R, noindex=True) + '<body data-page="admin" class="admin">\n' + f"""
<header class="site-header"><div class="wrap"><a class="logo" href="{R}"><img src="{R}assets/img/chada-tech-logo-horizontal-navy.svg" alt="Chada Tech" width="145" height="40"></a><span class="small">Team admin</span></div></header>
<main id="main" class="section" style="padding-top:32px">
  <div class="wrap" style="max-width:1300px">
    <div id="signin" class="form-card hidden" style="max-width:480px;margin:0 auto">
      <h1 style="font-size:1.6rem">Team sign in</h1>
      <p class="small">We'll email you a sign-in link. Only emails in the admins list can see data.</p>
      <div class="form-alert" role="alert"></div>
      <div class="field"><label for="a_email">Email</label><input id="a_email" type="email" autocomplete="email"></div>
      <button class="btn btn-block" id="a_send">Email me a sign-in link</button>
    </div>

    <div id="dash" class="hidden">
      <div class="admin-bar" style="justify-content:space-between">
        <h1 style="font-size:1.6rem;margin:0">Registrations</h1>
        <span class="small"><span id="who"></span> · <a href="#" id="signout">Sign out</a></span>
      </div>
      <div class="tabs">
        <button class="on" data-at="class_registrations">Class registrations <span class="pill" id="n-class_registrations">0</span></button>
        <button data-at="memberships">Inner Circle <span class="pill" id="n-memberships">0</span></button>
        <button data-at="reply_kit_leads">Reply Kit leads <span class="pill" id="n-reply_kit_leads">0</span></button>
      </div>
      <div class="admin-bar">
        <input type="text" id="search" placeholder="Search name, number, business…">
        <select id="filter" style="max-width:220px;min-height:44px;padding:8px 12px"></select>
        <label class="check mb0" style="margin:0"><input type="checkbox" id="only-updates"> Only opted in to updates</label>
        <button class="btn btn-sm" id="export">Export CSV</button>
        <button class="btn btn-sm btn-ghost" id="copy-nums">Copy WhatsApp numbers</button>
        <button class="btn btn-sm btn-ghost" id="refresh">Refresh</button>
      </div>
      <div class="form-alert" id="dash-alert"></div>
      <div class="table-wrap"><table id="tbl"></table></div>
      <p class="small mt2">"Copy WhatsApp numbers" copies the numbers of the rows shown. Tick "Only opted in to updates" before copying numbers for a broadcast.</p>
    </div>
  </div>
</main>
<script src="{R}assets/js/config.js?v={VER}"></script>
<script src="{R}assets/js/app.js?v={VER}"></script>
<script src="{R}assets/js/vendor/supabase.js"></script>
<script src="{R}assets/js/admin.js?v={VER}"></script>
</body></html>
"""

def notfound():
    R = "/"  # 404 is served at any depth; absolute to site root (fix if hosted in a sub-folder)
    R = SITE_URL + "/"
    return head("Page not found | Chada Tech", "Page not found.", "404.html", R, noindex=True) + '<body data-page="404">\n' + header(R) + f"""
<main id="main"><section class="section"><div class="wrap narrow center">
<h1>We can't find that page.</h1><p class="lead">The link may be old. Try one of these:</p>
<div class="btns" style="justify-content:center"><a class="btn" href="{R}free-class/">Join the free class</a><a class="btn btn-ghost" href="{R}reply-kit/">Free Reply Kit</a><a class="btn btn-ghost" href="{R or './'}">Home</a></div>
</div></section></main>
""" + footer(R, bar=False)

if __name__ == "__main__":
    page("index.html", home())
    page("free-class/index.html", free_class())
    page("thanks/class/index.html", thanks_class())
    page("inner-circle/index.html", inner_circle())
    page("join/index.html", join())
    page("thanks/join/index.html", thanks_join())
    page("reply-kit/index.html", reply_kit())
    page("privacy/index.html", privacy())
    page("refund/index.html", refund())
    page("admin/index.html", admin())
    page("404.html", notfound())
    print("Built pages for", SITE_URL)
