const $ = (id) => document.getElementById(id);
const input = $("number");
const btn = $("btn");
const resultsContainer = $("results-container");
const rawOut = $("raw-out");

// --- MODAL LOGIC ---
const modal = $("info-modal");
const openModalBtn = $("open-info");
const closeModalBtn = $("close-info");

const toggleModal = () => modal.classList.toggle("open");

openModalBtn.addEventListener("click", toggleModal);
closeModalBtn.addEventListener("click", toggleModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) toggleModal();
});


// --- DATA PARSING LOGIC ---
function showError(message) {
  resultsContainer.innerHTML = "";
  rawOut.style.display = "block";
  rawOut.textContent = `[GAGAL] ${message}`;
}

function renderHumanReadable(dataObj) {
  resultsContainer.innerHTML = "";
  rawOut.style.display = "none";

  if (!dataObj || typeof dataObj !== 'object') {
    showError("Data tidak valid dari server.");
    return;
  }

  // 1. KARTU INFO
  if (dataObj.subs_info) {
    const s = dataObj.subs_info;
    const cardInfo = document.createElement("div");
    cardInfo.className = "result-card bg-pink";
    
    // Logic Status ID
    let statusRegistrasi = s.id_verified;
    if (s.id_verified === "Sudah") {
      statusRegistrasi = "✅ Terdaftar (NIK/KK)";
    } else if (s.id_verified === "Belum") {
      statusRegistrasi = "❌ Belum Registrasi";
    }

    // Ditambah Icon FontAwesome biar makin enak dibaca
    cardInfo.innerHTML = `
      <h3><i class="fa-solid fa-sim-card"></i> INFO KARTU</h3>
      <div class="data-row"><span><i class="fa-solid fa-phone"></i> Nomor HP:</span> <strong>${s.msisdn || '-'}</strong></div>
      <div class="data-row"><span><i class="fa-solid fa-tower-cell"></i> Operator:</span> <strong>${s.operator || '-'}</strong></div>
      <div class="data-row"><span><i class="fa-solid fa-id-card-clip"></i> Registrasi NIK:</span> <strong>${statusRegistrasi}</strong></div>
      <div class="data-row"><span><i class="fa-solid fa-signal"></i> Jaringan:</span> <strong>${s.net_type || '-'}</strong></div>
      <div class="data-row"><span><i class="fa-regular fa-calendar-check"></i> Masa Aktif:</span> <strong>${s.exp_date || '-'}</strong></div>
      <div class="data-row"><span><i class="fa-solid fa-triangle-exclamation"></i> Masa Tenggang:</span> <strong>${s.grace_until || '-'}</strong></div>
    `;
    resultsContainer.appendChild(cardInfo);
  }

  // 2. PAKET INFO
  if (dataObj.package_info) {
    const pInfo = dataObj.package_info;
    const cardPkg = document.createElement("div");
    cardPkg.className = "result-card bg-blue";
    
    let pkgHTML = `<h3><i class="fa-solid fa-box-open"></i> INFO PAKET</h3>`;

    if (pInfo.error_message && pInfo.packages && pInfo.packages.length === 0) {
      pkgHTML += `<div class="alert-msg">${pInfo.error_message}</div>`;
    } 
    else if (pInfo.packages && pInfo.packages.length > 0) {
      pInfo.packages.forEach((pkg, index) => {
        const name = pkg.name || pkg.pkg_name || `Paket ${index + 1}`;
        const activeUntil = pkg.active_until || pkg.exp_date || pkg.expired || 'Tidak diketahui';
        
        // Desain daftar paket dibuat lebih mencolok
        pkgHTML += `
          <div class="pkg-item">
            <span class="pkg-title"><i class="fa-solid fa-cube"></i> ${name}</span>
            <span class="pkg-exp"><i class="fa-regular fa-clock"></i> Exp: ${activeUntil}</span>
          </div>
        `;
      });
    } else {
      pkgHTML += `<div class="alert-msg">Tidak ada data paket aktif.</div>`;
    }

    cardPkg.innerHTML = pkgHTML;
    resultsContainer.appendChild(cardPkg);
  }

  // Fallback Raw
  if (!dataObj.subs_info && !dataObj.package_info) {
     const fallbackCard = document.createElement("div");
     fallbackCard.className = "result-card bg-yellow";
     fallbackCard.innerHTML = `<h3>RAW DATA</h3><pre style="font-size:11px; white-space:pre-wrap;">${JSON.stringify(dataObj, null, 2)}</pre>`;
     resultsContainer.appendChild(fallbackCard);
  }
}

async function run() {
  const number = input.value.replace(/[^0-9]/g, ''); // Ambil angka saja
  if (!number) {
    showError("Masukin nomornya dulu bos!");
    return;
  }

  btn.disabled = true;
  btn.textContent = "MEMPROSES...";
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
      renderHumanReadable(data.results);
    } else {
      showError(data?.message || "Gagal mengambil data, mungkin API sedang limit.");
    }
  } catch (e) {
    showError("Terjadi kesalahan jaringan.");
  } finally {
    btn.disabled = false;
    btn.textContent = "CARI DATA";
  }
}

btn.addEventListener("click", run);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") run();
}); 
