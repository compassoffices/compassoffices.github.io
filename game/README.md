# Compass Christmas Gift Hunt — Toy-Scale Lounge Edition

The game world is now the designer's SketchUp model of the 9 Queen's Rd Central lounge.
Players shrink to ~16 cm — a tiny toy explorer hunting gift boxes under sofas and behind vases.

## Files in the GitHub repo (`compassoffices/game`)

- `index.html` — the game (third-person tiny avatar, joystick on mobile, WASD on desktop)
- `admin.html` — master control (fly the room, place hiding spots, set spawn, rounds, finds, CSV)
- `lounge.glb` — the lounge 3D model (9 MB, from your SketchUp export)
- `mesh-bvh.min.js` — collision engine

**Delete from the repo (no longer used):** `layout.js`, `floor.png`, `ceiling.png`, `office.glb`.

Without Firebase the game runs in local demo mode (8 fake gifts near the lounge set, data resets on refresh).

## Firebase go-live (15 min, free) — unchanged

1. console.firebase.google.com → Add project → Build → **Realtime Database** → Create (locked mode).
2. Rules → paste & publish:

```json
{
  "rules": {
    "game":     { ".read": true, ".write": true },
    "presence": { ".read": true, ".write": true },
    "archive":  { ".read": true, ".write": true }
  }
}
```

3. Project settings → Your apps → Web app → copy `apiKey`, `databaseURL`, `projectId` into `CONFIG.FIREBASE` in **both** HTML files.
4. In `index.html` CONFIG also set `REDNOTE_URL` and `GOOGLE_REVIEW_URL`.

Turn the database off after the campaign.

## Running the event

1. Open `admin.html` → set master password on first login.
2. **Placement**: fly the lounge (drag look, WASD, Q/E down/up, Shift fast). Click surfaces to drop
   hiding spots — think toy-scale: under the sofa, behind the vase, under armchairs, beside table legs.
   Orange markers = spots; click one to delete.
3. **Set player start to my position** — where tiny hunters begin.
4. **Place lounge furniture set here** — moves the sofa/chairs/table/rug cluster if it's not
   sitting in the right part of the room (reload the page after saving to see it move).
5. Set gifts per round + prize pool JSON → **Start new round**.
6. Finds table shows claim codes live; verify IG follow (and review/RedNote for second finds) at the desk.

## Game rules (enforced)

- One gift per player, +1 via review/RedNote unlock (verified at collection).
- Claims are transactions — no double-claims; a found gift disappears for everyone in ~1 s.
- Gifts must be opened within 1.4 m (toy scale) — players must actually reach them.
