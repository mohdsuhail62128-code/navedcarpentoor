/* ==========================================================
   Naved Wood Craft - script.js
   Sab editable cheezein sirf neeche siteConfig me hain.
   ========================================================== */

const siteConfig = {
  name: "Naved Wood Craft",
  owner: "Naved Badhee",

  // Optional: city/area likhoge to hero ke upar dikhega. Khali chhodo to hide rahega.
  city: "",

  // Contact links. Khali chhodo to button par click karne se hint dikhega.
  whatsapp: "+91 9792537568",   // country code ke saath, sirf digits. Example: "919XXXXXXXXX"
  instagram: "@ZUNAIDDD._ANSARI",  // sirf username. Example: "navedwoodcraft"
  facebook: "https://www.facebook.com/navedansari.ansari.52493",   // poora page link. Example: "https://facebook.com/yourpage"

  // Admin panel ka PIN (index.html#admin ya Ctrl+Shift+A se khulta hai).
  // Dhyan: yeh sirf frontend PIN hai, asli security nahi. Backend ke baad badlenge.
  adminPin: "1234",

  // Bade background photos (optional). Example: "images/hero.jpg"
  // Khali chhodo to wood-grain placeholder dikhta hai.
  heroImage: "images/hero.jpg",
  bannerImage: "images/banner.jpeg",

  // Hero ke neeche 4 dark cards. icon: "wood" | "chair" | "house" | "tools"
  features: [
    { icon: "wood",  title: "Custom Woodwork",   text: "Made to your measurements and your choice of wood." },
    { icon: "chair", title: "Bespoke Furniture", text: "Pieces planned around your room and your taste." },
    { icon: "house", title: "Home Renovation",   text: "Doors, windows, storage and woodwork for your home." },
    { icon: "tools", title: "Precision Craft",   text: "Clean joints and careful finishing on every piece." }
  ],

  // Service cards. icon placeholder me dikhta hai; image me photo ka path do.
  services: [
    {
      icon: "chair",
      title: "Furniture Design & Build",
      text: "Beds, wardrobes, tables, kitchen cabinets and mandir units, made to your room's size.",
      image: ""
    },
    {
      icon: "house",
      title: "Home Woodworking Projects",
      text: "Doors, windows, frames, panels and staircases, fitted properly at your home.",
      image: ""
    },
    {
      icon: "tools",
      title: "Wood Restoration & Repair",
      text: "Loose joints, broken hinges, scratches and a tired finish, repaired and polished.",
      image: ""
    }
  ],

  // Real photos add karne ke liye: image me path likho, jaise "images/bed-1.jpg".
  projects: [
    { title: "Storage bed",      type: "Bedroom",   image: "", alt: "" },
    { title: "Wardrobe",         type: "Bedroom",   image: "", alt: "" },
    { title: "Main door",        type: "Doors",     image: "", alt: "" },
    { title: "Kitchen cabinets", type: "Kitchen",   image: "", alt: "" },
    { title: "Mandir unit",      type: "Living",    image: "", alt: "" },
    { title: "Dining table",     type: "Furniture", image: "", alt: "" }
  ],

  steps: [
    { title: "Tell us your need",    text: "Message us what you want made or repaired." },
    { title: "Site visit",           text: "We measure the space and note your wood and finish choice." },
    { title: "Design and price",     text: "You get a clear plan and a price before work begins." },
    { title: "Making",               text: "Your piece is built and finished in the workshop." },
    { title: "Delivery and fitting", text: "We deliver, fit and check everything with you." }
  ]
};

/* ---------- icons (line style) ---------- */
const ICONS = {
  wood:
    '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M6 34h36v6H6z"/><path d="M10 34l5-11h18l5 11"/><path d="M19 23c0-5 6-5 6 0"/><path d="M30 14c2-3 5-2 5 1"/></svg>',
  chair:
    '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M14 8v18M14 8h20M34 8v18"/><path d="M10 26h28"/><path d="M14 26v16M34 26v16"/><path d="M14 17h20"/></svg>',
  house:
    '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M6 24L24 8l18 16"/><path d="M11 21v21h26V21"/><path d="M20 42V30h8v12"/></svg>',
  tools:
    '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 12l24 24"/><path d="M36 12L12 36"/><path d="M8 16l6-8 8 8-6 6z"/><path d="M40 32l-6 8-8-8 6-6z"/></svg>'
};

/* ---------- admin ke saved projects (localStorage) ---------- */
const STORE_KEY = "nwc_projects_v1";

function loadStoredProjects() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const list = raw ? JSON.parse(raw) : null;
    return Array.isArray(list) && list.length ? list : null;
  } catch (err) {
    return null;
  }
}

// Admin se add kiye projects ho to wahi dikhao, warna siteConfig.projects
function activeProjects() {
  return loadStoredProjects() || siteConfig.projects;
}

/* ---------- helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

let toastTimer;
function toast(message) {
  const box = $("#toast");
  box.textContent = message;
  box.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (box.hidden = true), 3600);
}

/* ---------- links ---------- */
function whatsappLink(message = "9792537568") {
  const number = siteConfig.whatsapp.replace(/\D/g, "");
  if (!number) return "";
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${number}${text}`;
}

function socialLink(kind) {
  if (kind === "whatsapp") return whatsappLink(`Hello ${siteConfig.name}, I want a quote.`);
  if (kind === "instagram") {
    const user = siteConfig.instagram.replace(/^@/, "").trim();
    return user ? `https://instagram.com/${user}` : "";
  }
  if (kind === "facebook") return siteConfig.facebook.trim();
  return "";
}

