
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
        // Use standard flash for validation as it's most likely to be available
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
  const cleanString = base64String.trim();
  const match = cleanString.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  
  if (match) {
    return {
      mimeType: match[1],
      data: match[2]
    };
  }
  
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
    
    let jsonCandidate = text;
    if (firstBracket !== -1 && lastBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
       jsonCandidate = text.substring(firstBracket, lastBracket + 1);
    } else if (firstBrace !== -1 && lastBrace !== -1) {
       jsonCandidate = text.substring(firstBrace, lastBrace + 1);
    }

    const cleaned = jsonCandidate.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error on text:", text);
    throw new Error("Failed to parse JSON response from AI");
  }
};

// --- GLOBAL STRUCTURE GUIDE (For Tools) ---
const STRUCTURE_GUIDE = `
FORMATTING & BEHAVIOR RULES:
1. **Direct & Sharp**: Start directly with the answer. No "Here is the analysis" or "Based on the data".
2. **Professional formatting**: Use **Bold** for key metrics. Use lists for readability.
3. **No Robot Speak**: Avoid "As an AI" or "I have processed". Act like a specialized software engine.
4. **Visuals**: Use emojis sparingly but effectively to categorize data (e.g. 📈 for trends).
5. **Confidence**: Be decisive. If unsure, state the risk factor, don't apologize.
`;

// --- HUMAN CHAT GUIDE (For Personas) ---
const HUMAN_CHAT_GUIDE = `
CRITICAL BEHAVIORAL INSTRUCTIONS:
1. **ZERO ROBOTIC GREETINGS**: 
   - NEVER start with "Hey there!", "Hello!", "Hi!", or "Greetings!" unless the user said it first.
   - If the user asks a question, answer it IMMEDIATELY.
   - Example: User: "Why is the sky blue?" -> Response: "It's because of Rayleigh scattering. Basically, sunlight hits the atmosphere..." (NOT "Hey there! The sky is blue because...")

2. **MIRROR ENERGY**:
   - If the user sends a short text, reply short.
   - If the user is casual ("yo what's good"), be casual.
   - If the user is serious, be professional.

3. **NATURAL FLOW**:
   - Use natural connectors like "Honestly,", "By the way,", "Look,".
   - It is okay to be opinionated (within safety bounds) based on your persona.
   - Don't lecture. Chat.

4. **PERSONA LOYALTY**:
   - You are NOT Google Gemini. You are the specific Persona assigned (e.g., Bestie, Coach).
   - Never break character.
`;

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
      model: 'gemini-2.5-flash', // Keep standard Flash for robust multimodal
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
      model: 'gemini-2.5-flash-lite', // Use Lite for fast text tasks
      contents: `Rewrite this caption to match a "${tone}" vibe. Be creative and concise. No intro text.\nCaption: "${caption}"`,
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
export const sendChatMessage = async (
    history: {role: string, parts: {text?: string, inlineData?: any}[]}[], 
    newMessage: string, 
    systemInstruction?: string,
    imageAttachment?: string
) => {
    const ai = getAiClient();
    
    // Choose the right guide
    const guide = systemInstruction ? HUMAN_CHAT_GUIDE : STRUCTURE_GUIDE;

    const combinedSystemInstruction = `
      ${systemInstruction || "You are SnapAura, a helpful, professional AI assistant."}
      ${guide}
    `;

    // Try Flash Lite for speed, fallback to Flash if needed
    const modelName = 'gemini-2.5-flash-lite';

    const chatSession = ai.chats.create({
        model: modelName,
        history: history,
        config: {
            systemInstruction: combinedSystemInstruction
        }
    });

    let messageParts: any[] = [{ text: newMessage }];
    
    if (imageAttachment) {
        const { mimeType, data } = processBase64Image(imageAttachment);
        messageParts = [
            { inlineData: { mimeType, data } },
            { text: newMessage || "Analyze this image." }
        ];
    }

    try {
        const result = await chatSession.sendMessage({ 
            message: { 
                parts: messageParts 
            } 
        });
        return result.text;
    } catch (error) {
        console.error("Chat Error (Lite), retrying with Standard Flash:", error);
        // Fallback to standard flash if Lite fails
        const fallbackSession = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: { systemInstruction: combinedSystemInstruction }
        });
        const fallbackResult = await fallbackSession.sendMessage({ message: { parts: messageParts } });
        return fallbackResult.text;
    }
}

