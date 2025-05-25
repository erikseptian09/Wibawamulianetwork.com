
const auth = firebase.auth();

// Show/Hide Password
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('toggleIcon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.textContent = '👀'; // Ganti icon jadi tutup mata
  } else {
    passwordInput.type = 'password';
    toggleIcon.textContent = '🙈'; // Kembali ke mata terbuka
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

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Login berhasil!");
      window.location.href = 'data_pelanggan.html';
    })
    .catch((error) => {
      console.log("Kode error:", error.code);
      if (error.code === 'auth/wrong-password') {
        alert("Password salah!");
      } else if (error.code === 'auth/user-not-found') {
        alert("Email tidak terdaftar.");
      } else if (error.code === 'auth/invalid-email') {
        alert("Format email tidak valid.");
      } else {
        alert("Terjadi kesalahan: " + error.message);
      }
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
      window.location.href = 'login.html';
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
    window.location.href = 'login.html';
  }
});
