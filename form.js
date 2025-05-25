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
    .then(() => { window.location.href = 'Home.html'; })
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
