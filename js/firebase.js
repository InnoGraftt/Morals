const firebaseConfig = {
  apiKey: "AIzaSyAy_P9NkDEiEYZYKmv4BfpFGEovrd2h7ow",
  authDomain: "morals-454918.firebaseapp.com",
  projectId: "morals-454918",
  storageBucket: "morals-454918.firebasestorage.app",
  messagingSenderId: "609181726100",
  appId: "1:609181726100:web:9231ee47619bb9f2284b81",
  measurementId: "G-HTW27BJE9K"
    };
  
  // Initialize Firebase
  const firebaseApp = firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Export the Firebase services
  const getCurrentUser = () => {
    return auth.currentUser;
  };
  
  // Setting up auth persistence
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch((error) => {
      console.error("Firebase persistence error:", error);
    });