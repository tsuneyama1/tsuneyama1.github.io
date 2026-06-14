const releaseDownloadUrl =
  "https://github.com/tsuneyama1/kuzenbox-pro-site/releases/download/v4.0.1-pro/kuzenbox_pro-setup.exe";

const localDownloadUrl = "./downloads/kuzenbox_pro-setup.exe";
const activeDownloadUrl = location.protocol === "file:" ? localDownloadUrl : releaseDownloadUrl;
const accessPasswordHash = "184dc9f5cd08a35edd6d01d5eb38782b1f87d37a79d3870c18d0c7361c20a507";
const accessSessionKey = "kuzenbox_pro_access";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let particleStarted = false;

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function unlockSite() {
  document.body.classList.remove("locked");
  runIntro();
  startParticleField();
}

function startParticleField() {
  const canvas = document.querySelector("#particle-field");
  if (!canvas || reduceMotion || particleStarted) return;

  particleStarted = true;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const mobileQuery = window.matchMedia("(max-width: 700px)");
  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    particles: [],
    lastFrame: 0,
    targetFrameMs: 42,
  };

  function makeSprite(color) {
    const size = 28;
    const sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;
    const spriteCtx = sprite.getContext("2d");
    const gradient = spriteCtx.createRadialGradient(14, 14, 0, 14, 14, 14);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.26, color.replace("0.9", "0.34"));
    gradient.addColorStop(1, "rgba(139, 184, 255, 0)");
    spriteCtx.fillStyle = gradient;
    spriteCtx.fillRect(0, 0, size, size);
    return sprite;
  }

  const blueSprite = makeSprite("rgba(139, 184, 255, 0.9)");
  const paleSprite = makeSprite("rgba(213, 224, 255, 0.9)");

  function createParticle() {
    const speed = mobileQuery.matches ? 0.045 : 0.075;
    return {
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: 8 + Math.random() * (mobileQuery.matches ? 10 : 16),
      alpha: 0.26 + Math.random() * 0.46,
      sprite: Math.random() > 0.78 ? paleSprite : blueSprite,
    };
  }

  function resize() {
    state.dpr = Math.min(window.devicePixelRatio || 1, mobileQuery.matches ? 1 : 1.25);
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    const count = mobileQuery.matches ? 18 : 34;
    state.particles = Array.from({ length: count }, createParticle);
  }

  function draw(time) {
    window.requestAnimationFrame(draw);
    if (document.hidden || time - state.lastFrame < state.targetFrameMs) return;
    state.lastFrame = time;

    ctx.clearRect(0, 0, state.width, state.height);
    ctx.globalCompositeOperation = "lighter";

    for (const particle of state.particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -particle.size) particle.x = state.width + particle.size;
      if (particle.x > state.width + particle.size) particle.x = -particle.size;
      if (particle.y < -particle.size) particle.y = state.height + particle.size;
      if (particle.y > state.height + particle.size) particle.y = -particle.size;

      ctx.globalAlpha = particle.alpha;
      ctx.drawImage(
        particle.sprite,
        particle.x - particle.size / 2,
        particle.y - particle.size / 2,
        particle.size,
        particle.size
      );
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  mobileQuery.addEventListener?.("change", resize);
  window.requestAnimationFrame(draw);
}

function runIntro() {
  const counter = document.querySelector("#loader-count");
  if (!counter || !document.body.classList.contains("loading")) return;

  if (reduceMotion) {
    counter.textContent = "100%";
    document.body.classList.remove("loading");
    return;
  }

  let value = 0;
  const timer = window.setInterval(() => {
    value += Math.ceil((100 - value) / 7);
    counter.textContent = `${Math.min(value, 100)}%`;

    if (value >= 100) {
      window.clearInterval(timer);
      window.setTimeout(() => document.body.classList.remove("loading"), 320);
    }
  }, 58);
}

if (sessionStorage.getItem(accessSessionKey) === "granted") {
  unlockSite();
}

document.querySelector("#password-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = document.querySelector("#site-password");
  const error = document.querySelector("#password-error");
  const password = input?.value ?? "";

  if ((await sha256Hex(password)) === accessPasswordHash) {
    sessionStorage.setItem(accessSessionKey, "granted");
    unlockSite();
    input.value = "";
    error.textContent = "";
    return;
  }

  error.textContent = "Incorrect password.";
  input.select();
});

document.querySelectorAll(".download-link").forEach((link) => {
  link.href = activeDownloadUrl;
  link.setAttribute("aria-label", "Download KuzenBox Pro Windows installer");
});

const heroWord = document.querySelector("#hero-word");
const stageStatus = document.querySelector("#stage-status");
const heroWords = [
  { word: "every packet", status: "TUN / ACTIVE" },
  { word: "DNS queries", status: "DNS / GUARDED" },
  { word: "AnyTLS flows", status: "ANYTLS / READY" },
  { word: "rule sets", status: "RULES / SYNCED" },
];

let heroIndex = 0;
if (heroWord && !reduceMotion) {
  window.setInterval(() => {
    heroIndex = (heroIndex + 1) % heroWords.length;
    heroWord.classList.add("is-changing");

    window.setTimeout(() => {
      heroWord.textContent = heroWords[heroIndex].word;
      if (stageStatus) stageStatus.textContent = heroWords[heroIndex].status;
      heroWord.classList.remove("is-changing");
    }, 360);
  }, 2800);
}

const featureTabs = [...document.querySelectorAll(".feature-tab")];
const featurePanels = [...document.querySelectorAll(".feature-panel")];
let activeFeature = 0;

function setFeature(index) {
  activeFeature = index % featurePanels.length;
  featureTabs.forEach((tab, tabIndex) => tab.classList.toggle("is-active", tabIndex === activeFeature));
  featurePanels.forEach((panel, panelIndex) => panel.classList.toggle("is-active", panelIndex === activeFeature));
}

featureTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const next = Number(tab.dataset.feature || 0);
    setFeature(next);
  });
});

if (featurePanels.length && !reduceMotion) {
  window.setInterval(() => setFeature(activeFeature + 1), 4200);
}

const terminal = document.querySelector("#terminal-output");
const proofLines = [
  ["> open route plane", "tun-in: all app traffic captured", "strict route: effective", "dns-out: protected"],
  ["> resolve example.com", "query intercepted before local resolver", "request stays inside tunnel", "STATUS: ZERO LEAK PATH"],
  ["> import anytls profile", "profile type: first-class", "chain generation: available", "route decision: ready"],
];

function typeLines(lines, target) {
  target.textContent = "";
  let lineIndex = 0;
  let charIndex = 0;

  function tick() {
    if (lineIndex >= lines.length) return;

    const line = lines[lineIndex];
    target.textContent += line.charAt(charIndex);
    charIndex += 1;

    if (charIndex > line.length) {
      target.textContent += "\n";
      lineIndex += 1;
      charIndex = 0;
      window.setTimeout(tick, 180);
      return;
    }

    window.setTimeout(tick, reduceMotion ? 1 : 18);
  }

  tick();
}

let terminalIndex = 0;
function runTerminalSequence() {
  if (!terminal) return;
  typeLines(proofLines[terminalIndex], terminal);
  terminalIndex = (terminalIndex + 1) % proofLines.length;
}

runTerminalSequence();
if (!reduceMotion) {
  window.setInterval(runTerminalSequence, 5200);
}
