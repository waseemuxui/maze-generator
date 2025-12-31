
import { GoogleGenAI } from "@google/genai";
import { MazeConfig } from "../types";

export const generateMazeStory = async (config: MazeConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as a mystical dungeon master. I have generated a maze with the following properties:
  - Shape: ${config.shape}
  - Size: ${config.size}x${config.size}
  - Difficulty: ${config.difficulty}
  
  Write a very short, atmospheric, 2-sentence background story or riddle for this specific maze. 
  Make it sound like an ancient quest. Return only the text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text ?? "An ancient labyrinth awaits your wisdom. Will you find the path to the forgotten realm?";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The walls of this ancient structure whisper secrets of a long-lost civilization. Tread carefully.";
  }
};
