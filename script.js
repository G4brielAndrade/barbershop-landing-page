const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => Array.from(el.querySelectorAll(q));

function openOverlay(el, backdropEl) {
  el.classList.add("is-open");
  el.setAttribute("aria-hidden", "false");
  backdropEl?.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeOverlay(el, backdropEl) {
  el.classList.remove("is-open");
  el.setAttribute("aria-hidden", "true");
  backdropEl?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$("#year").textContent = new Date().getFullYear();

const header = $("#header");
const progressBar = $("#progressBar");

function updateScrollUI() {
  const y = window.scrollY || 0;
  header.classList.toggle("is-scrolled", y > 10);

  const doc = document.documentElement;
  const max = doc.scrollHeight - doc.clientHeight;
  const pct = max > 0 ? (y / max) * 100 : 0;
  progressBar.style.width = `${pct}%`;
}
window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

/* To top */
const toTop = $("#toTop");
function updateToTop() {
  toTop.classList.toggle("is-visible", (window.scrollY || 0) > 600);
}
window.addEventListener("scroll", updateToTop, { passive: true });
updateToTop();
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* Drawer */
const drawer = $("#drawer");
const burger = $("#burger");
const closeDrawerBtn = $("#closeDrawer");
const drawerBackdrop = $("#drawerBackdrop");

function openDrawer() {
  burger.setAttribute("aria-expanded", "true");
  openOverlay(drawer, drawerBackdrop);
}
function closeDrawer() {
  burger.setAttribute("aria-expanded", "false");
  closeOverlay(drawer, drawerBackdrop);
}
burger.addEventListener("click", openDrawer);
closeDrawerBtn.addEventListener("click", closeDrawer);
drawerBackdrop.addEventListener("click", closeDrawer);
$$(".drawer__link").forEach(a => a.addEventListener("click", closeDrawer));

/* Active nav */
const sections = ["inicio", "servicos", "time", "clientes", "horarios", "contato"];
const navLinks = $$(".nav__link");

const ioNav = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
  });
}, { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 });

sections.forEach(id => {
  const el = document.getElementById(id);
  if (el) ioNav.observe(el);
});

/* Reveal on scroll */
const revealEls = $$(".reveal");
const ioReveal = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("is-in");
      ioReveal.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => ioReveal.observe(el));

/* Shuffle services */
const serviceCards = $("#serviceCards");
$("#shuffleCards")?.addEventListener("click", () => {
  const items = $$(".card", serviceCards);
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  items.forEach(it => serviceCards.appendChild(it));
});

/* Slider */
const track = $("#track");
const prev = $("#prev");
const next = $("#next");
const slides = $$(".slide", track);

let idx = 0;
function goTo(i) {
  idx = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${idx * 100}%)`;
}
prev?.addEventListener("click", () => goTo(idx - 1));
next?.addEventListener("click", () => goTo(idx + 1));

let timer = setInterval(() => goTo(idx + 1), 5500);
track?.addEventListener("mouseenter", () => clearInterval(timer));
track?.addEventListener("mouseleave", () => (timer = setInterval(() => goTo(idx + 1), 5500)));
track?.addEventListener("focusin", () => clearInterval(timer));
track?.addEventListener("focusout", () => (timer = setInterval(() => goTo(idx + 1), 5500)));

/* Booking modal */
const bookingModal = $("#bookingModal");
const bookingBackdrop = $("#bookingBackdrop");

function openBooking() {
  openOverlay(bookingModal, bookingBackdrop);
  $("#bName")?.focus();
}
function closeBooking() {
  closeOverlay(bookingModal, bookingBackdrop);
}

["#openBooking", "#openBooking2", "#openBooking3"].forEach(sel => {
  $(sel)?.addEventListener("click", openBooking);
});
$$(".openBookingAny").forEach(btn => btn.addEventListener("click", openBooking));

$("#closeBooking")?.addEventListener("click", closeBooking);
bookingBackdrop?.addEventListener("click", closeBooking);

/* WhatsApp floating link */
const WAPP_NUMBER = "5511998712728"; // TROCA AQUI
const wappFloat = $("#wappFloat");
if (wappFloat) {
  const msg = encodeURIComponent("Olá! Vim pelo site da Old Style Barbearia. Quero agendar um horário.");
  wappFloat.href = `https://wa.me/${WAPP_NUMBER}?text=${msg}`;
}

