# LingoRPG: The AI Language-Learning Adventure

LingoRPG is an interactive text-based adventure game designed to make learning a new language fun and immersive. Embark on epic quests where an AI acts as your personal Game Master, guiding you through a story that you shape with your decisions, all while practicing your target language.

## Key Features

- **Multilingual Learning**: Choose your native language and the language you want to learn. The entire app interface adapts to your native tongue, while all learning activities are conducted in your target language.
- **AI Game Master & Tutor**: In the RPG mode, an AI guides your story, creating unique challenges and correcting your grammar in real-time in the language you're learning.
- **Text-to-Speech with Highlighting**: Listen to the AI's narration in your target language. Click the play button to hear a full message, or click any sentence to play it individually and see it highlighted.
- **Integrated Vocabulary Builder**: Double-click any single word in a story to automatically translate it from your learning language to your native language and save it to your personal vocabulary list.
- **On-the-Fly Translation**: Select any phrase or sentence to see an instant translation from your learning language to your native language.

## Application Tabs

The application is divided into three main sections:

1.  **RPG**: The heart of the application. Start a text-based adventure by providing a theme and choosing a difficulty. The AI will generate a world for you to explore and will correct your grammar as you play.
2.  **Vocabulary**: Review the words you've saved from your adventures. Use the flashcards to test your memory of the word and its translation.
3.  **About**: Find information about the project and its features.

## Tech Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI API**: Google Gemini API (`@google/genai`)

## Setup and Usage

1.  Install the project dependencies with `npm install`.
2.  The Google Gemini API requires an API key. The application expects this key to be available as an environment variable. Create a `.env` file in the root of the project and add your key:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
3.  During development, run `npm run dev` to start the Vite development server.
4.  To build a production-ready version, use `npm run build`. The files will be generated in the `dist` folder and can be served by any static content host.

## License

Copyright (c) 2025 Cally Afiune.

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
