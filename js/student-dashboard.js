import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// ✅ Check if user is logged in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.log("❌ No user detected, redirecting to login...");
        window.location.href = "index.html"; // Go back to login if not logged in
    } else {
        console.log(`✅ Logged in as: ${user.email}`);
    }
});

// ✅ Logout function
document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth).then(() => {
        console.log("✅ Logged out!");
        window.location.href = "index.html";
    });
});

