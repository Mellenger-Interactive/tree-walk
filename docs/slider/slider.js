// Tree Walk slider. Stop content comes from ../trees.js (shared with the 3D viewer).
// Audio: drop files in ./audio/ as stop-01.mp3 … stop-14.mp3. Until a file exists,
// that stop's player shows "Audio coming soon".

import { TREES } from "../trees.js";

const root = document.querySelector(".tw-walk");
const gallery = root.querySelector(".tw-walk__gallery");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n) => String(n).padStart(2, "0");
const ordered = [...TREES].sort((a, b) => a.stop - b.stop);
const total = ordered.length;
const byStop = new Map(ordered.map((t) => [t.stop, t]));
const neighbours = (stop) => {
  const i = ordered.findIndex((t) => t.stop === stop);
  return { prev: ordered[(i - 1 + total) % total], next: ordered[(i + 1) % total] };
};

const ARROW = '<svg viewBox="0 0 41 41" fill="none" aria-hidden="true"><path d="M21.4609 8.96875L32.9922 20.5L21.4609 32.0312M31.3906 20.5L8.00781 20.5" stroke="currentColor" stroke-width="3.84" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PLAY = '<svg class="tw-i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>';
const PAUSE = '<svg class="tw-i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4.5v16H6zM13.5 4H18v16h-4.5z" fill="currentColor"/></svg>';
const CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const playerHTML = (t) => `
  <div class="tw-audio" data-stop="${t.stop}">
    <button type="button" class="tw-audio__play" aria-label="Play audio for ${esc(t.name)}">${PLAY}${PAUSE}</button>
    <div class="tw-audio__main">
      <input class="tw-audio__bar" type="range" min="0" max="100" step="0.1" value="0" aria-label="Seek ${esc(t.name)} audio">
      <div class="tw-audio__time">Loading audio…</div>
    </div>
  </div>`;

const stepsHTML = (t, cls) => {
  const { prev, next } = neighbours(t.stop);
  return `
  <nav class="${cls}" aria-label="Stop navigation">
    <button type="button" class="tw-card__step tw-card__step--prev" data-go="${prev.stop}">${ARROW}Stop ${prev.stop}</button>
    <button type="button" class="tw-card__step tw-card__step--next" data-go="${next.stop}">Stop ${next.stop}${ARROW}</button>
  </nav>`;
};

// ---------- Cards ----------
ordered.forEach((t, i) => {
  const slide = document.createElement("swiper-slide");
  slide.innerHTML = `
    <article class="tw-card" id="stop-${t.stop}" aria-labelledby="tw-name-${t.stop}">
      <div class="tw-card__media" data-open="${t.stop}">
        <img class="tw-card__photo" src="img/stop-${pad(t.stop)}.webp" alt="" loading="${i < 4 ? "eager" : "lazy"}" decoding="async">
      </div>
      <div class="tw-card__body">
        <p class="tw-card__stop">Stop ${t.stop} <span class="tw-visually-hidden">of ${total}</span></p>
        <h3 class="tw-card__name" id="tw-name-${t.stop}">
          <button type="button" class="tw-card__open" data-open="${t.stop}" aria-haspopup="dialog">${esc(t.name)}</button>
        </h3>
        ${playerHTML(t)}
        <button type="button" class="tw-card__more" data-open="${t.stop}" aria-haspopup="dialog">More about this tree</button>
        ${stepsHTML(t, "tw-card__nav")}
      </div>
    </article>`;
  gallery.appendChild(slide);
});

// ---------- Swiper ----------
Object.assign(gallery, {
  slidesPerView: 1.08,
  spaceBetween: 20,
  speed: reduceMotion ? 0 : 300,
  breakpoints: {
    640: { slidesPerView: 2 },
    865: { slidesPerView: 3 },
    1280: { slidesPerView: 4 },
  },
  navigation: {
    prevEl: root.querySelector(".tw-walk__arrow--prev"),
    nextEl: root.querySelector(".tw-walk__arrow--next"),
  },
  keyboard: { enabled: true, onlyInViewport: true },
  a11y: { slideRole: "group", slideLabelMessage: "Stop {{index}} of {{slidesLength}}" },
  injectStyles: [":host .swiper { overflow: visible; }"],
});
gallery.initialize();
const swiper = gallery.swiper;

function goTo(stop, { focus = false } = {}) {
  const idx = ordered.findIndex((t) => t.stop === stop);
  if (idx < 0) return;
  swiper.slideTo(idx);
  const card = root.querySelector(`#stop-${stop}`);
  root.querySelectorAll(".tw-card.is-target").forEach((c) => c.classList.remove("is-target"));
  card.classList.add("is-target");
  setTimeout(() => card.classList.remove("is-target"), 1600);
  if (focus) card.querySelector(".tw-card__open").focus({ preventScroll: true });
  history.replaceState(null, "", `#stop-${stop}`);
}

// ---------- Audio: one <audio> per stop, shared by the card and the panel ----------
const fmt = (s) => (isFinite(s) ? `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}` : "0:00");
const players = new Map();
let current = null;

