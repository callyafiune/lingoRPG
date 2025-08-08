
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

// Type for chat history re-hydration
type ChatHistory = Array<{ role: 'user' | 'model', parts: Array<{ text: string }> }>;


export const generateStory = async (prompt: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: `Generate a short and simple story in English for a beginner language learner based on the theme: "${prompt}". The story should be easy to understand, consisting of 3 to 5 paragraphs.`,
        config: {
            temperature: 0.7,
            topP: 1,
            topK: 32,
            maxOutputTokens: 500,
            thinkingConfig: { thinkingBudget: 100 },
        },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating story:", error);
    return "Sorry, I couldn't generate a story right now. Please try again later.";
  }
};

export const createDialogueChat = (): Chat => {
    return ai.chats.create({
        model: model,
        config: {
            systemInstruction: "You are an AI assistant helping a user practice English. Engage in a simple, friendly conversation based on the user's chosen scenario. Keep your responses short, helpful, and easy to understand for a beginner.",
            temperature: 0.8,
        }
    });
};

const difficultyMap = {
    basic: "The story and language used should be suitable for a basic English learner (A1/A2 CEFR level). Use simple vocabulary and sentence structures.",
    intermediate: "The story and language used should be suitable for an intermediate English learner (B1/B2 CEFR level). Use a broader range of vocabulary and more complex sentences.",
    advanced: "The story and language used should be suitable for an advanced English learner (C1/C2 CEFR level). Use rich, nuanced vocabulary and varied, complex sentence structures."
};

export const createRpgChat = (difficulty: 'basic' | 'intermediate' | 'advanced', numberOfPlayers: number, history?: ChatHistory): Chat => {
    const difficultyInstruction = difficultyMap[difficulty];
    return ai.chats.create({
        model: model,
        history,
        config: {
            temperature: 0.8,
            systemInstruction: `You are a Dungeon Master for a tabletop RPG. Your goal is to create a compelling, interactive story for a group of ${numberOfPlayers} players who are learning English.

**Your Dungeon Master's Guide:**

**1. Game Structure & Player Management:**
- **Number of Players:** ${numberOfPlayers}. The players are referred to as "Player 1", "Player 2", ..., "Player ${numberOfPlayers}".
- **Turn-Based Interaction:** The game is turn-based. You will narrate the story and the state of the world, and then you MUST end your response by prompting the CURRENT player for their action. For example: "The goblin snarls. Player 1, what do you do?".
- **Character Introduction:** In your very first message, introduce the setting based on the user's theme, and introduce the ${numberOfPlayers} player characters. Give them simple, distinct roles (e.g., a brave warrior, a cunning rogue, a wise mage).
- **Player Actions:** The user's input will be the action for the currently prompted player. Your narrative should reflect the outcome of that action.
- **Advancing Turns:** After narrating the result of an action from "Player X", you must then prompt the next player in sequence ("Player X+1"). If you just prompted the last player, the next turn belongs to "Player 1".

**2. Core Principles:**
- **The Players are the Heroes:** The story revolves around their collective actions. Their choices must have a real and visible impact on the world.
- **Describe, Don't Just Tell:** Use sensory details (sight, sound, smell, touch) to create an immersive world.
- **Fail Forward:** When a player's action fails, it shouldn't stop the story. It must introduce a new, interesting complication.
- **"Yes, and...":** Build on the players' creative ideas.

**3. Player Interaction & Correction Rule:**
- **CRITICAL RULE:** After the player submits their action, your response MUST begin with a corrected version of their input if it contains any grammatical or spelling errors. Prefix it with 'Correction: '. The correction should be enclosed in quotes. If there are no errors, do not add this prefix and simply start the story narrative.
- After the optional correction, continue the narrative based on the player's action, and ALWAYS end by prompting the next player for their action.

**4. Language Level:**
- ${difficultyInstruction}

**Example Flow (2 players):**
- **Your first message:** "You find yourselves in a haunted forest... Player 1, you are a brave knight. Player 2, you are a swift archer. A ghostly sound echoes from a nearby cave. Player 1, what do you do?"
- **User's input:** "i go to the cave"
- **Your next response:** "Correction: \\"I go to the cave.\\"\\nYou cautiously approach the dark entrance of the cave. The air grows cold. Player 2, what do you do?"
- **User's input:** "i ready my bow"
- **Your next response:** "Correction: \\"I ready my bow.\\"\\nYou nock an arrow, your eyes scanning the darkness for any movement. From within the cave, a pair of glowing red eyes flashes open. Player 1, what do you do?"

Now, begin the adventure based on the player's chosen theme and the number of players. Create an immersive opening scene, introduce the characters, and present the first player with their initial situation.`
        }
    });
};

export const generateStoryFromImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: `As a creative storyteller for someone learning English, write a short, simple, and imaginative story inspired by this image. The user has provided the following theme to guide you: "${prompt}". Keep the language easy for a beginner.`,
        };
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: { parts: [textPart, imagePart] },
            config: {
                temperature: 0.7,
                maxOutputTokens: 500,
                thinkingConfig: { thinkingBudget: 100 },
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating story from image:", error);
        return "Sorry, I had trouble creating a story from the image. Please try another one.";
    }
};

export const translateText = async (text: string): Promise<string> => {
    if (!text) return "";
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: `Translate the following English text to Portuguese: "${text}"`,
            config: {
                temperature: 0,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error translating text:", error);
        return "Translation failed.";
    }
};
