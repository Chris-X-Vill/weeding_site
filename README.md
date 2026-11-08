# Sofia & Nate — Wedding Website
**Saturday, August 7th, 2027 · Medellín, Colombia**

A minimal, warm wedding site styled after the draped-curtain & candlelight photograph
(`assets/photos/draped-candlelight-bg.jpg`).

## Design

| | |
|---|---|
| **Palette** | Sampled from the photo: sheer ivory `#FBF8F3`, lit drapes `#F5EEE4`, candle glow `#ECC8AD`, flame amber `#D6A274`, bronze accent `#8E6240`, warm espresso ink `#3A2E26`. |
| **Fonts** | *Cormorant Garamond* (light, editorial serif headings + italic ampersands), *Jost* (light, airy sans for body & small caps labels), *Pinyon Script* available for flourishes. |
| **Frames** | Photos sit in fine gallery mats: an inner white hairline plus an offset bronze hairline that shifts on hover. Arched frames for portraits & the venue, soft rectangles for story and gallery. Empty frames show a soft wash of the curtain photo with an italic caption. |
| **Monogram** | The S + N crest (`assets/images/monogram-sn.png`, light version for the footer) appears in the header, above the names and in the footer, and is the favicon. |
| **Venue arch** | The venue photo sits in a half-moon arch rising out of a ground floral meadow (`assets/images/floral-meadow.svg`, regenerate with `python3 tools/make_meadow.py`). |
| **Details** | Letterpress-style double-rule cards (venue, RSVP), candle ornament dividers, hairline countdown, underline-only form fields, flicker glow behind the names. |

## Sections
Hero (countdown, Save the Date `.ics`) → Medellín scroll-zoom arch portal → Our Story (bios + drawing timeline) → Venue & schedule → Discover Medellín (filterable) → Dress code (interactive swatches) → Gallery → RSVP (saved in the browser, CSV export) → Footer. EN / ES toggle in the header.

## Files
```
index.html                     page markup
css/styles.css                 all styles
js/app.js                      all interactions
assets/photos/                 background photograph
assets/images/                 monogram, favicon, floral meadow
standalone.html                single-file build (CSS, JS, photo inlined)
tools/build_standalone.py      regenerates standalone.html
```

## Viewing
- **Hosted / local server:** open `index.html` (e.g. `python3 -m http.server 8080` → http://localhost:8080). Works on GitHub Pages as-is.
- **Directly from a phone's Files app:** open `standalone.html` — everything is embedded so nothing is blocked.

After editing `index.html`, `css/` or `js/`, run `python3 tools/build_standalone.py` to refresh `standalone.html`.

## Adding photos
Click any frame to upload a photo (or **Upload photos** in the gallery to fill several frames at once). Uploads preview in the browser only. To make a photo permanent, save it in `assets/photos/` and add an `<img class="uploaded-preview" src="assets/photos/…" alt="…">` inside that frame's `.photo-placeholder` (and add the `has-image` class).

## RSVP → Google Forms
Each RSVP is sent to a Google Form, so replies land in your Google account (and, if you like, a Google Sheet).

1. Create a form at [forms.google.com](https://forms.google.com) with these 10 questions, **all as "Short answer"** (any order, any wording):
   Name · Email · Attending · Party size · Entrée · Shuttle · Events · Dietary notes · Song request · Message.
   Don't mark any as *Required*, and in **Settings → Responses** leave "Collect email addresses" and "Limit to 1 response" **off**.
2. Click **⋮ → Get pre-filled link**. Type these keywords as the answers, one per question:
   `NAME`, `EMAIL`, `ATTENDING`, `PARTY`, `ENTREE`, `SHUTTLE`, `EVENTS`, `DIETARY`, `SONG`, `MESSAGE`.
   Click **Get link → Copy link**.
3. Paste that link into `js/app.js`: `const GOOGLE_FORM_PREFILLED_LINK = '…';`
4. Run `python3 tools/build_standalone.py`, then submit a test RSVP and check the form's **Responses** tab.
   (Optional: **Responses → Link to Sheets** to get a spreadsheet.)

While the link is empty, RSVPs are only kept in the guest's own browser. A copy of each reply is always saved in that browser too ("View" / "Export CSV" under the form).

## Notes
- Respects *reduced motion* settings: reveals, parallax and the portal zoom are turned off.
