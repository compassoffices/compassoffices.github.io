// Compass Offices — Client Complaints Tracker
// Fill these in after creating your Firebase project — see ../SETUP.md.
// This config object is meant to be public: it is safe to ship in
// client-side code because every collection is locked down by
// firebase/firestore.rules — the config alone doesn't grant any access.

export const firebaseConfig = {
  apiKey: "AIzaSyAnButiddkDzZMxIIwMey21eVod-p0jZOM",
  authDomain: "compass---complaints.firebaseapp.com",
  projectId: "compass---complaints",
  storageBucket: "compass---complaints.firebasestorage.app",
  messagingSenderId: "148818364552",
  appId: "1:148818364552:web:a40be3e9db9b46c640f73d",
};

// Edit this list to match your real centre names. Seeded from the 8
// markets in the NPS dashboard as a starting point only.
export const CENTRES = [
  "Tokyo",
  "Osaka",
  "Hong Kong",
  "Sydney",
  "Singapore",
  "Melbourne",
  "Manila",
  "Kuala Lumpur",
  "Ho Chi Minh City",
];

export const COMPLAINT_TYPES = [
  "Facilities & Cleanliness",
  "Staff & Service",
  "Billing & Invoicing",
  "IT & Connectivity",
  "Noise / Neighbours",
  "Meeting Room / Booking",
  "Other",
];
