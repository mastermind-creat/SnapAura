import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize } from "../types";

// --- API KEY CONFIGURATION ---
// Add your API keys to this list to serve as a fallback when env vars are missing.
// The app will randomly select a key from this list to distribute usage.
const FALLBACK_KEYS = [
  "YOUR_API_KEY_HERE", 
  // Add more keys here, e.g.:
  // "AIzaSy..."
];

const getApiKey = (): string => {
  // 1. Check Environment Variable (Standard for production/local dev)
  if (process.env.API_KEY) return process.env.API_KEY;

  // 2. Check Local Storage (For manual override in browser console)
  // Run: localStorage.setItem('GEMINI_API_KEY', 'your-key')
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    if (localKey) return localKey;
  }

  // 3. Check Fallback List (Rotation)
  const validKeys = FALLBACK_KEYS.filter(k => k !== "YOUR_API_KEY_HERE" && k.trim() !== "");
  if (validKeys.length > 0) {
    // Return a random key to distribute load
    return validKeys[Math.floor(Math.random() * validKeys.length)];
  }

  return "YOUR_API_KEY_HERE";
};

const apiKey = getApiKey();

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: apiKey });

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

// Helper: Clean and parse JSON from text that might contain markdown or preamble
const cleanAndParseJSON = (text: string) => {
  try {
    // 1. Attempt to find the JSON object within the text (between first { and last })
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(jsonCandidate);
        } catch (innerError) {
            // If extracting braces failed, fall through to regex cleanup
        }
    }

    // 2. Fallback: Remove markdown code blocks and trim
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error on text:", text);
    throw new Error("Failed to parse JSON response from AI");
  }
};


// --- 1. Image Analysis & Caption Generation ---
// Model: gemini-2.5-flash (Fast, multimodal, good for analysis)

export const analyzeImageAndGenerateCaptions = async (base64Image: string): Promise<any> => {
  if (!apiKey || apiKey.includes("YOUR_API_KEY")) {
      console.warn("API Key is missing or invalid. Please check services/geminiService.ts or your environment variables.");
  }

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
// Fallback: gemini-2.5-flash-image

export const generateImageFromPrompt = async (prompt: string, size: ImageSize): Promise<string> => {
  try {
    // Attempt 1: Try High-Quality Pro Model first
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
    throw new Error("No image generated (Pro).");
  } catch (error: any) {
    const isAccessError = 
      error.status === 'PERMISSION_DENIED' || 
      error.status === 403 || 
      error.code === 403 || 
      error.status === 'NOT_FOUND' || 
      error.status === 404 ||
      (error.message && error.message.includes('permission'));

    if (isAccessError) {
      console.warn("Pro model access denied or not found. Falling back to Gemini 2.5 Flash Image.");
      try {
        // Attempt 2: Fallback to Flash Image
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: "1:1"
            }
          },
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
    
    console.error("Image Gen Error:", error);
    throw error;
  }
};

// --- 5. Chatbot ---
// Model: gemini-3-pro-preview

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], newMessage: string) => {
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

// --- 6. Toolkit Features ---
// Model: gemini-2.5-flash (Fast)

export const generateSocialBio = async (info: string): Promise<string> => {
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

// --- 7. Financial Analysis (Crypto/Currency) ---
// Model: gemini-2.5-flash with Google Search Grounding

export const getCryptoData = async (coin: string) => {
  const prompt = `
    Find the current price, 24h change, and market trend for ${coin} as of right now (real-time).
    Also provide a brief trading analysis and a signal (BUY, SELL, or HOLD).
    Generate 7 estimate data points representing the last 7 days price trend normalized between 0 and 100 for a graph.
    
    Return strict JSON format (do not include markdown code blocks like \`\`\`json):
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
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType cannot be used with googleSearch
      },
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
  const prompt = `
    Convert ${amount} ${from} to ${to} using the latest exchange rates.
    Return strict JSON format (do not include markdown code blocks like \`\`\`json):
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
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType cannot be used with googleSearch
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error("Currency Data Error:", error);
    throw error;
  }
};
