import { auth } from "./config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  //signInWithRedirect,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification ,
  updatePassword,
  updateEmail,
  verifyBeforeUpdateEmail,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { app } from "./config.js";
import {
  getDatabase,
  ref,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import {
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getHashConfig } from "../utils/hashConfig.js";

// -------------- AUTHENTICATION FUNCTIONS ----------------

// const googleProvider = new GoogleAuthProvider();
// const githubProvider = new GithubAuthProvider();



// Example usage in user import or password hashing logic

const hashConfig = getHashConfig(); 
export const importUsersWithHashConfig = async (users) => {
  try {
    const result = await auth.importUsers(users, { hash: hashConfig });
    console.log("Successfully imported users:", result.successCount);
    console.log("Failed to import users:", result.failureCount);
    if (result.errors.length > 0) {
      console.error("Errors:", result.errors);
    }
  } catch (error) {
    console.error("Error importing users:", error);
  }
};


// Create an account
export const createAccount = async (email, password) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

// Sign in with email/password
export const signIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken(); // Retrieve the token
     console.log("Token from Firebase:", token); // Debug log
    return { user: userCredential.user, token }; // Return user and token
};

export async function registerGuestUserInTeams() {
  // Team API endpoint
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  if (!backendUrl) throw new Error("Teams backend URL not set");

  const fallbackName = "Guest";
  const fallbackEmail = "guest@example.com";
  const avatar = "/assets/Others/user.png";
  const role = "member";
  // No token available, so backend must allow this request or you should create a guest/jwt system for guests

  // First, check if this guest exists
  const res = await fetch(`${backendUrl}/api/users?email=${encodeURIComponent(fallbackEmail)}`, {
    method: "GET",
    headers: {"Accept": "application/json"}
  });
  let alreadyExists = false;
  if (res.ok) {
    try {
      const arr = await res.json();
      alreadyExists = Array.isArray(arr) && arr.some(u => u.email === fallbackEmail);
    } catch { /* ignore */ }
  }
  if (alreadyExists) return true;

  // If not, create the guest user
  const resp = await fetch(`${backendUrl}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: fallbackName,
      email: fallbackEmail,
      avatar,
      role,
    })
  });
  if (!resp.ok) throw new Error("Failed to add guest to Teams: " + (await resp.text()));
  return true;
}


const database = getDatabase(app);
export const saveNewsletterSubscription = async (email) => {
  try {
    const subscriptionRef = ref(database, "newsletterSubscriptions");
    const newSubscriptionRef = push(subscriptionRef);
    await set(newSubscriptionRef, {
      email,
      subscribedAt: new Date().toISOString(),
    });
    // Call backend to send confirmation email
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/newsletter/send-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    console.log("Email saved and confirmation sent:", email);
    return true;
  } catch (error) {
    console.error("Error saving subscription:", error);
    throw error;
  }
};
/// Sign in with Google

async function syncGoogleUserToTeam({ name, email, avatar, token }) {
  // Use your environment variable or fallback
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
  if (!backendUrl) {
    throw new Error("Teams backend URL is not set. Set VITE_BACKEND_URL.");
  }

  // Check if user present by email—backend should allow this query
  const checkRes = await fetch(`${backendUrl}/api/users?email=${encodeURIComponent(email)}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    }
  });

  let alreadyExists = false;
  if (checkRes.ok) {
    try {
      const data = await checkRes.json();
      alreadyExists = Array.isArray(data) && data.some((user) => user.email?.toLowerCase() === email.toLowerCase());
    } catch {}
  }

  if (alreadyExists) return;

  // Create new member
  const createRes = await fetch(`${backendUrl}/api/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      email,
      avatar,
      role: "member"
    }),
  });

  if (!createRes.ok) {
    const msg = await createRes.text();
    throw new Error("Failed to register Google user in Teams: " + msg);
  }
}
export const signInWithGoogle = async () => {
  const googleProvider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result && result.user) {
      const token = await result.user.getIdToken();

      // Check if user is new by checking additionalUserInfo
      const isNewUser = result._tokenResponse?.isNewUser || (result.additionalUserInfo && result.additionalUserInfo.isNewUser);

      // Ensure Google login becomes a Teams member.
      await syncGoogleUserToTeam({
        name: result.user.displayName || "Unnamed",
        email: result.user.email,
        avatar: result.user.photoURL || "https://via.placeholder.com/150",
        token,
      });

      // Return the full data for client consumption, including isNewUser
      return {
        name: result.user.displayName,
        email: result.user.email,
        avatar: result.user.photoURL || "https://via.placeholder.com/150",
        token,
        isNewUser: !!isNewUser,
      };
    } else {
      throw new Error("Google Sign-In did not provide user data.");
    }
  } catch (error) {
    console.error("Google Sign-In failed:", error);
    throw new Error(error.message || "Unknown error with Google Sign-In");
  }
};

// Sign out
export const logout = async () => {
  return await signOut(auth);
};

// Password reset
export const passwordReset = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

// Update Password
export const passwordUpdate = async (newPassword) => {
  if (auth.currentUser) {
    return await updatePassword(auth.currentUser, newPassword);
  } else {
    throw new Error("No authenticated user found.");
  }
};

// Update Email
export const updateEmailAddress = async (newEmail) => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user found.");
  }
  try {
    if (auth.currentUser.email === newEmail) {
      throw new Error("The new email is the same as the current email.");
    }
    // Use verifyBeforeUpdateEmail instead of updateEmail
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
    return { verificationSent: true };
  } catch (error) {
    let message = error?.message || "Unknown error updating email.";
    if (error?.code === "auth/email-already-in-use") {
      message = "This email address is already in use by another account.";
    } else if (error?.code === "auth/invalid-email") {
      message = "The email address is not valid.";
    } else if (error?.code === "auth/requires-recent-login") {
      message = "Please re-authenticate and try again (recent login required).";
    }
    throw new Error(message);
  }
};

// Subscribe to newsletter
export const subscribeToNewsletter = async (email) => {
  // Call backend to subscribe
  const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!resp.ok) throw new Error("Failed to subscribe");
  return true;
};

// Unsubscribe from newsletter
export const unsubscribeFromNewsletter = async (email, token) => {
  // Call backend to unsubscribe
  const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`);
  if (!resp.ok) throw new Error("Failed to unsubscribe");
  return true;
};