/* Date min */
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
$("#bDate") && ($("#bDate").min = `${yyyy}-${mm}-${dd}`);

/* Form validation + WhatsApp */
function onlyDigits(s) { return (s || "").replace(/\D+/g, ""); }

function validateField(input) {
  const key = input.name || input.id;
  const err = document.querySelector(`.error[data-for="${key}"]`);
  if (!err) return true;

  let msg = "";
  const val = (input.value || "").trim();

  if (input.hasAttribute("required") && !val) msg = "Campo obrigatório.";

  if (!msg && (key === "phone" || key === "bPhone")) {
    const d = onlyDigits(val);
    if (d.length < 10) msg = "Digite um WhatsApp válido.";
  }

  err.textContent = msg;
  return !msg;
}

function bindValidation(form) {
  const inputs = $$("input, select, textarea", form);

  inputs.forEach(inp => {
    inp.addEventListener("blur", () => validateField(inp));
    inp.addEventListener("input", () => {
      const err = document.querySelector(`.error[data-for="${inp.name || inp.id}"]`);
      if (err?.textContent) validateField(inp);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ok = inputs.every(validateField);
    if (!ok) return;

    const data = new FormData(form);
    const lines = [];

    if (form.id === "bookingForm") {
      lines.push("Olá! Quero agendar na Old Style Barbearia:");
      lines.push(`• Nome: ${data.get("bName")}`);
      lines.push(`• WhatsApp: ${data.get("bPhone")}`);
      lines.push(`• Serviço: ${data.get("bService")}`);
      lines.push(`• Data: ${data.get("bDate")}`);
      lines.push(`• Hora: ${data.get("bTime")}`);
      const note = (data.get("bNote") || "").trim();
      if (note) lines.push(`• Obs: ${note}`);
      closeBooking();
    } else {
      lines.push("Olá! Tenho uma dúvida/solicitação na Old Style Barbearia:");
      lines.push(`• Nome: ${data.get("name")}`);
      lines.push(`• WhatsApp: ${data.get("phone")}`);
      lines.push(`• Serviço: ${data.get("service")}`);
      const m = (data.get("msg") || "").trim();
      if (m) lines.push(`• Mensagem: ${m}`);
    }

    const text = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/${WAPP_NUMBER}?text=${text}`, "_blank", "noopener,noreferrer");
    form.reset();
  });
}
bindValidation($("#contactForm"));
bindValidation($("#bookingForm"));

/* Lightbox gallery */
const lightbox = $("#lightbox");
const lbImg = $("#lbImg");
const lbClose = $("#lbClose");
const lbBackdrop = $("#lbBackdrop");
const lbPrev = $("#lbPrev");
const lbNext = $("#lbNext");

const gallery = $("#gallery");
const items = gallery ? $$(".gallery__item", gallery) : [];
let gIndex = 0;

function openLightbox(i) {
  gIndex = i;
  const full = items[gIndex].dataset.full;
  lbImg.src = full;
  items.forEach(b => b.classList.remove("is-active"));
  items[gIndex].classList.add("is-active");

  openOverlay(lightbox, lbBackdrop);
}
function closeLightbox() {
  closeOverlay(lightbox, lbBackdrop);
  lbImg.removeAttribute("src");
}
function navLightbox(dir) {
  if (!items.length) return;
  gIndex = (gIndex + dir + items.length) % items.length;
  const full = items[gIndex].dataset.full;
  lbImg.src = full;
  items.forEach(b => b.classList.remove("is-active"));
  items[gIndex].classList.add("is-active");
}

items.forEach((btn, i) => btn.addEventListener("click", () => openLightbox(i)));
lbClose?.addEventListener("click", closeLightbox);
lbBackdrop?.addEventListener("click", closeLightbox);
lbPrev?.addEventListener("click", () => navLightbox(-1));
lbNext?.addEventListener("click", () => navLightbox(1));

/* ESC + arrows */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeLightbox();
    closeBooking();
    closeDrawer();
  }
  if (lightbox?.classList.contains("is-open")) {
    if (e.key === "ArrowLeft") navLightbox(-1);
    if (e.key === "ArrowRight") navLightbox(1);
  }
});