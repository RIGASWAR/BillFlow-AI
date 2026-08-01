// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyBouC7mbVqUzBAYQ8AAnT4bwE3F9RrV4NQ",
  authDomain: "vellorespunpipes.firebaseapp.com",
  projectId: "vellorespunpipes",
  storageBucket: "vellorespunpipes.firebasestorage.app",
  messagingSenderId: "496846462094",
  appId: "1:496846462094:web:c8ee6ceb87dcb3c0aebddf",
  measurementId: "G-FKDNL6FJLP"
};

// ============================================
// INITIALIZATION
// ============================================

// Initialize Firebase only if it hasn't been initialized yet
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // if already initialized, use that one
}

const auth = firebase.auth();

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Log in using Email and Password
 * Used by: login.html (Admin Login)
 */
function loginUser(email, password) {
    // Returns a Promise so the login page can show errors or success
    return auth.signInWithEmailAndPassword(email, password);
}

/**
 * Log out the current user
 * Used by: Sidebar Logout button
 */
function logoutUser() {
    auth.signOut().then(() => {
        // Redirect to the Portal Selection (Landing) page
        window.location.href = "index.html"; 
    }).catch((error) => {
        console.error("Logout Error:", error);
        alert("Failed to logout. Check console.");
    });
}

/**
 * Page Protection Logic
 * Used by: dashboard.html, sales.html, etc.
 * Checks if user is logged in. If not, sends them to login page.
 */
function checkAuth() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in. Access granted.
            // console.log("Admin Logged In:", user.email);
        } else {
            // No user is signed in.
            const path = window.location.pathname;
            
            // Defines pages that do NOT require Admin Authentication
            const publicPages = [
                "login.html", 
                "index.html", 
                "customer_login.html", 
                "customer_dashboard.html",
                "/"
            ];

            // Check if current page is in the safe list
            const isPublic = publicPages.some(page => path.includes(page));

            // If we are on a protected page and NOT logged in, redirect to Admin Login
            if (!isPublic) {
                console.warn("Unauthorized access. Redirecting to login.");
                window.location.href = "login.html";
            }
        }
    });
}