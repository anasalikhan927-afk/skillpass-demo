# SkillPass TL — concept prototype

This is a working demo of a training and licensing system for high-risk work in Timor-Leste. It also tracks the internet link at each training site, since remote sites mostly connect by satellite.

Built by Avora Consulting Services as a proposal. All names and records are demo data.

## What it does

| Screen | Purpose |
|---|---|
| Overview | Licences, enrolled trainees, sites online, today's classes, recent check-ins |
| Register trainee | Details → photo (face template) → optional fingerprint → licence card with QR |
| Check-in & verify | Identify a trainee by **face**, **fingerprint** or licence number; records attendance against the site's class |
| Licence register | Search all holders; open the licence card; mark assessment passed |
| Classes | Upcoming sessions per site, on-site or theory live from Dili over the site link; seat booking |
| Sites & links | Status, latency, speed, monthly data use and last sync for each site |

### Face recognition
- Uses [face-api](https://github.com/vladmandic/face-api) (MIT), running entirely in the browser. The models are in `/models` (~7 MB, loaded once).
- At registration, the photo is converted into a 128-number face template. At check-in, a new photo is compared against every template on file.
- A match counts when the distance is under **0.50**.
- The demo rejects pictures with no face or more than one face, and warns when a new face looks like someone already registered.

### Fingerprint
- Uses the device's own fingerprint sensor (or face unlock) through **WebAuthn / passkeys**.
- The fingerprint never leaves the sensor. The app stores a key ID that only that finger can unlock on that device.
- Works on Android phones, iPhones (Touch ID / Face ID) and laptops with a sensor. The page must be opened on HTTPS, which GitHub Pages provides.

## Run it on GitHub Pages
1. Create a new repository, e.g. `skillpass-demo`.
2. Upload every file in this folder, keeping the `models/` and `vendor/` folders.
3. Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, then `main` / root, and save.
4. After about a minute the app is live at `https://<your-username>.github.io/skillpass-demo/`.

Open it on a phone and allow the camera when asked.

## Run locally
```
python3 -m http.server 8000
```
Then open http://localhost:8000. The camera works on localhost.

## Demo limits (what a production build would add)
- Data is stored in the browser's localStorage on one device. Production would use a central database in Dili with offline sync from site tablets.
- There is no liveness check: a printed photo could fool the face check. Production needs a blink or turn-head test or a depth camera.
- Fingerprint keys are not verified by a server. Production verifies the WebAuthn signature on the server.
- Site link figures are simulated. Production would read them from the satellite terminals' status API or from SNMP on site routers.
