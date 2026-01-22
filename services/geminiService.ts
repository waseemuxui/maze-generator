import { GoogleGenAI } from "@google/genai";
import { MazeConfig } from "../types";

const RIDDLES = [
  "I have cities, but no houses. I have mountains, but no trees. What am I? (A Map)",
  "The more of me there is, the less you see. What am I? (Darkness)",
  "I can be cracked, made, told, and played. What am I? (A Joke)",
  "I am full of holes but still hold water. What am I? (A Sponge)",
  "The one who makes it, doesn't want it. The one who buys it, doesn't use it. What am I? (A Coffin)"
];

const FALLBACK_ATMOSPHERES = [
  "Ancient whispers echo through these stone corridors, where light and shadow dance.",
  "Deep within the crystalline hollows, a path reveals itself only to the persistent.",
  "The steampunk mechanisms hum with rhythmic precision, guarding forgotten secrets.",
  "Neon veins pulse across the digital landscape, a complex sequence waiting to be solved."
];

/**
 * Generates an atmospheric story or riddle using Gemini AI.
 */
export const generateMazeStory = async (config: MazeConfig): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a mysterious, 1-sentence atmospheric introduction for a ${config.difficulty} ${config.generatorType} puzzle with a ${config.themeId} theme. Do not use quotes.`,
    });
    
    return response.text?.trim() || FALLBACK_ATMOSPHERES[0];
  } catch (error) {
    console.error("Gemini Story Generation Error:", error);
    // Use config to seed pseudo-randomness for consistent fallbacks
    const seed = config.seed.length + (config.size || 0) + config.generatorType.length;
    
    if (config.difficulty === 'hard') {
      return RIDDLES[seed % RIDDLES.length];
    }
    
    return FALLBACK_ATMOSPHERES[seed % FALLBACK_ATMOSPHERES.length];
  }
};