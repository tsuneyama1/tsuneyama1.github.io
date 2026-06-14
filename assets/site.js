const releaseDownloadUrl =
  "https://github.com/tsuneyama1/kuzenbox-pro-site/releases/download/v4.0.1-pro/kuzenbox_pro-setup.exe";

const localDownloadUrl = "./downloads/kuzenbox_pro-setup.exe";
const activeDownloadUrl = location.protocol === "file:" ? localDownloadUrl : releaseDownloadUrl;
const accessPasswordHash = "184dc9f5cd08a35edd6d01d5eb38782b1f87d37a79d3870c18d0c7361c20a507";
const accessSessionKey = "kuzenbox_pro_access";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function unlockSite() {
  document.body.classList.remove("locked");
  runIntro();
}

function runIntro() {
  const counter = document.querySelector("#loader-count");
  if (!counter || !document.body.classList.contains("loading")) return;

  counter.textContent = "100%";
  window.setTimeout(() => document.body.classList.remove("loading"), reduceMotion ? 0 : 180);
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

if (heroWord && stageStatus) {
  heroWord.textContent = heroWords[0].word;
  stageStatus.textContent = heroWords[0].status;
}

let heroIndex = 0;
if (heroWord && stageStatus && !reduceMotion) {
  window.setInterval(() => {
    heroIndex = (heroIndex + 1) % heroWords.length;
    heroWord.classList.add("is-changing");

    window.setTimeout(() => {
      heroWord.textContent = heroWords[heroIndex].word;
      stageStatus.textContent = heroWords[heroIndex].status;
      heroWord.classList.remove("is-changing");
    }, 360);
  }, 3200);
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
