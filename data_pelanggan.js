
// data_pelanggan.js
const db = firebase.database();
const refAktif = db.ref("pelanggan/aktif");
const refLunas = db.ref("pelanggan/lunas");
const refArsip = db.ref("pelanggan/arsip");

function uploadJSON() {
  const file = document.getElementById("fileUpload").files[0];
  if (!file) {
    alert("Pilih file .json terlebih dahulu.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.pelanggan || !data.pelanggan.aktif) {
        alert("Format JSON tidak sesuai! Harus ada 'pelanggan.aktif'.");
        return;
      }

      db.ref("pelanggan/aktif").set(data.pelanggan.aktif)
        .then(() => {
          alert("Data pelanggan aktif berhasil diupload ke Firebase!");
        })
        .catch(err => {
          alert("Gagal upload: " + err.message);
        });
    } catch (error) {
      alert("File JSON tidak valid.");
    }
  };
  reader.readAsText(file);
}

function renderDataAktif() {
  refAktif.on("value", (snapshot) => {
    const data = snapshot.val() || {};
    let html = "";
    let no = 1;
    for (let id in data) {
      const p = data[id];
      const jsonData = JSON.stringify(p).replace(/"/g, '&quot;');
      html += `<tr>
        <td>${no++}</td>
        <td>${p.nama}</td>
        <td>${p.paket}</td>
        <td>${p.keterangan}</td>
        <td>Rp ${p.harga}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="showEdit('${id}', ${jsonData})">Edit</button>
          <button class="btn btn-sm btn-success" onclick="showBayar('${id}', ${jsonData})">Bayar</button>
          <button class="btn btn-sm btn-danger" onclick="hapusData('${id}')">Hapus</button>
        </td>
      </tr>`;
    }
    document.querySelector("#tabelAktif tbody").innerHTML = html;
  });
}

renderDataAktif();

function tambahPelanggan() {
  document.getElementById("tambahNama").value = "";
  document.getElementById("tambahPaket").value = "";
  document.getElementById("tambahKeterangan").value = "";
  document.getElementById("tambahHarga").value = "";
  new bootstrap.Modal(document.getElementById("modalTambah")).show();
}

function simpanPelanggan() {
  const nama = document.getElementById("tambahNama").value.trim();
  const paket = document.getElementById("tambahPaket").value.trim();
  const keterangan = document.getElementById("tambahKeterangan").value.trim();
  const harga = document.getElementById("tambahHarga").value.trim();

  if (!nama || !paket || !harga) {
    alert("Nama, Paket, dan Harga wajib diisi!");
    return;
  }

  const id = Date.now().toString();
  const data = { nama, paket, keterangan, harga };

  refAktif.child(id).set(data).then(() => {
    bootstrap.Modal.getInstance(document.getElementById("modalTambah")).hide();
  }).catch(err => {
    alert("Gagal menyimpan data: " + err.message);
  });
}

function showEdit(id, data) {
  document.getElementById("editId").value = id;
  document.getElementById("editNama").value = data.nama || "";
  document.getElementById("editPaket").value = data.paket || "";
  document.getElementById("editKeterangan").value = data.keterangan || "";
  document.getElementById("editHarga").value = data.harga || "";
  new bootstrap.Modal(document.getElementById("modalEdit")).show();
}

function simpanEdit() {
  const id = document.getElementById("editId").value;
  const data = {
    nama: document.getElementById("editNama").value,
    paket: document.getElementById("editPaket").value,
    keterangan: document.getElementById("editKeterangan").value,
    harga: document.getElementById("editHarga").value,
  };
  refAktif.child(id).set(data).then(() => {
    bootstrap.Modal.getInstance(document.getElementById("modalEdit")).hide();
  });
}

function hapusData(id) {
  if (confirm("Yakin ingin menghapus data ini?")) {
    refAktif.child(id).remove();
  }
}

function showBayar(id, data) {
  document.getElementById("bayarId").value = id;
  document.getElementById("bayarNama").textContent = data.nama || "";
  document.getElementById("bayarJumlah").value = data.harga || "";
  document.getElementById("bayarMetode").value = data.metode || "Tunai";
  new bootstrap.Modal(document.getElementById("modalBayar")).show();
}

function prosesBayar() {
  const id = document.getElementById("bayarId").value;
  refAktif.child(id).once("value").then((snap) => {
    const data = snap.val();
    if (data) {
      data.tanggalLunas = new Date().toISOString();
      data.metode = document.getElementById("bayarMetode").value || "Tunai";
      refLunas.child(id).set(data).then(() => {
        refAktif.child(id).remove();
        bootstrap.Modal.getInstance(document.getElementById("modalBayar")).hide();
      });
    }
  });
}