
import { GoogleGenAI } from "@google/genai";
import { ImageSize, GlobalContextState, AppIntent } from "../types";

// --- CONFIGURATION ---
const FALLBACK_KEYS = ["YOUR_API_KEY_HERE"];

// --- PROMPT ENGINE ---
class PromptEngine {
  static getToolSystemInstruction(): string {
    return `
      CRITICAL INSTRUCTION PROTOCOL (TOOL MODE):
      1. **ZERO FLUFF**: No greetings. Start directly with data.
      2. **DIRECT OUTPUT**: Return ONLY requested format (JSON/Markdown).
      3. **PROFESSIONAL**: Expert tone.
    `;
  }

  static getChatSystemInstruction(persona?: string): string {
    return `
      BEHAVIORAL INSTRUCTION PROTOCOL (CHAT MODE):
      1. **HUMAN-LIKE**: Speak naturally. Vary sentence length.
      2. **NO REPETITION**: Do NOT start messages with "Hey there".
      3. **CONTEXT AWARE**: Mirror user energy.
      
      *** ACTIVE PERSONA ***:
      ${persona || "You are a helpful, witty, and concise creative assistant."}
    `;
  }

  static injectContext(prompt: string, context?: GlobalContextState): string {
    let contextString = "";
    if (context) {
      if (context.userProfile) contextString += `\n[User: ${context.userProfile.name}]`;
      if (context.activeAnalysis) contextString += `\n[Image Analysis: ${JSON.stringify(context.activeAnalysis).slice(0, 500)}...]`;
    }
    return `${prompt}\n${contextString}`;
  }
}

// --- CLIENT MANAGEMENT ---
const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    if (localKey && localKey.trim() !== "") return localKey;
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) return process.env.API_KEY;
  } catch (e) {}
  return FALLBACK_KEYS[0];
};

const getAiClient = () => new GoogleGenAI({ apiKey: getApiKey() });

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: { parts: [{ text: 'ping' }] } });
        return true;
    } catch (error) { return false; }
};

const processBase64Image = (base64String: string) => {
  const cleanString = base64String.trim();
  const match = cleanString.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  return match ? { mimeType: match[1], data: match[2] } : { mimeType: 'image/png', data: cleanString };
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
  } catch (e) { return text.trim().startsWith('[') ? [] : {}; }
};

// --- OMNI ROUTER (THE BRAIN) ---
export const processOmniCommand = async (input: string): Promise<{ intent: AppIntent | null, reply: string }> => {
    const ai = getAiClient();
    const prompt = `
        You are the OS Controller for SnapAura. Map the user's natural language request to a specific App Intent.
        
        AVAILABLE TOOLS & ROUTING LOGIC:
        - "Create", "Generate image", "Imagine": Route to GENERATE.
        - "Edit this", "Fix photo", "Filter": Route to EDIT.
        - "Crypto", "Bitcoin", "Price", "Market": Route to TOOLKIT -> finance.
        - "Football", "Soccer", "Score", "Match": Route to TOOLKIT -> football-hub.
        - "League", "Standings", "EPL table": Route to TOOLKIT -> league-central.
        - "QR", "Scan code": Route to TOOLKIT -> qr-tools.
        - "Notes", "Summarize", "Write": Route to TOOLKIT -> notes.
        - "Vibe check", "Rizz", "Roast": Route to TOOLKIT -> gen-z-lab.
        - "World mood", "Earth status": Route to TOOLKIT -> aura-state.
        - "Social", "Hashtags", "Tweet": Route to TOOLKIT -> social-growth.
        - "Chat", "Ask AI": Route to CHAT.

        JSON OUTPUT FORMAT:
        {
            "reply": "Short confirmation message (e.g. 'Opening Market Data...')",
            "intent": {
                "type": "NAVIGATE_TOOL" | "SEND_TO_CHAT" | "SOCIAL_GROWTH",
                "payload": { ...specifics based on tool... }
            }
        }

        If the request is vague, default to SEND_TO_CHAT with the text.
        If routing to TOOLKIT, payload must include { "toolId": "id-from-list-above", "context": "user query" }.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User Input: "${input}"\n${prompt}`,
            config: { responseMimeType: "application/json" }
        });
        
        const data = cleanAndParseJSON(response.text || "{}");
        return {
            intent: data.intent || null,
            reply: data.reply || "Processing..."
        };
    } catch (e) {
        return { intent: null, reply: "I couldn't understand that command." };
    }
};