function player(stop) {
  if (players.has(stop)) return players.get(stop);
  const audio = new Audio();
  audio.preload = "metadata";
  const p = { audio, views: new Set(), unavailable: false };
  const paintAll = () => p.views.forEach(paint);
  audio.addEventListener("error", () => { p.unavailable = true; paintAll(); });
  ["loadedmetadata", "timeupdate", "play", "pause"].forEach((ev) => audio.addEventListener(ev, paintAll));
  audio.addEventListener("ended", () => { audio.currentTime = 0; paintAll(); });
  audio.src = `audio/stop-${pad(stop)}.mp3`;
  players.set(stop, p);

  function paint(wrap) {
    const btn = wrap.querySelector(".tw-audio__play");
    const bar = wrap.querySelector(".tw-audio__bar");
    const time = wrap.querySelector(".tw-audio__time");
    if (p.unavailable) {
      wrap.classList.add("is-unavailable");
      btn.disabled = true;
      btn.setAttribute("aria-label", "Audio coming soon");
      time.textContent = "Audio coming soon";
      return;
    }
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    bar.value = pct;
    bar.style.setProperty("--tw-pct", pct + "%");
    time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    wrap.classList.toggle("is-playing", !audio.paused);
  }
  p.paint = paint;
  return p;
}

function bindPlayer(wrap) {
  const p = player(Number(wrap.dataset.stop));
  p.views.add(wrap);
  wrap._player = p;
  wrap.querySelector(".tw-audio__play").addEventListener("click", () => {
    const a = p.audio;
    if (a.paused) {
      if (current && current !== a) current.pause(); // one stop at a time
      current = a;
      a.play().catch(() => { p.unavailable = true; p.views.forEach(p.paint); });
    } else a.pause();
  });
  wrap.querySelector(".tw-audio__bar").addEventListener("input", (e) => {
    if (p.audio.duration) p.audio.currentTime = (e.target.value / 100) * p.audio.duration;
  });
  p.paint(wrap);
}
const unbindPlayer = (wrap) => wrap?._player?.views.delete(wrap);

root.querySelectorAll(".tw-card .tw-audio").forEach(bindPlayer);

// ---------- Detail panel ----------
const panel = document.createElement("dialog");
panel.className = "tw-panel";
panel.setAttribute("aria-labelledby", "tw-panel-name");
root.appendChild(panel);

function renderPanel(stop) {
  const t = byStop.get(stop);
  unbindPlayer(panel.querySelector(".tw-audio"));
  panel.innerHTML = `
    <div class="tw-panel__media">
      <img src="img/stop-${pad(t.stop)}.webp" alt="${esc(t.name)} at stop ${t.stop}">
      <button type="button" class="tw-panel__close" aria-label="Close">${CLOSE}</button>
    </div>
    <div class="tw-panel__body">
      <p class="tw-card__stop">Stop ${t.stop} of ${total}</p>
      <h2 class="tw-panel__name" id="tw-panel-name">${esc(t.name)}</h2>
      <p class="tw-panel__meta"><i>${esc(t.latin)}</i>${t.origin ? ` · From ${esc(t.origin)}` : ""}</p>
      ${playerHTML(t)}
      ${t.observe?.length ? `
      <h3 class="tw-panel__h">What to look for</h3>
      <dl class="tw-panel__observe">
        ${t.observe.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
      </dl>` : ""}
      ${t.fun?.length ? `
      <h3 class="tw-panel__h">Did you know?</h3>
      ${t.fun.map((p) => `<p class="tw-panel__fact">${esc(p)}</p>`).join("")}` : ""}
      ${stepsHTML(t, "tw-panel__nav")}
    </div>`;
  panel.dataset.stop = stop;
  bindPlayer(panel.querySelector(".tw-audio"));
  panel.scrollTop = 0;
}

function openPanel(stop) {
  renderPanel(stop);
  if (!panel.open) {
    panel.showModal();
    document.documentElement.classList.add("tw-lock");
  }
  panel.querySelector(".tw-panel__close").focus();
  history.replaceState(null, "", `#stop-${stop}`);
}
panel.addEventListener("close", () => {
  document.documentElement.classList.remove("tw-lock");
  const stop = Number(panel.dataset.stop);
  root.querySelector(`#stop-${stop} .tw-card__open`)?.focus({ preventScroll: true });
});
panel.addEventListener("click", (e) => {
  if (e.target.closest(".tw-panel__close")) return panel.close();
  // Click on the backdrop (outside the panel box) closes it
  const r = panel.getBoundingClientRect();
  if (e.target === panel && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) panel.close();
});

// ---------- Clicks ----------
root.addEventListener("click", (e) => {
  const step = e.target.closest(".tw-card__step");
  if (step) {
    const stop = Number(step.dataset.go);
    if (panel.contains(step)) { renderPanel(stop); swiper.slideTo(ordered.findIndex((t) => t.stop === stop)); panel.querySelector(".tw-panel__close").focus(); history.replaceState(null, "", `#stop-${stop}`); }
    else goTo(stop, { focus: true });
    return;
  }
  const open = e.target.closest("[data-open]");
  if (open && !panel.contains(open)) openPanel(Number(open.dataset.open));
});

// Deep link: #stop-N scrolls the slider to that stop
const fromHash = () => {
  const m = location.hash.match(/^#stop-(\d+)$/);
  if (m && byStop.has(Number(m[1]))) goTo(Number(m[1]));
};
fromHash();
addEventListener("hashchange", fromHash);
