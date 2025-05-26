// pelanggan.js
const db = firebase.database();

let dataPaket = {
  "Paket 5Mbps": { "keterangan": "Basic package", "harga": "150000" },
  "Paket 7Mbps": { "keterangan": "Standard package", "harga": "170000" },
  "Paket 10Mbps": { "keterangan": "Premium package", "harga": "200000" }
};

// Upload JSON
function uploadJSON() {
  const fileInput = document.getElementById('jsonFile');
  const file = fileInput.files[0];
  if (!file) {
    alert('Pilih file JSON terlebih dulu.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const json = JSON.parse(e.target.result);
      db.ref('pelanggan/aktif').set(json, (error) => {
        if (error) {
          alert('Gagal upload data: ' + error.message);
        } else {
          alert('Data berhasil diupload!');
          loadPelanggan();
        }
      });
    } catch (err) {
      alert('File JSON tidak valid!');
    }
  };
  reader.readAsText(file);
}

// Update otomatis keterangan & harga sesuai paket
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

// Generate ID pelanggan otomatis
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

// Tambah pelanggan baru
function tambahPelangganBaru() {
  const nama = document.getElementById('namaBaru').value.trim();
  const keterangan = document.getElementById('keteranganBaru').value.trim();
  const paket = document.getElementById('paketBaru').value.trim();
  const harga = document.getElementById('hargaBaru').value.trim();

  if (nama && paket && harga) {
    generateIDPelanggan(function(newKey) {
      db.ref('pelanggan/aktif/' + newKey).set({
        nama: nama,
        keterangan: keterangan,
        paket: paket,
        harga: harga
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

// Ambil data pelanggan dari Firebase
function loadPelanggan() {
  db.ref('pelanggan/aktif').once('value').then(snapshot => {
    const data = snapshot.val();
    const tbody = document.getElementById('tabelBody');
    tbody.innerHTML = '';
    let no = 1;
    let total = 0;

    if (data) {
      Object.keys(data).forEach(key => {
        const p = data[key];  // Ambil data tiap pelanggan

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${no++}</td>
          <td>${key}</td>
          <td><strong>${p.nama || '-'}</strong></td>
          <td>${p.keterangan || '-'}</td>
          <td>${p.paket || '-'}</td>
          <td>Rp. ${parseInt(p.harga || 0).toLocaleString('id-ID')}</td>
          <td>
            <button onclick="editPelanggan('${key}')">✏️</button>
            <button onclick="hapusPelanggan('${key}')">🗑️</button>
            <button onclick="bayarPelanggan('${key}')">💳</button>
          </td>
        `;
        tbody.appendChild(tr);

        total += parseInt(p.harga || 0);
      });
    }

    document.getElementById('totalHarga').innerText = `Rp. ${total.toLocaleString('id-ID')}`;
  });
}

// Edit pelanggan
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

// Hapus pelanggan
function hapusPelanggan(id) {
  if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
    db.ref(`pelanggan/aktif/${id}`).remove().then(() => {
      alert("Data berhasil dihapus!");
      loadPelanggan();
    });
  }
}

// Bayar pelanggan
function bayarPelanggan(id) {
  db.ref(`pelanggan/aktif/${id}`).once('value').then(snapshot => {
    const data = snapshot.val();
    db.ref(`pelanggan/lunas/${id}`).set(data).then(() => {
      db.ref(`pelanggan/aktif/${id}`).remove().then(() => {
        alert("Data berhasil dipindahkan ke Lunas!");
        loadPelanggan();
      });
    });
  });
}

// Auto load
window.onload = function() {
  if (document.getElementById('tabelBody')) {
    loadPelanggan();
  }
};
