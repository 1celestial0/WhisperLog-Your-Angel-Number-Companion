
WhisperLog helps you record angel number sightings and explore their meaning. It combines logging tools with AI powered insights to create a personal spiritual journal.

## Features
- **Intuitive Input Console** – quickly log numbers, emotions, activities and optional notes
- **AI Interpretation Engine** – generates personalized spiritual interpretations
- **Interactive Timeline** – visualize entries over time with cosmic styling
- **Analytics Dashboard** – discover patterns between numbers and emotions
- **Spoken Insights** – hear interpretations read aloud in multiple languages
- **Tabbed Navigation** – simple access to timelines, analytics and affirmations
- **Local Data & Export** – entries are stored locally and can be exported
- **Daily Affirmations & Mood Tracking** – receive daily messages that consider your recent logs and emotional state

These features are described in more detail in [`docs/blueprint.md`](docs/blueprint.md).

## Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
3. To run AI flows in development, start the Genkit dev server:
   ```bash
   npm run genkit:dev
   ```
   (Use `npm run genkit:watch` to reload flows on file changes.)

## Folder Layout
- `src/ai` – Genkit configuration and AI flows such as `interpret-angel-number.ts`
- `src/app` – Next.js `app` directory containing routes and layout
- `src/components` – React components used throughout the UI
- `src/hooks` – reusable React hooks
- `src/lib` – shared types and utilities

## Usage
After installing dependencies, run both `npm run dev` and `npm run genkit:dev` in separate terminals. Visit the URL printed by Next.js (default `http://localhost:9002`) to use the web app. The Genkit dashboard provides a UI for testing individual AI flows during development.

## Environment Variables
Copy `.env.example` to `.env` and fill in the required values. This file lists the environment variables the application reads at runtime (such as API keys for external services). The development server loads them automatically using `dotenv`.

## Running Tests
Make sure dependencies are installed with `npm install` and then run:

```bash
npm test
```

## Production Build
To create a production build and start the app:

```bash
npm run build
npm start
```
