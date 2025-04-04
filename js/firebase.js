const firebaseConfig = {
    apiKey: "AIzaSyAy_P9NkDEiEYZYKmv4BfpFGEovrd2h7ow",
    authDomain: "morals-educational-platform.firebaseapp.com",
    projectId: "morals-educational-platform",
    storageBucket: "morals-educational-platform.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
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