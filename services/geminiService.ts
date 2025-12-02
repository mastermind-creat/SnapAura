
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
  // Remove any whitespace
  const cleanString = base64String.trim();
  const match = cleanString.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  
  if (match) {
    return {
      mimeType: match[1],
      data: match[2]
    };
  }
  
  // If it's already raw base64, assume png but this is risky
  return {
    mimeType: 'image/png',
    data: cleanString
  };
};

const cleanAndParseJSON = (text: string) => {
  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    
    // Check if it's an array or object and extract accordingly
    let jsonCandidate = text;
    if (firstBracket !== -1 && lastBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
       // It's likely an array
       jsonCandidate = text.substring(firstBracket, lastBracket + 1);
    } else if (firstBrace !== -1 && lastBrace !== -1) {
       // It's likely an object
       jsonCandidate = text.substring(firstBrace, lastBrace + 1);
    }

    const cleaned = jsonCandidate.replace(/```json/g, '').replace(/```/g, '').trim();
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
  } catch (error: any) {
    console.error("Image Edit Error:", error);
    if (error.status === 403 || error.message?.includes('permission') || error.message?.includes('403')) {
        throw new Error("Access Denied: Image Editing requires a paid Google Cloud Project. Please enable billing in Google AI Studio.");
    }
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
    } catch (fallbackError: any) {
      console.error("Fallback Image Gen Error:", fallbackError);
       if (fallbackError.status === 403 || fallbackError.message?.includes('permission') || fallbackError.message?.includes('403')) {
        throw new Error("Access Restricted: Image Generation requires a billed Google Cloud Project. Free tier keys are not supported for this model.");
       }
      throw fallbackError;
    }
  }
};

// --- 5. Chatbot ---
export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], newMessage: string, systemInstruction?: string) => {
    const ai = getAiClient();
    // Use Flash for standard chat, robust and fast
    const chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
        config: {
            systemInstruction: systemInstruction || "You are SnapAura, a helpful, witty, and aesthetic AI assistant for a photo editing app. You help users with photography tips, caption ideas, and navigating the app. Format your responses with Markdown: use **bold** for emphasis, lists for steps, and keep it concise."
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

// --- 8. Soccer Predictions ---
export const getSoccerPredictions = async () => {
  const ai = getAiClient();
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const prompt = `
    Find the major soccer matches scheduled for today, ${today}.
    Select the top 5 most popular or significant matches.
    For EACH match, perform a detailed statistical analysis considering:
    - Recent team form (last 5 games)
    - Head-to-head history
    - Goals scored/conceded context
    - Key injuries or news
    
    Based on this data, provide probability-based predictions (NOT betting advice).
    Calculate a 'SnapAura Confidence Score' (0-100) based on how clear the data is.
    
    Return strict JSON in this format:
    [
      {
        "id": "match1",
        "homeTeam": "string",
        "awayTeam": "string",
        "time": "string (e.g. 20:00 GMT)",
        "league": "string",
        "probabilities": {
          "home": number (percentage 0-100),
          "draw": number (percentage 0-100),
          "away": number (percentage 0-100)
        },
        "metrics": {
          "over2_5": number (percentage 0-100),
          "btts": number (percentage 0-100)
        },
        "confidenceScore": number (0-100),
        "analysis": "A detailed paragraph analyzing form, stats, and explaining the prediction."
      }
    ]
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
    console.error("Soccer Prediction Error:", error);
    throw error;
  }
}