// --- CORE AI FUNCTIONS ---

export const analyzeImageAndGenerateCaptions = async (base64Image: string, context?: GlobalContextState): Promise<any> => {
  const ai = getAiClient();
  const { mimeType, data } = processBase64Image(base64Image);
  const prompt = PromptEngine.injectContext(`${PromptEngine.getToolSystemInstruction()} Analyze visual. Return JSON: {analysis, captions:[{category, options[]}], hashtags[]}`, context);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ inlineData: { mimeType, data } }, { text: prompt }] },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const sendChatMessage = async (history: any[], newMessage: string, personaPrompt?: string, imageAttachment?: string, globalContext?: GlobalContextState) => {
    const ai = getAiClient();
    
    // Choose specific instruction set
    const systemPrompt = PromptEngine.getChatSystemInstruction(personaPrompt) + 
                         (globalContext?.activeAnalysis ? `\n[CONTEXT]: User is looking at an image analyzed as: ${JSON.stringify(globalContext.activeAnalysis).slice(0,300)}` : '');

    // Use standard Flash model for best reliability with chat sessions
    const model = 'gemini-2.5-flash';

    const chatSession = ai.chats.create({ 
        model: model, 
        history: history, 
        config: { systemInstruction: systemPrompt } 
    });

    try {
        let result;
        if (imageAttachment) {
            const { mimeType, data } = processBase64Image(imageAttachment);
            const messageParts = [
                { inlineData: { mimeType, data } }, 
                { text: newMessage || "Analyze this." }
            ];
            // Fix: Wrap in { message: { parts: ... } } for ContentUnion compliance
            result = await chatSession.sendMessage({ message: { parts: messageParts } });
        } else if (globalContext?.activeImage && !history.length) {
            // First message context injection
            const { mimeType, data } = processBase64Image(globalContext.activeImage);
            const messageParts = [
                { inlineData: { mimeType, data } }, 
                { text: `[Context Image attached] ${newMessage}` }
            ];
            // Fix: Wrap in { message: { parts: ... } }
            result = await chatSession.sendMessage({ message: { parts: messageParts } });
        } else {
            // Text only - Wrap in { message: ... }
            result = await chatSession.sendMessage({ message: newMessage });
        }
        
        return result.text;
    } catch (e: any) {
        console.error("Chat Error Details:", e);
        return "I'm having trouble connecting right now. Try refreshing.";
    }
}

export const editImageWithPrompt = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAiClient();
  const { mimeType, data } = processBase64Image(base64Image);
  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image', 
          contents: { parts: [{ inlineData: { data, mimeType } }, { text: prompt }] },
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
      throw new Error("No image returned");
  } catch(e: any) {
      // Fallback for permissions
      if (e.message?.includes('403')) throw new Error("Permission Denied: Billing required for Image Edit.");
      throw e;
  }
};

export const generateImageFromPrompt = async (prompt: string, size: ImageSize): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { imageSize: size as any, aspectRatio: "1:1" } },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Pro Gen Failed");
  } catch (error) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } },
        });
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
        throw new Error("Fallback Failed");
    } catch(e) { throw new Error("Image Generation Failed. Check API Key permissions."); }
  }
};

