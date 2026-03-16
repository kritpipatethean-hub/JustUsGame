// No ES modules. Using Firebase Compat via global 'firebase' object.

const firebaseConfig = {
    apiKey: "AIzaSyCNhrAnezD00bcGKkTENRs4t2M3Edyg_w4",
    authDomain: "justus-462d5.firebaseapp.com",
    projectId: "justus-462d5",
    storageBucket: "justus-462d5.firebasestorage.app",
    messagingSenderId: "88545419124",
    appId: "1:88545419124:web:dfaf9bb01cc0f072fc9621",
    measurementId: "G-7TG7WL6RNS",
    // Exact databaseURL required for asia-southeast1
    databaseURL: "https://justus-462d5-default-rtdb.asia-southeast1.firebasedatabase.app"
};
  
// Initialize Firebase using compat syntax
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
