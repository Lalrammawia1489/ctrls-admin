// firebase-config.js

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWr1FmRh3mJ-Zi-q-YSgHr77ThrT_goUk",
  authDomain: "ctrl-s-e02e2.firebaseapp.com",
  projectId: "ctrl-s-e02e2",
  storageBucket: "ctrl-s-e02e2.appspot.com",
  messagingSenderId: "205036009997",
  appId: "1:205036009997:web:d88b19dac975048ed6f344"
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ✅ Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
