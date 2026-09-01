// Compass Offices — Client Complaints Tracker
// Shared Firebase app/auth/db instances, loaded from Google's official CDN
// so this stays a no-build-step static site, consistent with the rest of
// this repo.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Redirects to login.html if there's no signed-in staff member. Returns
// {id, name, team, email} on success. Call this at the top of any page
// that requires a logged-in staff member. Firebase Auth's session check is
// listener-based (not a simple await), so this wraps the first
// onAuthStateChanged callback in a promise.
export function requireStaffSession() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (!user) {
        window.location.href = "login.html";
        resolve(null);
        return;
      }
      // Reading /staff is itself gated on having a staff record, so an
      // unapproved account gets permission-denied here rather than an
      // empty snapshot. Both mean the same thing — no access yet — but
      // the thrown case must be caught, or this promise never settles
      // and the page hangs on a blank screen forever.
      let snap;
      try {
        snap = await getDoc(doc(db, "staff", user.uid));
      } catch (err) {
        console.error("Staff record unreadable — not approved yet?", err);
        await signOut(auth);
        window.location.href = "login.html?pending=1";
        resolve(null);
        return;
      }
      if (!snap.exists()) {
        await signOut(auth);
        window.location.href = "login.html?pending=1";
        resolve(null);
        return;
      }
      resolve({ id: user.uid, ...snap.data() });
    });
  });
}

export async function signOutAndRedirect() {
  await signOut(auth);
  window.location.href = "login.html";
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
