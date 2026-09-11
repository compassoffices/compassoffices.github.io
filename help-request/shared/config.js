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

// Where IT's service desk lives, used only to turn a stored Freshservice
// ticket id into a clickable link. Leave blank to show the id as plain
// text. No credentials here — the API key lives in Apps Script only.
export const FRESH_TICKET_URL = "https://encoreit.freshdesk.com/a/tickets/";

// Teams a complaint can be routed to during triage. Management is a staff
// team but never owns tickets — it's read-only across everything.
export const OWNER_TEAMS = ["CS", "Project", "IT", "Operations Finance", "CS Hub", "Sales", "Marketing"];
export const STAFF_TEAMS = [...OWNER_TEAMS, "Management"];

// Market → centre → floors. Drives the intake form's three-step picker
// (market, then centre, then floor) and the coverage picker on staff
// registration. Keep in sync with the NPS dashboard if a centre opens,
// closes or is renamed.
//
// Centre names are matched literally throughout — a complaint stores the
// string, a CS member's coverage list stores the string — so renaming one
// here silently stops it matching anything recorded under the old name.
// A centre with an empty floor list simply shows no floor choice.
export const LOCATIONS = {
  "Hong Kong": {
    "9 Queen's Road Central 皇后大道中九號": ["10"],
    "Admiralty Centre Tower 1 海富中心一座": ["15"],
    "Admiralty Centre Tower 2 海富中心二座": ["8", "11"],
    "AIA Tower 友邦廣場": ["43"],
    "Bank of Dongguan Tower 東莞銀行大廈": ["9", "10", "11", "12"],
    "China Building 華人行": ["18", "19"],
    "Infinitus Plaza 無限極廣場": ["12", "20", "29", "35", "38"],
    "Lee Garden One 利園一期": ["24"],
    "Lee Garden Two 利園二期": ["15", "16", "28"],
    "Silvercord 1 新港中心 1": ["8"],
    "Silvercord 2 新港中心 2": ["5", "11", "17"],
    "Wing On Centre 永安中心": ["27"],
  },
  "Japan": {
    "ouno八重洲 × Compass Offices": ["3"],
    "Museum Tower Kyobashi Tokyo x Compass Offices": ["19"],
    "イノゲート大阪（INOGATE OSAKA）": ["9", "10"],
    "WTC annex": ["11", "12"],
    "虎ノ門40MTビル（Toranomon 40 MT）": ["7"],
    "いちご恵比寿グリーングラス（Ebisu Green Glass）": ["6", "7", "8", "9"],
  },
  "Sydney": {
    "207 Kent Street | Barangaroo": ["21"],
    "9 Castlereagh Street | Martin Place": ["16", "17"],
    "141 Walker Street | North Sydney": ["12"],
  },
  "Singapore": {
    "Samsung Hub": ["29"],
    "Singapore Land Tower": ["19", "30"],
  },
  "Melbourne": {
    "459 Collins Street | North Tower": ["21"],
    "360 Collins Street | Melbourne CBD": ["26"],
    "570 Bourke Street | Bourke": ["17", "24"],
  },
  "Philippines": {
    "Arthaland Century Pacific Tower": ["9"],
    "Tower 6789": ["16"],
    "BGC Corporate Center": ["24"],
  },
  "Malaysia": {
    "Menara AIA Sentral": ["3", "4", "5"],
  },
  "Vietnam": {
    "Landmark 81": ["72"],
    "Bitexco Financial Tower": ["16", "46", "56"],
  },
};

// Separator for floor-level coverage entries on a staff record, e.g.
// "Lee Garden Two 利園二期::15". Deliberately not "|", which already
// appears inside the Sydney and Melbourne centre names.
export const FLOOR_SEP = "::";

export const COMPLAINT_TYPES = [
  "Temperature",
  "Noise / Other Community Member(s)",
  "Cleaning & Pest Control",
  "Centre Maintenance / Repairs",
  "Health & Safety",
  "Services & Amenities",
  "Finance & Billing",
  "Access & Security",
  "Events",
  "Internet Access / Speed / IT",
  "Renewal",
  "Perks",
  "Others",
];

// -------------------------------------------------------------- washroom
// Twice-daily washroom cleanliness checks — washroom.html (CS, submits the
// checks) and washroom-dashboard.html (Management, sees whether they were
// done and what they found).
//
// The inspection SCHEDULE is derived, not stored: every floor listed in
// LOCATIONS above is expected to be checked once per slot, per working day.
// That means adding a floor there automatically adds it to the schedule and
// to the compliance denominator — there's no second list to keep in sync.

export const WASHROOM_SLOTS = [
  { key: "AM", label: "Morning", window: "Start of day — before 13:00" },
  { key: "PM", label: "Afternoon", window: "13:00 onwards" },
];

// Which slot the check page pre-selects. Local time on the phone doing the
// check, which is the local time of the centre — the person is standing in it.
export const WASHROOM_PM_FROM_HOUR = 13;

// Days a check is expected, as JS getDay() values (0 = Sunday). Weekends are
// out by default: centres are quiet, and counting them would drag every
// compliance figure down by ~28% for no reason. Add 6 / 0 here if a market
// starts covering weekends.
export const WASHROOM_INSPECTION_DAYS = [1, 2, 3, 4, 5];

// The checklist itself. `key` is what gets stored on the inspection record,
// so renaming one strands the history recorded under the old key — add and
// retire rather than rename. Order here is the order on screen.
export const WASHROOM_CHECKS = [
  { key: "floor",    label: "Floor dry, clean, free of litter" },
  { key: "bowls",    label: "Toilets / urinals clean and flushing" },
  { key: "basins",   label: "Basins, mirrors and counters clean" },
  { key: "soap",     label: "Soap dispensers filled and working" },
  { key: "paper",    label: "Toilet paper stocked" },
  { key: "drying",   label: "Hand towels stocked / dryer working" },
  { key: "bins",     label: "Bins emptied, not overflowing" },
  { key: "odour",    label: "No unpleasant odour" },
  { key: "fixtures", label: "Lighting, ventilation and fixtures working" },
];

// How CS told the building's cleaning team about a failed check. Recorded so
// a chase can be evidenced later — "we called at 09:40, it was still dirty at
// 14:00" is the conversation that actually moves a building manager.
export const WASHROOM_ESCALATION_CHANNELS = [
  "Phone call",
  "Email",
  "WhatsApp / chat group",
  "In person",
  "Building portal / work order",
];
