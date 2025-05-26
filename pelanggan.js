// pelanggan.js (Final tanpa Upload JSON)
const db = firebase.database();

// Data Paket
let dataPaket = {
  "Paket 5 Mbps": { "keterangan": "(Max 5 Device)", "harga": "150000" },
  "Paket 7 Mbps": { "keterangan": "(Max 7 Device)", "harga": "170000" },
  "Paket 10 Mbps": { "keterangan": "(Paket Bisnis)", "harga": "200000" }
};

// Update Keterangan & Harga Otomatis
function updateOtomatis() {
  const paket = document.getElementById('paketBaru').value;
  if (paket && dataPaket[paket]) {
    document.getElementById('keteranganBaru').value = dataPaket[paket].keterangan;
    document.getElementById('hargaBaru').value = dataPaket[paket].harga;
  } else {
    document.getElementById('keteranganBaru').value = '';
    document.getElementById('hargaBaru').value = '';
  }
}

// Tambah Pelanggan Baru
function tambahPelangganBaru() {
  const nama = document.getElementById('namaBaru').value.trim();
  const keterangan = document.getElementById('keteranganBaru').value.trim();
  const paket = document.getElementById('paketBaru').value.trim();
  const harga = document.getElementById('hargaBaru').value.trim();

  if (nama && paket && harga) {
    db.ref('pelanggan/aktif').once('value').then(snapshot => {
      const data = snapshot.val() || {};
      let maxID = 0;
      for (let key in data) {
        const match = key.match(/pel_(\\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxID) maxID = num;
        }
      }
      const newID = 'pel_' + String(maxID + 1).padStart(3, '0');

      db.ref('pelanggan/aktif/' + newID).set({
        nama, keterangan, paket, harga
      }).then(() => {
        alert('Pelanggan berhasil ditambahkan!');
        document.getElementById('namaBaru').value = '';
        document.getElementById('keteranganBaru').value = '';
        document.getElementById('paketBaru').value = '';
        document.getElementById('hargaBaru').value = '';
        loadPelanggan();
      });
    });
  } else {
    alert('Pilih paket dan isi nama!');
  }
}

// Load Data Pelanggan Aktif
function loadPelanggan() {
  db.ref('pelanggan/aktif').once('value').then(snapshot => {
    const data = snapshot.val() || {};
    const tbody = document.querySelector('#pelangganTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    let no = 1, total = 0;

    for (let key in data) {
      const p = data[key];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${no++}</td>
        <td>${key}</td>
        <td>${p.nama || '-'}</td>
        <td>${p.keterangan || '-'}</td>
        <td>${p.paket || '-'}</td>
        <td>Rp. ${parseInt(p.harga || 0).toLocaleString('id-ID')}</td>
        <td>
          <button onclick="bayarPelanggan('${key}')"><i class="fa-solid fa-money-bill"></i></button>
          <button onclick="editPelanggan('${key}')"><i class="fa-solid fa-pen-to-square"></i></button>
          <button onclick="hapusPelanggan('${key}')"><i class="fa-solid fa-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
      total += parseInt(p.harga || 0);
    }

    document.getElementById('totalHarga').innerText = `Rp. ${total.toLocaleString('id-ID')}`;
  });
}

// Load Data Pelanggan Lunas
function loadPelangganLunas() {
  db.ref('pelanggan/lunas').once('value').then(snapshot => {
    const data = snapshot.val() || {};
    const tbody = document.querySelector('.data-table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    let no = 1, total = 0;

    for (let key in data) {
      const p = data[key];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${no++}</td>
        <td>${key}</td>
        <td>${p.nama || '-'}</td>
        <td>${p.keterangan || '-'}</td>
        <td>${p.paket || '-'}</td>
        <td>Rp. ${parseInt(p.harga || 0).toLocaleString('id-ID')}</td>
        <td><button onclick="kembalikanPelanggan('${key}')"><i class="fa-solid fa-rotate-left"></i></button></td>
      `;
      tbody.appendChild(tr);
      total += parseInt(p.harga || 0);
    }

    document.getElementById('totalHargaLunas').innerText = `Rp. ${total.toLocaleString('id-ID')}`;
  });
}

// Bayar (Pindahkan ke Lunas)
function bayarPelanggan(id) {
  db.ref(`pelanggan/aktif/${id}`).once('value').then(snapshot => {
    const data = snapshot.val();
    if (data && data.nama) {
      db.ref(`pelanggan/lunas/${id}`).set(data).then(() => {
        db.ref(`pelanggan/aktif/${id}`).remove().then(() => {
          alert("Data berhasil dipindahkan ke Lunas!");
          loadPelanggan();
          loadPelangganLunas();
        });
      });
    } else {
      alert("Data tidak lengkap atau tidak ditemukan!");
    }
  });
}

// Kembalikan (Pindahkan ke Aktif)
function kembalikanPelanggan(id) {
  db.ref(`pelanggan/lunas/${id}`).once('value').then(snapshot => {
    const data = snapshot.val();
    if (data && data.nama) {
      db.ref(`pelanggan/aktif/${id}`).set(data).then(() => {
        db.ref(`pelanggan/lunas/${id}`).remove().then(() => {
          alert("Data berhasil dikembalikan ke Aktif!");
          loadPelanggan();
          loadPelangganLunas();
        });
      });
    } else {
      alert("Data tidak lengkap atau tidak ditemukan!");
    }
  });
}

// Edit & Hapus
function editPelanggan(id) {
  const namaBaru = prompt("Masukkan nama baru:");
  const paketBaru = prompt("Masukkan paket baru:");
  const hargaBaru = prompt("Masukkan harga baru:");

  if (namaBaru && paketBaru && hargaBaru) {
    db.ref(`pelanggan/aktif/${id}`).update({
      nama: namaBaru,
      paket: paketBaru,
      harga: hargaBaru
    }).then(() => {
      alert("Data berhasil diupdate!");
      loadPelanggan();
    });
  }
}

function hapusPelanggan(id) {
  if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
    db.ref(`pelanggan/aktif/${id}`).remove().then(() => {
      alert("Data berhasil dihapus!");
      loadPelanggan();
    });
  }
}

// Auto-Load
window.onload = function() {
  if (document.querySelector('#pelangganTable tbody')) loadPelanggan();
  if (document.querySelector('.data-table tbody')) loadPelangganLunas();
};
