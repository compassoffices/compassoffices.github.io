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

// Location → centres hierarchy for the intake form's two-step picker
// (choose a location/market first, then the specific centre within it).
// Sourced from the NPS dashboard's live centre list — keep these two in
// sync if a centre opens/closes/renames.
export const LOCATIONS = {
  "Hong Kong": [
    "Admiralty Centre Tower 1 海富中心一座",
    "Admiralty Centre Tower 2 海富中心二座",
    "AIA Tower 友邦廣場",
    "Bank of Dongguan Tower 東莞銀行大廈",
    "China Building 華人行",
    "Infinitus Plaza 無限極廣場",
    "Lee Garden One 利園一期",
    "Lee Garden Two 利園二期",
    "Silvercord 1 新港中心 1",
    "Silvercord 2 新港中心 2",
    "Wing On Centre 永安中心",
  ],
  "Japan": [
    "ouno八重洲 × Compass Offices",
    "イノゲート大阪（INOGATE OSAKA）",
    "WTC annex",
    "虎ノ門40MTビル（Toranomon 40 MT）",
    "いちご恵比寿グリーングラス（Ebisu Green Glass）",
  ],
  "Sydney": [
    "207 Kent Street | Barangaroo",
    "9 Castlereagh Street | Martin Place",
    "141 Walker Street | North Sydney",
  ],
  "Singapore": [
    "Samsung Hub",
    "Singapore Land Tower",
  ],
  "Melbourne": [
    "459 Collins Street | North Tower",
    "360 Collins Street | Melbourne CBD",
    "570 Bourke Street | Bourke",
  ],
  "Philippines": [
    "Arthaland Century Pacific Tower",
    "Tower 6789",
    "BGC Corporate Center",
  ],
  "Malaysia": [
    "Malaysia",
  ],
  "Vietnam": [
    "Landmark 81",
    "Bitexco Financial Tower",
  ],
};

export const COMPLAINT_TYPES = [
  "Facilities & Cleanliness",
  "Staff & Service",
  "Billing & Invoicing",
  "IT & Connectivity",
  "Noise / Neighbours",
  "Meeting Room / Booking",
  "Other",
];
