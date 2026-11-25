/* =====================================================================
   CHADA TECH SITE CONFIG — the ONLY file you need to edit.
   Every value marked CONFIRM in the build plan lives here.
   Save the file, push to GitHub, and the whole site updates.
   ===================================================================== */
window.CHADA = {

  /* ---- Supabase (Project Settings → API). ONLY the URL + publishable/anon key.
     NEVER paste the service_role key or any Paystack secret key here. ---- */
  supabaseUrl: "https://munvxhwzeztqimrhysec.supabase.co",   // done: project "chada-tech-site"
  supabaseAnonKey: "sb_publishable_kPC6EZNA8dXv32ss_CjHsw_BTf6djnk",  // publishable key (safe to be public)

  /* ---- Free class (change these 5 lines for every monthly class) ---- */
  freeClass: {
    code: "free-2026-11-28",                 // saved with each registration
    dateLabel: "Saturday 28 November 2026",
    timeLabel: "11:00 am (WAT)",             // CONFIRM: 11 am or 4 pm
    startISO: "2026-11-28T11:00:00+01:00",   // CONFIRM: same time, used for "Add to calendar"
    minutes: 45,
    meetLink: "",                            // Google Meet link
    showMeetLinkOnThanksPage: false          // CONFIRM: false = "we'll send it on the day"
  },

  /* ---- Contact and community (CONFIRM) ---- */
  whatsappCommunityLink: "",                 // https://chat.whatsapp.com/...
  businessWhatsapp: "",                      // display format, e.g. "0801 234 5678"
  businessWhatsappIntl: "",                  // digits only, e.g. "2348012345678" (for wa.me links)
  contactEmail: "hello@chadatech.com",       // set up forwarding to Gmail in Namecheap
  tutorLinkedIn: "https://www.linkedin.com/in/",  // CONFIRM Joseph's LinkedIn URL
  socials: {
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/@",
    facebook: "https://facebook.com/",
    x: "https://x.com/"
  },

  /* ---- Inner Circle tracks (CONFIRM prices). status: "open" or "waitlist" ---- */
  tracks: {
    business:     { name: "Business",     price: 50000, status: "open",
                    paystackLink: "" },      // CONFIRM: https://paystack.com/pay/...
    professional: { name: "Professional", price: 20000, status: "waitlist",
                    paystackLink: "" },
    student:      { name: "Student",      price: 10000, status: "waitlist",
                    paystackLink: "" }
  },
  foundingPlaces: 10,
  cohortStartLabel: "Saturday 5 December 2026",

  /* ---- Policies (CONFIRM) ---- */
  refundDays: 7,
  memberRecordsRetention: "6 years, as financial records usually must be kept", // CONFIRM with an accountant

  /* ---- Analytics: "none", "plausible", "umami" or "ga4" ---- */
  analytics: { provider: "none", plausibleDomain: "", umamiWebsiteId: "", umamiSrc: "https://cloud.umami.is/script.js", ga4Id: "" },

  /* ---- Testimonials: leave empty until you have REAL ones, with permission.
     Example: { quote: "...", name: "Ada", business: "Ada's Fabrics, Lagos" } ---- */
  testimonials: []
};
