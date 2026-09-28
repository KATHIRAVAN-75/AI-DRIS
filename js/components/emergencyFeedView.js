/**
 * Disaster Rescue Center - Dedicated Emergency Feed View Component
 * Renders full-screen emergency feed cards with multi-tier filters, Danger Score progress,
 * and direct one-click actions: [VIEW DETAILS], [ASSIGN TEAM], [MARK RESOLVED].
 */

class EmergencyFeedView {
    constructor(containerId = "view-feed") {
        this.containerId = containerId;
        this.currentFilter = "ALL";
    }

    init() {
        sosService.on('alerts-updated', () => {
            if (sidebarNav.currentView === 'feed') {
                this.render();
            }
        });
    }

    setFilter(filterKey) {
        this.currentFilter = filterKey;
        this.render();
    }

    getFilteredList() {
        let alerts = sosService.getAllAlerts().filter(a => !a.mergedInto);

        if (this.currentFilter === "CRITICAL" || this.currentFilter === "HIGH" || this.currentFilter === "MEDIUM" || this.currentFilter === "LOW") {
            alerts = alerts.filter(a => sosService.getEffectivePriority(a) === this.currentFilter);
        } else if (this.currentFilter === "MULTILINGUAL") {
            alerts = alerts.filter(a => a.sourceLanguage !== "en" && a.detectedLanguage !== "English");
        } else if (this.currentFilter === "UNREVIEWED") {
            alerts = alerts.filter(a => !a.isReviewed && a.status !== "RESOLVED");
        } else if (this.currentFilter === "REVIEWED") {
            alerts = alerts.filter(a => a.isReviewed);
        } else if (this.currentFilter === "SOS") {
            alerts = alerts.filter(a => a.reportType === "SOS");
        } else if (this.currentFilter === "INCIDENT") {
            alerts = alerts.filter(a => a.reportType === "INCIDENT");
        } else if (this.currentFilter === "UNASSIGNED") {
            alerts = alerts.filter(a => !a.assignedTeam && a.status !== "RESOLVED");
        } else if (this.currentFilter === "ASSIGNED") {
            alerts = alerts.filter(a => !!a.assignedTeam);
        } else if (this.currentFilter === "RESOLVED") {
            alerts = alerts.filter(a => a.status === "RESOLVED");
        }

        // Strict Sorting: Critical first, then High, then Medium, then Low, then newest
        alerts.sort((a, b) => {
            const rankA = PRIORITIES[sosService.getEffectivePriority(a)]?.rank || 0;
            const rankB = PRIORITIES[sosService.getEffectivePriority(b)]?.rank || 0;
            if (rankA !== rankB) return rankB - rankA;
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        return alerts;
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const alerts = this.getFilteredList();
        const isAutoTranslate = sosService.isAutoTranslateEnabled();
        const filterOptions = [
            { key: "ALL", label: "All Cases" },
            { key: "CRITICAL", label: "🔴 Critical" },
            { key: "HIGH", label: "🟠 High" },
            { key: "MULTILINGUAL", label: "🌐 Multilingual" },
            { key: "UNREVIEWED", label: "⏳ Unreviewed" },
            { key: "REVIEWED", label: "✓ Reviewed" },
            { key: "SOS", label: "🚨 SOS Only" },
            { key: "INCIDENT", label: "📢 Incidents" },
            { key: "UNASSIGNED", label: "⏳ Unassigned" },
            { key: "ASSIGNED", label: "🚒 Assigned" },
            { key: "RESOLVED", label: "✓ Resolved" }
        ];

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-7xl mx-auto">
                <!-- Feed Header & Multi-Filter Bar -->
                <div class="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                    <div>
                        <h2 class="text-base font-bold font-mono text-white flex items-center gap-2">
                            <span>🚨</span>
                            <span>REAL-TIME EMERGENCY FEED & MULTILINGUAL QUEUE</span>
                        </h2>
                        <p class="text-xs text-slate-400 font-mono">Live stream of validated distress calls, citizen alerts, and multilingual AI translation.</p>
                    </div>

                    <!-- Instant Search & Auto-Translate Toggle -->
                    <div class="flex items-center gap-2 flex-wrap">
                        <button class="btn btn-xs font-mono py-1.5 px-3 flex items-center gap-1.5 rounded transition ${isAutoTranslate ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'}"
                                onclick="emergencyFeedView.toggleAutoTranslate()"
                                title="Toggle automatic translation of all incoming non-English messages">
                            <span>⚡</span>
                            <span>Auto-Translate: <strong class="${isAutoTranslate ? 'text-white' : 'text-slate-400'}">${isAutoTranslate ? 'ON' : 'OFF'}</strong></span>
                        </button>

                        <div class="relative w-full sm:w-64">
                            <input type="text" id="feed-search-input" class="tactical-input w-full text-xs pl-7" 
                                   placeholder="Search SOS ID, message, location..."
                                   value="${sosService.filterState.searchQuery || ''}"
                                   oninput="sosService.setFilter('searchQuery', this.value); emergencyFeedView.render();">
                            <span class="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
                        </div>
                    </div>
                </div>

                <!-- Filter Chips Carousel -->
                <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
                    ${filterOptions.map(f => `
                        <button class="feed-filter-chip ${this.currentFilter === f.key ? 'active' : ''}" 
                                onclick="emergencyFeedView.setFilter('${f.key}')">
                            ${f.label}
                        </button>
                    `).join('')}
                </div>

                <!-- Emergency Cards Grid -->
                ${alerts.length === 0 ? `
                    <div class="card p-10 text-center bg-slate-900 border border-slate-800 font-mono text-xs text-slate-400">
                        No emergency reports match the selected filter "${this.currentFilter}".
                    </div>
                ` : `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        ${alerts.map(alert => this.renderEmergencyCard(alert)).join('')}
                    </div>
                `}
            </div>
        `;
    }

    renderEmergencyCard(alert) {
        const priority = sosService.getEffectivePriority(alert);
        const prioConfig = PRIORITIES[priority] || PRIORITIES.MEDIUM;
        const disaster = DISASTER_TYPES[alert.disasterType] || DISASTER_TYPES.Other;
        const dangerScore = sosService.getEffectiveDangerScore(alert);
        const isIncident = alert.reportType === "INCIDENT";
        const hasMedical = alert.injured || alert.aiAnalysis?.extractedEntities?.medicalEmergency;
        const hasVulnerable = alert.vulnerable || alert.aiAnalysis?.extractedEntities?.vulnerablePerson;
        const isNonEnglish = alert.sourceLanguage !== "en" && alert.detectedLanguage !== "English";

        // Danger color
        let dangerColor = "#22c55e";
        let dangerTier = "LOW";
        if (dangerScore >= 81) { dangerColor = "#ef4444"; dangerTier = "CRITICAL"; }
        else if (dangerScore >= 61) { dangerColor = "#f97316"; dangerTier = "HIGH"; }
        else if (dangerScore >= 31) { dangerColor = "#eab308"; dangerTier = "MEDIUM"; }

        // Time ago calculation
        const minutesAgo = Math.max(1, Math.round((new Date() - new Date(alert.timestamp)) / 60000));
        const timeAgoStr = minutesAgo > 60 ? `${Math.round(minutesAgo/60)}h ago` : `${minutesAgo} mins ago`;

        return `
            <div class="card emergency-card p-3.5 bg-slate-900/90 border border-slate-700 hover:border-slate-500 transition flex flex-col justify-between"
                 style="border-top: 3px solid ${prioConfig.color};">
                
                <div>
                    <!-- Top Badge Bar -->
                    <div class="flex items-center justify-between mb-2 flex-wrap gap-1">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="${isIncident ? 'report-type-badge-incident' : 'report-type-badge-sos'}">
                                ${isIncident ? '📢 INCIDENT' : '🚨 SOS'}
                            </span>
                            <span class="font-mono font-bold text-xs text-white">${alert.id}</span>
                            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isNonEnglish ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' : 'bg-slate-800 text-slate-300 border border-slate-700'}">
                                🌐 ${alert.detectedLanguage || (alert.sourceLanguage === 'en' ? 'English' : 'Regional')}
                            </span>
                        </div>
                        <div class="flex items-center gap-1">
                            ${alert.isReviewed ? `
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                                    ✓ REVIEWED
                                </span>
                            ` : `
                                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40 animate-pulse">
                                    UNREVIEWED
                                </span>
                            `}
                            <span class="badge ${prioConfig.badgeClass}">
                                ${priority === 'CRITICAL' ? '<span class="pulse-dot"></span>' : ''}
                                ${priority}
                            </span>
                        </div>
                    </div>

                    <!-- Citizen Contact Banner -->
                    <div class="flex items-center justify-between text-[11px] font-mono bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700/80 mb-2 text-slate-300">
                        <span>👤 <strong class="text-white">${this.escapeHtml(alert.contactName || 'Citizen')}</strong></span>
                        <a href="tel:${this.escapeHtml(alert.contactPhone || '+91 94471 00000')}" class="text-cyan-400 hover:text-cyan-300 font-bold hover:underline flex items-center gap-1" onclick="event.stopPropagation()">
                            <span>📞</span> <span>${this.escapeHtml(alert.contactPhone || '+91 94471 00000')}</span>
                        </a>
                    </div>

                    <!-- Original Message Body -->
                    <div class="mb-2">
                        <div class="flex items-center justify-between text-[10px] uppercase font-mono text-slate-400 mb-0.5">
                            <span>Original Citizen Message (${alert.detectedLanguage || 'Original'}):</span>
                            ${isNonEnglish ? '<span class="text-cyan-400 font-bold">Native Text</span>' : ''}
                        </div>
                        <p class="text-xs text-white italic font-medium bg-slate-800/50 p-2.5 rounded border-l-2 border-amber-400">
                            "${this.escapeHtml(alert.originalMessage || alert.message)}"
                        </p>
                    </div>

                    <!-- Real Translation Box (Side-by-Side or Below) -->
                    ${isNonEnglish ? `
                        <div class="mb-2.5 p-2 rounded bg-slate-950/90 border border-slate-800 space-y-1.5">
                            <div class="flex items-center justify-between flex-wrap gap-1">
                                <span class="text-[10px] uppercase font-mono text-slate-300 font-bold flex items-center gap-1">
                                    <span>🇬🇧</span> <span>English Translation</span>
                                </span>
                                <div class="flex items-center gap-1.5">
                                    ${alert.translationStatus === 'NOT_TRANSLATED' || !alert.translationStatus ? `
                                        <button class="btn btn-secondary btn-xs text-cyan-300 border-cyan-500/50 hover:bg-cyan-950 flex items-center gap-1"
                                                onclick="emergencyFeedView.translateItem('${alert.id}')">
                                            <span>🌐</span> <span>Translate to English</span>
                                        </button>
                                    ` : alert.translationStatus === 'TRANSLATING' ? `
                                        <span class="text-[10px] font-mono text-amber-400 flex items-center gap-1 animate-pulse">
                                            <span class="animate-spin inline-block">⏳</span> Translating...
                                        </span>
                                    ` : alert.translationStatus === 'TRANSLATED' ? `
                                        <span class="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                                            ✓ Translated
                                        </span>
                                        <button class="btn btn-secondary btn-xs text-[10px] px-1.5 py-0.5 text-slate-400 hover:text-white" onclick="emergencyFeedView.translateItem('${alert.id}', true)" title="Re-translate">
                                            ↺
                                        </button>
                                    ` : `
                                        <button class="btn btn-secondary btn-xs text-rose-300 border-rose-500/40 hover:bg-rose-950 text-[10px] flex items-center gap-1"
                                                onclick="emergencyFeedView.translateItem('${alert.id}', true)">
                                            <span>⚠️ Failed</span> <span>Retry ↺</span>
                                        </button>
                                    `}
                                </div>
                            </div>

                            ${alert.translationStatus === 'TRANSLATED' && alert.translatedMessage ? `
                                <div class="text-xs text-emerald-200 font-medium italic p-2 bg-emerald-950/20 rounded border border-emerald-500/30">
                                    "${this.escapeHtml(alert.translatedMessage)}"
                                </div>
                            ` : alert.translationStatus === 'NOT_TRANSLATED' || !alert.translationStatus ? `
                                <div class="text-[11px] font-mono text-slate-500 italic">
                                    Click "Translate to English" to convert native ${alert.detectedLanguage} transmission.
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    <!-- Key Telemetry Details -->
                    <div class="space-y-1 text-xs font-mono bg-slate-800/60 p-2.5 rounded border border-slate-700/60 mb-2.5">
                        <div class="flex items-center justify-between text-slate-300">
                            <span class="text-slate-400">📍 Location:</span>
                            <span class="font-bold text-white truncate max-w-[180px]">${this.escapeHtml(alert.address)}</span>
                        </div>
                        <div class="flex items-center justify-between text-slate-300">
                            <span class="text-slate-400">👥 People:</span>
                            <span class="font-bold text-cyan-300">${alert.peopleCount || 1}</span>
                        </div>
                        <div class="flex items-center justify-between text-slate-300">
                            <span class="text-slate-400">🩺 Medical Emergency:</span>
                            <span class="font-bold ${hasMedical ? 'text-rose-400' : 'text-slate-400'}">${hasMedical ? 'YES' : 'NO'}</span>
                        </div>
                        <div class="flex items-center justify-between text-slate-300">
                            <span class="text-slate-400">⚠️ Vulnerable Person:</span>
                            <span class="font-bold ${hasVulnerable ? 'text-amber-400' : 'text-slate-400'}">${hasVulnerable ? 'YES' : 'NO'}</span>
                        </div>
                        <div class="flex items-center justify-between text-slate-300">
                            <span class="text-slate-400">🕐 Received:</span>
                            <span class="text-slate-300">${timeAgoStr}</span>
                        </div>
                        <div class="flex items-center justify-between pt-1 border-t border-slate-700">
                            <span class="text-slate-400">⚠️ Danger Score:</span>
                            <span class="font-bold text-sm" style="color: ${dangerColor};">${dangerScore}/100</span>
                        </div>
                    </div>

                    <!-- Danger Score Progress Bar -->
                    <div class="danger-score-bar-bg mb-3">
                        <div class="danger-score-bar-fill" style="width: ${dangerScore}%; background: ${dangerColor};"></div>
                    </div>
                </div>

                <!-- Card Action Buttons -->
                <div class="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800">
                    <button class="btn btn-secondary btn-xs" onclick="detailModal.openForAlert('${alert.id}')">
                        VIEW DETAILS
                    </button>
                    ${!alert.isReviewed ? `
                        <button class="btn btn-secondary btn-xs text-amber-400 border-amber-500/40 hover:bg-amber-950 font-bold" onclick="emergencyFeedView.markReviewed('${alert.id}')">
                            ✓ REVIEW
                        </button>
                    ` : `
                        <button class="btn btn-secondary btn-xs text-emerald-400 font-bold" disabled>
                            ✓ ACTIONED
                        </button>
                    `}
                    ${alert.status !== 'RESOLVED' ? `
                        <button class="btn btn-primary btn-xs" onclick="emergencyFeedView.quickAssign('${alert.id}')">
                            ${alert.assignedTeam ? 'REASSIGN' : 'ASSIGN'}
                        </button>
                    ` : `
                        <div class="text-center text-[11px] font-mono text-emerald-400 font-bold py-1">
                            ✓ RESOLVED
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    translateItem(alertId, forceRetry = false) {
        sosService.translateAlert(alertId, forceRetry);
        this.render();
    }

    markReviewed(alertId) {
        sosService.markAsReviewed(alertId, "Officer #01");
        this.render();
    }

    toggleAutoTranslate() {
        sosService.setAutoTranslate(!sosService.isAutoTranslateEnabled());
        this.render();
    }

    quickAssign(alertId) {
        detailModal.openForAlert(alertId);
    }

    quickResolve(alertId) {
        if (confirm(`Mark emergency ${alertId} as RESOLVED?`)) {
            sosService.updateStatus(alertId, "RESOLVED", "Officer #01");
            this.render();
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

const emergencyFeedView = new EmergencyFeedView();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EmergencyFeedView, emergencyFeedView };
}
