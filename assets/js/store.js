/* Chada Tech store: catalogue, book pages, My library, checkout (Paystack) and downloads. */
(function () {
  "use strict";
  var C = window.CHADA, CT = window.CT, K = window.CATALOGUE, R = CT.root;
  var page = document.body.getAttribute("data-page");
  var $ = function (id) { return document.getElementById(id); };
  var esc = CT.esc;
  var bySlug = {}; K.books.forEach(function (b) { bySlug[b.slug] = b; }); K.bundles.forEach(function (b) { bySlug[b.slug] = b; });
  var colName = {}; K.collections.forEach(function (c) { colName[c.id] = c.name; });
  var status = {};           // slug -> {status, file_path} from the database
  var owned = {};            // slug -> true
  var member = false, interest = {}, signedIn = false;

  /* ---------- covers (drawn in CSS, no image downloads) ---------- */
  CT.cover = function (b, cls) {
    var label = b.items ? "Bundle · " + b.items.length + " ebooks" : (colName[b.collection] || "Free ebook");
    return '<div class="cover ' + (cls || "") + ' c-' + (b.collection || (b.items ? "bundle" : "free")) + '" aria-hidden="true">' +
      '<span class="cover-label">' + esc(label) + '</span><span class="cover-title">' + esc(b.title) + '</span>' +
      '<span class="cover-brand"><img src="' + R + 'assets/img/chada-tech-icon-white.svg" alt="" width="18" height="18">Chada Tech</span></div>';
  };
  function price(b) { return CT.naira(b.price); }
  function isLive(slug) { return status[slug] && status[slug].status === "live"; }

  /* ---------- data from the database ---------- */
  function loadStatus() {
    if (!CT.sbReady()) return Promise.resolve();
    return fetch(C.supabaseUrl + "/rest/v1/products?select=slug,status,file_path", { headers: { apikey: C.supabaseAnonKey } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) { rows.forEach(function (r) { status[r.slug] = r; }); })
      .catch(function () {});
  }
  function loadMine() {
    if (!CT.hasSession()) return Promise.resolve(null);
    return CT.sb().then(function (sb) {
      return sb.auth.getSession().then(function (s) {
        if (!s.data.session) return null;
        var u = s.data.session.user; signedIn = true;
        return Promise.all([
          sb.from("purchases").select("product_slug,created_at,amount_kobo,reference").eq("status", "paid"),
          sb.rpc("is_member"),
          sb.from("book_interest").select("product_slug"),
          sb.from("profiles").select("full_name,whatsapp").eq("id", u.id).maybeSingle()
        ]).then(function (res) {
          (res[0].data || []).forEach(function (p) {
            owned[p.product_slug] = true;
            var b = bySlug[p.product_slug]; if (b && b.items) b.items.forEach(function (s) { owned[s] = true; });
          });
          member = !!res[1].data;
          (res[2].data || []).forEach(function (i) { interest[i.product_slug] = true; });
          return { user: u, profile: res[3].data, purchases: res[0].data || [] };
        });
      });
    });
  }
  function ownsBook(slug) { return signedIn && (member || owned[slug] || slug === K.free.slug); }

  /* ---------- actions ---------- */
  function notice(el, text, ok) { if (!el) return alert(text); el.className = "form-alert " + (ok ? "success" : "error"); el.textContent = text; }

  CT.download = function (slug, btn) {
    CT.requireAccount("Create a free account to download your ebook.", function () {
      var label = btn ? btn.textContent : ""; if (btn) { btn.disabled = true; btn.textContent = "Preparing…"; }
      CT.sb().then(function (sb) {
        return sb.from("products").select("file_path,title").eq("slug", slug).maybeSingle().then(function (r) {
          if (!r.data || !r.data.file_path) throw new Error("nofile");
          return sb.storage.from("ebooks").createSignedUrl(r.data.file_path, 3600, { download: r.data.file_path.split("/").pop() });
        });
      }).then(function (r) {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        if (r.error || !r.data) throw new Error("denied");
        CT.track("ebook_download", { slug: slug });
        location.href = r.data.signedUrl;
      }).catch(function (e) {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        alert(e.message === "nofile" ? "This ebook isn't ready to download yet. We'll message you when it is." : "We couldn't open your download. Please sign in again and retry.");
      });
    });
  };

  CT.notify = function (slug, btn) {
    CT.requireAccount("Create a free account and we'll tell you the moment this ebook is out.", function () {
      CT.sb().then(function (sb) { return sb.auth.getUser().then(function (u) { return sb.from("book_interest").upsert({ user_id: u.data.user.id, product_slug: slug }, { onConflict: "user_id,product_slug", ignoreDuplicates: true }); }); })
        .then(function (r) {
          if (r.error) return alert("Couldn't save that. Please try again.");
          interest[slug] = true; CT.track("ebook_notify", { slug: slug });
          if (btn) { btn.textContent = "We'll let you know ✓"; btn.disabled = true; }
        });
    });
  };

  var payScript = null;
  function loadPaystack() {
    if (payScript) return payScript;
    payScript = new Promise(function (res, rej) { var s = document.createElement("script"); s.src = "https://js.paystack.co/v2/inline.js"; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    return payScript;
  }
  function callCheckout(body) {
    return CT.sb().then(function (sb) { return sb.auth.getSession(); }).then(function (s) {
      var t = s.data.session && s.data.session.access_token;
      if (!t) throw new Error("signin");
      return fetch(C.supabaseUrl + "/functions/v1/checkout", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + t, apikey: C.supabaseAnonKey }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().then(function (j) { j._status = r.status; return j; }); });
    });
  }
  function verify(ref, slug, box) {
    notice(box, "Confirming your payment…", true);
    return callCheckout({ action: "verify", reference: ref }).then(function (j) {
      if (j.ok) {
        CT.track("ebook_purchase", { slug: slug });
        notice(box, "Payment received. Your ebook is in your library now.", true);
        setTimeout(function () { location.href = R + "account/?bought=" + encodeURIComponent(slug); }, 1200);
      } else notice(box, "We couldn't confirm the payment yet. If you were charged, it will show in your library within a few minutes, or message us on WhatsApp.");
    });
  }
  CT.buy = function (slug, btn, box) {
    var b = bySlug[slug];
    CT.requireAccount("Create a free account to buy <strong>" + esc(b.title) + "</strong>. Your ebooks are saved to your library.", function () {
      var label = btn.textContent; btn.disabled = true; btn.textContent = "Opening payment…";
      var back = new URL(location.href); back.search = "";
      callCheckout({ action: "init", slug: slug, callback_url: back.href }).then(function (j) {
        btn.disabled = false; btn.textContent = label;
        if (j.error === "already_owned") return notice(box, "You already own this ebook. It's in your library.", true);
        if (j.error === "payments_not_ready") return notice(box, "Payments open very soon. Tap \"Notify me\" and we'll message you.", false);
        if (j.error === "not_available") return notice(box, "This ebook isn't on sale yet.", false);
        if (!j.access_code) return notice(box, "Payment couldn't start. Please try again in a moment.", false);
        CT.track("checkout_started", { slug: slug });
        return loadPaystack().then(function () {
          var pop = new window.PaystackPop();
          pop.resumeTransaction(j.access_code, {
            onSuccess: function (tx) { verify(tx.reference || j.reference, slug, box); },
            onCancel: function () { notice(box, "Payment cancelled. You haven't been charged.", false); }
          });
        }).catch(function () { location.href = j.authorization_url; });
      }).catch(function (e) {
        btn.disabled = false; btn.textContent = label;
        if (e.message === "signin") return CT.openAuth("in");
        notice(box, "Couldn't connect. Check your data and try again.", false);
      });
    });
  };

  /* ---------- buttons for one product ---------- */
  function actions(b) {
    var slug = b.slug, isBundle = !!b.items;
    if (slug === K.free.slug && !signedIn) return '<button class="btn" data-dl="' + slug + '">Get it free</button>';
    if (!isBundle && ownsBook(slug)) {
      return isLive(slug) || slug === K.free.slug
        ? '<button class="btn" data-dl="' + slug + '">Download</button>'
        : '<span class="pill paid">In your library · out soon</span>';
    }
    if (isLive(slug)) return '<button class="btn" data-buy="' + slug + '">Buy ' + price(b) + "</button>";
    return interest[slug] ? '<button class="btn btn-ghost" disabled>We\'ll let you know ✓</button>'
                          : '<button class="btn btn-ghost" data-notify="' + slug + '">Notify me when it\'s out</button>';
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-buy],[data-notify],[data-dl]"); if (!t) return;
    var box = t.closest("[data-box]"); box = box ? box.querySelector(".form-alert") : null;
    if (t.hasAttribute("data-buy")) CT.buy(t.getAttribute("data-buy"), t, box);
    if (t.hasAttribute("data-notify")) CT.notify(t.getAttribute("data-notify"), t);
    if (t.hasAttribute("data-dl")) CT.download(t.getAttribute("data-dl"), t);
  });

  function card(b) {
    var live = isLive(b.slug), mine = !b.items && ownsBook(b.slug);
    return '<article class="book" data-box>' +
      '<a href="' + R + "store/" + b.slug + '/" class="book-link">' + CT.cover(b) + "</a>" +
      '<div class="book-body"><a href="' + R + "store/" + b.slug + '/" class="book-title">' + esc(b.title) + "</a>" +
      '<p class="small mt0">' + esc(b.audience || b.subtitle || "") + "</p>" +
      '<div class="book-meta"><strong>' + (b.price ? price(b) : "Free") + "</strong>" +
      (mine ? '<span class="pill paid">Yours</span>' : b.slug === K.free.slug ? '<span class="pill paid">Free</span>' : live ? '<span class="pill paid">Available</span>' : '<span class="pill">Coming soon</span>') + "</div>" +
      '<div class="form-alert" role="status"></div>' + actions(b) + "</div></article>";
  }

  /* ---------- pages ---------- */
  function renderStore() {
    var html = "";
    if (member) html += '<p class="notice">You\'re an Inner Circle member: every ebook is free for you. Open any book to download it.</p>';
    html += '<section class="shelf" id="free"><h2>Start free</h2><div class="books">' + card(Object.assign({ price: 0, audience: K.free.subtitle }, K.free)) + "</div></section>";
    K.collections.forEach(function (c) {
      var list = K.books.filter(function (b) { return b.collection === c.id; }).sort(function (a, b) { return a.wave - b.wave; });
      html += '<section class="shelf" id="' + c.id + '"><h2>' + esc(c.name) + '</h2><div class="books">' + list.map(card).join("") + "</div></section>";
    });
    html += '<section class="shelf" id="bundles"><h2>Bundles</h2><div class="books">' + K.bundles.map(function (b) {
      var full = b.items.reduce(function (s, x) { return s + bySlug[x].price; }, 0);
      b.audience = b.subtitle + " · worth " + CT.naira(full);
      return card(b);
    }).join("") + "</div></section>";
    $("shelves").innerHTML = html;
  }

  function renderBook() {
    var slug = document.body.getAttribute("data-book"), b = bySlug[slug]; if (!b) return;
    $("book-actions").innerHTML = '<div data-box><div class="form-alert" role="status"></div>' + actions(b) + "</div>" +
      (b.items ? "" : (ownsBook(slug) ? "" : '<p class="small mt2">Inner Circle members get every ebook free. <a href="' + R + 'inner-circle/">See the Inner Circle</a></p>'));
    var st = $("book-status");
    if (st) st.innerHTML = ownsBook(slug) && !b.items ? '<span class="pill paid">In your library</span>' : isLive(slug) ? '<span class="pill paid">Available now</span>' : '<span class="pill">Coming soon</span>';
    var q = new URLSearchParams(location.search), ref = q.get("reference") || q.get("trxref");
    if (ref && CT.hasSession()) verify(ref, slug, $("book-actions").querySelector(".form-alert"));
  }

  function renderAccount(me) {
    var out = $("account");
    if (!me) {
      out.innerHTML = '<div class="form-card center" style="max-width:520px;margin:0 auto"><h1 style="font-size:1.8rem">Your Chada Tech account</h1>' +
        '<p>Create a free account to get <strong>The 15-Minute AI Starter</strong> ebook and keep every ebook you buy in one place.</p>' +
        '<div class="btns" style="justify-content:center"><button class="btn" data-a="up">Create free account</button><button class="btn btn-ghost" data-a="in">Sign in</button></div></div>';
      out.querySelectorAll("[data-a]").forEach(function (b) { b.addEventListener("click", function () { CT.openAuth(b.getAttribute("data-a"), null, function () { location.reload(); }); }); });
      return;
    }
    var name = (me.profile && me.profile.full_name) || me.user.email;
    var mine = K.books.filter(function (b) { return ownsBook(b.slug); });
    var wanted = K.books.filter(function (b) { return interest[b.slug] && !ownsBook(b.slug); });
    var q = new URLSearchParams(location.search);
    var html = '<div class="admin-bar" style="justify-content:space-between"><div><span class="label">My library</span><h1 style="font-size:clamp(1.6rem,6vw,2.2rem);margin:0">Hi, ' + esc(name.split(" ")[0]) + "</h1></div>" +
      '<button class="btn btn-sm btn-ghost" id="signout">Sign out</button></div>';
    if (q.get("welcome")) html += '<p class="notice">Your account is ready. Your free ebook is below.</p>';
    if (q.get("bought")) html += '<p class="notice">Thank you for your purchase! Your ebook is in your library.</p>';
    if (member) html += '<p class="notice"><strong>Inner Circle member:</strong> every ebook is free for you, including new ones as they come out.</p>';
    html += '<h2 class="mt2" style="font-size:1.3rem">Your free ebook</h2><div class="books">' + card(Object.assign({ price: 0, audience: K.free.subtitle }, K.free)) + "</div>";
    html += '<h2 class="mt2" style="font-size:1.3rem">Your ebooks</h2>';
    html += (member ? "" : mine.length ? '<div class="books">' + mine.map(card).join("") + "</div>" : '<p>No ebooks yet. <a href="' + R + 'store/">Browse the store</a></p>');
    if (member) html += '<p><a class="btn" href="' + R + 'store/">Open the store</a></p>';
    if (wanted.length) html += '<h2 class="mt2" style="font-size:1.3rem">We\'ll tell you when these are out</h2><div class="books">' + wanted.map(card).join("") + "</div>";
    html += '<p class="small mt2">Signed in as ' + esc(me.user.email) + (me.profile && me.profile.whatsapp ? " · WhatsApp " + esc(me.profile.whatsapp) : "") +
      '. To change your details or delete your account, message us on WhatsApp or see the <a href="' + R + 'privacy/">Privacy notice</a>.</p>';
    out.innerHTML = html;
    $("signout").addEventListener("click", function () { CT.sb().then(function (sb) { return sb.auth.signOut(); }).then(function () { location.href = R; }); });
  }

  function passwordReset() {
    CT.sb().then(function (sb) {
      var out = $("account");
      out.innerHTML = '<form class="form-card" id="pw-form" style="max-width:480px;margin:0 auto" novalidate><h1 style="font-size:1.6rem">Set a new password</h1><div class="form-alert"></div>' +
        '<div class="field"><label for="npw">New password</label><input id="npw" type="password" autocomplete="new-password" minlength="8"></div><button class="btn btn-block" type="submit">Save password</button></form>';
      $("pw-form").addEventListener("submit", function (e) {
        e.preventDefault(); var a = $("pw-form").querySelector(".form-alert"), v = $("npw").value;
        if (v.length < 8) return notice(a, "Use at least 8 characters.");
        sb.auth.updateUser({ password: v }).then(function (r) { r.error ? notice(a, r.error.message) : (notice(a, "Password saved.", true), setTimeout(function () { location.href = R + "account/"; }, 900)); });
      });
    });
  }

  /* ---------- boot ---------- */
  var isReset = page === "account" && /reset=1/.test(location.search);
  Promise.all([loadStatus(), (page === "account" && /access_token|code=/.test(location.hash + location.search)) ? CT.sb().then(function (sb) { return sb.auth.getSession(); }) : null])
    .then(function () { return isReset ? null : loadMine(); })
    .then(function (me) {
      CT.refreshHeader();
      if (isReset) return passwordReset();
      if (page === "store") renderStore();
      if (page === "book") renderBook();
      if (page === "account") renderAccount(me);
      if (page === "home") renderHomeShelf();
    });

  function renderHomeShelf() {
    var el = $("home-books"); if (!el) return;
    var picks = ["whatsapp-autopilot", "know-your-profit", "content-machine", "win-scholarships"].map(function (s) { return bySlug[s]; });
    el.innerHTML = picks.map(card).join("");
  }
})();
