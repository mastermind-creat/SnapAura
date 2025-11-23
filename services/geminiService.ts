import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize } from "../types";

const apiKey = process.env.API_KEY;

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Helper: Extract raw base64 and mimeType from Data URL
const processBase64Image = (base64String: string) => {
  // Check if it matches data:image/xyz;base64, pattern
  const match = base64String.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  
  if (match) {
    return {
      mimeType: match[1],
      data: match[2]
    };
  }
  
  // Fallback if no header found (assume raw png)
  return {
    mimeType: 'image/png',
    data: base64String
  };
};

// --- 1. Image Analysis & Caption Generation ---
// Model: gemini-2.5-flash (Fast, multimodal, good for analysis)

export const analyzeImageAndGenerateCaptions = async (base64Image: string): Promise<any> => {
  if (!apiKey) throw new Error("API Key missing");

  const { mimeType, data } = processBase64Image(base64Image);

  const prompt = `
    Analyze this image in detail (mood, lighting, facial expressions, environment). 
    Based on the analysis, generate captions in the following categories:
    - Flirty
    - Savage
    - Inspirational
    - Funny
    - Aesthetic
    - Short Poetic Lines
    - Kenyan Slang
    
    Also generate a list of 15 optimized hashtags.
    
    Return the response strictly as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            captions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  }
                }
              }
            },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Caption Gen Error:", error);
    throw error;
  }
};

// --- 2. Caption Rewriting ---
// Model: gemini-3-pro-preview (Complex reasoning for tone)

export const rewriteCaption = async (caption: string, tone: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Rewrite the following caption to match a "${tone}" vibe. Be creative. Caption: "${caption}"`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Rewrite Error:", error);
    return "Could not rewrite caption.";
  }
};

// --- 3. Image Editing ---
// Model: gemini-2.5-flash-image (Nano banana for edits)

export const editImageWithPrompt = async (base64Image: string, prompt: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  const { mimeType, data } = processBase64Image(base64Image);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType, 
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate parts to find the image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image returned from edit.");
  } catch (error) {
    console.error("Image Edit Error:", error);
    throw error;
  }
};

// --- 4. Image Generation ---
// Model: gemini-3-pro-image-preview (Nano banana pro for HQ generation)

export const generateImageFromPrompt = async (prompt: string, size: ImageSize): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          imageSize: size as any, 
          aspectRatio: "1:1"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

// --- 5. Chatbot ---
// Model: gemini-3-pro-preview

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], newMessage: string) => {
    if (!apiKey) throw new Error("API Key missing");
    
    const chatSession = ai.chats.create({
        model: 'gemini-3-pro-preview',
        history: history,
        config: {
            systemInstruction: "You are SnapAura, a helpful, witty, and aesthetic AI assistant for a photo editing app. You help users with photography tips, caption ideas, and navigating the app."
        }
    });

    const result = await chatSession.sendMessage({ message: newMessage });
    return result.text;
}