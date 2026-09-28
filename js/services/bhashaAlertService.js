/**
 * BhashaAlert Service - Multilingual Emergency Communication & Translation
 * Supports English, Tamil, Malayalam, and Hindi.
 * Preserves critical tokens (locations, dates, helplines, metrics) and provides
 * Web Speech API text-to-speech audio broadcasting.
 */

class BhashaAlertService {
    constructor() {
        this.sampleAlerts = typeof SAMPLE_MULTILINGUAL_ALERTS !== 'undefined' ? SAMPLE_MULTILINGUAL_ALERTS : [];
        this.languages = [
            { code: "en", name: "English", nativeName: "English", speechLocale: "en-IN" },
            { code: "ta", name: "Tamil", nativeName: "தமிழ்", speechLocale: "ta-IN" },
            { code: "ml", name: "Malayalam", nativeName: "മലയാളം", speechLocale: "ml-IN" },
            { code: "hi", name: "Hindi", nativeName: "हिंदी", speechLocale: "hi-IN" }
        ];

        // Core Tactical Disaster Terminology Matrix
        this.glossary = {
            "evacuation": { ta: "வெளியேற்றம்", ml: "ഒഴിപ്പിക്കൽ", hi: "निकासी" },
            "evacuate immediately": { ta: "உடனடியாக வெளியேறவும்", ml: "ഉടൻ തന്നെ ഒഴിയുക", hi: "तुरंत बाहर निकलें" },
            "flash flood": { ta: "திடீர் வெள்ளம்", ml: "മിന്നൽ പ്രളയം", hi: "अचानक बाढ़" },
            "flood": { ta: "வெள்ளம்", ml: "വെള്ളപ്പൊക്കം", hi: "बाढ़" },
            "cyclone": { ta: "புயல்", ml: "ചുഴലിക്കാറ്റ്", hi: "चक्रवात" },
            "earthquake": { ta: "நிலநடுக்கம்", ml: "ഭൂകമ്പം", hi: "भूकंप" },
            "relief camp": { ta: "நிவாரண முகாம்", ml: "ദുരിതാശ്വാസ ക്യാമ്പ്", hi: "राहत शिविर" },
            "clean drinking water": { ta: "சுத்தமான குடிநீர்", ml: "ശുദ്ധമായ കുടിവെള്ളം", hi: "स्वच्छ पेयजल" },
            "emergency medicine": { ta: "அவசர மருந்துகள்", ml: "അടിയന്തിര മരുന്നുകൾ", hi: "आपातकालीन दवाएं" },
            "food and rations": { ta: "உணவு மற்றும் ரேஷன் பொருட்கள்", ml: "ഭക്ഷണവും റേഷനും", hi: "भोजन और राशन" },
            "helpline": { ta: "உதவி எண்", ml: "ഹെൽപ്പ് ലൈൻ", hi: "हेल्पलाइन" },
            "warning": { ta: "எச்சரிக்கை", ml: "മുന്നറിയിപ്പ്", hi: "चेतावनी" },
            "danger": { ta: "ஆபத்து", ml: "അപകടം", hi: "खतरा" },
            "safe": { ta: "பாதுகாப்பானது", ml: "സുരക്ഷിതം", hi: "सुरक्षित" },
            "rescue boat": { ta: "மீட்பு படகு", ml: "റെസ്ക്യൂ ബോട്ട്", hi: "बचाव नौका" },
            "doctors on site": { ta: "மருத்துவர்கள் பணியில் உள்ளனர்", ml: "ഡോക്ടർമാർ ക്യാമ്പിൽ ഉണ്ട്", hi: "चिकित्सक मौके पर उपलब्ध हैं" },
            "stay indoors": { ta: "வீடுகளுக்குள் இருக்கவும்", ml: "വീടുകളിൽ തന്നെ തുടരുക", hi: "घरों के अंदर रहें" },
            "severe": { ta: "தீவிர", ml: "തീവ്ര", hi: "गंभीर" },
            "water level rising": { ta: "நீர் மட்டம் உயர்கிறது", ml: "ജലനിരപ്പ് ഉയരുന്നു", hi: "जलस्तर बढ़ रहा है" }
        };

        this.currentUtterance = null;
        this.isSpeaking = false;
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => {
                try { cb(data); } catch(e) { console.error("BhashaAlert event error:", e); }
            });
        }
    }

    getLanguages() {
        return [...this.languages];
    }

    getSampleAlerts() {
        return [...this.sampleAlerts];
    }

    extractEntities(text) {
        // Preserves phone numbers, coordinates, distances, and sector IDs
        const helplines = text.match(/\b(?:\+91[-\s]?)?[6789]\d{9}\b|\b112\b|\b1070\b|\b1077\b|\b108\b|\b101\b/g) || [];
        const measurements = text.match(/\b\d+(?:\.\d+)?\s*(?:ft|feet|km\/h|cusecs|mm|meters?|hours?|mins?)\b/gi) || [];
        const sectors = text.match(/\bSector\s*\d+\b|\bZone\s*[A-Z]\b|\b[A-Z][a-z]+(?:puram|cheri|pattinam|nagar|colony|enclave)\b/gi) || [];

        return {
            helplines: Array.from(new Set(helplines)),
            measurements: Array.from(new Set(measurements)),
            sectors: Array.from(new Set(sectors))
        };
    }

    translate(text, targetLang = "ta") {
        if (!text || !text.trim()) {
            return {
                originalText: "",
                translatedText: "",
                targetLang,
                entities: { helplines: [], measurements: [], sectors: [] }
            };
        }

        const clean = text.trim();
        const entities = this.extractEntities(clean);

        // Check if matching sample exists
        const matchedSample = this.sampleAlerts.find(s => 
            s.english.toLowerCase().substring(0, 35) === clean.toLowerCase().substring(0, 35)
        );

        if (matchedSample) {
            let outputText = matchedSample.english;
            if (targetLang === "ta") outputText = matchedSample.tamil;
            else if (targetLang === "ml") outputText = matchedSample.malayalam;
            else if (targetLang === "hi") outputText = matchedSample.hindi;

            return {
                originalText: clean,
                translatedText: outputText,
                targetLang,
                entities,
                isPrecompiled: true
            };
        }

        // Domain-specific rule-based translation preserving entities
        let translated = clean;
        const sortedPhrases = Object.keys(this.glossary).sort((a, b) => b.length - a.length);

        sortedPhrases.forEach(phrase => {
            const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
            if (this.glossary[phrase][targetLang]) {
                translated = translated.replace(regex, this.glossary[phrase][targetLang]);
            }
        });

        // Ensure helplines and phone numbers remain prominently intact
        entities.helplines.forEach(num => {
            if (!translated.includes(num)) {
                translated += ` (Helpline: ${num})`;
            }
        });

        return {
            originalText: clean,
            translatedText: translated,
            targetLang,
            entities,
            isPrecompiled: false
        };
    }

    speak(text, langCode = "en") {
        if (!('speechSynthesis' in window)) {
            console.warn("Speech Synthesis is not supported in this browser environment.");
            return false;
        }

        window.speechSynthesis.cancel();

        const langObj = this.languages.find(l => l.code === langCode) || this.languages[0];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langObj.speechLocale;
        utterance.rate = 0.95; // Slightly slower for emergency clarity
        utterance.pitch = 1.0;

        // Try to pick matching voice
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(langObj.code) || v.lang.replace('_', '-').startsWith(langObj.code));
        if (voice) {
            utterance.voice = voice;
        }

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.emit('speech-start', { lang: langCode, text });
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.emit('speech-end', { lang: langCode });
        };

        utterance.onerror = (e) => {
            this.isSpeaking = false;
            this.emit('speech-error', e);
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
        return true;
    }

    stopSpeaking() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            this.isSpeaking = false;
            this.emit('speech-end', {});
        }
    }
}

const bhashaAlertService = new BhashaAlertService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BhashaAlertService, bhashaAlertService };
}