// --- 6. Toolkit Features ---
export const generateSocialBio = async (info: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: `Write 3 different short, punchy, and aesthetic social media bios (max 150 chars each) for a person who describes themselves as: "${info}". Use emojis. Return strictly just the 3 bios separated by '||'. No intro.`
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
    Also provide a brief professional trading analysis and a signal (BUY, SELL, or HOLD).
    Generate 7 estimate data points representing the last 7 days price trend normalized between 0 and 100 for a graph.
    
    Return strict JSON format:
    {
      "price": "string (e.g. $65,000)",
      "change": "string (e.g. +2.5%)",
      "trend": [number, number, ...],
      "signal": "BUY" | "SELL" | "HOLD",
      "analysis": "short professional analysis string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Use Flash for Search Grounding stability
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
      "details": "Brief market context"
    }
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Use Flash for Search Grounding stability
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
    For EACH match, perform a detailed deep-dive statistical analysis.
    Think carefully about player form, injuries, and historical data.
    
    Format the "analysis" field in clean Markdown:
    1. **Direct Answer**: Brief summary of the likely outcome.
    2. **Key Stats**: Form (Last 5), Head-to-Head, Injuries.
    3. **Momentum**: Who is currently stronger?
    4. **Prediction**: Explicit win/draw/loss probability.
    
    Return strict JSON:
    [
      {
        "id": "match1",
        "homeTeam": "string",
        "awayTeam": "string",
        "time": "string (e.g. 20:00 GMT)",
        "league": "string",
        "probabilities": {
          "home": number (0-100),
          "draw": number (0-100),
          "away": number (0-100)
        },
        "metrics": {
          "over2_5": number (0-100),
          "btts": number (0-100)
        },
        "confidenceScore": number (0-100),
        "analysis": "Markdown formatted string"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Flash + Search is the most stable combo for live data
      contents: prompt,
      config: { 
          tools: [{ googleSearch: {} }]
          // Removed thinkingConfig due to incompatibility with googleSearch in some environments causing 500 RPC errors
      },
    });

    const text = response.text;
    if (!text) throw new Error("No data returned");
    return cleanAndParseJSON(text);
  } catch (error) {
    console.error("Soccer Prediction Error:", error);
    throw error;
  }
}

// --- 9. Smart Notes Assistant ---
export const generateSmartNote = async (text: string, mode: 'summarize' | 'rewrite' | 'expand' | 'translate', extra?: string): Promise<string> => {
    const ai = getAiClient();
    let prompt = "";
    
    // Enforce Markdown structure in all prompts
    const styleGuide = `
    ${STRUCTURE_GUIDE}
    Output must be clean Markdown. Use **Bold** for key terms, *Bullet Points* for lists, and ### Headers for sections.
    `;

    switch(mode) {
        case 'summarize': prompt = `Summarize this text into concise, structured bullet points:${styleGuide}\n\nTEXT:\n${text}`; break;
        case 'rewrite': prompt = `Rewrite this text to be ${extra || 'professional'}. Maintain the meaning but improve the flow and vocabulary:${styleGuide}\n\nTEXT:\n${text}`; break;
        case 'expand': prompt = `Expand on the following ideas with more detail, context, and examples:${styleGuide}\n\nTEXT:\n${text}`; break;
        case 'translate': prompt = `Translate this text to ${extra || 'English'}. Ensure natural phrasing:${styleGuide}\n\nTEXT:\n${text}`; break;
    }

    const response = await ai.models.generateContent({
        model: mode === 'expand' ? 'gemini-3-pro-preview' : 'gemini-2.5-flash-lite', 
        contents: prompt,
        // Only use thinking config for expansion where deep reasoning is needed and no search is involved
        config: mode === 'expand' ? { thinkingConfig: { thinkingBudget: 32768 } } : undefined
    });
    return response.text || "";
}

// --- 10. Social Media Growth ---
export const generateSocialContent = async (topic: string, type: 'hashtag' | 'idea' | 'reply' | 'timing', context?: string) => {
    const ai = getAiClient();
    let prompt = "";
    const styleGuide = `
    ${STRUCTURE_GUIDE}
    Format the output in clean Markdown. Use **Bold** for hooks/headings and bullet points for lists.
    `;

    if (type === 'hashtag') prompt = `Generate 30 high-reach, mix of niche and broad hashtags for a post about: "${topic}". Return strictly the tags separated by space.`;
    
    if (type === 'idea') prompt = `Give me 5 viral content ideas (Reels & Posts) for a creator in the "${topic}" niche.${styleGuide} For each idea include:\n- **Hook**\n- **Concept**\n- **Why it works**`;
    
    if (type === 'reply') prompt = `Write 3 engaging, authentic replies to this comment: "${context}". Tone: ${topic}. Separate each reply by '||'.`;
    
    if (type === 'timing') prompt = `Suggest the best posting times for the "${topic}" niche on Instagram and TikTok.${styleGuide} Provide specific days/times and the reasoning based on general audience behavior.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite', // Lite is sufficient for social text
        contents: prompt
    });
    return response.text || "";
}

// --- 11. Moodboard Analysis ---
export const analyzeMoodboard = async (images: string[]) => {
    const ai = getAiClient();
    const { mimeType, data } = processBase64Image(images[0]);
    
    const prompt = `
      Analyze the aesthetic of this image to create a Moodboard.
      Identify:
      1. A creative Theme Name (e.g. "Velvet Hour")
      2. 5 Vibe Keywords
      3. A Color Palette (5 hex codes)
      4. A matching poetic caption
      
      Return strict JSON:
      {
        "theme": "string",
        "keywords": ["string",...],
        "colors": ["#hex",...],
        "caption": "string"
      }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Flash needed for vision
        contents: {
            parts: [
                { inlineData: { mimeType: mimeType, data } },
                { text: prompt }
            ]
        },
        config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text || "{}");
}

