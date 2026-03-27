import { GoogleGenAI } from "@google/genai";

// Standard environment variable access for Vite
// In AI Studio, this is injected via vite.config.ts
// Locally, users should add GEMINI_API_KEY to their .env file
const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. Please add it to your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export const getChatModel = () => {
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are a helpful and friendly FAQ Chatbot. Your goal is to provide clear, concise, and accurate answers to user questions. If you don't know the answer, politely say so and suggest where they might find more information. Use a professional yet approachable tone.",
    },
  });
};

export const generateResponse = async (prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};
