# 🍳 PantryFlow
### AI Touchless Sous-Chef

> From messy fridge to hands-free cooking — in under 60 seconds.

PantryFlow is a web-based cooking assistant that understands what ingredients you have, suggests relevant recipes, and lets you cook through every step **without touching your screen once**. Hand gestures detected through your webcam handle all navigation.

---

## ✨ What It Does

1. **Tell it what you have** — type your ingredients in plain, informal language. No need to be precise.
2. **Pick a recipe** — PantryFlow uses AI to understand your ingredients and surfaces the three most relevant matches.
3. **Cook hands-free** — enter cooking mode and control everything with hand gestures. Your hands stay in the food, not on your screen.

---

## 👋 Gesture Controls

| Gesture | Action | Hold Duration |
|---|---|---|
| ☝️ Point up | Previous step | 600ms |
| 👇 Point down | Next step | 600ms |
| 👍 Thumbs up | Save recipe to pantry | 1000ms |

A live camera feed in the bottom-right corner shows the hand skeleton overlay so you always know the gesture system is active and tracking.

---

## 🤖 How the AI Works

PantryFlow uses two types of AI for two different problems:

**Claude Haiku (Anthropic)** — handles language understanding. Your informal ingredient description is sent to Claude, which extracts a clean recipe search term and estimates per-serving nutrition from the recipe's ingredient list. Both calls are made server-side through a Vercel function — your API key is never exposed to the browser.

**MediaPipe HandLandmarker (Google)** — handles real-time gesture detection. This neural network runs entirely in your browser via WebAssembly, detecting 21 hand landmark coordinates per frame at ~30fps. No video ever leaves your device.

---

## 🗂️ Project Structure

```
pantryflow/
├── index.html        # Entire frontend — single file, no build step
├── vercel.json       # Routing config for Vercel deployment
└── api/
    └── chat.js       # Serverless function — proxies Anthropic API calls
```

---

## 🚀 Deployment

### Prerequisites
- A [Vercel](https://vercel.com) account (free)
- A [GitHub](https://github.com) account (free)
- An [Anthropic API key](https://console.anthropic.com) (~$5 credit covers thousands of demo sessions)

### Steps

**1. Push to GitHub**

Upload the three files to a new GitHub repository, keeping the folder structure above. To create the `api/` folder on GitHub, click **Add file → Create new file** and type `api/chat.js` as the filename — GitHub creates the folder automatically.

**2. Deploy on Vercel**

- Go to [vercel.com](https://vercel.com) → **Add New Project**
- Import your GitHub repository
- Leave all settings as default — Vercel auto-detects the configuration
- Click **Deploy**

**3. Add your API key**

- In your Vercel project, go to **Settings → Environment Variables**
- Add a new variable:
  - **Name:** `ANTHROPIC_API_KEY`
  - **Value:** your Anthropic API key (`sk-ant-...`)
- Click **Save**
- Go to **Deployments → Redeploy** to apply the new variable

**4. Open and cook**

Your app is live. No login, no setup, no API key prompt — just open the URL and start cooking.

---

## 🛠️ Running Locally

Since there is no build step, you can run PantryFlow locally with any static server. The simplest way:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx serve .
```

Then open `http://localhost:8080` in your browser.

> **Note:** The Anthropic API calls go through `/api/chat`, which only works when deployed on Vercel. For local development, you can temporarily restore the direct browser call using the `anthropic-dangerous-direct-browser-access` header and paste your API key manually.

---

## 🔒 Privacy

- **No video leaves your device.** MediaPipe runs entirely in WebAssembly in your browser — webcam frames are processed locally and immediately discarded.
- **Your API key is server-side only.** It is stored as a Vercel environment variable and never sent to the browser.
- **Saved recipes stay on your device.** The pantry feature uses browser `localStorage` — nothing is transmitted to any server beyond the Anthropic API calls.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Language model | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |
| Vision / gesture AI | MediaPipe HandLandmarker via WebAssembly |
| Recipe data | TheMealDB REST API (free, no auth required) |
| Frontend | Vanilla JavaScript + Tailwind CSS |
| Webcam capture | HTML5 `getUserMedia` API |
| Landmark overlay | HTML5 Canvas API |
| Storage | Browser `localStorage` |
| Hosting | Vercel (static + serverless function) |

---

## ⚠️ Known Limitations

- **Desktop / tablet only** — gesture control requires a larger, stable screen. Mobile phones are not supported in v1.
- **Lighting sensitive** — gesture detection accuracy drops in low-light environments. Good ambient lighting is recommended.
- **Recipe coverage** — TheMealDB has strong coverage of Western and South Asian recipes but may return no results for some regional cuisines. The app handles this with a four-level fallback search.
- **Nutrition estimates** — macronutrient values are estimated by Claude from ingredient lists and are labelled as estimates. They are not verified database values and should not be used for clinical dietary planning.
- **Internet required** — Claude and TheMealDB calls both require an active connection. Offline mode is not supported in v1.

---

## 📄 License

Built as an individual project submission for Technology Management — AI Solution Design, April 2026.

---

*PantryFlow — Break the loop between cooking and your screen.*
