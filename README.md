# Hull

The office TV dashboard for **Fog Signal Strategies** — calendar, live TV, documents,
call launcher, staff board, and an ambient home screen, designed for a 1920×1080 display
running full-screen in a browser. *(On-screen branding reads "Fog Signal · Office TV";
"Hull" is the project/repo name.)*

It's a single static page: **React 18 (UMD) + in-browser Babel — no build step.**
You serve the files; the browser compiles the JSX on load.

> **Internet required on the display.** React, Babel, the Lucide icon set, and Source Sans
> are loaded from public CDNs (unpkg / Google Fonts) at runtime. The TV needs outbound
> internet for the app to render. Everything else (logos, Baskerville fonts) is bundled.

---

## Deploy on TrueNAS Scale

TrueNAS Scale (Electric Eel / 24.10+) runs native Docker. The simplest, most repeatable
path is to clone this repo onto the NAS and bring it up with Docker Compose.

```sh
# 1. SSH into TrueNAS, pick a dataset to hold the app
cd /mnt/<your-pool>/apps          # e.g. /mnt/tank/apps
git clone https://github.com/TalunJames/hull.git
cd hull

# 2. Build and start (rebuilds the image from the Dockerfile)
docker compose up -d --build

# 3. Confirm it's healthy
docker compose ps
```

Then open **`http://<truenas-ip>:8080/`** in the TV's browser and put it full-screen.

- **Change the port:** edit `ports: "8080:80"` in [`docker-compose.yml`](docker-compose.yml).
  The container always listens on 80; the left number is the host port.
- **Updating:** `git pull && docker compose up -d --build`.
- **Restart policy:** `unless-stopped`, so it comes back after a NAS reboot.

> Installing through the TrueNAS **Apps → Custom App** GUI (paste-the-YAML) needs a
> *prebuilt image* rather than a `build:` context. If you'd rather go that route, say the
> word and I'll add a GitHub Actions workflow to publish the image to GHCR
> (`ghcr.io/talunjames/hull`) so the NAS just pulls it.

---

## Run locally

No Docker needed — any static server works:

```sh
python3 -m http.server 8765
# → http://localhost:8765/app.html
```

Or via Docker, exactly as it runs on the NAS:

```sh
docker compose up -d --build
# → http://localhost:8080/
```

---

## Configuration

- **Google Calendar (optional):** paste an OAuth Web client ID into `window.GOOGLE_CLIENT_ID`
  in [`app.html`](app.html). Empty (the default) keeps the app on built-in sample data with
  no visual change. Setup steps are documented at the top of
  [`src/google-calendar.jsx`](src/google-calendar.jsx). Changing this requires a rebuild
  (`docker compose up -d --build`).
- **Display tweaks:** accent intensity, density, and dark mode defaults live in the
  `window.TWEAK_DEFAULTS` block in `app.html`. Dark mode can run on `auto` (driven by real
  sunset from the live weather feed).

---

## Project layout

```
app.html                  # entry — scales a 1920×1080 stage to fit, loads all scripts
tweaks-panel.jsx          # in-app display-settings panel
src/
  app.jsx                 # root component + view router
  chrome.jsx              # nav rail, header, ticker, deck
  data.jsx                # sample data + live weather (Open-Meteo) + call-platform detect
  google-calendar.jsx     # optional client-side Google Calendar (inert until configured)
  icons.jsx               # Lucide icon wrappers
  view-*.jsx              # home, calendar, livetv, documents, call, staff
assets/                   # logos
design-system/            # colors_and_type.css + bundled Baskerville fonts
Dockerfile                # nginx:alpine static serve
nginx.conf                # serves app.html at /, no-cache on html/jsx
docker-compose.yml        # TrueNAS / local deploy
```

---

## Status

High-fidelity prototype with several pieces wired to real services (live weather,
one-click call launch, optional Google Calendar). The longer arc is an Electron/Windows
kiosk build; this repo is the web app at its core.

---

© Fog Signal Strategies. All rights reserved. Unlicensed — not for redistribution.
