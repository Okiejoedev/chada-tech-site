/* Chada Tech — Customer Reply Kit. Everything is generated in the browser.
   Only the lead (first name, WhatsApp, business, what they sell, city, tone) is sent to Supabase.
   Bank details never leave the device and are never stored. */
(function () {
  "use strict";
  var CT = window.CT;
  var STEPS = 6, step = 1, A = {}, tone = "friendly", unlocked = CT.store.get("ct_kit_unlocked");
  var $ = function (id) { return document.getElementById(id); };
  var form = $("kit-form");

  /* ---------------- helpers ---------------- */
  function num(v) {
    var s = String(v || "").trim().toLowerCase().replace(/[₦,\s]/g, "");
    var m = s.match(/^([0-9]*\.?[0-9]+)(k|m)?$/);
    if (!m) return "";
    var n = parseFloat(m[1]) * (m[2] === "k" ? 1000 : m[2] === "m" ? 1000000 : 1);
    return n > 0 ? Math.round(n).toLocaleString("en-NG") : "";
  }
  function listJoin(a) { return a.length <= 1 ? (a[0] || "") : a.slice(0, -1).join(", ") + " or " + a[a.length - 1]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function copy(text, btn, block) {
    function done() {
      if (btn) { var l = btn.textContent; btn.textContent = "Copied ✓"; btn.classList.add("done"); setTimeout(function () { btn.textContent = l; btn.classList.remove("done"); }, 1600); }
      CT.track("kit_copy", { block: block || "unknown" });
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() {
      var t = document.createElement("textarea"); t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} t.remove(); done();
    }
  }

  /* ---------------- read answers ---------------- */
  function readForm() {
    var f = new FormData(form), g = function (k) { return String(f.get(k) || "").trim(); };
    var pay = f.getAll("pay");
    var minN = num(g("min")), maxN = num(g("max"));
    A = {
      biz: g("biz"), item: g("item"), buyers: g("buyers"),
      min: minN, max: maxN,
      price: maxN && maxN !== minN ? "₦" + minN + " to ₦" + maxN : "from ₦" + minN,
      city: g("city"), fee_city: num(g("fee_city")) || g("fee_city"), time_city: g("time_city"),
      out: g("out") === "yes", time_other: g("time_other"), fee_other: num(g("fee_other")) || g("fee_other"),
      payList: pay, hasBank: pay.indexOf("bank transfer") > -1, hasLink: pay.indexOf("payment link") > -1,
      pay: listJoin(pay.map(function (p) { return p === "payment link" ? "a payment link" : p === "pay on pickup" ? "payment on pickup" : p; })),
      hours: g("hours") || "8am to 8pm, Monday to Saturday",
      bank: g("bank_name") || "[bank name]", acct: g("acct_no") || "[account number]", acctName: g("acct_name") || "[account name]",
      original: f.get("original") === "on"
    };
    tone = g("tone") || "friendly";
  }
  function saveAnswers() { // never stores bank details
    var keep = {};
    form.querySelectorAll("input:not([data-local])").forEach(function (i) {
      if (i.type === "radio") { if (i.checked) keep[i.name] = i.value; }
      else if (i.type === "checkbox") { (keep[i.name] = keep[i.name] || []); if (i.checked) keep[i.name].push(i.value); }
      else keep[i.name] = i.value;
    });
    CT.store.set("ct_kit_answers", keep);
  }
  function loadAnswers() {
    var s = CT.store.get("ct_kit_answers"); if (!s) return false;
    form.querySelectorAll("input:not([data-local])").forEach(function (i) {
      var v = s[i.name]; if (v === undefined) return;
      if (i.type === "radio") i.checked = v === i.value;
      else if (i.type === "checkbox") i.checked = Array.isArray(v) && v.indexOf(i.value) > -1;
      else i.value = v;
    });
    return true;
  }

  /* ---------------- templates ---------------- */
  function T() {
    var a = A, R = [];
    R.push({ id: "price", title: "“How much?”", sc: "/price", t: {
      friendly: "Hi! Thanks for asking 😊 Our " + a.item + " cost " + a.price + ". Which one caught your eye? Send me a screenshot and I'll confirm the exact price and what's available.",
      professional: "Good day, and thank you for your interest in " + a.biz + ". Our " + a.item + " are priced " + a.price + ". Kindly share the item you're interested in, and we'll confirm the exact price and availability.",
      casual: "Hey! Our " + a.item + " go for " + a.price + ". Which one are you eyeing? Send a screenshot, let me check for you 👌" } });
    R.push({ id: "lastprice", title: "“Last price?”", sc: "/lastprice", t: {
      friendly: "I understand, everyone loves a good deal 😊 Our prices are fixed so every customer gets a fair price, and you get exactly what you see. I'm happy to send more photos or a short video so you can see the quality. Shall I keep one for you?",
      professional: "Thank you for asking. Our prices are fixed so they stay fair for every customer, and they reflect the quality you'll receive. We'd be glad to send more photos or a short video of the item. Shall we reserve one for you?",
      casual: "I get you! But our price is fixed so everybody gets the same fair deal 😅 The quality is solid, I can send you a video so you see it yourself. Should I keep one for you?" } });
    R.push({ id: "delivery", title: "“Do you deliver to Abuja?”", sc: "/delivery", t: a.out ? {
      friendly: "Yes, we do! 🚚 We deliver outside " + a.city + " in " + a.time_other + ", from ₦" + a.fee_other + ". Within " + a.city + " it's ₦" + a.fee_city + " and takes " + a.time_city + ". Where should we send yours?",
      professional: "Yes, we deliver nationwide. Delivery outside " + a.city + " takes " + a.time_other + " and starts from ₦" + a.fee_other + ". Within " + a.city + ", delivery is ₦" + a.fee_city + " and takes " + a.time_city + ". Kindly share your delivery address.",
      casual: "Yes o! We send outside " + a.city + " in " + a.time_other + ", from ₦" + a.fee_other + ". Inside " + a.city + " na ₦" + a.fee_city + ", " + a.time_city + ". Where we dey send am?" } : {
      friendly: "Right now we deliver within " + a.city + " only (₦" + a.fee_city + ", " + a.time_city + ") 😊 If you're outside " + a.city + ", you can send a dispatch rider or courier you trust to pick it up from us.",
      professional: "At the moment we deliver within " + a.city + " only, for ₦" + a.fee_city + ", within " + a.time_city + ". Customers outside " + a.city + " are welcome to arrange a courier to collect their order from us.",
      casual: "For now na only " + a.city + " we dey deliver (₦" + a.fee_city + ", " + a.time_city + "). If you dey outside, send your rider make dem pick am from us 👍" } });
    R.push(a.original ? { id: "original", title: "“Is it original?”", sc: "/original", t: {
      friendly: "Yes, it's 100% original 😊 I can send you a short video of the exact item and its packaging before you pay, so you're sure.",
      professional: "Yes, all our products are original. We're happy to send a video of the exact item and its packaging before payment.",
      casual: "Original, no wahala 😎 I fit send you video of the exact one before you pay." } } : { id: "quality", title: "“Is it good quality?”", sc: "/quality", t: {
      friendly: "Yes! I can send you a short video of the exact item so you can see the quality before you pay 😊",
      professional: "Yes. We're happy to send a short video of the exact item so you can see the quality before payment.",
      casual: "Quality dey! I fit send you video of the exact one so you see am before you pay 👌" } });
    R.push({ id: "followup", title: "“I'll get back to you.” (send 2 days later)", sc: "/followup", t: {
      friendly: "Hi! Just checking in on the " + a.item + " you asked about 😊 It's still available. Would you like me to keep one for you?",
      professional: "Good day. We're following up on your enquiry about our " + a.item + ". It's still available, and we'd be glad to reserve one for you. Would you like us to?",
      casual: "Hey! The " + a.item + " you asked about is still available o. Should I keep one for you? 😊" } });
    R.push({ id: "order", title: "“How do I order?”", sc: "/order", t: {
      friendly: "Ordering is easy 😊\n1. Tell me the item, size or colour and quantity.\n2. Send your delivery address and phone number.\n3. Pay by " + a.pay + ".\nOnce payment is confirmed, we'll pack and send your order and keep you updated.",
      professional: "To place an order:\n1. Share the item, size or colour and quantity.\n2. Provide your delivery address and phone number.\n3. Make payment by " + a.pay + ".\nWe'll confirm your payment and dispatch your order promptly.",
      casual: "Easy!\n1. Tell me what you want (size/colour/how many).\n2. Send your address and number.\n3. Pay by " + a.pay + ".\nOnce I confirm, I go send am sharp sharp 🚀" } });
    R.push({ id: "pay", title: "“Send account number”", sc: "/pay", t: payReply() });
    R.push({ id: "available", title: "“Is it available?”", sc: "/available", t: {
      friendly: "Yes, it's available 😊 Which size or colour would you like? I'll confirm and keep it for you.",
      professional: "Yes, it's available. Kindly let us know your preferred size or colour and we'll confirm.",
      casual: "Yes, e dey! Which size or colour you want? 😊" } });
    return R;
  }
  function payReply() {
    var a = A, warn = "\n\nPlease pay only into this account. We'll never ask you to pay into a different one.";
    var orLink = a.hasLink ? "\nOr pay securely with this link: [your payment link]" : "";
    if (a.hasBank) return {
      friendly: "Thank you for your order 🙏 Your total is ₦[amount] (item + delivery). Please pay to: " + a.bank + " · " + a.acct + " · " + a.acctName + "." + orLink + "\nSend me a screenshot once you've paid and I'll confirm and send your order out." + warn,
      professional: "Thank you for your order. Your total is ₦[amount], including delivery. Kindly make payment to: " + a.bank + ", " + a.acct + ", " + a.acctName + ", and share your receipt." + orLink + "\nWe'll confirm and dispatch your order." + warn,
      casual: "Thank you! Total na ₦[amount] with delivery. Pay to " + a.bank + ", " + a.acct + ", " + a.acctName + ", then send screenshot make I confirm 👍" + orLink + warn };
    if (a.hasLink) return {
      friendly: "Thank you for your order 🙏 Your total is ₦[amount] (item + delivery). Pay securely with this link: [your payment link]. Send me a screenshot once you've paid and I'll confirm and send your order out.",
      professional: "Thank you for your order. Your total is ₦[amount], including delivery. Pay securely with this link: [your payment link]. We'll confirm your payment and dispatch your order.",
      casual: "Thank you! Total na ₦[amount] with delivery. Pay securely with this link: [your payment link], then send screenshot make I confirm 👍" };
    return {
      friendly: "Thank you for your order 🙏 Your total is ₦[amount] (item + delivery). You can pay by " + a.pay + ". I'll confirm and get your order ready.",
      professional: "Thank you for your order. Your total is ₦[amount], including delivery, payable by " + a.pay + ". We'll confirm and prepare your order.",
      casual: "Thank you! Total na ₦[amount] with delivery. You fit pay by " + a.pay + ". I go prepare am sharp 👍" };
  }
  function orderLink() {
    var n = unlocked && unlocked.whatsapp ? unlocked.whatsapp.replace(/^\+/, "") : "234XXXXXXXXXX";
    return "https://wa.me/" + n + "?text=" + encodeURIComponent("Hi " + A.biz + "! I'd like to order.");
  }
  function profile() {
    var a = A, nat = a.out ? " and nationwide" : "", outside = a.out ? ", and outside " + a.city + " in " + a.time_other : "";
    var desc = a.biz + " sells " + a.item + " for " + a.buyers + ". Prices " + a.price + ". Delivery within " + a.city + " in " + a.time_city + outside + ". Pay by " + a.pay + ". Order on WhatsApp: " + orderLink();
    return [
      { id: "greeting", title: "Greeting message", t: {
        friendly: "Hi, welcome to " + a.biz + "! 😊 We sell " + a.item + ", " + a.price + ". We deliver within " + a.city + nat + ". Tell us what you're looking for and we'll reply shortly.",
        professional: "Good day, and welcome to " + a.biz + ". We offer " + a.item + ", " + a.price + ". We deliver within " + a.city + nat + ". Kindly tell us what you're looking for and we'll respond shortly.",
        casual: "Hey, welcome to " + a.biz + "! 👋 We sell " + a.item + ", " + a.price + ". We deliver for " + a.city + nat + ". Tell us wetin you want, we go reply sharp sharp." } },
      { id: "away", title: "Away message", t: {
        friendly: "Thank you for messaging " + a.biz + "! We're closed right now. Our hours are " + a.hours + ". Leave your message and we'll reply as soon as we're back 😊",
        professional: "Thank you for contacting " + a.biz + ". We're currently closed. Our hours are " + a.hours + ". Please leave a message and we'll respond as soon as we're back.",
        casual: "Thanks for messaging " + a.biz + "! We don close for now. We open " + a.hours + ". Drop your message, we go reply once we back 😊" } },
      { id: "description", title: "Business description (WhatsApp Business profile)", note: desc.length > 500 ? "This is " + desc.length + " characters. WhatsApp allows 512, so shorten it a little." : desc.length + " of 512 characters.", t: desc },
      { id: "price_increase", title: "Price increase message", t: "Quick update from " + a.biz + ": because our costs have gone up, our prices will change from [date]. Thank you for always supporting us 🙏 You can still order at today's prices until [date]." },
      { id: "catalogue", title: "Catalogue description prompt (paste into ChatGPT or Meta AI for each product)", t: "Write a catalogue description under 30 words for [product] from " + a.biz + ". Include size, material and what it's good for. Price: ₦[price]." },
      { id: "order_link", title: "Your order link (for your bio and flyers)", t: orderLink() }
    ];
  }
  function policy() {
    var a = A;
    return a.biz + ": Delivery and returns\n\n" +
      "1. Within " + a.city + ": " + a.time_city + ", ₦" + a.fee_city + ".\n" +
      (a.out ? "2. Outside " + a.city + ": " + a.time_other + ", from ₦" + a.fee_other + ".\n" : "2. We deliver within " + a.city + " only; you can send a courier to collect.\n") +
      "3. Your order is confirmed once payment is received.\n" +
      "4. Exchanges: wrong size? Swap it within 3 days, unused, with tags.\n" +
      "5. Wrong or damaged item? Tell us within 2 days with a photo and we'll make it right.";
  }
  function text(b) { return typeof b.t === "string" ? b.t : b.t[tone]; }

  /* ---------------- rendering ---------------- */
  function block(b) {
    return '<div class="reply"><div class="reply-head"><h3>' + esc(b.title) + "</h3>" + (b.sc ? '<span class="shortcut">' + b.sc + "</span>" : "") + "</div>" +
      '<div class="bubble">' + esc(text(b)) + "</div>" + (b.note ? '<p class="small mt0" style="margin-top:8px">' + esc(b.note) + "</p>" : "") +
      '<button type="button" class="copy-btn" data-copy="' + b.id + '">Copy</button></div>';
  }
  var current = {};
  function render() {
    var replies = T(), prof = profile();
    current = {}; replies.concat(prof).forEach(function (b) { current[b.id] = b; });
    document.querySelectorAll(".seg button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-tone") === tone); });
    $("res-title").textContent = A.biz ? A.biz + ": your replies are ready" : "Your replies are ready";
    if (!unlocked) {
      $("preview").innerHTML = block(replies[0]) + '<p class="small">That\'s 1 of 8 replies. Unlock the rest below, free.</p>';
      $("unlock-form").classList.remove("hidden"); $("full").classList.add("hidden");
      return;
    }
    $("preview").innerHTML = "";
    $("unlock-form").classList.add("hidden"); $("full").classList.remove("hidden");
    $("tab-replies").innerHTML = replies.map(block).join("");
    $("tab-profile").innerHTML = prof.map(block).join("");
    if (!$("policy-text").dataset.edited) $("policy-text").value = policy();
    $("send-wa").href = "https://wa.me/?text=" + encodeURIComponent(allText());
  }
  function allText() {
    var out = "MY CUSTOMER REPLY KIT (" + A.biz + ")\n\n";
    T().forEach(function (b) { out += b.title + " " + b.sc + "\n" + text(b) + "\n\n"; });
    profile().forEach(function (b) { out += b.title + "\n" + text(b) + "\n\n"; });
    return out + "Made free with the Chada Tech Customer Reply Kit";
  }
  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-copy]");
    if (c) { var b = current[c.getAttribute("data-copy")]; copy(text(b), c, b.id); }
    var tb = e.target.closest("[data-tone]");
    if (tb) { tone = tb.getAttribute("data-tone"); render(); }
    var tab = e.target.closest("[data-tab]");
    if (tab) {
      document.querySelectorAll("[data-tab]").forEach(function (x) { x.classList.toggle("on", x === tab); });
      document.querySelectorAll(".tabpane").forEach(function (p) { p.classList.toggle("on", p.id === "tab-" + tab.getAttribute("data-tab")); });
    }
  });
  $("policy-text").addEventListener("input", function () { this.dataset.edited = "1"; });
  $("policy-copy").addEventListener("click", function () { copy($("policy-text").value, this, "policy"); });
  $("copy-all").addEventListener("click", function () { copy(allText(), this, "all"); });
  $("send-wa").addEventListener("click", function () { CT.track("kit_copy", { block: "send_whatsapp" }); });
  $("sound-me").addEventListener("click", function () {
    var p = "Here are my customer replies. Rewrite them so they sound like me. Here are 3 messages I've sent customers before: [paste]. Keep prices and details exactly the same.\n\n" + allText();
    copy(p, this, "sound_like_me");
    setTimeout(function () { window.open("https://chatgpt.com/", "_blank", "noopener"); }, 300);
  });
  $("cta-ic").addEventListener("click", function () { CT.track("kit_cta_inner_circle"); });
  $("kit-restart").addEventListener("click", function () {
    $("kit-results").classList.add("hidden"); form.classList.remove("hidden"); step = 1; show(); window.scrollTo(0, 0);
  });

  /* ---------------- steps ---------------- */
  function show() {
    form.querySelectorAll(".kit-step").forEach(function (s) { s.classList.toggle("active", +s.getAttribute("data-step") === step); });
    $("kit-prog").style.width = (step / STEPS * 100) + "%";
    $("kit-count").textContent = "Question " + step + " of " + STEPS;
    $("kit-back").style.visibility = step === 1 ? "hidden" : "visible";
    $("kit-next").textContent = step === STEPS ? "Show my replies" : "Next";
    var first = form.querySelector('.kit-step.active input[type=text]'); if (first && window.innerWidth > 700) first.focus();
  }
  function validStep() {
    var s = form.querySelector('.kit-step[data-step="' + step + '"]'), ok = true;
    s.querySelectorAll(".field").forEach(function (f) { f.classList.remove("invalid"); });
    s.querySelectorAll("input[required]").forEach(function (i) { if (!i.value.trim()) { i.closest(".field").classList.add("invalid"); ok = false; } });
    if (step === 3) { var m = $("k_min"); if (m.value && !num(m.value)) { m.closest(".field").classList.add("invalid"); ok = false; } }
    if (step === 4 && form.querySelector("[name=out]:checked").value === "yes") {
      ["k_time_other", "k_fee_other"].forEach(function (id) { var i = $(id); if (!i.value.trim()) { i.closest(".field").classList.add("invalid"); ok = false; } });
    }
    if (step === 5 && !form.querySelectorAll("[name=pay]:checked").length) { $("pay-field").classList.add("invalid"); ok = false; }
    return ok;
  }
  form.querySelectorAll("[name=out]").forEach(function (r) {
    r.addEventListener("change", function () { $("out-fields").classList.toggle("hidden", form.querySelector("[name=out]:checked").value === "no"); });
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validStep()) return;
    if (step < STEPS) { step++; show(); window.scrollTo({ top: form.offsetTop - 90, behavior: "smooth" }); return; }
    readForm(); saveAnswers(); CT.track("kit_completed", { tone: tone });
    form.classList.add("hidden"); $("kit-results").classList.remove("hidden"); render(); window.scrollTo(0, 0);
  });
  $("kit-back").addEventListener("click", function () { if (step > 1) { step--; show(); } });
  $("kit-start").addEventListener("click", function () {
    $("kit-intro").classList.add("hidden"); form.classList.remove("hidden"); show(); CT.track("kit_started");
  });

  /* ---------------- unlock (the only data sent) ---------------- */
  CT.setupForm($("unlock-form"), {
    onSubmit: function (d) {
      var lead = {
        first_name: d.first_name, whatsapp: d.whatsapp, business_name: A.biz.slice(0, 80) || null,
        what_they_sell: A.item.slice(0, 120) || null, city: A.city.slice(0, 60) || null, tone: tone,
        consent_privacy: true, consent_updates: d.consent_updates === "on", source: CT.source
      };
      // Never block the visitor from their kit because of a network problem.
      return CT.insert("reply_kit_leads", lead).catch(function (err) { console.warn("Lead not saved:", err && err.message); });
    },
    onSuccess: function (res, d) {
      unlocked = { first: d ? d.first_name : "", whatsapp: d ? d.whatsapp : "" };
      CT.store.set("ct_kit_unlocked", unlocked);
      CT.track("kit_unlocked", { tone: tone });
      render(); window.scrollTo({ top: $("kit-results").offsetTop - 80, behavior: "smooth" });
    }
  });

  /* ---------------- returning visitors ---------------- */
  if (loadAnswers()) {
    $("out-fields").classList.toggle("hidden", (form.querySelector("[name=out]:checked") || {}).value === "no");
    var again = document.createElement("button");
    again.className = "btn btn-ghost"; again.style.marginLeft = "8px"; again.textContent = "See my saved kit";
    again.addEventListener("click", function () {
      readForm(); $("kit-intro").classList.add("hidden"); $("kit-results").classList.remove("hidden"); render();
    });
    $("kit-start").textContent = "Start with new answers";
    $("kit-start").after(again);
  }
})();
