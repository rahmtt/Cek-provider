const $ = (id) => document.getElementById(id);
const input = $("number");
const btn = $("btn");
const resultsContainer = $("results-container");
const rawOut = $("raw-out");

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

  // 1. KARTU INFO (Mengekstrak data dari subs_info)
  if (dataObj.subs_info) {
    const s = dataObj.subs_info;
    const cardInfo = document.createElement("div");
    cardInfo.className = "result-card bg-pink";
    
    cardInfo.innerHTML = `
      <h3>INFO KARTU</h3>
      <div class="data-row"><span>Nomor HP:</span> <strong>${s.msisdn || '-'}</strong></div>
      <div class="data-row"><span>Operator:</span> <strong>${s.operator || '-'}</strong></div>
      <div class="data-row"><span>Status ID:</span> <strong>${s.id_verified || '-'}</strong></div>
      <div class="data-row"><span>Jaringan:</span> <strong>${s.net_type || '-'}</strong></div>
      <div class="data-row"><span>Masa Aktif:</span> <strong>${s.exp_date || '-'}</strong></div>
      <div class="data-row"><span>Masa Tenggang:</span> <strong>${s.grace_until || '-'}</strong></div>
    `;
    resultsContainer.appendChild(cardInfo);
  }

  // 2. PAKET INFO (Mengekstrak data dari package_info)
  if (dataObj.package_info) {
    const pInfo = dataObj.package_info;
    const cardPkg = document.createElement("div");
    cardPkg.className = "result-card bg-blue";
    
    let pkgHTML = `<h3>INFO PAKET</h3>`;

    // Cek apakah ada pesan error spesifik (misal: tidak memiliki paket)
    if (pInfo.error_message && pInfo.packages && pInfo.packages.length === 0) {
      pkgHTML += `<div class="alert-msg">${pInfo.error_message}</div>`;
    } 
    // Jika ada paket aktif, loop datanya
    else if (pInfo.packages && pInfo.packages.length > 0) {
      pInfo.packages.forEach((pkg, index) => {
        // Karena kadang struktur API beda, kita render fleksibel
        const name = pkg.name || pkg.pkg_name || `Paket ${index + 1}`;
        const activeUntil = pkg.active_until || pkg.exp_date || pkg.expired || 'Tidak diketahui';
        
        pkgHTML += `
          <div class="pkg-item">
            <strong>${name}</strong><br>
            <span>Expired: ${activeUntil}</span>
          </div>
        `;
      });
    } else {
      pkgHTML += `<div class="alert-msg">Tidak ada data paket aktif.</div>`;
    }

    cardPkg.innerHTML = pkgHTML;
    resultsContainer.appendChild(cardPkg);
  }

  // Jika suatu saat API berubah dan nggak ada subs_info/package_info
  if (!dataObj.subs_info && !dataObj.package_info) {
     const fallbackCard = document.createElement("div");
     fallbackCard.className = "result-card bg-yellow";
     fallbackCard.innerHTML = `<h3>RAW DATA</h3><pre style="font-size:12px; white-space:pre-wrap;">${JSON.stringify(dataObj, null, 2)}</pre>`;
     resultsContainer.appendChild(fallbackCard);
  }
}

async function run() {
  const number = input.value.trim();
  if (!number) {
    showError("Nomor tidak boleh kosong bozz!");
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
      // Panggil fungsi parse yang baru!
      renderHumanReadable(data.results);
    } else {
      showError(data?.message || "Gagal mengambil data, mungkin nomor salah atau server limit.");
    }
  } catch (e) {
    showError("Terjadi kesalahan jaringan / server.");
  } finally {
    btn.disabled = false;
    btn.textContent = "CARI DATA";
  }
}

btn.addEventListener("click", run);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") run();
});
