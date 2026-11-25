/* Chada Tech — page logic: free class, join, thank-you pages, track cards */
(function () {
  "use strict";
  var C = window.CHADA, CT = window.CT;
  var page = document.body.getAttribute("data-page");
  function rootUrl(p) { // resolve a site path relative to the current page depth
    var depth = { "free-class": 1, "inner-circle": 1, join: 1, "thanks-class": 2, "thanks-join": 2 }[page] || 0;
    return new Array(depth + 1).join("../") + p;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---- track cards (home + inner circle): open vs waitlist from config ---- */
  document.querySelectorAll("[data-track-btn]").forEach(function (b) {
    var key = b.getAttribute("data-track-btn"), t = C.tracks[key];
    var badge = document.querySelector('[data-track-badge="' + key + '"]');
    if (t.status === "open") {
      b.textContent = "Join the " + t.name + " track";
      b.removeAttribute("style"); b.className = "btn";
      if (badge) { badge.textContent = key === "business" ? "Open: founding cohort" : "Open"; badge.className = "badge open"; }
    } else {
      b.textContent = "Join the waitlist";
      if (badge) { badge.textContent = "Waitlist"; badge.className = "badge"; }
    }
  });

  /* ---- testimonials (hidden until real ones exist) ---- */
  if (page === "home" && C.testimonials && C.testimonials.length) {
    var list = document.getElementById("testimonial-list");
    list.innerHTML = C.testimonials.map(function (t) {
      return '<div class="card"><p>“' + esc(t.quote) + '”</p><p class="mb0"><strong>' + esc(t.name) + "</strong><br><span class=\"small\">" + esc(t.business || "") + "</span></p></div>";
    }).join("");
    document.getElementById("testimonials").classList.remove("hidden");
  }

  /* ---- free class registration ---- */
  if (page === "free-class") {
    CT.setupForm(document.getElementById("class-form"), {
      onSubmit: function (d) {
        return CT.insert("class_registrations", {
          class_code: C.freeClass.code,
          full_name: d.full_name, whatsapp: d.whatsapp,
          what_they_do: d.what_they_do || null, email: d.email || null, heard_from: d.heard_from || null,
          consent_privacy: true, consent_updates: d.consent_updates === "on",
          source: CT.source
        });
      },
      onSuccess: function () {
        CT.track("class_registered", { source: CT.source });
        location.href = rootUrl("thanks/class/");
      }
    });
  }

  /* ---- thanks: class (calendar + meet link) ---- */
  if (page === "thanks-class") {
    var fc = C.freeClass, start = new Date(fc.startISO), end = new Date(start.getTime() + fc.minutes * 60000);
    var title = "Chada Tech free AI class";
    var details = "Free live class on Google Meet. Bring your phone, data and one product photo." + (fc.showMeetLinkOnThanksPage && fc.meetLink ? " Link: " + fc.meetLink : " We'll send the link on WhatsApp on the day.");
    function z(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
    document.getElementById("gcal").href = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(title) +
      "&dates=" + z(start) + "/" + z(end) + "&details=" + encodeURIComponent(details) + "&location=" + encodeURIComponent(fc.showMeetLinkOnThanksPage && fc.meetLink ? fc.meetLink : "Google Meet");
    document.getElementById("ics").addEventListener("click", function () {
      var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Chada Tech//Free class//EN", "BEGIN:VEVENT",
        "UID:" + fc.code + "@chadatech", "DTSTAMP:" + z(new Date()), "DTSTART:" + z(start), "DTEND:" + z(end),
        "SUMMARY:" + title, "DESCRIPTION:" + details.replace(/,/g, "\\,"), "LOCATION:Google Meet",
        "BEGIN:VALARM", "TRIGGER:-PT1H", "ACTION:DISPLAY", "DESCRIPTION:" + title, "END:VALARM",
        "END:VEVENT", "END:VCALENDAR"].join("\r\n");
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
      a.download = "chada-tech-free-class.ics"; document.body.appendChild(a); a.click(); a.remove();
    });
    if (fc.showMeetLinkOnThanksPage && fc.meetLink) {
      document.getElementById("meet-line").innerHTML = 'Class link: <a href="' + esc(fc.meetLink) + '" target="_blank" rel="noopener">' + esc(fc.meetLink) + "</a>";
    }
    if (!C.whatsappCommunityLink) document.getElementById("wa-community").classList.add("hidden");
  }

  /* ---- join flow ---- */
  if (page === "join") {
    var key = (CT.qs("track") || "business").toLowerCase();
    if (!C.tracks[key]) key = "business";
    var t = C.tracks[key], open = t.status === "open";
    document.getElementById("join-title").textContent = open ? "Join the " + t.name + " track" : "Join the " + t.name + " waitlist";
    document.getElementById("join-sub").textContent = open
      ? CT.naira(t.price) + " per 3 months. Live class every Saturday" + (key === "business" ? ", starting " + C.cohortStartLabel + "." : ".")
      : "This track opens soon. Join the waitlist and we'll message you on WhatsApp when it opens. No payment now.";
    document.getElementById("join-btn").textContent = open ? "Continue to payment" : "Join the waitlist";
    document.getElementById("join-note").textContent = open
      ? "Next, you'll pay " + CT.naira(t.price) + " securely on our official Paystack page (card, bank transfer or USSD)."
      : "No payment needed for the waitlist.";
    var proofField = document.getElementById("proof-field"), proof = document.getElementById("proof");
    if (key === "student") { proofField.classList.remove("hidden"); proof.required = true; }
    document.title = document.getElementById("join-title").textContent + " | Chada Tech";

    CT.setupForm(document.getElementById("join-form"), {
      onSubmit: function (d) {
        var up = Promise.resolve(null);
        if (key === "student") {
          var f = proof.files[0];
          var okType = f && /^(image\/(jpeg|png)|application\/pdf)$/.test(f.type) && f.size <= 5 * 1024 * 1024;
          if (!okType) { proofField.classList.add("invalid"); return Promise.reject(new Error("upload")); }
          var ext = f.type === "application/pdf" ? "pdf" : f.type === "image/png" ? "png" : "jpg";
          var rand = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Math.random()).slice(2);
          up = CT.upload("student-proofs", new Date().toISOString().slice(0, 10) + "/" + rand + "." + ext, f);
        }
        return up.then(function (path) {
          return CT.insert("memberships", {
            track: key, status: open ? "pending" : "waitlist",
            full_name: d.full_name, whatsapp: d.whatsapp, email: d.email || null,
            what_they_do: d.what_they_do || null, proof_path: path,
            consent_privacy: true, consent_updates: d.consent_updates === "on", source: CT.source
          });
        });
      },
      onSuccess: function () {
        CT.track(open ? "join_pending" : "join_waitlist", { track: key });
        if (open && t.paystackLink) location.href = t.paystackLink;
        else if (open) location.href = rootUrl("thanks/join/?status=nolink");
        else location.href = rootUrl("thanks/join/?status=waitlist");
      }
    });
  }

  /* ---- thanks: join ---- */
  if (page === "thanks-join") {
    var st = CT.qs("status");
    if (st === "waitlist") {
      document.getElementById("paid-msg").classList.add("hidden");
      document.getElementById("wait-msg").classList.remove("hidden");
    } else if (st === "nolink") {
      document.querySelector("#paid-msg .lead").textContent = "Your place is saved. Our payment page is being set up: we'll send you the Paystack link on WhatsApp shortly.";
    }
  }
})();
