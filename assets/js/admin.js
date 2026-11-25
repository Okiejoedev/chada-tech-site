/* Chada Tech — team admin (Supabase Auth magic link). Data is only readable by emails in public.admins. */
(function () {
  "use strict";
  var C = window.CHADA, $ = function (id) { return document.getElementById(id); };
  if (!C.supabaseUrl || !C.supabaseAnonKey) {
    $("signin").classList.remove("hidden");
    $("signin").querySelector(".form-alert").className = "form-alert error";
    $("signin").querySelector(".form-alert").textContent = "Add the Supabase URL and anon key in assets/js/config.js first.";
    return;
  }
  var sb = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey);
  var table = "class_registrations", rows = [], data = {};
  var COLS = {
    class_registrations: ["created_at", "class_code", "full_name", "whatsapp", "what_they_do", "email", "heard_from", "consent_updates", "source"],
    memberships: ["created_at", "track", "status", "full_name", "whatsapp", "email", "what_they_do", "founding", "paid_at", "renews_on", "proof_path", "consent_updates", "source", "notes"],
    reply_kit_leads: ["created_at", "first_name", "whatsapp", "business_name", "what_they_sell", "city", "tone", "consent_updates", "source"]
  };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function alertMsg(msg, ok) { var a = $("dash-alert"); a.className = "form-alert " + (msg ? (ok ? "success" : "error") : ""); a.textContent = msg || ""; }
  function fmt(k, v) {
    if (v == null) return "";
    if (k === "created_at" || k === "paid_at") return new Date(v).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
    if (typeof v === "boolean") return v ? "Yes" : "";
    return v;
  }

  /* ---- auth ---- */
  $("a_send").addEventListener("click", function () {
    var email = $("a_email").value.trim(), al = $("signin").querySelector(".form-alert");
    if (!email) return;
    this.disabled = true;
    sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: location.href.split("#")[0], shouldCreateUser: true } }).then(function (r) {
      $("a_send").disabled = false;
      al.className = "form-alert " + (r.error ? "error" : "success");
      al.textContent = r.error ? r.error.message : "Check your email for the sign-in link (also check spam).";
    });
  });
  $("signout").addEventListener("click", function (e) { e.preventDefault(); sb.auth.signOut().then(function () { location.reload(); }); });
  sb.auth.getSession().then(function (r) { r.data.session ? start(r.data.session) : $("signin").classList.remove("hidden"); });
  sb.auth.onAuthStateChange(function (ev, s) { if (ev === "SIGNED_IN" && s && $("dash").classList.contains("hidden")) start(s); });

  function start(s) {
    $("signin").classList.add("hidden"); $("dash").classList.remove("hidden");
    $("who").textContent = s.user.email;
    loadAll();
  }
  function loadAll(msg) {
    alertMsg(typeof msg === "string" ? msg : "", true);
    Promise.all(Object.keys(COLS).map(function (t) {
      return sb.from(t).select("*").order("created_at", { ascending: false }).limit(5000).then(function (r) {
        if (r.error) throw r.error; data[t] = r.data; $("n-" + t).textContent = r.data.length;
      });
    })).then(function () {
      if (!data.class_registrations.length && !data.memberships.length && !data.reply_kit_leads.length)
        alertMsg("No rows visible. If you expected data, make sure your email is in the admins table (see README).");
      draw();
    }).catch(function (e) { alertMsg("Could not load data: " + e.message); });
  }

  /* ---- filters ---- */
  function setFilter() {
    var f = $("filter"), opts = [["", "All"]];
    if (table === "class_registrations") {
      var codes = {}; (data[table] || []).forEach(function (r) { codes[r.class_code] = 1; });
      Object.keys(codes).forEach(function (c) { opts.push(["class_code:" + c, c]); });
    } else if (table === "memberships") {
      ["pending", "paid", "waitlist", "cancelled", "refunded"].forEach(function (s) { opts.push(["status:" + s, "Status: " + s]); });
      ["business", "professional", "student"].forEach(function (s) { opts.push(["track:" + s, "Track: " + s]); });
    } else {
      ["friendly", "professional", "casual"].forEach(function (s) { opts.push(["tone:" + s, "Tone: " + s]); });
    }
    var cur = f.value;
    f.innerHTML = opts.map(function (o) { return '<option value="' + esc(o[0]) + '">' + esc(o[1]) + "</option>"; }).join("");
    if (opts.some(function (o) { return o[0] === cur; })) f.value = cur;
  }
  function visible() {
    var q = $("search").value.trim().toLowerCase(), f = $("filter").value, only = $("only-updates").checked;
    return (data[table] || []).filter(function (r) {
      if (only && !r.consent_updates) return false;
      if (f) { var p = f.split(":"); if (String(r[p[0]]) !== p.slice(1).join(":")) return false; }
      if (!q) return true;
      return Object.keys(r).some(function (k) { return String(r[k] == null ? "" : r[k]).toLowerCase().indexOf(q) > -1; });
    });
  }
  function draw() {
    setFilter();
    rows = visible();
    var cols = COLS[table], isM = table === "memberships";
    var h = "<thead><tr>" + (isM ? "<th>Action</th>" : "") + cols.map(function (c) { return "<th>" + esc(c.replace(/_/g, " ")) + "</th>"; }).join("") + "</tr></thead><tbody>";
    rows.forEach(function (r) {
      h += "<tr>";
      if (isM) {
        h += "<td>" + (r.status === "pending" ? '<button class="btn btn-sm" data-paid="' + r.id + '">Mark paid</button> ' : "") +
          '<select data-status="' + r.id + '" style="min-height:36px;padding:4px 8px;width:auto">' +
          ["pending", "paid", "waitlist", "cancelled", "refunded"].map(function (s) { return "<option" + (s === r.status ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></td>";
      }
      cols.forEach(function (c) {
        var v = fmt(c, r[c]);
        if (c === "status") v = '<span class="pill ' + esc(r.status) + '">' + esc(r.status) + "</span>";
        else if (c === "whatsapp") v = '<a href="https://wa.me/' + esc(String(r.whatsapp).replace("+", "")) + '" target="_blank" rel="noopener">' + esc(r.whatsapp) + "</a>";
        else if (c === "proof_path" && r.proof_path) v = '<button class="copy-btn" style="margin:0" data-proof="' + esc(r.proof_path) + '">View proof</button>';
        else v = esc(v);
        h += "<td>" + v + "</td>";
      });
      h += "</tr>";
    });
    if (!rows.length) h += '<tr><td colspan="' + (cols.length + 1) + '" class="small">No rows.</td></tr>';
    $("tbl").innerHTML = h + "</tbody>";
  }

  /* ---- actions ---- */
  document.querySelectorAll("[data-at]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll("[data-at]").forEach(function (x) { x.classList.toggle("on", x === b); });
      table = b.getAttribute("data-at"); $("filter").value = ""; draw();
    });
  });
  ["search", "filter", "only-updates"].forEach(function (id) { $(id).addEventListener(id === "search" ? "input" : "change", function () { rows = visible(); draw(); }); });
  $("refresh").addEventListener("click", function () { loadAll(); });

  function addMonths(d, n) { var x = new Date(d); x.setMonth(x.getMonth() + n); return x.toISOString().slice(0, 10); }
  function update(id, patch, msg) {
    return sb.from("memberships").update(patch).eq("id", id).then(function (r) {
      if (r.error) return alertMsg("Update failed: " + r.error.message);
      loadAll(msg);
    });
  }
  document.addEventListener("click", function (e) {
    var p = e.target.closest("[data-paid]");
    if (p) {
      var id = p.getAttribute("data-paid"), r = data.memberships.find(function (x) { return x.id === id; });
      if (!confirm("Mark " + r.full_name + " (" + r.track + ") as paid? Check the Paystack dashboard first.")) return;
      var now = new Date(), patch = { status: "paid", paid_at: now.toISOString(), renews_on: addMonths(now, 3) };
      if (r.track === "business") {
        var paid = data.memberships.filter(function (x) { return x.track === "business" && x.status === "paid"; }).length;
        if (paid < (C.foundingPlaces || 10)) patch.founding = true;
      }
      update(id, patch, r.full_name + " marked paid" + (patch.founding ? " (Founding Member)." : "."));
    }
    var pr = e.target.closest("[data-proof]");
    if (pr) sb.storage.from("student-proofs").createSignedUrl(pr.getAttribute("data-proof"), 300).then(function (r) {
      if (r.error) alertMsg("Could not open proof: " + r.error.message); else window.open(r.data.signedUrl, "_blank", "noopener");
    });
  });
  document.addEventListener("change", function (e) {
    var s = e.target.closest("[data-status]");
    if (!s) return;
    var id = s.getAttribute("data-status"), patch = { status: s.value };
    if (s.value === "paid") { patch.paid_at = new Date().toISOString(); patch.renews_on = addMonths(new Date(), 3); }
    update(id, patch, "Status changed to " + s.value + ".");
  });

  function csvCell(v) { v = v == null ? "" : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  $("export").addEventListener("click", function () {
    var cols = Object.keys((data[table] && data[table][0]) || {}).length ? Object.keys(data[table][0]) : COLS[table];
    var csv = cols.join(",") + "\n" + rows.map(function (r) { return cols.map(function (c) { return csvCell(r[c]); }).join(","); }).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
    a.download = table + "-" + new Date().toISOString().slice(0, 10) + ".csv"; document.body.appendChild(a); a.click(); a.remove();
  });
  $("copy-nums").addEventListener("click", function () {
    var nums = rows.map(function (r) { return r.whatsapp; }).filter(Boolean);
    var uniq = nums.filter(function (n, i) { return nums.indexOf(n) === i; }).join("\n");
    navigator.clipboard.writeText(uniq).then(function () { alertMsg(nums.length + " numbers copied.", true); }, function () { alertMsg("Copy failed. Use Export CSV instead."); });
  });
})();
