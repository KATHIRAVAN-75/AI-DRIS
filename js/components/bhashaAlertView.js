/**
 * BhashaAlert View - Multilingual Emergency Translation & Voice Broadcast
 * Supports regional Indian languages: English, Tamil, Malayalam, and Hindi.
 * Side-by-side translation with critical entity preservation and Web Speech TTS audio playback.
 */

class BhashaAlertView {
    constructor() {
        this.selectedLang = "ta"; // default to Tamil for South Indian coastal theater
        this.currentInput = "";
        this.currentTranslation = null;
        this.isSpeaking = false;
    }

    render() {
        const container = document.getElementById('view-bhashaalert');
        if (!container) return;

        // Pre-load default sample if empty
        if (!this.currentInput) {
            const defaultSample = bhashaAlertService.getSampleAlerts()[0];
            if (defaultSample) {
                this.currentInput = defaultSample.english;
                this.currentTranslation = bhashaAlertService.translate(this.currentInput, this.selectedLang);
            }
        }

        const languages = bhashaAlertService.getLanguages();
        const samples = bhashaAlertService.getSampleAlerts();

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-7xl mx-auto">
                <!-- Module Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xl">🌐</span>
                            <h2 class="text-base font-bold font-mono text-white tracking-wider">
                                BHASHAALERT — MULTILINGUAL EMERGENCY COMMUNICATION & TTS
                            </h2>
                            <span class="text-[10px] font-mono uppercase bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-500/40">
                                REGIONAL EMERGENCY SUITE
                            </span>
                        </div>
                        <p class="text-xs text-slate-400 font-mono mt-0.5">
                            Cross-language disaster warnings, evacuation instructions, relief camp logistics, and voice broadcast.
                        </p>
                    </div>

                    <!-- 5-Language Selector Bar -->
                    <div class="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-700 flex-wrap">
                        ${languages.map(l => `
                            <button class="bhasha-lang-btn ${this.selectedLang === l.code ? 'active' : ''}" data-lang="${l.code}">
                                <span class="font-bold">${l.nativeName}</span>
                                <span class="text-[10px] opacity-75 font-mono uppercase">(${l.code})</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Scenario Selection Pills -->
                <div class="card p-3 bg-slate-900/90 border border-slate-800 font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <span class="text-slate-400 text-xs flex items-center gap-1.5">
                        <span>⚡</span> <span>Standard Tactical Emergency Scenarios:</span>
                    </span>
                    <div class="flex items-center gap-1.5 flex-wrap">
                        ${samples.map((s, idx) => `
                            <button class="bhasha-scenario-btn" data-index="${idx}">
                                ${s.category}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Side-by-Side Translation Workspace -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <!-- Left: Original Source Alert -->
                    <div class="card p-4 bg-slate-900/90 border border-slate-700 font-mono space-y-3">
                        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div class="flex items-center gap-2">
                                <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block animate-pulse"></span>
                                <span class="text-xs font-bold text-white uppercase tracking-wider">
                                    Original Emergency Alert (English / Source)
                                </span>
                            </div>
                            <span class="text-[10px] text-slate-400">INPUT SOURCE</span>
                        </div>

                        <textarea id="ba-source-input" rows="7" class="tactical-input w-full text-xs font-mono" placeholder="Type or paste emergency instructions, evacuation routes, or relief camp timings...">${this.currentInput}</textarea>

                        <div class="flex items-center justify-between pt-1">
                            <span class="text-[11px] text-slate-400">Edit text above to instantly update live translation.</span>
                            <button id="btn-ba-translate" class="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
                                <span>🔄</span> <span>Translate</span>
                            </button>
                        </div>

                        <!-- Preserved Entities Highlight Box -->
                        ${this.renderPreservedEntities()}
                    </div>

                    <!-- Right: Translated Target Alert + Voice Player -->
                    <div class="card p-4 bg-slate-900/90 border border-slate-700 font-mono space-y-3">
                        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div class="flex items-center gap-2">
                                <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                                <span class="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                                    Translated Broadcast (${this.getLanguageName(this.selectedLang)})
                                </span>
                            </div>
                            <span class="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                                READY TO BROADCAST
                            </span>
                        </div>

                        <!-- Translated Output Box -->
                        <div id="ba-translated-box" class="p-4 rounded bg-slate-950 border border-slate-800 min-h-[175px] text-slate-100 text-sm leading-relaxed font-sans font-medium flex flex-col justify-between">
                            <div id="ba-translated-text">
                                ${this.currentTranslation ? this.currentTranslation.translatedText : 'Translating...'}
                            </div>

                            <!-- Audio Waveform Animation (Visible while speaking) -->
                            <div id="ba-audio-wave" class="flex items-center gap-2 pt-3 border-t border-slate-800/80 mt-3 ${this.isSpeaking ? '' : 'hidden'}">
                                <span class="text-[10px] text-cyan-400 font-mono animate-pulse">VOICE BROADCAST ACTIVE:</span>
                                <div class="waveform-bars">
                                    <span class="waveform-bar"></span>
                                    <span class="waveform-bar"></span>
                                    <span class="waveform-bar"></span>
                                    <span class="waveform-bar"></span>
                                    <span class="waveform-bar"></span>
                                </div>
                            </div>
                        </div>

                        <!-- Audio Voice Broadcast Controls -->
                        <div class="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800">
                            <div class="text-[11px] text-slate-400 font-mono">
                                Web Speech API Voice Engine: <b class="text-sky-300">${this.getLanguageLocale(this.selectedLang)}</b>
                            </div>

                            <div class="flex items-center gap-2 w-full sm:w-auto">
                                <button id="btn-ba-speak" class="btn btn-primary text-xs flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500">
                                    <span>🔊</span>
                                    <span>Play Voice Broadcast</span>
                                </button>
                                <button id="btn-ba-stop" class="btn btn-secondary text-xs px-3">
                                    ⏹ Stop
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Emergency Vocabulary Field Quick-Reference -->
                <div class="card p-4 bg-slate-900/90 border border-slate-800 font-mono">
                    <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-2">
                        <span>📖</span> <span>Tactical Disaster Terminology Reference (Multilingual Quick Grid)</span>
                    </h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left text-xs font-mono">
                            <thead>
                                <tr class="text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                                    <th class="pb-2">Emergency Term</th>
                                    <th class="pb-2">தமிழ் (Tamil)</th>
                                    <th class="pb-2">മലയാളം (Malayalam)</th>
                                    <th class="pb-2">हिंदी (Hindi)</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800/60 text-slate-300">
                                <tr>
                                    <td class="py-2 text-red-400 font-bold">Evacuate Immediately</td>
                                    <td class="py-2">உடனடியாக வெளியேறவும்</td>
                                    <td class="py-2">ഉടൻ ഒഴിയുക</td>
                                    <td class="py-2">तुरंत बाहर निकलें</td>
                                </tr>
                                <tr>
                                    <td class="py-2 text-cyan-400 font-bold">Flash Flood</td>
                                    <td class="py-2">திடீர் வெள்ளம்</td>
                                    <td class="py-2">മിന്നൽ പ്രളയം</td>
                                    <td class="py-2">अचानक बाढ़</td>
                                </tr>
                                <tr>
                                    <td class="py-2 text-purple-400 font-bold">Relief Camp</td>
                                    <td class="py-2">நிவாரண முகாம்</td>
                                    <td class="py-2">ദുരിതാശ്വാസ ക്യാമ്പ്</td>
                                    <td class="py-2">राहत शिविर</td>
                                </tr>
                                <tr>
                                    <td class="py-2 text-emerald-400 font-bold">Clean Drinking Water</td>
                                    <td class="py-2">சுத்தமான குடிநீர்</td>
                                    <td class="py-2">ശുദ്ധമായ കുടിവെള്ളം</td>
                                    <td class="py-2">स्वच्छ पेयजल</td>
                                </tr>
                                <tr>
                                    <td class="py-2 text-amber-400 font-bold">Helpline (112 / 1070)</td>
                                    <td class="py-2">உதவி எண் (112 / 1070)</td>
                                    <td class="py-2">ഹെൽപ്പ് ലൈൻ (112 / 1070)</td>
                                    <td class="py-2">हेल्पलाइन (112 / 1070)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }
    renderPreservedEntities() {
        if (!this.currentTranslation || !this.currentTranslation.entities) return '';
        const ent = this.currentTranslation.entities;
        const total = (ent.helplines.length + ent.measurements.length + ent.sectors.length);

        if (total === 0) return '';

        return `
            <div class="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono space-y-1">
                <div class="text-slate-400 font-bold flex items-center justify-between">
                    <span>🛡️ Critical Preserved Tokens (Exact Integrity Protection):</span>
                    <span class="text-cyan-400 font-mono">${total} Detected</span>
                </div>
                <div class="flex items-center gap-1.5 flex-wrap pt-1">
                    ${ent.helplines.map(h => `<span class="bg-red-950/80 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-bold">☎️ ${h}</span>`).join('')}
                    ${ent.sectors.map(s => `<span class="bg-sky-950/80 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded font-bold">📍 ${s}</span>`).join('')}
                    ${ent.measurements.map(m => `<span class="bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">📏 ${m}</span>`).join('')}
                </div>
            </div>
        `;
    }

    getLanguageName(code) {
        const lang = bhashaAlertService.getLanguages().find(l => l.code === code);
        return lang ? `${lang.name} (${lang.nativeName})` : code.toUpperCase();
    }

    getLanguageLocale(code) {
        const lang = bhashaAlertService.getLanguages().find(l => l.code === code);
        return lang ? lang.speechLocale : 'en-IN';
    }

    bindEvents() {
        // Language Buttons
        document.querySelectorAll('.bhasha-lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.getAttribute('data-lang');
                this.selectedLang = lang;
                this.updateTranslation();
                this.render();
            });
        });

