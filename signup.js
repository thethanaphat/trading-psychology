const CHECKOUT_ENDPOINT = window.TP_CHECKOUT_ENDPOINT || "https://script.google.com/macros/s/AKfycbwzDqDKrUaEp14oimRyyWk-4nDcOzXDCM2Pu0gvjeWG9_4sT3CV1Fo0Ad-UG9c5oDzpCA/exec";

const PACKAGES = {
  core: { label: "Core Set", amount: 790 },
  guided: { label: "Guided Set", amount: 1490 },
};

const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "placement",
  "campaign_id",
  "adset_id",
  "ad_id",
  "fbclid",
  "fbp",
  "fbc",
];

const packageOptions = document.querySelectorAll("[data-package-option]");
const selectedPackage = document.querySelector("[data-selected-package]");
const selectedAmount = document.querySelector("[data-selected-amount]");
const paymentAmount = document.querySelector("[data-payment-amount]");
const selectionMessage = document.querySelector("[data-selection-message]");
const copyAmountButton = document.querySelector("[data-copy-amount]");
const copyFeedback = document.querySelector("[data-copy-feedback]");
const form = document.querySelector("[data-checkout-form]");
const guidedField = document.querySelector("[data-guided-field]");
const guidedInput = guidedField?.querySelector("input");
const formPackage = document.querySelector("[data-form-package]");
const formAmount = document.querySelector("[data-form-amount]");
const submitButton = document.querySelector("[data-submit-button]");
const submitLabel = document.querySelector("[data-submit-label]");
const formStatus = document.querySelector("[data-form-status]");
const successPanel = document.querySelector("[data-checkout-success]");
const successMessage = document.querySelector("[data-success-message]");

let currentPackage = null;
let checkoutStarted = false;
let isSubmitting = false;

function trackEvent(name, parameters = {}) {
  if (typeof window.gtag === "function") window.gtag("event", name, parameters);
}

function trackMeta(name, parameters = {}, standard = false) {
  if (typeof window.fbq !== "function") return;
  window.fbq(standard ? "track" : "trackCustom", name, parameters);
}

function formatAmount(amount) {
  return new Intl.NumberFormat("th-TH").format(amount);
}

function safeSessionGet(key) {
  try { return window.sessionStorage.getItem(key) || ""; } catch { return ""; }
}

function safeSessionSet(key, value) {
  try { window.sessionStorage.setItem(key, value); } catch { /* Storage is optional. */ }
}

function safeSessionRemove(key) {
  try { window.sessionStorage.removeItem(key); } catch { /* Storage is optional. */ }
}

function readCookie(name) {
  const prefix = `${name}=`;
  const item = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : "";
}

function collectAttribution() {
  const query = new URLSearchParams(window.location.search);
  const values = {};

  TRACKING_KEYS.forEach((key) => {
    const fromUrl = (query.get(key) || "").trim();
    if (fromUrl) safeSessionSet(`tp_checkout_${key}`, fromUrl);
    values[key] = fromUrl || safeSessionGet(`tp_checkout_${key}`);
  });

  values.fbp = values.fbp || readCookie("_fbp");
  values.fbc = values.fbc || readCookie("_fbc");
  return values;
}

