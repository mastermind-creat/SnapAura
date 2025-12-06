
import { GoogleGenAI, Type } from "@google/genai";
import { ImageSize, GlobalContextState } from "../types";

// --- CONFIGURATION ---
const FALLBACK_KEYS = ["YOUR_API_KEY_HERE"];

// --- PROMPT ENGINE ---
class PromptEngine {
  static getBaseSystemInstruction(persona?: string): string {
    return `
      CRITICAL INSTRUCTION PROTOCOL:
      1. **ZERO FLUFF**: Do not use greetings ("Hello", "Here is").
      2. **DIRECT OUTPUT**: Start immediately with the result.
      3. **STRUCTURE**: Use clean Markdown. Bold key metrics.
      4. **CONTEXT AWARE**: You are part of the SnapAura OS.
      5. **PERSONA**: ${persona || "You are an expert AI engine specialized in high-precision analysis."}
    `;
  }

  static injectContext(prompt: string, context?: GlobalContextState): string {
    let contextString = "";
    if (context) {
      if (context.userProfile) {
        contextString += `\n[User Context: Name=${context.userProfile.name}]`;
      }
      if (context.activeAnalysis) {
        contextString += `\n[Active Content Context: ${JSON.stringify(context.activeAnalysis).slice(0, 200)}...]`;
      }
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
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {}
  return FALLBACK_KEYS[0];
};

const getAiClient = () => new GoogleGenAI({ apiKey: getApiKey() });

// --- UTILITIES ---
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: 'ping' }] },
        });
        return true;
    } catch (error) {
        return false;
    }
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
  } catch (e) {
    if (text.trim().startsWith('[')) return [];
    return {};
  }
};

// --- CORE AI FUNCTIONS ---

export const analyzeImageAndGenerateCaptions = async (base64Image: string, context?: GlobalContextState): Promise<any> => {
  const ai = getAiClient();
  const { mimeType, data } = processBase64Image(base64Image);
  const prompt = PromptEngine.injectContext(`Analyze visual. Return JSON: {analysis, captions:[{category, options[]}], hashtags[]}`, context);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ inlineData: { mimeType, data } }, { text: prompt }] },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const sendChatMessage = async (history: any[], newMessage: string, personaPrompt?: string, imageAttachment?: string, globalContext?: GlobalContextState) => {
    const ai = getAiClient();
    const systemPrompt = `${PromptEngine.getBaseSystemInstruction(personaPrompt)} ${globalContext?.activeAnalysis ? `CONTEXT: ${JSON.stringify(globalContext.activeAnalysis)}` : ''}`;
    const chatSession = ai.chats.create({ model: 'gemini-2.5-flash-lite', history, config: { systemInstruction: systemPrompt } });

    let messageParts: any[] = [{ text: newMessage }];
    if (imageAttachment) {
        const { mimeType, data } = processBase64Image(imageAttachment);
        messageParts = [{ inlineData: { mimeType, data } }, { text: newMessage || "Analyze." }];
    } else if (globalContext?.activeImage && !history.length) {
        const { mimeType, data } = processBase64Image(globalContext.activeImage);
        messageParts = [{ inlineData: { mimeType, data } }, { text: `[Context] ${newMessage}` }];
    }

    try {
        const result = await chatSession.sendMessage({ message: { parts: messageParts } });
        return result.text;
    } catch (e) {
        return "Service unavailable.";
    }
}

export const editImageWithPrompt = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAiClient();
  const { mimeType, data } = processBase64Image(base64Image);
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: { parts: [{ inlineData: { data, mimeType } }, { text: prompt }] },
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("No image returned");
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
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw error;
  }
};

export const analyzeMoodboard = async (images: string[]) => {
    const ai = getAiClient();
    const { mimeType, data } = processBase64Image(images[0]);
    const prompt = `Analyze aesthetics. JSON Output: {theme, keywords[], colors[], caption}`;
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
    const prompt = `Analyze major soccer matches today. JSON Array: [{id, league, homeTeam, awayTeam, time, probabilities:{home,draw,away}, metrics:{over2_5,btts}, confidenceScore, analysis}]. Use Google Search.`;
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
    if (mode === 'summarize') prompt = `Summarize: "${text}"`;
    else if (mode === 'rewrite') prompt = `Rewrite (Tone: ${extra}): "${text}"`;
    else if (mode === 'expand') prompt = `Expand: "${text}"`;
    else if (mode === 'translate') prompt = `Translate to ${extra}: "${text}"`;
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
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
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

export const getCryptoData = async (coin: string) => {
    const ai = getAiClient();
    const prompt = `Analyze current market data for ${coin}. JSON Output: {price, change (e.g. +5%), signal (BUY/SELL/HOLD), analysis}. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return cleanAndParseJSON(response.text || "{}");
};

export const getCurrencyData = async (amount: string, from: string, to: string) => {
    const ai = getAiClient();
    const prompt = `Convert ${amount} ${from} to ${to} using real-time rates. JSON Output: {result (e.g. "KES 10,000"), rate (e.g. "1 USD = 130 KES")}. Use Google Search.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
    });
    return cleanAndParseJSON(response.text || "{}");
};