        // Scenario Preset Buttons
        document.querySelectorAll('.bhasha-scenario-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
                const sample = bhashaAlertService.getSampleAlerts()[idx];
                if (sample) {
                    this.currentInput = sample.english;
                    const inputEl = document.getElementById('ba-source-input');
                    if (inputEl) inputEl.value = sample.english;
                    this.updateTranslation();
                    this.render();
                }
            });
        });

        // Translate Button
        const translateBtn = document.getElementById('btn-ba-translate');
        if (translateBtn) {
            translateBtn.addEventListener('click', () => {
                const inputEl = document.getElementById('ba-source-input');
                if (inputEl) {
                    this.currentInput = inputEl.value;
                    this.updateTranslation();
                    this.render();
                }
            });
        }

        // Live typing translation debounce
        const sourceInput = document.getElementById('ba-source-input');
        if (sourceInput) {
            sourceInput.addEventListener('input', (e) => {
                this.currentInput = e.target.value;
            });
        }

        // Speak Button
        const speakBtn = document.getElementById('btn-ba-speak');
        if (speakBtn) {
            speakBtn.addEventListener('click', () => {
                if (!this.currentTranslation || !this.currentTranslation.translatedText) return;
                this.isSpeaking = true;
                const wave = document.getElementById('ba-audio-wave');
                if (wave) wave.classList.remove('hidden');

                bhashaAlertService.speak(this.currentTranslation.translatedText, this.selectedLang);
            });
        }

        // Stop Speaking Button
        const stopBtn = document.getElementById('btn-ba-stop');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                bhashaAlertService.stopSpeaking();
                this.isSpeaking = false;
                const wave = document.getElementById('ba-audio-wave');
                if (wave) wave.classList.add('hidden');
            });
        }

        // Listen for speech events from service
        bhashaAlertService.on('speech-end', () => {
            this.isSpeaking = false;
            const wave = document.getElementById('ba-audio-wave');
            if (wave) wave.classList.add('hidden');
        });
    }

    updateTranslation() {
        if (!this.currentInput || !this.currentInput.trim()) {
            this.currentTranslation = null;
            return;
        }
        this.currentTranslation = bhashaAlertService.translate(this.currentInput, this.selectedLang);
    }
}

const bhashaAlertView = new BhashaAlertView();
