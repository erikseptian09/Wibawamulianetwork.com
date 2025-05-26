// pelanggan.js
const db = firebase.database();

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
    db.ref('pelanggan/aktif').set(json, (error) => {
      if (error) {
        alert('Gagal upload data: ' + error.message);
      } else {
        alert('Data berhasil diupload!');
        loadPelanggan();
      }
    });
  };
  reader.readAsText(file);
}

let dataPaket = {
  "Paket 5Mbps": { "keterangan": "Basic package", "harga": "150000" },
  "Paket 7Mbps": { "keterangan": "Standard package", "harga": "170000" },
  "Paket 10Mbps": { "keterangan": "Premium package", "harga": "200000" }
};

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

function loadPelanggan() {
  db.ref('pelanggan/aktif').once('value').then(snapshot => {
    const data = snapshot.val();
    const tbody = document.getElementById('tabelBody');
    tbody.innerHTML = '';
    let no = 1;

    for (let key in data) {
      const p = data[key];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${no++}</td>
        <td>${key}</td>
        <td>${p.nama}</td>
        <td>${p.paket}</td>
        <td>${p.keterangan}</td>
        <td>Rp. ${parseInt(p.harga).toLocaleString('id-ID')}</td>
      `;
      tbody.appendChild(tr);

window.onload = loadPelanggan;

      total += parseInt(p.harga || 0);
    }

    document.getElementById('totalHarga').innerText = `Rp. ${total.toLocaleString('id-ID')}`;
  });
}

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

window.onload = function() {
  if (document.getElementById('tabelBody')) {
    loadPelanggan();
  }
};
