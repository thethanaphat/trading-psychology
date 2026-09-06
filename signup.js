const PACKAGES = {
  core: { label: "Core Set", amount: 790 },
  guided: { label: "Guided Set", amount: 1490 },
};

const packageOptions = document.querySelectorAll("[data-package-option]");
const selectedPackage = document.querySelector("[data-selected-package]");
const selectedAmount = document.querySelector("[data-selected-amount]");
const paymentAmount = document.querySelector("[data-payment-amount]");
const selectionMessage = document.querySelector("[data-selection-message]");
const formReminder = document.querySelector("[data-form-reminder]");
const copyAmountButton = document.querySelector("[data-copy-amount]");
const gatedLinks = document.querySelectorAll("[data-requires-package]");
const copyFeedback = document.querySelector("[data-copy-feedback]");
const formLink = document.querySelector("[data-form-link]");
const lineLink = document.querySelector("[data-line-link]");

let currentPackage = null;

function trackEvent(name, parameters = {}) {
  if (typeof window.gtag === "function") window.gtag("event", name, parameters);
}

function formatAmount(amount) {
  return new Intl.NumberFormat("th-TH").format(amount);
}

function choosePackage(packageKey, shouldScroll = false) {
  const details = PACKAGES[packageKey];
  if (!details) return;

  if (shouldScroll) trackEvent("package_select", { package_name: details.label });

  currentPackage = packageKey;
  packageOptions.forEach((option) => {
    const isSelected = option.dataset.packageOption === packageKey;
    option.classList.toggle("selected", isSelected);
    option.setAttribute("aria-pressed", String(isSelected));
  });

  const amountLabel = `${formatAmount(details.amount)} บาท`;
  selectedPackage.textContent = details.label;
  selectedAmount.textContent = amountLabel;
  paymentAmount.textContent = amountLabel;
  selectionMessage.textContent = `เลือก ${details.label} แล้ว — ยอดชำระ ${amountLabel}`;
  selectionMessage.classList.add("ready");
  formReminder.textContent = `เมื่อเปิด Form กรุณาเลือก “${details.label} — ${amountLabel}” ให้ตรงกับรายการนี้`;
  copyAmountButton.disabled = false;
  copyAmountButton.dataset.copy = String(details.amount);

  gatedLinks.forEach((link) => {
    link.classList.remove("disabled-link");
    link.removeAttribute("aria-disabled");
  });

  const url = new URL(window.location.href);
  url.searchParams.set("package", packageKey);
  window.history.replaceState({}, "", url);

  if (shouldScroll) document.querySelector("#payment")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const temporary = document.createElement("textarea");
    temporary.value = text;
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.appendChild(temporary);
    temporary.select();
    document.execCommand("copy");
    temporary.remove();
  }
  copyFeedback.textContent = "คัดลอกเรียบร้อยแล้ว";
  window.setTimeout(() => { copyFeedback.textContent = ""; }, 1800);
}

packageOptions.forEach((option) => {
  option.addEventListener("click", () => choosePackage(option.dataset.packageOption, true));
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => copyText(button.dataset.copy));
});

copyAmountButton.addEventListener("click", () => {
  if (currentPackage) copyText(String(PACKAGES[currentPackage].amount));
});

formLink?.addEventListener("click", () => {
  if (!currentPackage) return;

  trackEvent("open_registration_form", {
    package_name: PACKAGES[currentPackage].label,
  });

  if (typeof window.fbq === "function") {
    window.fbq("trackCustom", "OpenRegistrationForm", {
      package_name: PACKAGES[currentPackage].label,
    });
  }
});

lineLink?.addEventListener("click", () => {
  if (!currentPackage) return;
  trackEvent("open_line_oa", { package_name: PACKAGES[currentPackage].label });
});

const initialPackage = new URLSearchParams(window.location.search).get("package");
if (PACKAGES[initialPackage]) choosePackage(initialPackage);
