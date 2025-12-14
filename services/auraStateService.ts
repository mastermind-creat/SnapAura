
import { GoogleGenAI } from "@google/genai";

// --- STORAGE MANAGER ---
const KEYS = {
    CURRENT: 'snapaura:auraState:current',
    HISTORY: 'snapaura:auraState:history',
    CACHE: 'snapaura:auraState:cache',
    SETTINGS: 'snapaura:auraState:settings'
};

const getStorage = (key: string) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) { return null; }
};

const setStorage = (key: string, data: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) { console.error("Storage Full"); }
};

// Simple Cache with TTL (15 mins)
const CACHE_TTL = 15 * 60 * 1000; 

const checkCache = (id: string) => {
    const cache = getStorage(KEYS.CACHE) || {};
    if (cache[id] && Date.now() - cache[id].timestamp < CACHE_TTL) {
        return cache[id].data;
    }
    return null;
};

const updateCache = (id: string, data: any) => {
    const cache = getStorage(KEYS.CACHE) || {};
    cache[id] = { timestamp: Date.now(), data };
    setStorage(KEYS.CACHE, cache);
};

// --- CLIENT MANAGEMENT (Gemini) ---
const getApiKey = (): string => {
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    if (localKey && localKey.trim() !== "") return localKey;
  }
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) return process.env.API_KEY;
  } catch (e) {}
  return "YOUR_API_KEY_HERE";
};

// --- DATA FETCHERS ---

// 1. Markets (CoinGecko - Free)
const fetchMarkets = async () => {
    const cached = checkCache('markets');
    if (cached) return cached;

    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        
        // Calculate volatility score (Average absolute change)
        const btcChange = Math.abs(data.bitcoin.usd_24h_change);
        const ethChange = Math.abs(data.ethereum.usd_24h_change);
        const avgChange = (btcChange + ethChange) / 2;
        
        // Normalize: >5% is high stress (100), 0% is calm (0)
        let stress = Math.min((avgChange / 5) * 100, 100);
        
        const result = { stress, label: avgChange > 0 ? "Volatile" : "Stable", raw: { btc: data.bitcoin.usd_24h_change, eth: data.ethereum.usd_24h_change } };
        updateCache('markets', result);
        return result;
    } catch (e) {
        return { stress: 20, label: "Unknown", raw: {} };
    }
};

// 2. Weather (OpenMeteo - Free)
const fetchWeather = async () => {
    const cached = checkCache('weather');
    if (cached) return cached;

    try {
        // Defaults to London if no geo (simplify for MVP)
        const lat = 51.5074;
        const lon = -0.1278;
        
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m`);
        const data = await res.json();
        
        const code = data.current.weather_code;
        const wind = data.current.wind_speed_10m;
        
        // WMO Codes: 0=Clear, >60=Rain, >95=Thunderstorm
        let stress = 0;
        if (code > 90) stress = 90; // Thunderstorm
        else if (code > 60) stress = 60; // Rain
        else if (code > 50) stress = 40; // Drizzle
        else if (code > 3) stress = 20; // Cloudy
        
        // Add wind factor (>30kmh adds stress)
        if (wind > 30) stress += 20;

        const result = { stress: Math.min(stress, 100), temp: data.current.temperature_2m, condition: code };
        updateCache('weather', result);
        return result;
    } catch (e) {
        return { stress: 10, temp: 20, condition: 0 };
    }
};

// 3. News & Space (Gemini Search Grounding)
const fetchIntelligence = async () => {
    const cached = checkCache('intelligence');
    if (cached) return cached;

    const apiKey = getApiKey();
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") return { newsStress: 50, spaceStress: 10, summary: "API Key Missing" };

    try {
        const ai = new GoogleGenAI({ apiKey });
        const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash', tools: [{ googleSearch: {} }] });
        
        const prompt = `
            Analyze current global news headlines and space weather (solar flares, asteroids). 
            Return a JSON object:
            {
                "newsSentiment": number (0-100, where 100 is extremely chaotic/negative/stressful, 0 is peaceful),
                "spaceActivity": number (0-100, where 100 is high solar flares/danger, 0 is calm),
                "topHeadlines": ["headline 1", "headline 2"],
                "briefSummary": "1 sentence summary of world mood."
            }
        `;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        // Extract JSON
        const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || "{}";
        const data = JSON.parse(jsonStr);
        
        const output = {
            newsStress: data.newsSentiment || 50,
            spaceStress: data.spaceActivity || 10,
            summary: data.briefSummary || "World is turning.",
            headlines: data.topHeadlines || []
        };
        
        updateCache('intelligence', output);
        return output;
    } catch (e) {
        return { newsStress: 50, spaceStress: 10, summary: "AI Analysis Unavailable", headlines: [] };
    }
};

// --- MOOD ENGINE ---
export const calculateAuraState = async () => {
    // Check if we have a fresh calculation recently (prevent spam)
    const current = getStorage(KEYS.CURRENT);
    if (current && Date.now() - current.timestamp < 5 * 60 * 1000) {
        return current;
    }

    const [market, weather, intel] = await Promise.all([
        fetchMarkets(),
        fetchWeather(),
        fetchIntelligence()
    ]);

    // Weights: News 40%, Market 20%, Weather 20%, Space 20%
    const score = Math.round(
        (intel.newsStress * 0.4) +
        (market.stress * 0.2) +
        (weather.stress * 0.2) +
        (intel.spaceStress * 0.2)
    );

    let label = "Neutral";
    if (score <= 20) label = "Calm";
    else if (score <= 40) label = "Stable";
    else if (score <= 60) label = "Tense";
    else if (score <= 80) label = "Chaotic";
    else label = "Crisis";

    const state = {
        score,
        label,
        timestamp: Date.now(),
        breakdown: {
            market,
            weather,
            intel
        }
    };

    setStorage(KEYS.CURRENT, state);
    
    // Update History
    const history = getStorage(KEYS.HISTORY) || [];
    const newHistory = [state, ...history].slice(0, 30); // Keep last 30
    setStorage(KEYS.HISTORY, newHistory);

    return state;
};

export const getAuraHistory = () => {
    return getStorage(KEYS.HISTORY) || [];
};
