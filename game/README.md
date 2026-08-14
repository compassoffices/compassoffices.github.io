# Compass Christmas Gift Hunt — Setup Guide

Three files, one game — no Matterport account or license needed anymore:

- `index.html` — the game players open. Full 3D walkthrough of 9 Queen's Rd Central (drag to look, joystick/WASD to walk, tap a gift to open it).
- `admin.html` — master control: walk the model and click surfaces to place hiding spots, start/reset rounds, live finds table with claim codes, export the email list.
- `office.glb` — the 3D model of the office (7.5 MB, compressed from your 1.8 GB MatterPak). Must sit in the same folder as the two HTML files, including on GitHub.

Without Firebase configured the game runs in a local demo (data resets on refresh) — the 3D space, gifts, and full flow all still work for testing.

## What you still need to plug in

Both HTML files have a `CONFIG` block at the top of the `<script>` section. Fill the same Firebase values into both.

### 1. Firebase (15 min, free)

1. Go to console.firebase.google.com → Add project (any name, Analytics off).
2. In the project: Build → **Realtime Database** → Create database (any region) → start in **locked mode**.
3. In Rules, paste and publish:

```json
{
  "rules": {
    "game":     { ".read": true, ".write": true },
    "presence": { ".read": true, ".write": true },
    "archive":  { ".read": true, ".write": true }
  }
}
```

4. Project settings (gear icon) → General → Your apps → Web app (`</>`) → register. Copy `apiKey`, `databaseURL`, `projectId` into `CONFIG.FIREBASE` in **both** files.

Note: these rules are open — fine for a short marketing game, but switch the database off (or set `.write: false`) after the campaign. The admin password only hides the control page from casual visitors; it is not bank-grade security.

### 2. Links (index.html only)

- `REDNOTE_URL` — your RedNote profile URL.
- `GOOGLE_REVIEW_URL` — get your Place ID at developers.google.com/maps/documentation/places/web-service/place-id, then use `https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID`.

## Deploy on GitHub Pages

Repo `compassoffices/game` (already created):

1. **Add file → Upload files** → drag in `index.html`, `admin.html`, **and `office.glb`** → Commit changes.
2. Settings → Pages → Deploy from a branch → `main` / root → Save.
3. Game URL for the IG bio / QR code: `https://compassoffices.github.io/game/`
   Admin: `https://compassoffices.github.io/game/admin.html` (keep private).
4. To update later: re-upload the changed file the same way — it overwrites.

## Running the event

1. Open `admin.html`, set your master password on first login.
2. In the placement card, walk the model (drag to look, WASD to move) and click ~25–30 surfaces — behind plants, on shelves, in phone booths, spread across the floor. Click a grey marker to remove it.
3. Set gifts per round + prize pool (JSON; add an `img` URL to show a photo in the win popup).
4. **Start new round** — gifts land on random spots, everyone's counters reset, previous round is archived.
5. Watch the Finds table live. At the front desk: check the claim code, check the @compassoffices IG follow (and review / RedNote follow for second gifts), then hand over.
6. **Start new round** again anytime for a fresh hunt.

## How the rules are enforced

- One gift per player, +1 via the review/RedNote unlock (self-declared in-game, verified by you at collection — no platform lets a website check follows automatically).
- Claims are Firebase transactions — two people clicking the same box at once can't both win; the loser sees "just missed it".
- A claimed gift disappears for every player within about a second, however far away they are.
- Gifts must be opened within 5 metres in-game, so players have to actually walk to them.

## Not built yet (say the word)

- Other hunters visible as avatars in the space (currently: live "X hunting" counter + "someone found a gift" toasts).
- Traditional Chinese UI.
- QR poster for the front desk.
- Snow / music / festive dressing inside the 3D space.
