
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

    // Clean text: remove markdown, brackets, emojis for smoother speech
    const cleanText = text
        .replace(/[*_`#]/g, '') 
        .replace(/\[.*?\]/g, '')
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