function setupLinks() {
  $$("[data-link]").forEach((a) => {
    const kind = a.dataset.link;
    const url = socialLink(kind);
    if (url) {
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    } else {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        toast(`Add the ${kind} detail in siteConfig (script.js).`);
      });
    }
  });

  const none = ["whatsapp", "instagram", "facebook"].every((k) => !socialLink(k));
  if (none) {
    const note = $("#contactNote");
    note.textContent = "Contact links are not added yet.";
    note.hidden = false;
  }
}

/* ---------- text content ---------- */
function setupText() {
  $$("[data-site='name']").forEach((n) => (n.textContent = siteConfig.name));
  document.title = `${siteConfig.name} | Custom Carpentry and Furniture`;

  if (siteConfig.owner) $("#ownerLine").textContent = `by ${siteConfig.owner}`;

  if (siteConfig.city) {
    const loc = $("#heroLocation");
    loc.textContent = `Carpenter in ${siteConfig.city}`;
    loc.hidden = false;
  }
  $("#year").textContent = new Date().getFullYear();
}

/* ---------- background photos ---------- */
function setupBackgrounds() {
  const pairs = [
    ["#heroBg", siteConfig.heroImage],
    ["#bannerBg", siteConfig.bannerImage]
  ];
  pairs.forEach(([selector, src]) => {
    if (!src) return;
    const img = el("img");
    img.src = src;
    img.alt = "";
    img.decoding = "async";
    $(selector).append(img);
  });
}

/* ---------- renderers ---------- */
function renderFeatures() {
  const grid = $("#featureGrid");
  siteConfig.features.forEach((f) => {
    const card = el("article", "feature");
    card.innerHTML = ICONS[f.icon] || "";
    card.append(el("h3", "", f.title), el("p", "", f.text));
    grid.append(card);
  });
}

function renderServices() {
  const grid = $("#servicesList");
  const select = $("#fNeed");

  siteConfig.services.forEach((s, i) => {
    const card = el("article", "service-card");

    const media = el("div", `service-media tone-${[1, 3, 5][i % 3]}`);
    if (s.image) {
      const img = el("img");
      img.src = s.image;
      img.alt = s.title;
      img.loading = "lazy";
      media.append(img);
    } else {
      media.innerHTML = ICONS[s.icon] || "";
    }

    const body = el("div", "service-body");
    const btn = el("button", "btn btn-walnut btn-sm", "Request Quote");
    btn.type = "button";
    btn.addEventListener("click", () => requestQuote(s.title));
    body.append(el("h3", "", s.title), el("p", "", s.text), btn);

    card.append(media, body);
    grid.append(card);

    select.append(new Option(s.title, s.title));
  });

  select.append(new Option("Something else", "Something else"));
}

function requestQuote(title) {
  $("#fNeed").value = title;
  $("#contact").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => $("#fName").focus({ preventScroll: true }), 600);
}

function renderGallery() {
  const wrap = $("#gallery");
  wrap.replaceChildren();
  activeProjects().forEach((p, i) => {
    const tile = el("button", `tile tone-${i % 6}`);
    tile.type = "button";

    if (p.image) {
      const img = el("img");
      img.src = p.image;
      img.alt = p.alt || p.title;
      img.loading = "lazy";
      tile.append(img);
      tile.addEventListener("click", () => openLightbox(p));
    } else {
      tile.setAttribute("aria-label", `${p.title} (photo to be added)`);
    }

    const label = el("span", "tile-label", p.title);
    label.append(el("small", "", p.image ? p.type : `${p.type} - photo to be added`));
    tile.append(label);
    wrap.append(tile);
  });
}

function renderSteps() {
  const list = $("#stepsList");
  siteConfig.steps.forEach((s) => {
    const li = el("li", "step");
    li.append(el("h3", "", s.title), el("p", "", s.text));
    list.append(li);
  });
}

/* ---------- lightbox ---------- */
function openLightbox(project) {
  $("#lightboxImg").src = project.image;
  $("#lightboxImg").alt = project.alt || project.title;
  $("#lightboxCaption").textContent = `${project.title} - ${project.type}`;
  $("#lightbox").showModal();
}

function setupLightbox() {
  const box = $("#lightbox");
  box.addEventListener("click", (e) => {
    if (e.target === box) box.close(); // bahar click par band
  });
}

/* ---------- header / menu ---------- */
function setupHeader() {
  const header = $("#siteHeader");
  const btn = $("#menuBtn");
  const nav = $("#nav");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
    if (open) header.classList.add("is-scrolled");
    else onScroll();
  });

  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      nav.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      onScroll();
    }
  });
}

/* ---------- quote form -> WhatsApp ---------- */
function setupForm() {
  const form = $("#quoteForm");
  const error = $("#formError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    error.hidden = true;

    const name = form.name.value.trim();
    const need = form.need.value;
    const details = form.details.value.trim();

    if (!name) {
      error.textContent = "Please enter your name.";
      error.hidden = false;
      form.name.focus();
      return;
    }

    const message =
      `Hello ${siteConfig.name}, my name is ${name}.\n` +
      `I need: ${need}.\n` +
      (details ? `Details: ${details}` : "");

    const url = whatsappLink(message);
    if (!url) {
      toast("Add the WhatsApp number in siteConfig (script.js) first.");
      return;
    }
    window.open(url, "_blank", "noopener");
  });
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  setupText();
  setupBackgrounds();
  renderFeatures();
  renderServices();
  renderGallery();
  renderSteps();
  setupLinks();
  setupHeader();
  setupLightbox();
  setupForm();
});
