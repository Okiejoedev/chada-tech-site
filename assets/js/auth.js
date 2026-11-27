/* Chada Tech accounts: welcome card, sign up / sign in modal, header state.
   Supabase is loaded only when needed, so pages stay light. */
(function () {
  "use strict";
  var C = window.CHADA, CT = window.CT;
  var ROOT = (document.querySelector('link[rel="manifest"]') || {}).getAttribute ? document.querySelector('link[rel="manifest"]').getAttribute("href").replace("site.webmanifest", "") : "/";
  CT.root = ROOT;
  var STORE_KEY = "sb-" + (C.supabaseUrl || "").replace(/^https:\/\//, "").split(".")[0] + "-auth-token";

  /* ---------- lazy Supabase client ---------- */
  var clientP = null;
  CT.sb = function () {
    if (clientP) return clientP;
    clientP = new Promise(function (resolve, reject) {
      function make() { resolve(window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })); }
      if (window.supabase && window.supabase.createClient) return make();
      var s = document.createElement("script"); s.src = ROOT + "assets/js/vendor/supabase.js"; s.onload = make; s.onerror = reject; document.head.appendChild(s);
    });
    return clientP;
  };
  CT.hasSession = function () { try { return !!localStorage.getItem(STORE_KEY); } catch (e) { return false; } };
  CT.user = function () { return CT.sb().then(function (sb) { return sb.auth.getSession().then(function (r) { return r.data.session ? r.data.session.user : null; }); }); };

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- modal ---------- */
  var modal;
  function buildModal() {
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "modal hidden"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true"); modal.setAttribute("aria-labelledby", "auth-title");
    modal.innerHTML =
      '<div class="modal-card">' +
      '<button class="modal-x" type="button" aria-label="Close">&times;</button>' +
      '<h2 id="auth-title" style="font-size:1.5rem">Create your free account</h2>' +
      '<p class="small mt0" id="auth-sub">Get <strong>The 15-Minute AI Starter</strong> ebook free, and access to the Chada Tech ebook store.</p>' +
      '<div class="seg" role="tablist" style="margin:16px 0 20px"><button type="button" class="on" data-auth="up">Create account</button><button type="button" data-auth="in">Sign in</button></div>' +
      '<form id="auth-form" novalidate>' +
      '<div class="form-alert" role="alert"></div>' +
      '<div class="field up-only"><label for="a_name">Full name</label><input id="a_name" name="full_name" type="text" autocomplete="name" maxlength="80"><div class="err-msg">Please enter your name.</div></div>' +
      '<div class="field up-only"><label for="a_wa">WhatsApp number</label><input id="a_wa" name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="0801 234 5678"><div class="err-msg">Enter a Nigerian WhatsApp number, e.g. 0801 234 5678.</div></div>' +
      '<div class="field"><label for="a_email">Email</label><input id="a_email" name="email" type="email" autocomplete="email" maxlength="120"><div class="err-msg">Please enter a valid email.</div></div>' +
      '<div class="field"><label for="a_pw">Password</label><input id="a_pw" name="password" type="password" autocomplete="new-password" minlength="8"><div class="hint up-only">At least 8 characters.</div><div class="err-msg">Use at least 8 characters.</div></div>' +
      '<label class="check up-only"><input type="checkbox" name="consent_privacy"> <span>I agree to Chada Tech using my details to create my account and contact me about it, as explained in the <a href="' + ROOT + 'privacy/" target="_blank">Privacy notice</a>.</span></label>' +
      '<label class="check up-only"><input type="checkbox" name="consent_updates"> <span>Send me free AI tips and class updates on WhatsApp. I can stop any time by replying STOP.</span></label>' +
      '<div class="hp" aria-hidden="true"><label>Company<input type="text" name="company" tabindex="-1" autocomplete="off"></label></div>' +
      '<button class="btn btn-block mt2" type="submit" id="auth-btn">Create my free account</button>' +
      '<p class="small center mt2 in-only hidden"><a href="#" id="auth-forgot">Forgot your password?</a></p>' +
      "</form></div>";
    document.body.appendChild(modal);
    var mode = "up", started = Date.now(), form = modal.querySelector("#auth-form"), alertBox = form.querySelector(".form-alert");
    function setMode(m) {
      mode = m;
      modal.querySelectorAll("[data-auth]").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-auth") === m); });
      modal.querySelectorAll(".up-only").forEach(function (e) { e.classList.toggle("hidden", m !== "up"); });
      modal.querySelectorAll(".in-only").forEach(function (e) { e.classList.toggle("hidden", m !== "in"); });
      modal.querySelector("#auth-title").textContent = m === "up" ? "Create your free account" : "Welcome back";
      modal.querySelector("#auth-btn").textContent = m === "up" ? "Create my free account" : "Sign in";
      modal.querySelector("#a_pw").setAttribute("autocomplete", m === "up" ? "new-password" : "current-password");
      alertBox.className = "form-alert";
    }
    modal._setMode = setMode;
    modal.querySelectorAll("[data-auth]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-auth")); }); });
    modal.querySelector(".modal-x").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal(); });
    function msg(t, ok) { alertBox.className = "form-alert " + (ok ? "success" : "error"); alertBox.textContent = t; }
    modal.querySelector("#auth-forgot").addEventListener("click", function (e) {
      e.preventDefault();
      var em = form.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { form.email.closest(".field").classList.add("invalid"); return msg("Type your email above first."); }
      CT.sb().then(function (sb) { return sb.auth.resetPasswordForEmail(em, { redirectTo: new URL(ROOT + "account/?reset=1", location.href).href }); })
        .then(function (r) { msg(r.error ? "We couldn't send the email. Try again in a minute." : "Check your email for a link to set a new password.", !r.error); });
    });
    form.querySelectorAll("input").forEach(function (i) { i.addEventListener("input", function () { var f = i.closest(".field,.check"); if (f) f.classList.remove("invalid"); }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault(); alertBox.className = "form-alert";
      var ok = true;
      function bad(el) { var f = el.closest(".field,.check"); if (f) f.classList.add("invalid"); ok = false; }
      var em = form.email.value.trim(), pw = form.password.value, phone = null;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) bad(form.email);
      if (pw.length < (mode === "up" ? 8 : 1)) bad(form.password);
      if (mode === "up") {
        if (form.full_name.value.trim().length < 2) bad(form.full_name);
        phone = CT.normPhone(form.whatsapp.value); if (!phone) bad(form.whatsapp);
        if (!form.consent_privacy.checked) bad(form.consent_privacy);
      }
      if (!ok) return msg("Please check the highlighted fields.");
      if (form.company.value) return;
      if (mode === "up" && Date.now() - started < 3000) { started = 0; return msg("That was quick! Please check your details and tap the button again."); }
      var btn = modal.querySelector("#auth-btn"), label = btn.textContent; btn.disabled = true; btn.textContent = "Please wait…";
      CT.sb().then(function (sb) {
        if (mode === "in") return sb.auth.signInWithPassword({ email: em, password: pw });
        return sb.auth.signUp({ email: em, password: pw, options: {
          emailRedirectTo: new URL(ROOT + "account/?welcome=1", location.href).href,
          data: { full_name: form.full_name.value.trim(), whatsapp: phone, consent_privacy: true, consent_updates: form.consent_updates.checked, source: CT.source }
        } });
      }).then(function (r) {
        btn.disabled = false; btn.textContent = label;
        if (r.error) {
          var m = r.error.message || "";
          if (/registered|already/i.test(m)) { setMode("in"); return msg("You already have an account. Sign in instead."); }
          if (/Invalid login/i.test(m)) return msg("That email and password don't match. Try again, or reset your password.");
          if (/confirm/i.test(m)) return msg("Please confirm your email first. Check your inbox (and spam) for our email.");
          if (/rate|security purposes/i.test(m)) return msg("Too many attempts. Please wait a minute and try again.");
          return msg("Something went wrong: " + m);
        }
        if (mode === "up") CT.track("account_created", { source: CT.source });
        if (r.data && r.data.session) { closeModal(); afterAuth(); }
        else msg("Almost done! We've sent a confirmation link to " + em + ". Open it to finish creating your account (check spam too).", true);
      }).catch(function () { btn.disabled = false; btn.textContent = label; msg("Couldn't connect. Check your data and try again."); });
    });
    return modal;
  }
  var after = null;
  CT.openAuth = function (mode, sub, then) {
    buildModal(); modal._setMode(mode || "up");
    if (sub) modal.querySelector("#auth-sub").innerHTML = sub;
    after = then || null;
    modal.classList.remove("hidden"); document.body.classList.add("modal-open");
    setTimeout(function () { var f = modal.querySelector(mode === "in" ? "#a_email" : "#a_name"); if (f && window.innerWidth > 700) f.focus(); }, 50);
  };
  function closeModal() { if (modal) { modal.classList.add("hidden"); document.body.classList.remove("modal-open"); } }
  function afterAuth() { refreshHeader(); if (after) after(); else if (!/\/account\//.test(location.pathname)) location.href = ROOT + "account/?welcome=1"; else location.reload(); }
  CT.requireAccount = function (sub, then) {
    if (!CT.hasSession()) return CT.openAuth("up", sub, then);
    CT.user().then(function (u) { u ? then() : CT.openAuth("up", sub, then); });
  };

  /* ---------- header state ---------- */
  function refreshHeader() {
    var signed = CT.hasSession();
    document.querySelectorAll("[data-account-link]").forEach(function (a) {
      a.textContent = signed ? "My library" : "Sign in";
      a.href = ROOT + "account/";
      if (!signed) a.onclick = function (e) { e.preventDefault(); CT.openAuth("in"); }; else a.onclick = null;
    });
  }
  CT.refreshHeader = refreshHeader;

  /* ---------- welcome card (first visit, closable, returns after 7 days) ---------- */
  function welcome() {
    if (CT.hasSession() || document.body.hasAttribute("data-no-welcome")) return;
    var last = Number(CT.store.get("ct_welcome_closed") || 0);
    if (Date.now() - last < 7 * 864e5) return;
    var w = document.createElement("div");
    w.className = "welcome"; w.setAttribute("role", "dialog"); w.setAttribute("aria-label", "Create your free account");
    w.innerHTML = '<button class="modal-x" type="button" aria-label="Close">&times;</button>' +
      '<div class="welcome-in"><div class="mini-cover" aria-hidden="true"><span>Free ebook</span><b>The 15-Minute AI Starter</b></div>' +
      '<div><strong>Create your free Chada Tech account</strong><p>Get <em>The 15-Minute AI Starter</em> ebook free, plus access to the ebook store.</p>' +
      '<button class="btn btn-sm" type="button" data-w-go>Create free account</button> <button class="linkish" type="button" data-w-in>I have an account</button></div></div>';
    document.body.appendChild(w);
    function close() { w.classList.remove("show"); CT.store.set("ct_welcome_closed", Date.now()); setTimeout(function () { w.remove(); }, 300); }
    w.querySelector(".modal-x").addEventListener("click", close);
    w.querySelector("[data-w-go]").addEventListener("click", function () { close(); CT.track("welcome_signup_click"); CT.openAuth("up"); });
    w.querySelector("[data-w-in]").addEventListener("click", function () { close(); CT.openAuth("in"); });
    setTimeout(function () { w.classList.add("show"); }, 2500);
  }

  document.addEventListener("DOMContentLoaded", function () {
    refreshHeader(); welcome();
    document.querySelectorAll("[data-open-signup]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); CT.openAuth("up"); }); });
    // Pick up a session from an email link on any page
    if (/access_token|code=|type=signup|type=recovery/.test(location.hash + location.search)) CT.sb().then(function (sb) { sb.auth.getSession().then(refreshHeader); });
  });
  CT.esc = esc;
})();
