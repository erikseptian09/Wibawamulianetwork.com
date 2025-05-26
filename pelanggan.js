// pelanggan.js
const db = firebase.database();

// Data Paket
let dataPaket = {
  "Paket 5 Mbps": { "keterangan": "(Max 5 Device)", "harga": "150000" },
  "Paket 7 Mbps": { "keterangan": "(Max 7 Device)", "harga": "170000" },
  "Paket 10 Mbps": { "keterangan": "(Paket Bisnis)", "harga": "200000" }
};

function uploadJSON() {
  const fileInput = document.getElementById('jsonFile');
  const file = fileInput.files[0];
  if (!file) {
    alert('Pilih file JSON terlebih dulu.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const json = JSON.parse(e.target.result);
    if (json.pelanggan && json.pelanggan.aktif) {
      db.ref('pelanggan/aktif').set(json.pelanggan.aktif, (error) => {
        if (error) {
          alert('Gagal upload data: ' + error.message);
        } else {
          alert('Data berhasil diupload!');
          loadPelanggan();
          loadPelangganLunas();
        }
      });
    } else {
      alert('Format JSON tidak sesuai. Harus ada pelanggan > aktif');
    }
  };
  reader.readAsText(file);
}

// Update Otomatis
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

// Tambah Pelanggan
function generateIDPelanggan(callback) {
  db.ref('pelanggan/aktif').once('value').then(snapshot => {
    const data = snapshot.val();
    let maxID = 0;
    if (data) {
      Object.keys(data).forEach(key => {
        const match = key.match(/pel_(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxID) maxID = num;
        }
      });
    }
    const newID = 'pel_' + String(maxID + 1).padStart(3, '0');
    callback(newID);
  });
}

function tambahPelangganBaru() {
  const nama = document.getElementById('namaBaru').value.trim();
  const keterangan = document.getElementById('keteranganBaru').value.trim();
  const paket = document.getElementById('paketBaru').value.trim();
  const harga = document.getElementById('hargaBaru').value.trim();

  if (nama && paket && harga) {
    generateIDPelanggan(function(newKey) {
      db.ref('pelanggan/aktif/' + newKey).set({
        nama, keterangan, paket, harga,
        aktif: true, lunas: false
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

// Load Data Aktif
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
        <td>${p.nama}</td>
        <td>${p.keterangan}</td>
        <td>${p.paket}</td>
        <td>Rp. ${parseInt(p.harga).toLocaleString('id-ID')}</td>
        <td>
          <button onclick="bayarPelanggan('${key}')">Bayar</button>
          <button onclick="editPelanggan('${key}')">Edit</button>
          <button onclick="hapusPelanggan('${key}')">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
      total += parseInt(p.harga || 0);
    }

    document.getElementById('totalHarga').innerText = `Rp. ${total.toLocaleString('id-ID')}`;
  });
}

// Load Data Lunas
function loadPelangganLunas() {
  db.ref('pelanggan/lunas').once('value').then(snapshot => {
    const data = snapshot.val() || {};
    const tbody = document.getElementById('tabelLunasBody'); // Sesuaikan dengan id di HTML
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
        <td><button onclick="kembalikanPelanggan('${key}')">Kembalikan</button></td>
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
    if (data) {
      data.aktif = false;
      data.lunas = true;
      db.ref(`pelanggan/lunas/${id}`).set(data).then(() => {
        db.ref(`pelanggan/aktif/${id}`).remove().then(() => {
          alert("Data berhasil dipindahkan ke Lunas!");
          loadPelanggan();
          loadPelangganLunas();
        });
      });
    }
  });
}

// Kembalikan (Pindahkan ke Aktif)
function kembalikanPelanggan(id) {
  db.ref(`pelanggan/lunas/${id}`).once('value').then(snapshot => {
    const data = snapshot.val();
    if (data) {
      data.aktif = true;
      data.lunas = false;
      db.ref(`pelanggan/aktif/${id}`).set(data).then(() => {
        db.ref(`pelanggan/lunas/${id}`).remove().then(() => {
          alert("Data berhasil dikembalikan ke Aktif!");
          loadPelanggan();
          loadPelangganLunas();
        });
      });
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
  if (document.getElementById('tabelLunasBody')) loadPelangganLunas();
  if (document.querySelector('#pelangganTable tbody')) loadPelanggan();
};