// --- 12. Football Intelligence Hub ---

export const getLiveMatchDetails = async () => {
  const ai = getAiClient();
  const prompt = `
    Find live football matches happening right now. 
    If no major matches are live, find the most recent completed major match results.
    Return a list of up to 3 matches.
    
    For "commentary", return a SINGLE STRING formatted with Markdown.
    Example: "**Direct Answer:** Match is intense. **Momentum:** Home team attacking. **Key Event:** Goal by ..."
    Do NOT return a nested JSON object for commentary.
    
    Return strict JSON:
    [
      {
        "id": "string",
        "home": "string",
        "away": "string",
        "score": "string (e.g. 2-1)",
        "status": "string (e.g. 65' or FT)",
        "events": "string (summary of goals/cards)",
        "commentary": "string"
      }
    ]
  `;
  
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash', // Stable grounding
          contents: prompt,
          config: { tools: [{ googleSearch: {} }] }
      });
      return cleanAndParseJSON(response.text || "[]");
  } catch (e) {
      console.error(e);
      throw e;
  }
};

export const analyzePlayerPerformance = async (playerName: string) => {
    const ai = getAiClient();
    const prompt = `
      Search for current season stats and recent form (last 5 games) for football player: "${playerName}".
      Analyze their strengths, weaknesses, playstyle, and injury status deeply.
      Calculate an "Impact Score" (0-10) based on their influence on the game.
      
      Return strict JSON:
      {
        "name": "string",
        "team": "string",
        "position": "string",
        "image": "string (optional url or null)",
        "form": "string (e.g. W-L-D-W-W)",
        "stats": { "goals": number, "assists": number, "mins": number },
        "analysis": {
          "strengths": ["string"],
          "weaknesses": ["string"],
          "style": "string (One short paragraph description)"
        },
        "riskScore": number (0-10, based on injury/rotation),
        "impactScore": number (0-10, based on performance),
        "availability": "string (e.g. Fit, Injured, Suspended)"
      }
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Stable grounding
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }]
            }
        });
        return cleanAndParseJSON(response.text || "{}");
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getFantasyTips = async () => {
    const ai = getAiClient();
    const prompt = `
      Based on upcoming football fixtures and player form, suggest Fantasy Football picks.
      Think deeply about differential options and upcoming difficult fixtures.
      Do NOT provide gambling odds. Focus on points potential.
      
      Identify:
      1. **Top Picks (Safe)**: High ownership, consistent returners.
      2. **Value Picks**: Cheap players with good fixtures.
      3. **Differentials (Risky)**: Low ownership, high ceiling.
      
      Return strict JSON:
      {
        "gameweek": "string",
        "topPicks": [{ "name": "string", "team": "string", "reason": "string", "expectedPoints": "string" }],
        "valuePicks": [{ "name": "string", "team": "string", "cost": "string", "valueRating": "string (e.g. 9/10)" }],
        "differentials": [{ "name": "string", "team": "string", "ownership": "string", "riskLevel": "High/Med" }],
        "captain": { "name": "string", "reason": "string" }
      }
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Stable grounding
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }]
            }
        });
        return cleanAndParseJSON(response.text || "{}");
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getYesterdayAccuracy = async () => {
    const ai = getAiClient();
    const prompt = `
      Find results for major football matches played yesterday.
      For each match:
      1. Determine what the general pre-match expectation was (Prediction).
      2. Compare it to the Actual Result.
      3. Calculate an "Accuracy Score" (0-100).
      4. Explain the outcome in "Reasoning".
      
      Return strict JSON:
      [
        {
          "match": "Home vs Away",
          "result": "string (e.g. 1-2)",
          "prediction": "string (e.g. Home Win expected)",
          "accuracyScore": number,
          "reasoning": "string (Brief explanation: e.g. Red card changed game)"
        }
      ]
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Stable grounding
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }]
            }
        });
        return cleanAndParseJSON(response.text || "[]");
    } catch (e) {
        console.error(e);
        throw e;
    }
};
