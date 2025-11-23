# SnapAura AI 📸✨

**SnapAura AI** is a premium, Progressive Web App (PWA) designed for the modern social media era. It leverages the latest **Google Gemini Models** to transform how users create, edit, and caption their content. 

Built with **React**, **Tailwind CSS**, and **Glassmorphism UI**, it offers a stunning, app-native experience on both mobile and desktop.

![SnapAura Banner](https://via.placeholder.com/1200x600/0f0f11/C084FC?text=SnapAura+AI+Studio)

## 🚀 Key Features

### 1. 🧠 AI Studio (Home)
The command center for your photos.
*   **Vibe Analysis:** Uses **Gemini 2.5 Flash** to analyze the mood, lighting, and aesthetics of your uploaded photo.
*   **Smart Captions:** Generates 10+ captions across categories like *Flirty, Savage, Aesthetic, Kenyan Slang, and Poetic*.
*   **Hashtag Generator:** Auto-generates trending tags based on visual content.
*   **Social Preview:** Visualize exactly how your post will look with an Instagram-style overlay.
*   **Post Card Generator:** "Burns" the caption onto the image with a stylish gradient for instant Story sharing.
*   **Auto-Enhance:** One-click photo improvement using Generative AI.

### 2. 🪄 Magic Editor
Modify reality with text prompts.
*   **Generative Editing:** Powered by **Gemini 2.5 Flash Image**. Users can say "Add a neon sign" or "Remove the background".
*   **Aesthetic Filters:** One-tap presets that construct complex prompts for specific looks:
    *   *Cinematic, Vintage, Moody, Pastel, Luxury*.

### 3. 🎨 AI Artist
Text-to-Image generation studio.
*   **High-Fidelity Generation:** Uses **Gemini 3 Pro Image Preview** for stunning 1K, 2K, and 4K results.
*   **Fallback Mechanism:** Automatically degrades to *Flash Image* if the user lacks Pro permissions, ensuring reliability.

### 4. 💬 AI Assistant
*   **Chatbot:** A helpful creative assistant powered by **Gemini 3 Pro Preview**. Ask for photography tips, app navigation, or creative ideas.

### 5. 🧰 Creator Toolkit
Essential utilities for social growth and financial tracking.
*   **📈 Crypto Market:** Real-time cryptocurrency price analysis and trend tracking using **Search Grounding**.
*   **💱 Currency Exchange:** Real-time fiat currency conversion with current exchange rates.
*   **🔗 Link Shortener:** Instantly shorten long URLs for bio links.
*   **📱 QR Generator:** Create custom QR codes for websites or text.
*   **✨ Bio Writer:** AI-generated social media bios based on your personality keywords.

---

## 🛠 Tech Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS (Custom animations, Glassmorphism utility classes)
*   **AI Core:** Google GenAI SDK (`@google/genai`)
*   **Icons:** Lucide React
*   **PWA:** Web Manifest, Service Worker ready, iOS/Android meta tags
*   **Utilities:** Canvas Confetti, Native Web Share API, LocalStorage

---

## 🤖 Gemini Models Used

| Feature | Model | Description |
| :--- | :--- | :--- |
| **Image Analysis** | `gemini-2.5-flash` | Fast multimodal analysis for captions & tags |
| **Caption Rewrite** | `gemini-3-pro-preview` | Complex reasoning for tone shifting |
| **Magic Editor** | `gemini-2.5-flash-image` | "Nano Banana" model for fast image manipulation |
| **Image Gen (HQ)** | `gemini-3-pro-image-preview` | "Nano Banana Pro" for 4K generation |
| **Chat** | `gemini-3-pro-preview` | High-intelligence conversational agent |
| **Toolkit (Bio)** | `gemini-2.5-flash` | Fast text generation |
| **Financial Tools** | `gemini-2.5-flash` | Uses **Google Search Grounding** for real-time data |

---

## 📦 Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/snapaura-ai.git
    cd snapaura-ai
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key**
    *   Create a `.env` file in the root.
    *   Add your Google Gemini API Key:
    ```env
    API_KEY=your_google_api_key_here
    ```
    *   *Note: The app also supports a fallback list in `services/geminiService.ts` for deployment environments without env var injection.*

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## 📱 PWA Instructions

To install on mobile:
1.  Open the deployed URL in Chrome (Android) or Safari (iOS).
2.  Tap **Share** (iOS) or **Menu** (Android).
3.  Select **"Add to Home Screen"**.
4.  Launch SnapAura like a native app!

---

## 📄 License

MIT License. Built for the Google Gemini Developer Competition.