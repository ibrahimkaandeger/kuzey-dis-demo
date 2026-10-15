// ---- Ayarlar: müşteriye teslimde sadece burayı değiştir ----
const WHATSAPP_NO = "905000000000"; // ülke koduyla, başında + olmadan
const SAATLER = {
  // 0 = Pazar ... 6 = Cumartesi  →  [açılış, kapanış] ya da null (kapalı)
  0: null, 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 15],
};
const TEDAVILER = [
  { ad: "İmplant Tedavisi", acik: "Eksik dişlerin yerine çene kemiğine yerleştirilen titanyum vidalar üzerine sabit protez." },
  { ad: "Ortodonti & Şeffaf Plak", acik: "Çapraşık dişlerin tel ya da şeffaf plaklarla düzenlenmesi." },
  { ad: "Kanal Tedavisi", acik: "İltihaplanmış diş sinirinin temizlenip dişin ağızda korunması." },
  { ad: "Diş Beyazlatma", acik: "Hekim kontrolünde ofis tipi veya ev tipi beyazlatma uygulamaları." },
  { ad: "Çocuk Diş Hekimliği", acik: "Süt dişi tedavileri, fissür örtücü ve flor gibi koruyucu uygulamalar." },
  { ad: "Estetik Diş Hekimliği", acik: "Zirkonyum kron, lamina ve estetik dolgu ile gülüş tasarımı." },
];
// -------------------------------------------------------------

const waLink = (text) => `https://wa.me/${WHATSAPP_NO}?text=${encodeURIComponent(text)}`;

// Mobil menü
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", false);
  })
);

// Açık / kapalı durumu
function updateStatus() {
  const now = new Date();
  const bugun = SAATLER[now.getDay()];
  const saat = now.getHours() + now.getMinutes() / 60;
  const el = document.getElementById("status");
  if (bugun && saat >= bugun[0] && saat < bugun[1]) {
    el.innerHTML = `<span class="st-open">Şu an açığız</span> · ${bugun[1]}:00'a kadar`;
    return;
  }
  // Bir sonraki açılışı bul
  for (let i = bugun && saat < bugun[0] ? 0 : 1; i <= 7; i++) {
    const gun = (now.getDay() + i) % 7;
    if (SAATLER[gun]) {
      const ne = i === 0 ? "bugün" : i === 1 ? "yarın" : new Date(now.getTime() + i * 864e5).toLocaleDateString("tr-TR", { weekday: "long" });
      el.innerHTML = `<span class="st-closed">Şu an kapalıyız</span> · ${ne} ${String(SAATLER[gun][0]).padStart(2, "0")}:00'da açılıyoruz`;
      return;
    }
  }
}
updateStatus();
setInterval(updateStatus, 60000);

// Tedavi kartları + form seçenekleri
const cards = document.getElementById("treatments");
const select = document.getElementById("treatment-select");
select.innerHTML = `<option value="Genel muayene">Genel muayene / kontrol</option>` +
  TEDAVILER.map((t) => `<option>${t.ad}</option>`).join("");
cards.innerHTML = TEDAVILER.map((t, i) => `
  <article class="card">
    <span class="num">${String(i + 1).padStart(2, "0")}</span>
    <h3>${t.ad}</h3>
    <p>${t.acik}</p>
    <button type="button" data-tedavi="${t.ad}">Randevu talebi →</button>
  </article>`).join("");
cards.addEventListener("click", (e) => {
  const ad = e.target.dataset?.tedavi;
  if (!ad) return;
  select.value = ad;
  document.getElementById("randevu").scrollIntoView();
});

// Randevu formu → WhatsApp
const form = document.getElementById("appt-form");
form.tarih.min = new Date().toLocaleDateString("sv-SE");
form.tarih.addEventListener("change", () => {
  const gun = new Date(form.tarih.value + "T12:00").getDay();
  form.tarih.setCustomValidity(SAATLER[gun] ? "" : "Pazar günleri kapalıyız, lütfen başka bir gün seçin.");
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  const tarih = new Date(d.tarih + "T12:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
  const mesaj =
    `Merhaba, randevu talebi oluşturmak istiyorum.\n` +
    `Ad: ${d.ad}\nTelefon: ${d.tel}\nTedavi: ${d.tedavi}\nTercih: ${tarih}, ${d.aralik}` +
    (d.not ? `\nŞikâyet: ${d.not}` : "");
  window.open(waLink(mesaj), "_blank");
  document.getElementById("form-msg").textContent = "WhatsApp açıldı. Mesajı gönderdiğinizde talebiniz bize ulaşacak.";
});

// KVKK penceresi
const kvkk = document.getElementById("kvkk");
document.getElementById("kvkk-link").addEventListener("click", (e) => {
  e.preventDefault();
  kvkk.showModal();
});

document.getElementById("wa-float").href = waLink("Merhaba, bilgi almak istiyorum.");

// Kaydırınca beliren bölümler
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("visible");
        observer.unobserve(en.target);
      }
    }),
  { threshold: 0.12 }
);
document.querySelectorAll(".section .container").forEach((el) => {
  el.classList.add("reveal");
  observer.observe(el);
});

document.getElementById("year").textContent = new Date().getFullYear();