function createSubmissionId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `tp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSubmissionId() {
  const stored = safeSessionGet("tp_checkout_submission_id");
  if (stored) return stored;
  const created = createSubmissionId();
  safeSessionSet("tp_checkout_submission_id", created);
  return created;
}

function setFormStatus(message = "", type = "") {
  formStatus.textContent = message;
  formStatus.className = `form-status${type ? ` ${type}` : ""}`;
}

function beginCheckout(details) {
  if (checkoutStarted) return;
  checkoutStarted = true;
  const parameters = {
    currency: "THB",
    value: details.amount,
    content_name: details.label,
    content_ids: [`trading-psychology-${currentPackage}`],
    content_type: "product",
  };
  trackEvent("begin_checkout", {
    currency: parameters.currency,
    value: parameters.value,
    package_name: parameters.content_name,
  });
  trackMeta("InitiateCheckout", parameters, true);
}

function choosePackage(packageKey, shouldScroll = false) {
  const details = PACKAGES[packageKey];
  if (!details) return;

  const changed = currentPackage !== packageKey;
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
  formPackage.textContent = details.label;
  formAmount.textContent = amountLabel;
  selectionMessage.textContent = `เลือก ${details.label} แล้ว — ยอดชำระ ${amountLabel}`;
  selectionMessage.classList.add("ready");
  copyAmountButton.disabled = false;
  copyAmountButton.dataset.copy = String(details.amount);
  submitButton.disabled = false;
  submitLabel.textContent = "ส่งข้อมูลเพื่อยืนยันการสมัคร";

  const isGuided = packageKey === "guided";
  guidedField.hidden = !isGuided;
  guidedInput.required = isGuided;
  if (!isGuided) {
    guidedInput.value = "";
    guidedInput.removeAttribute("aria-invalid");
  }

  const url = new URL(window.location.href);
  url.searchParams.set("package", packageKey);
  window.history.replaceState({}, "", url);

  if (changed) {
    trackEvent("package_select", { package_name: details.label });
    beginCheckout(details);
  }

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

function validateForm() {
  form.querySelectorAll("[aria-invalid=true]").forEach((field) => field.removeAttribute("aria-invalid"));

  if (!currentPackage) {
    setFormStatus("กรุณาเลือกแพ็กเกจก่อนส่งข้อมูล", "error");
    document.querySelector("#package")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return false;
  }

  const invalid = [...form.querySelectorAll("input, textarea")].find((field) => !field.checkValidity());
  if (invalid) {
    invalid.setAttribute("aria-invalid", "true");
    invalid.reportValidity();
    invalid.focus();
    setFormStatus("กรุณาตรวจข้อมูลในช่องที่ยังไม่ครบ", "error");
    return false;
  }

  return true;
}

function isEndpointConfigured() {
  return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?|$)/.test(CHECKOUT_ENDPOINT)
    || /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\//.test(CHECKOUT_ENDPOINT);
}

function buildPayload() {
  const data = new FormData(form);
  const tracking = collectAttribution();
  const payload = new URLSearchParams({
    action: "submitCheckout",
    submissionId: getSubmissionId(),
    packageKey: currentPackage,
    name: String(data.get("name") || "").trim(),
    email: String(data.get("email") || "").trim(),
    transferAccountName: String(data.get("transferAccountName") || "").trim(),
    transferTime: String(data.get("transferTime") || "").trim(),
    facebook: currentPackage === "guided" ? String(data.get("facebook") || "").trim() : "",
    note: String(data.get("note") || "").trim(),
    website: String(data.get("website") || "").trim(),
  });

  Object.entries(tracking).forEach(([key, value]) => payload.set(key, value || ""));
  return payload;
}

async function submitCheckout(event) {
  event.preventDefault();
  if (isSubmitting || !validateForm()) return;

  if (!isEndpointConfigured()) {
    setFormStatus("ระบบรับข้อมูลยังอยู่ระหว่างตั้งค่า กรุณาลองอีกครั้งหลังเปิดใช้งานหน้าใหม่", "error");
    return;
  }

  isSubmitting = true;
  submitButton.disabled = true;
  submitLabel.textContent = "กำลังส่งข้อมูล…";
  setFormStatus("กรุณารอสักครู่ อย่าปิดหน้านี้", "info");

  try {
    const response = await fetch(CHECKOUT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: buildPayload().toString(),
      redirect: "follow",
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = JSON.parse(await response.text());
    if (!result.ok) throw new Error(result.message || "ระบบไม่สามารถบันทึกข้อมูลได้");

    const details = PACKAGES[currentPackage];
    trackEvent("payment_confirmation_submitted", {
      currency: "THB",
      value: details.amount,
      package_name: details.label,
    });
    trackMeta("PaymentConfirmationSubmitted", {
      currency: "THB",
      value: details.amount,
      content_name: details.label,
    });

    if (result.emailSent === false) {
      successMessage.textContent = "ระบบบันทึกข้อมูลการสมัครเรียบร้อยแล้ว แต่อีเมลยืนยันอาจมาถึงช้ากว่าปกติ";
    }

    form.hidden = true;
    successPanel.hidden = false;
    successPanel.focus({ preventScroll: true });
    successPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    safeSessionRemove("tp_checkout_submission_id");
  } catch (error) {
    console.error("Checkout submission failed", error);
    setFormStatus("ยังส่งข้อมูลไม่สำเร็จ กรุณาตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง ข้อมูลที่กรอกไว้ยังอยู่", "error");
    submitButton.disabled = false;
    submitLabel.textContent = "ลองส่งข้อมูลอีกครั้ง";
  } finally {
    isSubmitting = false;
  }
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

document.querySelectorAll(".promptpay-actions a").forEach((link) => {
  link.addEventListener("click", () => trackEvent("promptpay_qr_action", {
    action: link.hasAttribute("download") ? "download" : "open",
    package_name: currentPackage ? PACKAGES[currentPackage].label : "not_selected",
  }));
});

document.querySelectorAll("[data-support-line]").forEach((link) => {
  link.addEventListener("click", () => trackEvent("open_line_oa", {
    placement: successPanel && !successPanel.hidden ? "checkout_success" : "footer",
  }));
});

form.addEventListener("submit", submitCheckout);

form.addEventListener("input", (event) => {
  event.target.removeAttribute("aria-invalid");
  if (formStatus.classList.contains("error")) setFormStatus();
});

collectAttribution();
const initialPackage = new URLSearchParams(window.location.search).get("package");
if (PACKAGES[initialPackage]) choosePackage(initialPackage);
