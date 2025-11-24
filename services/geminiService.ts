import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize } from "../types";

// --- API KEY CONFIGURATION ---
const FALLBACK_KEYS = [
  "YOUR_API_KEY_HERE", 
];

const getApiKey = (): string => {
  // 1. Check Local Storage (Highest Priority - User provided)
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    if (localKey && localKey.trim() !== "") return localKey;
  }

  // 2. Check Environment Variable (Production/Dev fallback)
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError
  }

  // 3. Check Fallback List (Rotation)
  const validKeys = FALLBACK_KEYS.filter(k => k !== "YOUR_API_KEY_HERE" && k.trim() !== "");
  if (validKeys.length > 0) {
    return validKeys[Math.floor(Math.random() * validKeys.length)];
  }

  return "YOUR_API_KEY_HERE";
};

// DYNAMIC CLIENT GENERATOR
// We must generate the client on every request to ensure we use the latest key
// if the user updates it in LocalStorage during the session.
const getAiClient = () => {
    const key = getApiKey();
    return new GoogleGenAI({ apiKey: key });
}

// --- KEY VALIDATION UTILITY ---
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Attempt a minimal generation to test the key
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: 'ping' }] },
        });
        return true;
    } catch (error) {
        console.warn("API Key Validation Failed:", error);
        return false;
    }
};

// Helper: Extract raw base64 and mimeType from Data URL
const processBase64Image = (base64String: string) => {
  const match = base64String.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  
  if (match) {
    return {
      mimeType: match[1],
      data: match[2]
    };
  }
  
  return {
    mimeType: 'image/png',
    data: base64String
  };
};

const cleanAndParseJSON = (text: string) => {
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(jsonCandidate);
        } catch (innerError) {}
    }

    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error on text:", text);
    throw new Error("Failed to parse JSON response from AI");
  }
};


// --- 1. Image Analysis & Caption Generation ---
export const analyzeImageAndGenerateCaptions = async (base64Image: string): Promise<any> => {
  const ai = getAiClient();
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
          { inlineData: { mimeType: mimeType, data: data } },
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
export const rewriteCaption = async (caption: string, tone: string): Promise<string> => {
  const ai = getAiClient();
  try {
    // Switched to gemini-2.5-flash for better availability
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following caption to match a "${tone}" vibe. Be creative. Caption: "${caption}"`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Rewrite Error:", error);
    return "Could not rewrite caption.";
  }
};

// --- 3. Image Editing ---
export const editImageWithPrompt = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAiClient();
  const { mimeType, data } = processBase64Image(base64Image);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: data, mimeType: mimeType } },
          { text: prompt },
        ],
      },
    });

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
export const generateImageFromPrompt = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = getAiClient();
  
  // Try Pro Model First
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { imageSize: size as any, aspectRatio: "1:1" }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated (Pro).");
  } catch (error: any) {
    // Fallback: If Pro model fails for ANY reason (auth, access, not found), try Flash Image
    console.warn("Pro model failed. Attempting Flash fallback. Error:", error);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image generated (Flash Fallback).");
    } catch (fallbackError) {
      console.error("Fallback Image Gen Error:", fallbackError);
      throw fallbackError;
    }
  }
};

// --- 5. Chatbot ---
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], newMessage: string) => {
    const ai = getAiClient();
    // Switched to gemini-2.5-flash for broader compatibility and speed
    const chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
            systemInstruction: "You are SnapAura, a helpful, witty, and aesthetic AI assistant for a photo editing app. You help users with photography tips, caption ideas, and navigating the app."
        }
    });

    const result = await chatSession.sendMessage({ message: newMessage });
    return result.text;
}

// --- 6. Toolkit Features ---
export const generateSocialBio = async (info: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write 3 different short, punchy, and aesthetic social media bios (max 150 chars each) for a person who describes themselves as: "${info}". Use emojis. Return strictly just the 3 bios separated by '||'.`
        });
        return response.text || "";
    } catch (e) {
        console.error(e);
        return "Could not generate bio.";
    }
}

// --- 7. Financial Analysis ---
export const getCryptoData = async (coin: string) => {
  const ai = getAiClient();
  const prompt = `
    Find the current price, 24h change, and market trend for ${coin} as of right now (real-time).
    Also provide a brief trading analysis and a signal (BUY, SELL, or HOLD).
    Generate 7 estimate data points representing the last 7 days price trend normalized between 0 and 100 for a graph.
    
    Return strict JSON format:
    {
      "price": "string (e.g. $65,000)",
      "change": "string (e.g. +2.5%)",
      "trend": [number, number, ...],
      "signal": "BUY" | "SELL" | "HOLD",
      "analysis": "short analysis string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error("Crypto Data Error:", error);
    throw error;
  }
};

export const getCurrencyData = async (amount: string, from: string, to: string) => {
  const ai = getAiClient();
  const prompt = `
    Convert ${amount} ${from} to ${to} using the latest exchange rates.
    Return strict JSON format:
    {
      "result": "string (formatted result e.g. KES 15,000)",
      "rate": "string (e.g. 1 USD = 130 KES)",
      "details": "Brief market context or recent fluctuation note"
    }
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error("Currency Data Error:", error);
    throw error;
  }
};