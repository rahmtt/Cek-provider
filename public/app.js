const $ = (id) => document.getElementById(id);
const input = $("number");
const btn = $("btn");
const resultsContainer = $("results-container");
const rawOut = $("raw-out");

// Warna background rotasi untuk style neo-brutalism
const brutalColors = ['bg-pink', 'bg-blue', 'bg-yellow', 'bg-white'];

function showRawError(message) {
  resultsContainer.innerHTML = "";
  rawOut.style.display = "block";
  rawOut.style.background = "#FF4C4C"; // Red error
  rawOut.style.color = "#FFF";
  rawOut.textContent = `[ERROR]\n\n${message}`;
}

function renderCards(dataObj) {
  resultsContainer.innerHTML = "";
  rawOut.style.display = "none";
  
  // Jika balasan bukan objek/array, buang ke raw
  if (!dataObj || typeof dataObj !== 'object') {
    rawOut.style.display = "block";
    rawOut.style.background = "#fff";
    rawOut.style.color = "#000";
    rawOut.textContent = JSON.stringify(dataObj, null, 2);
    return;
  }

  let colorIdx = 0;

  // Loop setiap kunci (key) di dalam data result
  for (const [key, value] of Object.entries(dataObj)) {
    const card = document.createElement("div");
    card.className = `result-card ${brutalColors[colorIdx % brutalColors.length]}`;
    
    const title = document.createElement("h3");
    title.textContent = key.replace(/_/g, " ");
    card.appendChild(title);

    const content = document.createElement("div");
    if (typeof value === "object" && value !== null) {
      // Jika datanya array/objek (misal: list paket), tampilkan rapi dalam <pre>
      const pre = document.createElement("pre");
      pre.textContent = JSON.stringify(value, null, 2);
      content.appendChild(pre);
    } else {
      // Jika datanya text biasa (misal: pulsa, sisa kuota)
      content.innerHTML = `<div class="val">${value}</div>`;
    }
    
    card.appendChild(content);
    resultsContainer.appendChild(card);
    colorIdx++;
  }
}

async function run() {
  const number = input.value.trim();
  if (!number) return;

  btn.disabled = true;
  btn.textContent = "MIKIR...";
  
  // Reset UI
  resultsContainer.innerHTML = "";
  rawOut.style.display = "none";

  try {
    const res = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data?.success) {
      // API berhasil, render jadi kartu
      renderCards(data.results);
    } else {
      // Gagal di API / Nomor salah
      showRawError(data?.message || "Gagal mengambil data dari server.");
    }
  } catch (e) {
    showRawError(e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "CEK NOMOR";
  }
}

btn.addEventListener("click", run);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") run();
});
