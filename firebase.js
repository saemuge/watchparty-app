// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Realtime Database をインポート

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6CiKRapFSJwoGjxof1jQYq32etdv7tLc",
  authDomain: "watchparty-project-5503d.firebaseapp.com",
  databaseURL: "https://watchparty-project-5503d-default-rtdb.firebaseio.com",
  projectId: "watchparty-project-5503d",
  storageBucket: "watchparty-project-5503d.appspot.com", // ここ少し修正
  messagingSenderId: "732377131472",
  appId: "1:732377131472:web:6de59823ab381dbcca71d5",
  measurementId: "G-6EXQPGV4ER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app); // Realtime Database を初期化

export { database };
