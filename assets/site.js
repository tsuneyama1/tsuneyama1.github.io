const releaseDownloadUrl =
  "https://github.com/tsuneyama1/kuzenbox-pro-site/releases/download/v4.0.1-pro/kuzenbox_pro-setup.exe";

const localDownloadUrl = "./downloads/kuzenbox_pro-setup.exe";
const activeDownloadUrl = location.protocol === "file:" ? localDownloadUrl : releaseDownloadUrl;
const accessPasswordHash = "184dc9f5cd08a35edd6d01d5eb38782b1f87d37a79d3870c18d0c7361c20a507";
const accessSessionKey = "kuzenbox_pro_access";

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function unlockSite() {
  document.body.classList.remove("locked");
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

  error.textContent = "密码不正确。";
  input.select();
});

document.querySelectorAll(".download-link").forEach((link) => {
  link.href = activeDownloadUrl;
  link.setAttribute("aria-label", "下载 KuzenBox Pro Windows 安装器");
});

const proofButton = document.querySelector("#run-proof");
const terminal = document.querySelector("#terminal-output");

const proofLines = [
  "> query google.com A",
  "app -> KuzenBox Pro DNS guard",
  "route: TUN inbound",
  "dns-out: protected",
  "STATUS: SECURE. ZERO LEAKS DETECTED.",
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
      setTimeout(tick, 180);
      return;
    }

    setTimeout(tick, 18);
  }

  tick();
}

proofButton?.addEventListener("click", () => {
  typeLines(proofLines, terminal);
});
