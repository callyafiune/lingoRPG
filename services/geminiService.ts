
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

export const createRpgChat = (history?: ChatHistory): Chat => {
    return ai.chats.create({
        model: model,
        history,
        config: {
            temperature: 0.8,
            systemInstruction: `You are a Dungeon Master for a tabletop RPG session. Your role is to guide a single player, who is an English language learner, through a fantasy adventure.
1. Start by creating an immersive opening scene based on the player's chosen theme.
2. Narrate the story, describe environments, and portray non-player characters.
3. Present the player with challenges, puzzles, and combat encounters. Sometimes, offer clear choices (e.g., A, B, C), but always allow for creative, free-text actions.
4. **Crucially, after the player submits their action, your response MUST begin with a corrected version of their input if it contains any grammatical or spelling errors. Prefix it with 'Correction: '. The correction should be enclosed in quotes. If there are no errors, simply start with the story.**
5. After providing the correction (if any), continue the narrative based on the player's action.
6. Keep the language engaging but accessible for a language learner. Maintain a consistent and compelling story.`
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
