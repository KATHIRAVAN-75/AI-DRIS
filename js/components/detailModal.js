/**
 * Disaster Rescue Center - Emergency Detail & AI Decision Support Modal
 * Displays full AI Smart Message Reader extraction, Danger Score (0-100),
 * Human Verification controls, Smart Team Matching, Flood-Aware Route, and Voice Player.
 */

class DetailModal {
    constructor(modalId = "detail-modal") {
        this.modalId = modalId;
        this.currentAlert = null;
        this.isOpen = false;
        this.isPlayingAudio = false;
        this.audioPlayInterval = null;
        this.audioProgress = 0;
    }

    init() {
        sosService.on('alert-selected', (alert) => {
            if (alert) {
                this.currentAlert = alert;
                if (this.isOpen) {
                    this.render(alert);
                }
            }
        });

        sosService.on('alert-updated', (alert) => {
            if (this.currentAlert && this.currentAlert.id === alert.id) {
                this.currentAlert = alert;
                if (this.isOpen) {
                    this.render(alert);
                }
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    openForAlert(alertId) {
        sosService.selectAlert(alertId);
        const alert = sosService.getAlertById(alertId);
        if (alert) {
            this.currentAlert = alert;
            this.open();
        }
    }

    open() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;
        this.isOpen = true;
        modal.classList.remove('hidden');
        if (this.currentAlert) {
            this.render(this.currentAlert);
        }
    }

    close() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;
        this.isOpen = false;
        this.stopAudio();
        modal.classList.add('hidden');
    }

    render(alert) {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        const priority = sosService.getEffectivePriority(alert);
        const prioConfig = PRIORITIES[priority] || PRIORITIES.MEDIUM;
        const disaster = DISASTER_TYPES[alert.disasterType] || DISASTER_TYPES.Other;
        const analysis = alert.aiAnalysis || aiAnalysisService.analyze(alert);
        const dangerScore = alert.aiAnalysis?.dangerScore || 65;
        const extracted = analysis.extractedEntities || {};
        const isIncident = alert.reportType === "INCIDENT";
        const isVerified = alert.isVerified || analysis.isVerified;

        // Multilingual & Translation resolution
        const langCode = alert.sourceLanguage || (typeof translationService !== 'undefined' ? translationService.detectScript(alert.originalMessage || alert.message) : 'en');
        const langName = alert.detectedLanguage || (typeof translationService !== 'undefined' ? translationService.getLanguageName(langCode) : 'English');
        const isNonEnglish = langCode !== 'en' || (alert.detectedLanguage && alert.detectedLanguage.toLowerCase() !== 'english');
        const translationStatus = alert.translationStatus || (isNonEnglish ? 'NOT_TRANSLATED' : 'TRANSLATED');

        // Danger Score styling
        let dangerColor = "#22c55e";
        let dangerTier = "LOW";
        let dangerBg = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
        if (dangerScore >= 81) {
            dangerColor = "#ef4444";
            dangerTier = "CRITICAL";
            dangerBg = "bg-rose-500/20 text-rose-400 border-rose-500/50";
        } else if (dangerScore >= 61) {
            dangerColor = "#f97316";
            dangerTier = "HIGH";
            dangerBg = "bg-orange-500/20 text-orange-400 border-orange-500/50";
        } else if (dangerScore >= 31) {
            dangerColor = "#eab308";
            dangerTier = "MEDIUM";
            dangerBg = "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
        }

        // Smart Team Matching
        const smartMatch = rescueTeamService.getSmartMatching(alert);
        const bestTeam = smartMatch.bestMatch;
        const otherTeams = smartMatch.otherOptions || [];

        // Hospitals
        const rankedHospitals = (typeof hospitalService !== 'undefined')
            ? hospitalService.getHospitalsWithProximity(alert.latitude, alert.longitude, extracted.medicalEmergency)
            : [];
        const currentHospital = (typeof hospitalService !== 'undefined')
            ? (hospitalService.getHospitalById(alert.hospitalId) || rankedHospitals[0])
            : null;

        // Route Summary
        const routeData = (typeof routingService !== 'undefined')
            ? routingService.calculateRescueRoute(alert, bestTeam, currentHospital)
            : null;

        // Duplicate Alerts
        const duplicates = sosService.getDuplicatesForAlert(alert.id);

        // Status Stepper (7 Stages)
        const currentStatusIndex = RESCUE_STATUSES.findIndex(s => s.key === alert.status);
        const statusStepperHtml = RESCUE_STATUSES.map((s, idx) => {
            const isDone = idx <= currentStatusIndex;
            const isCurrent = idx === currentStatusIndex;
            return `
                <div class="step-item ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-active' : ''}"
                     onclick="detailModal.changeStatus('${s.key}')"
                     title="Advance pipeline to ${s.label}">
                    <div class="step-dot">${s.icon || (idx + 1)}</div>
                    <span class="step-label text-[10px]">${s.label}</span>
                </div>
            `;
        }).join('<div class="step-line"></div>');

        // Relay Path
        const relayNodes = alert.relayPath || ["Victim-Node", "Gateway-South"];
        const relayGraphHtml = relayNodes.map((node, idx) => `
            <div class="relay-node">
                <div class="relay-node-bubble ${idx === 0 ? 'node-victim' : (idx === relayNodes.length - 1 ? 'node-center' : 'node-mesh')}">
                    ${node}
                </div>
                ${idx < relayNodes.length - 1 ? '<div class="relay-arrow">➔</div>' : ''}
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="modal-backdrop" onclick="detailModal.close()">
                <div class="modal-card max-w-5xl w-full max-h-[92vh] overflow-y-auto" onclick="event.stopPropagation()">
                    
                    <!-- Top Modal Header -->
                    <div class="detail-header flex items-center justify-between pb-3 border-b border-slate-700">
                        <div class="flex items-center gap-2.5 flex-wrap">
                            <span class="${isIncident ? 'report-type-badge-incident' : 'report-type-badge-sos'}">
                                ${isIncident ? '📢 INCIDENT REPORT' : '🚨 EMERGENCY SOS'}
                            </span>
                            <span class="text-xl font-mono font-black text-white">${alert.id}</span>
                            <span class="sos-disaster-badge text-xs">${disaster.icon} ${alert.disasterType}</span>
                            <span class="badge ${prioConfig.badgeClass} flex items-center gap-1">
                                ${priority === 'CRITICAL' ? '<span class="pulse-dot"></span>' : ''}
                                ${priority} PRIORITY
                            </span>
                            <span class="text-xs font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/50 flex items-center gap-1">
                                <span>🌐</span> <span>${langName}</span>
                            </span>
                            ${alert.isReviewed ? `
                                <span class="text-[11px] font-mono bg-indigo-950/80 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/50 flex items-center gap-1">
                                    <span>✓</span> REVIEWED
                                </span>
                            ` : ''}
                            ${isVerified ? `
                                <span class="text-[11px] font-mono bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/50 flex items-center gap-1">
                                    <span>✓</span> VERIFIED BY ${alert.verifiedBy || 'OFFICER'}
                                </span>
                            ` : `
                                <span class="text-[11px] font-mono bg-amber-950/80 text-amber-400 px-2 py-0.5 rounded border border-amber-500/50 animate-pulse">
                                    ⚠️ PENDING HUMAN VERIFICATION
                                </span>
                            `}
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="btn btn-secondary btn-xs flex items-center gap-1" onclick="detailModal.viewOnMap()">
                                <span>🗺️</span> <span>View on Map</span>
                            </button>
                            <button class="btn btn-secondary btn-xs" onclick="detailModal.close()">✕</button>
                        </div>
                    </div>

                    <!-- Duplicate Report Warning Banner (If Any) -->
                    ${duplicates.length > 0 ? `
                        <div class="duplicate-banner mt-3 flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <span class="text-xl">⚠️</span>
                                <div>
                                    <div class="text-xs font-bold text-amber-400 uppercase font-mono">Possible Duplicate Reports Detected (${duplicates.length + 1} Matching Reports)</div>
                                    <div class="text-[11px] text-slate-300">
                                        Reports: <strong class="text-white">${alert.id}, ${duplicates.map(d => d.id).join(', ')}</strong> share same location sector & ${alert.disasterType} disaster.
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-primary btn-xs bg-amber-600 hover:bg-amber-500 border-amber-400" onclick="detailModal.mergeDuplicates()">
                                🔗 Merge Reports
                            </button>
                        </div>
                    ` : ''}

                    <!-- 7-Stage Response Pipeline Stepper -->
                    <div class="py-2.5 border-b border-slate-800">
                        <div class="flex items-center justify-between mb-1.5">
                            <span class="text-[11px] text-slate-400 uppercase font-mono">Response Status Lifecycle (Click stage to advance):</span>
                            <span class="text-xs font-mono font-bold text-cyan-400">Current: ${alert.status}</span>
                        </div>
                        <div class="status-stepper">
                            ${statusStepperHtml}
                        </div>
                    </div>

                    <!-- Citizen Contact Details & Review Action Banner -->
                    <div class="my-2.5 p-2.5 rounded-lg bg-slate-800/90 border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                        <div class="flex items-center gap-4 flex-wrap">
                            <div class="flex items-center gap-2">
                                <span class="text-slate-400 text-xs font-mono">👤 CITIZEN:</span>
                                <strong class="text-white text-xs font-mono">${this.escapeHtml(alert.contactName || 'Public Citizen')}</strong>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-slate-400 text-xs font-mono">📞 PHONE:</span>
                                <a href="tel:${this.escapeHtml(alert.contactPhone || '+91 94471 00000')}" class="text-cyan-400 hover:text-cyan-300 text-xs font-mono font-bold hover:underline">
                                    ${this.escapeHtml(alert.contactPhone || '+91 94471 00000')}
                                </a>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <a href="tel:${this.escapeHtml(alert.contactPhone || '+91 94471 00000')}"
                               class="btn btn-xs bg-emerald-700 hover:bg-emerald-600 text-white font-mono flex items-center gap-1 px-3 py-1">
                                <span>📞</span> <span>Call Citizen</span>
                            </a>
                            ${alert.isReviewed ? `
                                <span class="text-xs font-mono bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded border border-indigo-500/50 flex items-center gap-1">
                                    <span>✓</span> <span>Reviewed by ${this.escapeHtml(alert.reviewedBy || 'Officer')}</span>
                                </span>
                            ` : `
                                <button class="btn btn-secondary btn-xs text-amber-300 border-amber-500/50 hover:bg-amber-950 font-mono font-bold flex items-center gap-1 px-3 py-1"
                                        onclick="detailModal.markReviewed()">
                                    <span>🛡️</span> <span>Mark as Reviewed</span>
                                </button>
                            `}
                        </div>
                    </div>

                    <!-- Main Modal Body Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 py-3">
                        
                        <!-- Left Column: Distress Details & AI Smart Message Reader (7 Cols) -->
                        <div class="lg:col-span-7 space-y-3">
                            
                            <!-- Victim Message Card -->
                            <div class="card p-3 bg-slate-900/90 border border-slate-700">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-xs text-slate-400 uppercase font-mono font-bold flex items-center gap-1.5">
                                        <span>📨</span>
                                        <span>${isIncident ? 'Observer Field Transmission' : 'Multilingual Distress Transmission'}</span>
                                    </span>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/40">
                                            🌐 ${langName}
                                        </span>
                                        <span class="text-[11px] text-slate-400 font-mono">
                                            ${new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • ${alert.battery ? `🔋 ${alert.battery}%` : ''}
                                        </span>
                                    </div>
                                </div>

                                <!-- Side-by-Side Multilingual Comparison Grid -->
                                <div class="grid grid-cols-1 ${isNonEnglish ? 'md:grid-cols-2' : ''} gap-3 mb-2">
                                    <!-- Original Citizen Message -->
                                    <div class="p-3 bg-slate-800/80 rounded border-l-4 border-amber-400 flex flex-col justify-between">
                                        <div>
                                            <div class="flex items-center justify-between text-[10px] uppercase font-mono text-slate-400 mb-1">
                                                <span class="font-bold text-amber-300">Original Text (${langName})</span>
                                                <span class="text-[10px] text-cyan-400 font-mono">Native Text</span>
                                            </div>
                                            <div class="text-sm text-white font-medium italic">
                                                "${this.escapeHtml(alert.originalMessage || alert.message)}"
                                            </div>
                                        </div>
                                        <div class="text-[10px] font-mono text-slate-500 mt-2">
                                            Verbatim transmission received from citizen
                                        </div>
                                    </div>

                                    <!-- English Translation Box -->
                                    ${isNonEnglish ? `
                                        <div class="p-3 bg-slate-950/90 rounded border-l-4 ${alert.translationStatus === 'TRANSLATED' ? 'border-emerald-400' : alert.translationStatus === 'FAILED' ? 'border-rose-400' : 'border-cyan-400'} flex flex-col justify-between">
                                            <div>
                                                <div class="flex items-center justify-between text-[10px] uppercase font-mono mb-1">
                                                    <span class="font-bold text-cyan-300 flex items-center gap-1">
                                                        <span>🇬🇧</span> <span>English Translation</span>
                                                    </span>
                                                    <div>
                                                        ${alert.translationStatus === 'TRANSLATED' ? `
                                                            <span class="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                                                                ✓ Translated
                                                            </span>
                                                        ` : alert.translationStatus === 'TRANSLATING' ? `
                                                            <span class="text-[10px] font-mono text-amber-400 animate-pulse">
                                                                ⏳ Translating...
                                                            </span>
                                                        ` : alert.translationStatus === 'FAILED' ? `
                                                            <span class="text-[10px] font-mono text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-500/40">
                                                                ⚠️ Failed
                                                            </span>
                                                        ` : `
                                                            <span class="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                                                Not Translated
                                                            </span>
                                                        `}
                                                    </div>
                                                </div>

                                                ${alert.translationStatus === 'TRANSLATED' && (alert.translatedMessage || alert.englishTranslation) ? `
                                                    <div class="text-sm text-emerald-100 font-medium italic">
                                                        "${this.escapeHtml(alert.translatedMessage || alert.englishTranslation)}"
                                                    </div>
                                                ` : alert.translationStatus === 'TRANSLATING' ? `
                                                    <div class="text-xs text-amber-300 font-mono italic animate-pulse py-2">
                                                        Querying dual-layer neural translation engine...
                                                    </div>
                                                ` : alert.translationStatus === 'FAILED' ? `
                                                    <div class="text-xs text-rose-300 font-mono italic py-2">
                                                        Translation service unreachable. Please retry.
                                                    </div>
                                                ` : `
                                                    <div class="text-xs text-slate-400 font-mono italic py-2">
                                                        Distress message received in native ${langName}. Click translate to display English text.
                                                    </div>
                                                `}
                                            </div>

                                            <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
                                                <span class="text-[10px] font-mono text-slate-500">Dual-Layer Engine</span>
                                                <div>
                                                    ${alert.translationStatus === 'TRANSLATED' ? `
                                                        <button class="btn btn-secondary btn-xs text-[10px] text-cyan-300 border-cyan-500/40 hover:bg-cyan-950 flex items-center gap-1"
                                                                onclick="detailModal.translateAlert(true)">
                                                            <span>↺</span> <span>Re-Translate</span>
                                                        </button>
                                                    ` : alert.translationStatus === 'TRANSLATING' ? `
                                                        <button class="btn btn-secondary btn-xs text-[10px] text-slate-400" disabled>Translating...</button>
                                                    ` : alert.translationStatus === 'FAILED' ? `
                                                        <button class="btn btn-secondary btn-xs text-[10px] text-rose-300 border-rose-500/50 hover:bg-rose-950 flex items-center gap-1"
                                                                onclick="detailModal.translateAlert(true)">
                                                            <span>↺</span> <span>Retry Translation</span>
                                                        </button>
                                                    ` : `
                                                        <button class="btn btn-primary btn-xs text-[11px] bg-cyan-600 hover:bg-cyan-500 border-cyan-400 flex items-center gap-1"
                                                                onclick="detailModal.translateAlert(false)">
                                                            <span>🌐</span> <span>Translate to English</span>
                                                        </button>
                                                    `}
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>

                                <!-- Voice Recording Player (Simulated) -->
                                ${alert.hasVoice ? `
                                    <div class="mt-2.5 p-2 bg-slate-800/60 rounded border border-slate-700/80 flex items-center justify-between">
                                        <div class="flex items-center gap-2.5">
                                            <button id="btn-modal-voice" class="w-8 h-8 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center text-xs transition" onclick="detailModal.toggleAudio()">
                                                ${this.isPlayingAudio ? '⏸' : '▶'}
                                            </button>
                                            <div>
                                                <div class="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                                                    <span>🎤 Voice Message Recording</span>
                                                    <span class="text-cyan-400 text-[11px]">00:0${alert.voiceDurationSeconds || 8}</span>
                                                </div>
                                                <div class="text-[10px] text-slate-400 font-mono">
                                                    Recorded & Relayed via Android Mesh Gateway
                                                </div>
                                            </div>
                                        </div>
                                        <div class="waveform-bars pr-2">
                                            <div class="waveform-bar"></div>
                                            <div class="waveform-bar"></div>
                                            <div class="waveform-bar"></div>
                                            <div class="waveform-bar"></div>
                                            <div class="waveform-bar"></div>
                                        </div>
                                    </div>
                                ` : ''}

                                <!-- Photo Attachment (If incident photo exists) -->
                                ${alert.photoUrl ? `
                                    <div class="mt-2.5">
                                        <div class="text-[11px] text-slate-400 uppercase font-mono mb-1 flex items-center gap-1">
                                            <span>📷</span> <span>Attached Photo Evidence:</span>
                                        </div>
                                        <div class="rounded overflow-hidden border border-slate-700 max-h-48">
                                            <img src="${alert.photoUrl}" alt="Incident Damage Photo" class="w-full h-48 object-cover">
                                        </div>
                                    </div>
                                ` : ''}

                                <!-- Grid of Key Telemetry -->
                                <div class="grid grid-cols-3 gap-2 mt-3 text-xs font-mono">
                                    <div class="bg-slate-800/60 p-2 rounded">
                                        <span class="text-slate-400 block text-[10px]">LOCATION</span>
                                        <span class="text-white font-bold">${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}</span>
                                        <span class="text-[10px] text-slate-400 block truncate">${this.escapeHtml(alert.address)}</span>
                                    </div>
                                    <div class="bg-slate-800/60 p-2 rounded">
                                        <span class="text-slate-400 block text-[10px]">PEOPLE AT RISK</span>
                                        <span class="text-cyan-400 font-bold text-sm">👥 ${alert.peopleCount || 1} Persons</span>
                                        <span class="text-[10px] ${alert.injured ? 'text-rose-400' : 'text-slate-400'} block">
                                            ${alert.injured ? '⚠️ Injured Reported' : 'No injuries'}
                                        </span>
                                    </div>
                                    <div class="bg-slate-800/60 p-2 rounded">
                                        <span class="text-slate-400 block text-[10px]">VULNERABILITY</span>
                                        <span class="${alert.vulnerable ? 'text-amber-400 font-bold' : 'text-slate-400'} text-xs block">
                                            ${alert.vulnerable ? '⚠️ ELDERLY / CHILD' : 'Standard'}
                                        </span>
                                        <span class="text-[10px] text-slate-400 block">Mesh Hops: ${alert.hopCount}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- AI SMART MESSAGE READER EXTRACTION PANEL -->
                            <div class="card p-3 bg-slate-900/90 border-2" style="border-color: ${dangerColor}40;">
                                <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                                    <div class="flex items-center gap-2">
                                        <span class="text-lg">🧠</span>
                                        <div>
                                            <span class="font-bold text-white text-sm font-mono">AI Smart Message Reader</span>
                                            <span class="text-[10px] text-cyan-300 bg-slate-800 px-1.5 py-0.5 rounded font-mono ml-2">NLP ENTITY EXTRACTION</span>
                                        </div>
                                    </div>
                                    <div class="danger-score-badge border ${dangerBg}">
                                        <span>DANGER SCORE:</span>
                                        <span class="text-sm font-black">${dangerScore}/100</span>
                                        <span class="text-[10px]">(${dangerTier})</span>
                                    </div>
                                </div>

                                <!-- Extracted Entities Grid -->
                                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2.5 text-xs font-mono">
                                    <div class="bg-slate-800/70 p-2 rounded border border-slate-700/60">
                                        <span class="text-slate-400 text-[10px] block">DISASTER TYPE</span>
                                        <strong class="text-sky-300">${extracted.disasterType || alert.disasterType}</strong>
                                        <span class="text-[10px] text-emerald-400 block">✓ ${extracted.disasterTypeConfidence || 96}% Conf</span>
                                    </div>
                                    <div class="bg-slate-800/70 p-2 rounded border border-slate-700/60">
                                        <span class="text-slate-400 text-[10px] block">PEOPLE AFFECTED</span>
                                        <strong class="text-cyan-300">👥 ${extracted.peopleCount || alert.peopleCount || 1} People</strong>
                                        <span class="text-[10px] text-emerald-400 block">✓ ${extracted.peopleCountConfidence || 99}% Conf</span>
                                    </div>
                                    <div class="bg-slate-800/70 p-2 rounded border border-slate-700/60">
                                        <span class="text-slate-400 text-[10px] block">MEDICAL EMERGENCY</span>
                                        <strong class="${extracted.medicalEmergency || alert.injured ? 'text-rose-400' : 'text-slate-300'}">
                                            ${extracted.medicalEmergency || alert.injured ? '🩺 YES (INJURED)' : 'NO'}
                                        </strong>
                                        <span class="text-[10px] text-emerald-400 block">✓ ${extracted.medicalConfidence || 93}% Conf</span>
                                    </div>
                                    <div class="bg-slate-800/70 p-2 rounded border border-slate-700/60">
                                        <span class="text-slate-400 text-[10px] block">VULNERABLE PERSON</span>
                                        <strong class="${extracted.vulnerablePerson || alert.vulnerable ? 'text-amber-400' : 'text-slate-300'}">
                                            ${extracted.vulnerableType || (alert.vulnerable ? 'YES (ELDERLY)' : 'NO')}
                                        </strong>
                                        <span class="text-[10px] text-emerald-400 block">✓ ${extracted.vulnerableConfidence || 92}% Conf</span>
                                    </div>
                                    <div class="bg-slate-800/70 p-2 rounded border border-slate-700/60">
                                        <span class="text-slate-400 text-[10px] block">LOCATION</span>
                                        <strong class="text-white truncate block">📍 GPS DETECTED</strong>
                                        <span class="text-[10px] text-emerald-400 block">✓ ${extracted.locationConfidence || 98}% Conf</span>
                                    </div>
                                    <div class="bg-slate-800/70 p-2 rounded border border-slate-700/60">
                                        <span class="text-slate-400 text-[10px] block">PRIORITY TIER</span>
                                        <strong class="text-rose-400">${priority}</strong>
                                        <span class="text-[10px] text-emerald-400 block">✓ ${extracted.priorityConfidence || 91}% Conf</span>
                                    </div>
                                </div>

                                <!-- AI Danger Score Gauge Bar -->
                                <div class="mt-3">
                                    <div class="flex items-center justify-between text-[11px] font-mono mb-1">
                                        <span class="text-slate-400">Danger Risk Assessment Index:</span>
                                        <span class="font-bold" style="color: ${dangerColor};">${dangerScore} / 100 (${dangerTier})</span>
                                    </div>
                                    <div class="danger-score-bar-bg">
                                        <div class="danger-score-bar-fill" style="width: ${dangerScore}%; background: ${dangerColor};"></div>
                                    </div>
                                </div>

                                <!-- Human Verification Alert Box (SIH Requirement: AI must not auto-dispatch) -->
                                <div class="mt-3 p-2.5 rounded bg-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <div>
                                        <div class="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                                            <span>🛡️</span>
                                            <span>AI recommendation — Human verification required</span>
                                        </div>
                                        <div class="text-[11px] text-slate-300">
                                            ${isVerified ? `✓ Verified by ${alert.verifiedBy || 'Officer'}. Dispatch unlocked.` : 'Officer verification required before dispatching rescue units.'}
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-1.5 shrink-0">
                                        ${!isVerified ? `
                                            <button class="btn btn-primary btn-xs bg-emerald-600 hover:bg-emerald-500 border-emerald-400" onclick="detailModal.verifyAI()">
                                                ✓ VERIFY AI
                                            </button>
                                        ` : `
                                            <span class="text-xs text-emerald-400 font-bold font-mono">✓ VERIFIED</span>
                                        `}
                                        <button class="btn btn-secondary btn-xs" onclick="detailModal.toggleEditAnalysis()">
                                            ✎ EDIT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column: Smart Team Matching, Routing & Hospital Selection (5 Cols) -->
                        <div class="lg:col-span-5 space-y-3">
                            
                            <!-- SMART TEAM MATCHING CARD -->
                            <div class="card p-3 bg-slate-900/90 border border-slate-700">
                                <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                                    <span class="text-xs text-slate-400 uppercase font-mono font-bold flex items-center gap-1">
                                        <span>👨‍🚒</span>
                                        <span>Smart Team Matching Engine</span>
                                    </span>
                                    <span class="text-[10px] text-cyan-400 font-mono">AI MATCH RECOMMENDATION</span>
                                </div>

                                ${alert.assignedTeam ? `
                                    <div class="mt-2.5 p-3 rounded bg-emerald-950/50 border border-emerald-500/50">
                                        <div class="flex items-center justify-between">
                                            <div>
                                                <span class="text-[10px] text-emerald-400 font-mono font-bold block uppercase">Assigned Tactical Unit</span>
                                                <strong class="text-white text-sm block">${alert.assignedTeam}</strong>
                                                <span class="text-xs text-emerald-300 font-mono">STATUS: ON MISSION (EN ROUTE)</span>
                                            </div>
                                            <button class="btn btn-secondary btn-xs text-rose-300" onclick="detailModal.releaseTeam()">
                                                Release Unit
                                            </button>
                                        </div>
                                    </div>
                                ` : `
                                    <!-- Best Match Recommendation Card -->
                                    ${bestTeam ? `
                                        <div class="mt-2.5 p-3 rounded bg-sky-950/40 border-2 border-sky-500/60">
                                            <div class="flex items-center justify-between mb-1.5">
                                                <div class="flex items-center gap-1.5">
                                                    <span class="text-xl">${bestTeam.icon}</span>
                                                    <div>
                                                        <span class="text-[10px] text-sky-400 font-mono font-bold block">AI BEST MATCH</span>
                                                        <strong class="text-white text-sm block">${bestTeam.name}</strong>
                                                    </div>
                                                </div>
                                                <div class="text-right">
                                                    <span class="text-xs font-mono font-black text-sky-300 bg-sky-900/80 px-2 py-0.5 rounded border border-sky-500/40">
                                                        ${bestTeam.matchScore}/100 Match
                                                    </span>
                                                </div>
                                            </div>

                                            <div class="text-[11px] text-slate-300 space-y-0.5 my-2 pl-1 font-mono">
                                                ${(bestTeam.reasons || []).map(r => `<div>✓ ${r}</div>`).join('')}
                                            </div>

                                            <div class="flex items-center gap-2 mt-2">
                                                <button class="btn btn-primary btn-sm w-full font-bold" onclick="detailModal.confirmTeamAssignment('${bestTeam.id}')">
                                                    CONFIRM ASSIGNMENT ➔
                                                </button>
                                            </div>
                                        </div>
                                    ` : ''}

                                    <!-- Other Team Options -->
                                    <div class="mt-2 space-y-1.5">
                                        <span class="text-[10px] text-slate-400 uppercase font-mono block">Other Team Options:</span>
                                        ${otherTeams.slice(0, 2).map(team => `
                                            <div class="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-700/60 text-xs">
                                                <div class="flex items-center gap-2">
                                                    <span>${team.icon}</span>
                                                    <div>
                                                        <div class="font-bold text-white">${team.name}</div>
                                                        <div class="text-[10px] text-slate-400 font-mono">${team.distanceKm} km away • ${team.status}</div>
                                                    </div>
                                                </div>
                                                <div class="flex items-center gap-2">
                                                    <span class="text-[11px] text-slate-300 font-mono">${team.matchScore}/100</span>
                                                    <button class="btn btn-secondary btn-xs" onclick="detailModal.confirmTeamAssignment('${team.id}')">
                                                        Select
                                                    </button>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                `}
                            </div>

                            <!-- FLOOD-AWARE ROUTING HUD -->
                            ${routeData ? `
                                <div class="card p-3 bg-slate-900/90 border border-slate-700">
                                    <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                                        <span class="text-xs text-slate-400 uppercase font-mono font-bold flex items-center gap-1">
                                            <span>🗺️</span>
                                            <span>Flood-Aware Route Intelligence</span>
                                        </span>
                                        <span class="text-[10px] text-emerald-400 font-mono">AUTONOMOUS HAZARD BYPASS</span>
                                    </div>

                                    <div class="mt-2 space-y-2 text-xs">
                                        <div class="route-blocked-callout text-[11px] font-mono text-rose-300">
                                            <strong>⚠️ Route A Blocked:</strong> Arumparthapuram causeway submerged under 4.5ft flowing floodwaters.
                                        </div>
                                        <div class="route-safe-callout text-[11px] font-mono text-emerald-300">
                                            <strong>✓ Alternative Route B Recommended:</strong> High-ground ring road safe.
                                            <div class="text-white font-bold mt-0.5">
                                                Distance: ${routeData.recommendedRoute.distanceKm} km • Est. Transit: ~${routeData.recommendedRoute.estimatedTimeMinutes} min
                                            </div>
                                        </div>
                                        <div class="p-2 bg-slate-800/60 rounded text-[11px] font-mono text-slate-300 flex items-center justify-between">
                                            <span>Waypoints: 🚨 Victim ➔ 👨‍🚒 Rescue Team ➔ 🏥 Hospital</span>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}

                            <!-- HOSPITAL SELECTION -->
                            <div class="card p-3 bg-slate-900/90 border border-slate-700">
                                <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                                    <span class="text-xs text-slate-400 uppercase font-mono font-bold flex items-center gap-1">
                                        <span>🏥</span>
                                        <span>Emergency Hospital Destination</span>
                                    </span>
                                    <span class="text-[10px] text-purple-400 font-mono">TRAUMA READY</span>
                                </div>

                                <div class="mt-2 space-y-2">
                                    <div>
                                        <label class="text-[11px] text-slate-400 block mb-1 font-mono">Select Hospital for Medical Transfer:</label>
                                        <select id="select-hospital" class="tactical-select w-full text-xs" onchange="detailModal.onHospitalSelected(this.value)">
                                            ${rankedHospitals.map(h => `
                                                <option value="${h.id}" ${alert.hospitalId === h.id ? 'selected' : ''}>
                                                    ${h.name} (${h.emergencyBeds} Beds, ${h.icuBeds} ICU • ${h.distanceKm} km)
                                                </option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    ${currentHospital ? `
                                        <div class="p-2 bg-slate-800/60 rounded text-[11px] font-mono text-slate-300 space-y-0.5">
                                            <div>Capabilities: <span class="text-cyan-300">${currentHospital.capabilities.join(', ')}</span></div>
                                            <div>Ambulance Dispatch: <span class="text-emerald-400">${currentHospital.ambulances} active units</span></div>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Action Bar -->
                    <div class="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                        <div class="flex items-center gap-2">
                            <button class="btn btn-secondary btn-sm" onclick="detailModal.contactTeam()">
                                📻 Contact Team via Mesh
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="detailModal.viewOnMap()">
                                🎯 Focus on Map
                            </button>
                        </div>
                        <div class="flex items-center gap-2">
                            ${alert.status !== 'RESOLVED' ? `
                                <button class="btn btn-primary btn-sm bg-emerald-600 hover:bg-emerald-500 border-emerald-400 font-bold" onclick="detailModal.markResolved()">
                                    ✓ MARK EMERGENCY RESOLVED
                                </button>
                            ` : `
                                <span class="text-emerald-400 font-mono font-bold text-xs">✓ RESOLVED & LOGGED IN HISTORY</span>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    verifyAI() {
        if (!this.currentAlert) return;
        sosService.verifyAIAnalysis(this.currentAlert.id, "Officer #01");
        this.render(this.currentAlert);
    }

    confirmTeamAssignment(teamId) {
        if (!this.currentAlert) return;
        sosService.assignTeam(this.currentAlert.id, teamId, "Officer #01");
        mapManager.visualizeRescueRoute(this.currentAlert, teamId, this.currentAlert.hospitalId || "HOSP-01");
        this.render(this.currentAlert);
    }

    releaseTeam() {
        if (!this.currentAlert || !this.currentAlert.assignedTeam) return;
        rescueTeamService.releaseTeam(this.currentAlert.assignedTeam);
        this.currentAlert.assignedTeam = null;
        sosService.updateStatus(this.currentAlert.id, "OFFICER VERIFIED", "Officer #01");
        mapManager.clearRescueRoute();
        this.render(this.currentAlert);
    }

    onHospitalSelected(hospitalId) {
        if (!this.currentAlert) return;
        sosService.assignHospital(this.currentAlert.id, hospitalId, "Officer #01");
        if (this.currentAlert.assignedTeam) {
            mapManager.visualizeRescueRoute(this.currentAlert, this.currentAlert.assignedTeam, hospitalId);
        }
    }

    changeStatus(newStatus) {
        if (!this.currentAlert) return;
        sosService.updateStatus(this.currentAlert.id, newStatus, "Officer #01");
        this.render(this.currentAlert);
    }

    markResolved() {
        if (!this.currentAlert) return;
        sosService.updateStatus(this.currentAlert.id, "RESOLVED", "Officer #01");
        this.render(this.currentAlert);
    }

    viewOnMap() {
        if (!this.currentAlert) return;
        this.close();
        // Switch to dashboard or map view
        if (typeof sidebarNav !== 'undefined') {
            sidebarNav.switchView('dashboard');
        }
        mapManager.focusOnAlert(this.currentAlert);
    }

    contactTeam() {
        if (!this.currentAlert) return;
        const assigned = this.currentAlert.assignedTeam || "Rescue Unit";
        const message = prompt(`Simulate tactical VHF/Mesh Radio transmission to ${assigned}:`, `Command to ${assigned}: Proceed via Safe Route B bypassing Arumparthapuram causeway. Patient requiring medical extrication.`);
        if (message) {
            alert(`[TACTICAL MESH BROADCAST CONFIRMED]\nPacket relayed to ${assigned}\nChannel: VHF-Ch16\nAck: Received.`);
        }
    }

    mergeDuplicates() {
        if (!this.currentAlert) return;
        const duplicates = sosService.getDuplicatesForAlert(this.currentAlert.id);
        if (duplicates.length === 0) return;

        const dupIds = duplicates.map(d => d.id);
        sosService.mergeIncidents(this.currentAlert.id, dupIds, "Officer #01");
        alert(`Successfully merged ${dupIds.length} duplicate reports (${dupIds.join(', ')}) into primary incident ${this.currentAlert.id}.`);
        this.render(this.currentAlert);
    }

    toggleAudio() {
        const btn = document.getElementById('btn-modal-voice');
        if (this.isPlayingAudio) {
            this.stopAudio();
            if (btn) btn.innerHTML = '▶';
        } else {
            this.isPlayingAudio = true;
            if (btn) btn.innerHTML = '⏸';
            // Tactical audio simulation beep
            sosService.playAlertSound(false);
            // Auto stop after duration
            setTimeout(() => {
                this.stopAudio();
                const b = document.getElementById('btn-modal-voice');
                if (b) b.innerHTML = '▶';
            }, (this.currentAlert?.voiceDurationSeconds || 8) * 1000);
        }
    }

    stopAudio() {
        this.isPlayingAudio = false;
        if (this.audioPlayInterval) clearInterval(this.audioPlayInterval);
    }

    toggleEditAnalysis() {
        if (!this.currentAlert) return;
        const newScore = prompt("Manual Danger Score Override (0-100):", this.currentAlert.aiAnalysis?.dangerScore || 91);
        if (newScore !== null && !isNaN(parseInt(newScore))) {
            const parsed = parseInt(newScore);
            let prio = "MEDIUM";
            if (parsed >= 81) prio = "CRITICAL";
            else if (parsed >= 61) prio = "HIGH";
            else if (parsed <= 30) prio = "LOW";

            sosService.overridePriority(this.currentAlert.id, prio, `Officer calibrated Danger Score to ${parsed}/100`, "Officer #01");
            this.currentAlert.aiAnalysis.dangerScore = parsed;
            this.render(this.currentAlert);
        }
    }

    async translateAlert(forceRetry = false) {
        if (!this.currentAlert) return;
        this.currentAlert.translationStatus = 'TRANSLATING';
        this.render(this.currentAlert);
        await sosService.translateAlert(this.currentAlert.id, forceRetry);
        const updated = sosService.getAlertById(this.currentAlert.id);
        if (updated) {
            this.currentAlert = updated;
            this.render(this.currentAlert);
        }
    }

    markReviewed() {
        if (!this.currentAlert) return;
        sosService.markAsReviewed(this.currentAlert.id, "Officer #01");
        const updated = sosService.getAlertById(this.currentAlert.id);
        if (updated) {
            this.currentAlert = updated;
            this.render(this.currentAlert);
        }
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[m]));
    }
}

const detailModal = new DetailModal();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DetailModal, detailModal };
}
