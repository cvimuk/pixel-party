import { GoogleGenAI, Type } from "@google/genai";
import { Challenge } from '../types';
import { PIXEL_COLORS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChallenges = async (theme: string = "party", players: string[] = []): Promise<Challenge[]> => {
  try {
    let promptContext = "";
    if (players.length > 0) {
      promptContext = `
      The players in the game are: ${players.join(', ')}.
      IMPORTANT: Randomly include specific player names in about 50% of the challenges (e.g., "${players[0]} drinks 2", "Kiss ${players[1] || 'someone'}", "${players[0]} chooses next").
      For the rest, use generic terms like "Left person", "Everyone", "Self".
      `;
    }

    const prompt = `Generate 8 short, fun, and creative drinking game challenges/tasks in Thai language for a "${theme}" theme. 
    ${promptContext}
    Keep them short (max 6 words). 
    Return strictly JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "The challenge text in Thai",
              },
              emoji: {
                type: Type.STRING,
                description: "A relevant emoji",
              }
            },
            required: ["text", "emoji"],
          },
        },
      },
    });

    const rawData = JSON.parse(response.text || '[]');
    
    // Map to Challenge object with colors
    return rawData.map((item: any, index: number) => ({
      id: `gen-${Date.now()}-${index}`,
      text: item.text,
      emoji: item.emoji,
      color: PIXEL_COLORS[index % PIXEL_COLORS.length],
    }));

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};