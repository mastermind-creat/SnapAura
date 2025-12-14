
export const TTS_VOICES = [
    { id: 'Kimberly', name: 'Kimberly (US Female)', lang: 'en-US' },
    { id: 'Salli', name: 'Salli (US Female)', lang: 'en-US' },
    { id: 'Joey', name: 'Joey (US Male)', lang: 'en-US' },
    { id: 'Matthew', name: 'Matthew (US Male)', lang: 'en-US' },
    { id: 'Amy', name: 'Amy (UK Female)', lang: 'en-GB' },
    { id: 'Brian', name: 'Brian (UK Male)', lang: 'en-GB' },
    { id: 'Hans', name: 'Hans (German)', lang: 'de-DE' },
];

let currentAudio: HTMLAudioElement | null = null;

// Common Internet Slang to Natural Speech Map
const SLANG_MAP: Record<string, string> = {
    "omg": "oh my god",
    "lol": "laughing out loud",
    "lmao": "laughing my ass off",
    "lmfao": "laughing my freaking ass off",
    "rofl": "rolling on the floor laughing",
    "brb": "be right back",
    "btw": "by the way",
    "idk": "I don't know",
    "tbh": "to be honest",
    "imho": "in my humble opinion",
    "imo": "in my opinion",
    "fr": "for real",
    "rn": "right now",
    "wbu": "what about you",
    "hbu": "how about you",
    "tbf": "to be fair",
    "ngl": "not gonna lie",
    "atm": "at the moment",
    "irl": "in real life",
    "jk": "just kidding",
    "nvm": "never mind",
    "bc": "because",
    "msg": "message",
    "plz": "please",
    "pls": "please",
    "thx": "thanks",
    "ty": "thank you",
    "gr8": "great",
    "ur": "your",
    "u": "you",
    "r": "are",
    "iykyk": "if you know you know",
    "fyi": "for your information",
    "asap": "as soon as possible",
    "dm": "direct message",
    "pov": "point of view"
};

export const stopTTS = () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (currentAudio.src.startsWith('blob:')) {
            URL.revokeObjectURL(currentAudio.src);
        }
        currentAudio = null;
    }
    window.speechSynthesis.cancel();
};

export const playTTS = async (text: string, voiceId: string = 'Kimberly'): Promise<void> => {
    stopTTS(); // Stop any active playback

    let processedText = text;

    // 1. Expand Slang/Abbreviations
    // We iterate through the map and replace occurrences using Regex with word boundaries (\b)
    // so we don't accidentally replace parts of words (e.g. "turn" won't trigger "ur")
    Object.entries(SLANG_MAP).forEach(([slang, expansion]) => {
        const regex = new RegExp(`\\b${slang}\\b`, 'gi'); // 'gi' = global, case-insensitive
        processedText = processedText.replace(regex, expansion);
    });

    // 2. Advanced Text Cleaning for Human-like Speech
    let cleanText = processedText
        // Remove Markdown links [text](url) -> text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove raw URLs
        .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
        // Remove Markdown formatting characters (*, _, `, ~, #, >, -)
        .replace(/[*_`~#>]/g, '')
        // Remove block context like [Replying to...] or [Image attached]
        .replace(/\[.*?\]/g, '')
        // Remove Emojis (Modern Unicode Property Escape)
        .replace(/\p{Extended_Pictographic}/gu, '')
        // Remove specific symbols often used in bot responses that shouldn't be read
        .replace(/[|]/g, '') 
        // Collapse whitespace
        .replace(/\s+/g, ' ')
        .trim();
        
    if (!cleanText) return;

    // --- STRATEGY 1: StreamElements API ---
    // Best for specific voice support (Kimberly, Salli, etc.)
    try {
        const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voiceId)}&text=${encodeURIComponent(cleanText)}`;
        const response = await fetch(url);
        
        if (response.ok && response.headers.get('content-type')?.includes('audio')) {
            const blob = await response.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);
            currentAudio = audio;
            
            await audio.play();
            audio.onended = () => {
                 if(currentAudio === audio) currentAudio = null;
                 URL.revokeObjectURL(audioUrl);
            };
            return; // Success
        }
    } catch (e) {
        console.warn("StreamElements TTS failed, attempting fallback...", e);
    }

    // --- STRATEGY 2: Keith API (User Provided) ---
    // Robust fallback useful if StreamElements is blocked or fails
    try {
        const url = `https://apiskeith.vercel.app/ai/text2speech?q=${encodeURIComponent(cleanText)}`;
        const response = await fetch(url);
        if (response.ok) {
             const data = await response.json();
             // Check for result.URL as per provided snippet structure
             const audioUrl = data?.result?.URL || data?.URL; 
             
             if (audioUrl) {
                const audio = new Audio(audioUrl);
                currentAudio = audio;
                await audio.play();
                audio.onended = () => { if(currentAudio === audio) currentAudio = null; };
                return; // Success
             }
        }
    } catch (e) {
        console.warn("Keith API TTS failed, defaulting to system...", e);
    }

    // --- STRATEGY 3: System SpeechSynthesis ---
    // Offline/Browser Native Fallback
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const sysVoices = window.speechSynthesis.getVoices();
    
    // Attempt to map requested voice ID to a system voice
    const preferredParams = TTS_VOICES.find(v => v.id === voiceId);
    let match = null;
    
    if (preferredParams) {
        // 1. Exact name match
        match = sysVoices.find(v => v.name.includes(preferredParams.id));
        // 2. Locale match
        if (!match) match = sysVoices.find(v => v.lang === preferredParams.lang);
    }
    
    if (match) utterance.voice = match;
    utterance.rate = 1.0;
    
    window.speechSynthesis.speak(utterance);
};