export const analyzeMoodboard = async (images: string[]) => {
    const ai = getAiClient();
    const { mimeType, data } = processBase64Image(images[0]);
    const prompt = `${PromptEngine.getToolSystemInstruction()} Analyze aesthetics. JSON Output: {theme, keywords[], colors[], caption}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ inlineData: { mimeType, data } }, { text: prompt }] },
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
}

export const rewriteCaption = async (text: string, tone: string = 'engaging'): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Rewrite this caption to be more ${tone}: "${text}"`,
    });
    return response.text || text;
};

export const getSoccerPredictions = async () => {
    const ai = getAiClient();
    const prompt = `${PromptEngine.getToolSystemInstruction()} Analyze top 5 soccer matches today. JSON Array: [{id, league, homeTeam, awayTeam, time, probabilities:{home,draw,away}, metrics:{over2_5,btts}, confidenceScore, analysis}]. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return cleanAndParseJSON(response.text || "[]");
};

export const generateSmartNote = async (text: string, mode: string, extra?: string) => {
    const ai = getAiClient();
    let prompt = "";
    const style = PromptEngine.getToolSystemInstruction();
    if (mode === 'summarize') prompt = `${style} Summarize: "${text}"`;
    else if (mode === 'rewrite') prompt = `${style} Rewrite (Tone: ${extra}): "${text}"`;
    else if (mode === 'expand') prompt = `${style} Expand: "${text}"`;
    else if (mode === 'translate') prompt = `${style} Translate to ${extra}: "${text}"`;
    
    // Use Pro with Thinking for complex expansion/reasoning
    if (mode === 'expand') {
        try {
            const response = await ai.models.generateContent({ 
                model: 'gemini-3-pro-preview', 
                contents: prompt,
                config: { thinkingConfig: { thinkingBudget: 16000 } } 
            });
            return response.text || "";
        } catch(e) {} // Fallback to flash if pro/thinking fails
    }

    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text || "";
};

export const generateSocialContent = async (topic: string, type: string, context?: string) => {
    const ai = getAiClient();
    let prompt = "";
    if (type === 'hashtag') prompt = `30 hashtags for: "${topic}". Space separated.`;
    else if (type === 'idea') prompt = `3 viral ideas for "${topic}". Markdown.`;
    else if (type === 'reply') prompt = `3 replies to "${context}". Separated by ||.`;
    else if (type === 'timing') prompt = `Best posting times for "${topic}". Markdown.`;
    else if (type === 'bio') prompt = `Generate a professional yet creative social media bio for: "${topic}". Include emojis. Max 150 chars. Return only the bio.`;
    
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-lite', contents: prompt });
    return response.text || "";
};

export const getLiveMatchDetails = async () => {
     const ai = getAiClient();
     const prompt = `Live/Recent soccer matches. JSON: [{status, league, home, away, score, commentary(string), events}]. Google Search.`;
     const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ googleSearch: {} }] } });
    return cleanAndParseJSON(response.text || "[]");
};

export const analyzePlayerPerformance = async (player: string) => {
    const ai = getAiClient();
    const prompt = `Analyze player ${player}. JSON: {name, team, position, impactScore(0-10), availability, form, stats:{goals,assists,mins}, analysis:{strengths[], style}}. Google Search.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ googleSearch: {} }] } });
    return cleanAndParseJSON(response.text || "{}");
};

export const getFantasyTips = async () => {
    const ai = getAiClient();
    const prompt = `FPL tips next gameweek. JSON: {gameweek, captain:{name,reason}, topPicks:[{name,team,expectedPoints}], valuePicks:[{name,cost,valueRating}], differentials:[{name,ownership,riskLevel}]}. Google Search.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ googleSearch: {} }] } });
    return cleanAndParseJSON(response.text || "{}");
};

export const getYesterdayAccuracy = async () => {
    const ai = getAiClient();
    const prompt = `Review yesterday's soccer predictions. JSON: [{match, prediction, result, accuracyScore, reasoning}]. Google Search.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { tools: [{ googleSearch: {} }] } });
    return cleanAndParseJSON(response.text || "[]");
};

