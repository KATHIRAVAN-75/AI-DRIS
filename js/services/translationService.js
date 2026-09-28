/**
 * TranslationService - Multilingual SOS Translation Engine
 * Provides authentic, real-time translation into English for disaster relief communications.
 * Supports Malayalam, Tamil, Hindi, English, and other regional languages.
 * Primary Provider: Google Translate GTX Engine (gtx)
 * Secondary Fallback: MyMemory Translation API
 * Environment Config: Supports custom TRANSLATION_API_KEY and TRANSLATION_API_URL
 *
 * NOTE: Kannada is strictly excluded from interface options per system constraints.
 */

class TranslationService {
    constructor() {
        this.cache = new Map();
        this.inFlight = new Map();
        this.languages = [
            { code: "auto", name: "Auto-Detect Language", nativeName: "Auto" },
            { code: "ml", name: "Malayalam", nativeName: "മലയാളം", scriptRegex: /[\u0D00-\u0D7F]/ },
            { code: "ta", name: "Tamil", nativeName: "தமிழ்", scriptRegex: /[\u0B80-\u0BFF]/ },
            { code: "hi", name: "Hindi", nativeName: "हिंदी", scriptRegex: /[\u0900-\u097F]/ },
            { code: "en", name: "English", nativeName: "English", scriptRegex: /^[A-Za-z0-9\s.,!?'"()#@\-:;%/+]+$/ }
        ];

        this.languageNames = {
            "ml": "Malayalam",
            "ta": "Tamil",
            "hi": "Hindi",
            "en": "English",
            "te": "Telugu",
            "bn": "Bengali",
            "mr": "Marathi",
            "gu": "Gujarati",
            "ur": "Urdu",
            "pa": "Punjabi",
            "or": "Odia"
        };
    }

    /**
     * Fast script-based client detection
     */
    detectScriptLanguage(text) {
        if (!text || !text.trim()) return "en";
        const trimmed = text.trim();

        if (/[\u0D00-\u0D7F]/.test(trimmed)) return "ml"; // Malayalam
        if (/[\u0B80-\u0BFF]/.test(trimmed)) return "ta"; // Tamil
        if (/[\u0900-\u097F]/.test(trimmed)) return "hi"; // Hindi / Devanagari
        if (/^[A-Za-z0-9\s.,!?'"()#@\-:;%/+]+$/.test(trimmed)) return "en";

        return "auto";
    }

    detectScript(text) {
        return this.detectScriptLanguage(text);
    }

    getLanguageName(code) {
        if (!code) return "Unknown";
        const clean = code.toLowerCase().trim();
        return this.languageNames[clean] || clean.toUpperCase();
    }

    getSelectableLanguages() {
        // Returns list of supported languages (strictly excludes Kannada)
        return this.languages.map(l => ({ code: l.code, name: l.name, nativeName: l.nativeName }));
    }

    getSupportedLanguages() {
        return this.getSelectableLanguages();
    }

    /**
     * Primary Translation Method
     * Translates any regional text to English
     */
    async translateToEnglish(text, sourceLang = "auto") {
        if (!text || !text.trim()) {
            return {
                originalText: "",
                translatedText: "",
                sourceLanguage: "en",
                detectedLanguage: "English",
                status: "TRANSLATED",
                provider: "Identity"
            };
        }

        const cleanText = text.trim();
        const scriptHint = sourceLang && sourceLang !== "auto" ? sourceLang : this.detectScriptLanguage(cleanText);

        // Check if already English
        if (scriptHint === "en" && /^[A-Za-z0-9\s.,!?'"()#@\-:;%/+]+$/.test(cleanText)) {
            return {
                originalText: cleanText,
                translatedText: cleanText,
                sourceLanguage: "en",
                detectedLanguage: "English",
                status: "TRANSLATED",
                provider: "Native English (No Translation Required)"
            };
        }

        // Cache key
        const cacheKey = `${scriptHint}:${cleanText}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Avoid duplicate concurrent calls for same string
        if (this.inFlight.has(cacheKey)) {
            return await this.inFlight.get(cacheKey);
        }

        const promise = this._executeTranslation(cleanText, scriptHint);
        this.inFlight.set(cacheKey, promise);

        try {
            const result = await promise;
            this.cache.set(cacheKey, result);
            return result;
        } finally {
            this.inFlight.delete(cacheKey);
        }
    }

    async _executeTranslation(text, sourceLang) {
        // Attempt 1: Call backend API endpoint if reachable
        try {
            const backendRes = await this._callBackendApi(text, sourceLang);
            if (backendRes && backendRes.success && backendRes.translatedText) {
                return {
                    originalText: text,
                    translatedText: backendRes.translatedText,
                    sourceLanguage: backendRes.sourceLanguage || sourceLang,
                    detectedLanguage: this.getLanguageName(backendRes.sourceLanguage || sourceLang),
                    status: "TRANSLATED",
                    provider: backendRes.provider || "Google Translate Engine"
                };
            }
        } catch (e) {
            // Fall through to direct browser fetch
        }

        // Attempt 2: Direct Google Translate GTX endpoint
        try {
            const gtxRes = await this._fetchGtx(text, sourceLang);
            if (gtxRes && gtxRes.translatedText) {
                return {
                    originalText: text,
                    translatedText: gtxRes.translatedText,
                    sourceLanguage: gtxRes.sourceLanguage || sourceLang,
                    detectedLanguage: this.getLanguageName(gtxRes.sourceLanguage || sourceLang),
                    status: "TRANSLATED",
                    provider: "Google Translate GTX"
                };
            }
        } catch (errGtx) {
            console.warn("[TranslationService] GTX error:", errGtx.message);
        }

        // Attempt 3: MyMemory API Fallback
        try {
            const myMemoryRes = await this._fetchMyMemory(text, sourceLang);
            if (myMemoryRes && myMemoryRes.translatedText) {
                return {
                    originalText: text,
                    translatedText: myMemoryRes.translatedText,
                    sourceLanguage: myMemoryRes.sourceLanguage || sourceLang,
                    detectedLanguage: this.getLanguageName(myMemoryRes.sourceLanguage || sourceLang),
                    status: "TRANSLATED",
                    provider: "MyMemory API"
                };
            }
        } catch (errMm) {
            console.warn("[TranslationService] MyMemory error:", errMm.message);
        }

        throw new Error("Unable to contact translation services. Check network connection.");
    }

    async _callBackendApi(text, sourceLang) {
        const timeout = 6000;
        const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const id = controller ? setTimeout(() => controller.abort(), timeout) : null;

        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, sourceLang, targetLang: 'en' }),
                signal: controller ? controller.signal : undefined
            });
            if (id) clearTimeout(id);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (e) {
            if (id) clearTimeout(id);
            throw e;
        }
    }

    async _fetchGtx(text, sourceLang = "auto") {
        const sl = sourceLang && sourceLang !== "auto" ? sourceLang : "auto";
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=en&dt=t&q=${encodeURIComponent(text)}`;

        let rawText = "";
        if (typeof fetch !== 'undefined') {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`GTX returned status ${res.status}`);
            rawText = await res.text();
        } else {
            // Node environment
            const https = require('https');
            rawText = await new Promise((resolve, reject) => {
                https.get(url, (res) => {
                    let d = '';
                    res.on('data', chunk => d += chunk);
                    res.on('end', () => resolve(d));
                }).on('error', reject);
            });
        }

        const parsed = JSON.parse(rawText);
        if (!parsed || !parsed[0]) throw new Error("Invalid GTX response format");

        const translatedSegments = parsed[0].map(segment => segment[0]).filter(Boolean);
        const translatedText = translatedSegments.join('').trim();
        const detectedLang = parsed[2] || (parsed[8] && parsed[8][0] && parsed[8][0][0]) || sourceLang || "auto";

        return {
            translatedText,
            sourceLanguage: detectedLang
        };
    }

    async _fetchMyMemory(text, sourceLang = "auto") {
        const sl = sourceLang && sourceLang !== "auto" ? sourceLang : (this.detectScriptLanguage(text) || "hi");
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(sl)}|en`;

        let data = null;
        if (typeof fetch !== 'undefined') {
            const res = await fetch(url);
            data = await res.json();
        } else {
            const https = require('https');
            const raw = await new Promise((resolve, reject) => {
                https.get(url, (res) => {
                    let d = '';
                    res.on('data', chunk => d += chunk);
                    res.on('end', () => resolve(d));
                }).on('error', reject);
            });
            data = JSON.parse(raw);
        }

        if (data && data.responseData && data.responseData.translatedText) {
            return {
                translatedText: data.responseData.translatedText.trim(),
                sourceLanguage: sl
            };
        }
        throw new Error("MyMemory translation empty");
    }
}

const translationService = new TranslationService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TranslationService, translationService };
}
