const firebaseConfig = {
  apiKey: "AIzaSyD-6bKBL82Gyc_yVYn8AyLmK3ih3IiFtpI",
  authDomain: "aplikasi-pelanggan.firebaseapp.com",
  databaseURL: "https://aplikasi-pelanggan-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aplikasi-pelanggan",
  storageBucket: "aplikasi-pelanggan.firebasestorage.app",
  messagingSenderId: "693408241938",
  appId: "1:693408241938:web:8c1099bb15533056f6bbcb",
  measurementId: "G-4E8QYEE8ES"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Show/Hide Password
function togglePassword() {
  const passwordInput = document.getElementById('password');
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }
}

// Login Function
function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    alert("Silakan isi data dengan benar");
    return;
  }

  if (password.length < 8) {
    alert("Password minimal 8 karakter");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => { window.location.href = 'index.html'; })
    .catch(error => {
      let message = "";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Silakan isi data yang sudah terdaftar";
      } else if (error.code === 'auth/invalid-email') {
        message = "Format email tidak valid";
      } else {
        message = error.message;
      }
      alert(message);
    });
}

// Register Function
function register() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    alert("Silakan isi data dengan benar");
    return;
  }

  if (password.length < 8) {
    alert("Password minimal 8 karakter");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert('Registrasi berhasil! Silakan login.');
      window.location.href = 'index.html';
    })
    .catch(error => {
      let message = "";
      if (error.code === 'auth/email-already-in-use') {
        message = "Email sudah digunakan, silakan gunakan email lain.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Format email tidak valid.";
      } else {
        message = error.message;
      }
      alert(message);
    });
}

// Cek Login Status
auth.onAuthStateChanged(user => {
  if (window.location.pathname.includes('index.html') && !user) {
    window.location.href = 'Home.html';
  }
});

function logout() {
  auth.signOut().then(() => window.location.href = 'index.html');
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

// Fungsi generate ID pelanggan baru
function generateIDPelanggan(callback) {
  db.ref('pelanggan/aktif').once('value').then(snapshot => {
    const data = snapshot.val();
    let maxID = 0;

    if (data) {
      Object.keys(data).forEach(key => {
        const match = key.match(/pel_(\\d+)/);
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
        let total = 0;

        for (let key in data) {
            const p = data[key];
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${no++}</td>
                <td>${key}</td>
                <td><strong>${p.nama}</strong></td>
                <td>${p.keterangan || '-'}</td>
                <td>${p.paket}</td>
                <td>Rp. ${parseInt(p.harga).toLocaleString('id-ID')}</td>
                <td>
                    <button onclick="editPelanggan('${key}')">✏️</button>
                    <button class="hapus" onclick="hapusPelanggan('${key}')">🗑️</button>
                    <button class="bayar" onclick="bayarPelanggan('${key}')">💳</button>
                </td>
            `;
            tbody.appendChild(tr);

            total += parseInt(p.harga || 0);
        }

        document.getElementById('totalHarga').innerText = `Rp. ${total.toLocaleString('id-ID')}`;
    });
}

// Fungsi search pelanggan
document.getElementById('searchInput').addEventListener('input', function() {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll('#pelangganTable tbody tr');

  rows.forEach(row => {
    const nama = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
    if (nama.includes(filter)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
});


function loadPelangganLunas() {
    db.ref('pelanggan/lunas').once('value').then(snapshot => {
        const data = snapshot.val();
        const tbody = document.getElementById('tabelLunasBody');
        tbody.innerHTML = '';
        let no = 1;
        let total = 0;

        for (let key in data) {
            const p = data[key];
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${no++}</td>
                <td>${key}</td>
                <td><strong>${p.nama}</strong></td>
                <td>${p.keterangan || '-'}</td>
                <td>${p.paket}</td>
                <td>Rp. ${parseInt(p.harga).toLocaleString('id-ID')}</td>
                <td>
                    <button class="kembalikan" onclick="kembalikanPelanggan('${key}')">↩️</button>
                    <button class="hapus" onclick="hapusPelangganLunas('${key}')">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);

            total += parseInt(p.harga || 0);
        }

        document.getElementById('totalHargaLunas').innerText = `Rp. ${total.toLocaleString('id-ID')}`;
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

function hapusPelangganLunas(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data ini dari Lunas?")) {
        db.ref(`pelanggan/lunas/${id}`).remove().then(() => {
            alert("Data berhasil dihapus dari Lunas!");
            loadPelangganLunas();
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

function kembalikanPelanggan(id) {
    db.ref(`pelanggan/lunas/${id}`).once('value').then(snapshot => {
        const data = snapshot.val();
        db.ref(`pelanggan/aktif/${id}`).set(data).then(() => {
            db.ref(`pelanggan/lunas/${id}`).remove().then(() => {
                alert("Data berhasil dikembalikan ke Aktif!");
                loadPelangganLunas();
            });
        });
    });
}

window.onload = function() {
    document.getElementById('tahun').textContent = new Date().getFullYear();

    if (document.getElementById('tabelBody')) {
        loadPelanggan();
    } else if (document.getElementById('tabelLunasBody')) {
        loadPelangganLunas();
    }
};