export const getLeagueData = async (league: string) => {
    const ai = getAiClient();
    const prompt = `${PromptEngine.getToolSystemInstruction()} 
    Fetch the current top 15 standings and upcoming 5 fixtures for ${league}.
    Use Google Search for real-time data.
    JSON Output: 
    { 
      "standings": [
        { "rank": 1, "team": "Team Name", "played": 10, "points": 25, "gd": "+15", "form": "W D W W L" }
      ], 
      "fixtures": [
        { "home": "Team A", "away": "Team B", "date": "Oct 24", "time": "15:00" }
      ] 
    }`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return cleanAndParseJSON(response.text || "{}");
};

// --- GEN Z FEATURES ---

export const analyzeAura = async (base64Image: string) => {
    const ai = getAiClient();
    const { mimeType, data } = processBase64Image(base64Image);
    const prompt = `
      Analyze the vibe/aura of this person.
      Return JSON:
      {
        "color": "Hex Code (e.g. #FF00FF)",
        "archetype": "Gen Z Archetype (e.g. Y2K Princess, Gym Rat, Cottagecore)",
        "reading": "A short, mystical but slang-heavy vibe check reading.",
        "song": "A song that matches this vibe (Artist - Title)"
      }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ inlineData: { mimeType, data } }, { text: prompt }] },
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const generateRizz = async (context: string, tone: string) => {
    const ai = getAiClient();
    const prompt = `
      You are a Rizz God. Generate 3 replies to this text: "${context}".
      Tone: ${tone} (e.g. Flirty, Unhinged, Nonchalant).
      Return JSON Array of strings. Use Gen Z slang (no cap, bet, fr).
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "[]");
};

export const rateAesthetic = async (base64Image: string) => {
    const ai = getAiClient();
    const { mimeType, data } = processBase64Image(base64Image);
    const prompt = `
      Rate the 'Fit Check' / Aesthetic of this photo out of 10.
      Be playful. If it's bad, roast them lightly. If it's good, hype them up using slang.
      Return JSON: { "rating": number, "verdict": "string", "advice": "string" }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ inlineData: { mimeType, data } }, { text: prompt }] },
        config: { responseMimeType: "application/json" }
    });
    return cleanAndParseJSON(response.text || "{}");
};

// --- ENHANCED CRYPTO & FIAT SERVICE ---

export const getCryptoMarketOverview = async () => {
    const ai = getAiClient();
    const prompt = `
      ${PromptEngine.getToolSystemInstruction()}
      Analyze the current crypto market (Top 10 coins by market cap + trending).
      Use Google Search for real-time data.
      Return a JSON ARRAY of objects:
      [
        {
          "symbol": "BTC",
          "name": "Bitcoin",
          "price": "e.g. $65,000",
          "change": "e.g. +2.5%",
          "signal": "BUY/SELL",
          "sentiment": "Bullish/Bearish"
        },
        ...
      ]
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return cleanAndParseJSON(response.text || "[]");
};

export const getCryptoData = async (coin: string) => {
    const ai = getAiClient();
    const prompt = `
      ${PromptEngine.getToolSystemInstruction()}
      Perform a deep technical analysis for ${coin}.
      Use Google Search for real-time charts and data.
      JSON Output:
      {
        "price": "current price",
        "change": "24h % change",
        "marketCap": "market cap",
        "volume": "24h volume",
        "signal": "STRONG BUY / BUY / NEUTRAL / SELL / STRONG SELL",
        "technical": {
           "rsi": "value",
           "macd": "sentiment",
           "support": "price level",
           "resistance": "price level"
        },
        "analysis": "Brief trader-focused summary."
      }
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const getCurrencyData = async (amount: string, from: string, to: string) => {
    const ai = getAiClient();
    const prompt = `${PromptEngine.getToolSystemInstruction()} Convert ${amount} ${from} to ${to} using real-time rates. JSON Output: {result (e.g. "KES 10,000"), rate (e.g. "1 USD = 130 KES")}. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return cleanAndParseJSON(response.text || "{}");
};
