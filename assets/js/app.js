/* Chada Tech — shared site code (config filling, nav, forms, Supabase inserts, analytics) */
(function () {
  "use strict";
  var C = window.CHADA || {};
  var CT = (window.CT = {});

  /* ---------- helpers ---------- */
  CT.naira = function (n) {
    n = Number(String(n).replace(/[^0-9.]/g, ""));
    if (!isFinite(n) || n === 0 && String(n) === "") return "";
    return "₦" + Math.round(n).toLocaleString("en-NG");
  };
  CT.get = function (path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, C);
  };
  CT.qs = function (name) { return new URLSearchParams(location.search).get(name); };
  CT.store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* Nigerian phone → +234XXXXXXXXXX (or null) */
  CT.normPhone = function (raw) {
    var d = String(raw || "").replace(/[^0-9]/g, "");
    if (d.indexOf("00234") === 0) d = d.slice(2);
    if (d.length === 11 && d[0] === "0") d = "234" + d.slice(1);
    else if (d.length === 10 && /^[789]/.test(d)) d = "234" + d;
    if (/^234[0-9]{10}$/.test(d) && /^234[789]/.test(d)) return "+" + d;
    return null;
  };

  /* ---------- UTM source (kept for the session) ---------- */
  (function () {
    var s = CT.qs("utm_source");
    try {
      if (s) sessionStorage.setItem("ct_src", s.slice(0, 60));
      CT.source = sessionStorage.getItem("ct_src") || (document.referrer ? "referral" : "direct");
    } catch (e) { CT.source = s || "direct"; }
  })();

  /* ---------- analytics ---------- */
  var A = C.analytics || {};
  function loadScript(src, attrs) {
    var s = document.createElement("script"); s.defer = true; s.src = src;
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    document.head.appendChild(s);
  }
  if (A.provider === "plausible" && A.plausibleDomain) {
    window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
    loadScript("https://plausible.io/js/script.js", { "data-domain": A.plausibleDomain });
  } else if (A.provider === "umami" && A.umamiWebsiteId) {
    loadScript(A.umamiSrc, { "data-website-id": A.umamiWebsiteId });
  } else if (A.provider === "ga4" && A.ga4Id) {
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + A.ga4Id);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date()); window.gtag("config", A.ga4Id);
  }
  CT.track = function (name, props) {
    try {
      if (A.provider === "plausible" && window.plausible) window.plausible(name, { props: props || {} });
      else if (A.provider === "umami" && window.umami) window.umami.track(name, props || {});
      else if (A.provider === "ga4" && window.gtag) window.gtag("event", name, props || {});
    } catch (e) {}
  };

  /* ---------- Supabase REST (insert-only, no rows returned) ---------- */
  function sbHeaders(extra) {
    var h = { apikey: C.supabaseAnonKey };
    if (/^eyJ/.test(C.supabaseAnonKey || "")) h.Authorization = "Bearer " + C.supabaseAnonKey;
    Object.keys(extra || {}).forEach(function (k) { h[k] = extra[k]; });
    return h;
  }
  CT.sbReady = function () { return !!(C.supabaseUrl && C.supabaseAnonKey); };
  CT.insert = function (table, row) {
    if (!CT.sbReady()) return Promise.reject(new Error("not-configured"));
    return fetch(C.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + table, {
      method: "POST",
      headers: sbHeaders({ "Content-Type": "application/json", Prefer: "return=minimal" }),
      body: JSON.stringify(row)
    }).then(function (r) {
      if (r.ok) return { ok: true };
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.status === 409 || j.code === "23505") return { ok: true, duplicate: true };
        var e = new Error(j.message || ("HTTP " + r.status)); e.status = r.status; throw e;
      });
    });
  };
  CT.rpc = function (fn) {
    if (!CT.sbReady()) return Promise.reject(new Error("not-configured"));
    return fetch(C.supabaseUrl.replace(/\/$/, "") + "/rest/v1/rpc/" + fn, {
      method: "POST", headers: sbHeaders({ "Content-Type": "application/json" }), body: "{}"
    }).then(function (r) { if (!r.ok) throw new Error("rpc"); return r.json(); });
  };
  CT.upload = function (bucket, path, file) {
    return fetch(C.supabaseUrl.replace(/\/$/, "") + "/storage/v1/object/" + bucket + "/" + path, {
      method: "POST", headers: sbHeaders({ "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" }), body: file
    }).then(function (r) { if (!r.ok) throw new Error("upload"); return path; });
  };

  /* ---------- fill config values into the page ---------- */
  CT.fill = function (root) {
    root = root || document;
    root.querySelectorAll("[data-c]").forEach(function (el) {
      var v = CT.get(el.getAttribute("data-c"));
      if (v !== undefined && v !== null && v !== "") el.textContent = v;
    });
    root.querySelectorAll("[data-c-href]").forEach(function (el) {
      var key = el.getAttribute("data-c-href"), v = CT.get(key);
      if (key === "contactEmail" && v) v = "mailto:" + v;
      if (key === "businessWhatsappIntl" && v) v = "https://wa.me/" + v;
      if (v) { el.href = v; return; }
      // no value yet: never show a dead link
      var li = el.closest("li"), grp = el.closest("[data-hide-if-empty]");
      if (grp) grp.classList.add("hidden");
      else if (li) li.classList.add("hidden");
      else if (el.classList.contains("btn")) el.classList.add("hidden");
      else { var sp = document.createElement("span"); sp.innerHTML = el.innerHTML; el.replaceWith(sp); }
    });
    root.querySelectorAll("[data-price]").forEach(function (el) {
      var t = C.tracks && C.tracks[el.getAttribute("data-price")];
      if (t) el.textContent = CT.naira(t.price);
    });
    root.querySelectorAll("[data-month]").forEach(function (el) {
      var t = C.tracks && C.tracks[el.getAttribute("data-month")];
      if (t) el.textContent = "about " + CT.naira(Math.round(t.price / 3 / 100) * 100) + " a month";
    });
    root.querySelectorAll("[data-if-missing]").forEach(function (el) {
      var v = CT.get(el.getAttribute("data-if-missing"));
      el.classList.toggle("hidden", !!v);
    });
    root.querySelectorAll("[data-if-set]").forEach(function (el) {
      var v = CT.get(el.getAttribute("data-if-set"));
      el.classList.toggle("hidden", !v);
    });
  };

  /* ---------- founding places ---------- */
  CT.loadPlaces = function () {
    var els = document.querySelectorAll("[data-places]");
    if (!els.length) return;
    CT.rpc("founding_places_left").then(function (n) {
      n = Number(n);
      els.forEach(function (el) {
        el.textContent = n > 0 ? n + " of " + (C.foundingPlaces || 10) + " founding places left" : "Founding places are full";
        el.classList.remove("hidden");
      });
    }).catch(function () { /* keep hidden if unavailable */ });
  };

  /* ---------- forms ---------- */
  CT.setupForm = function (form, opts) {
    var started = Date.now();
    var alertBox = form.querySelector(".form-alert");
    function showErr(msg) { alertBox.className = "form-alert error"; alertBox.textContent = msg; alertBox.scrollIntoView({ block: "center", behavior: "smooth" }); }
    form.querySelectorAll("input,select,textarea").forEach(function (i) {
      i.addEventListener("input", function () { var f = i.closest(".field,.check"); if (f) f.classList.remove("invalid"); });
    });
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      alertBox.className = "form-alert";
      var ok = true, first = null;
      function bad(el) { var f = el.closest(".field,.check"); if (f) f.classList.add("invalid"); ok = false; if (!first) first = el; }
      form.querySelectorAll("[required]").forEach(function (el) {
        if (el.type === "checkbox" ? !el.checked : !String(el.value).trim()) bad(el);
      });
      var phoneEl = form.querySelector("[name=whatsapp]"), phone = null;
      if (phoneEl) { phone = CT.normPhone(phoneEl.value); if (!phone) bad(phoneEl); }
      var email = form.querySelector("[name=email]");
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) bad(email);
      var name = form.querySelector("[name=full_name],[name=first_name]");
      if (name && name.value.trim().length < (name.name === "first_name" ? 1 : 2)) bad(name);
      if (!ok) { showErr("Please check the highlighted fields."); if (first) first.focus(); return; }

      var hp = form.querySelector(".hp input");
      if (hp && hp.value) { opts.onSuccess({ spam: true }); return; }          // bot: pretend success
      if (Date.now() - started < 3000) { showErr("That was quick! Please check your details and tap the button again."); started = 0; return; }

      var btn = form.querySelector("[type=submit]"), label = btn.textContent;
      btn.disabled = true; btn.textContent = "Please wait…";
      var data = {};
      new FormData(form).forEach(function (v, k) { if (typeof v === "string") data[k] = v.trim(); });
      data.whatsapp = phone;
      Promise.resolve(opts.onSubmit(data, form)).then(function (res) {
        opts.onSuccess(res || {}, data);
      }).catch(function (e) {
        btn.disabled = false; btn.textContent = label;
        if (e && e.message === "not-configured") showErr("Registration isn't switched on yet (the site's database isn't connected). Please message us on WhatsApp.");
        else if (e && e.message === "upload") showErr("We couldn't upload your file. Use a JPG, PNG or PDF under 5 MB and try again.");
        else showErr("Something went wrong. Check your data connection and try again.");
      });
    });
  };

  /* ---------- nav ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    var mb = document.querySelector(".menu-btn"), mn = document.querySelector(".mobile-nav");
    if (mb && mn) mb.addEventListener("click", function () {
      var open = mn.classList.toggle("open"); mb.setAttribute("aria-expanded", open);
    });
    if (mn) mn.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { mn.classList.remove("open"); }); });
    CT.fill();
    var fol = document.querySelector("[data-follow]");
    if (fol && !Object.keys(C.socials || {}).some(function (k) { return C.socials[k]; })) fol.classList.add("hidden");
    CT.loadPlaces();
    var y = document.querySelector("[data-year]"); if (y) y.textContent = new Date().getFullYear();
  });
})();
