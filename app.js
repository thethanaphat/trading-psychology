const ORDER_PAGE_URL = "signup.html";

const PROMOTION_END = new Date("2026-09-13T23:59:59+07:00");

function updateCountdown() {
  const remaining = PROMOTION_END.getTime() - Date.now();
  const targets = document.querySelectorAll("[data-countdown]");

  if (remaining <= 0) {
    targets.forEach((target) => { target.textContent = "ราคาเปิดตัวสิ้นสุดแล้ว"; });
    return;
  }

  const totalMinutes = Math.floor(remaining / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const label = `เหลือเวลา ${days} วัน ${hours} ชั่วโมง ${minutes} นาที`;
  targets.forEach((target) => { target.textContent = label; });
}

function openOrderPage(event) {
  const packageName = event.currentTarget.dataset.package;
  const target = new URL(ORDER_PAGE_URL, window.location.href);
  if (packageName) target.searchParams.set("package", packageName);
  window.location.href = target.href;
}

document.querySelectorAll("[data-order-button]").forEach((button) => {
  button.addEventListener("click", openOrderPage);
});

const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("figcaption");

document.querySelectorAll("[data-lightbox]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    lightboxImage.src = trigger.dataset.lightbox;
    lightboxImage.alt = trigger.dataset.caption || "ภาพตัวอย่าง";
    lightboxCaption.textContent = trigger.dataset.caption || "ภาพตัวอย่าง";
    lightbox.showModal();
  });
});

document.querySelectorAll("[data-youtube-id]").forEach((container) => {
  const trigger = container.querySelector(".video-poster");
  if (!trigger) return;

  trigger.addEventListener("click", () => {
    const videoId = container.dataset.youtubeId;
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
    iframe.title = "วิดีโอแนะนำการใช้งาน PTM Journal";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    trigger.replaceWith(iframe);
  });
});

lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});

updateCountdown();
setInterval(updateCountdown, 60000);
