
# DevLife OS 🚀

A modern, local-first operating system for developers to manage their professional life.

## Features
- **Dashboard**: High-level overview of profit, tasks, and projects.
- **AI Insights**: Powered by Gemini 3 Flash to give you financial advice and project roadmaps.
- **Local Vault**: API keys are encrypted using AES-GCM directly in your browser.
- **Finance**: Monthly revenue vs expense tracking with interactive charts.
- **Projects**: Manage active repos and live URLs.

## Tech Stack
- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (@google/genai)
- **Charts**: Recharts
- **Icons**: Emoji based for lightweight performance

## Setup
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set your Google Gemini API Key:
   ```env
   API_KEY=your_gemini_api_key
   ```
4. Start the development server: `npm run dev`.

## Deployment (Vercel)
1. Push your code to GitHub.
2. Link your repo to Vercel.
3. Add the `API_KEY` environment variable in Vercel settings.
4. Deploy!

## Security Note
The API Vault uses the Web Crypto API. Encryption keys are derived from a local constant for this demo. In a production environment, you should prompt the user for a "Master Password" to derive the encryption key using PBKDF2.
