/**
 * Disaster Rescue Center - AI Disaster Situation Summary Widget
 * Synthesizes aggregate telemetry into executive situational intelligence.
 */

class AISituationSummaryWidget {
    constructor(containerId = "ai-summary-container") {
        this.containerId = containerId;
        this.isExpanded = false;
    }

    init() {
        sosService.on('alerts-updated', () => {
            this.render();
        });

        sosService.on('stats-updated', () => {
            this.render();
        });

        this.render();
    }

    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        this.render();
    }

    generateSummaryText(alerts, stats, zones) {
        if (!alerts || alerts.length === 0) {
            return "No active emergency reports logged in the response theater. All sectors clear.";
        }

        // Find dominant disaster
        let dominantDisaster = "Unknown";
        let maxCount = 0;
        Object.entries(stats.disasterCounts || {}).forEach(([type, count]) => {
            if (count > maxCount) {
                maxCount = count;
                dominantDisaster = type;
            }
        });

        // Find most affected zone
        let mostAffectedZone = "General Theater";
        let maxZoneReports = 0;
        zones.forEach(z => {
            if (z.reportsCount > maxZoneReports) {
                maxZoneReports = z.reportsCount;
                mostAffectedZone = z.name;
            }
        });

        // Trapped count
        const trappedCount = alerts.filter(a =>
            (a.emergencyType && a.emergencyType.toLowerCase().includes('trap')) ||
            (a.message && a.message.toLowerCase().includes('trap'))
        ).length;

        // Build executive summary narrative
        return `${stats.total} SOS alerts have been received across the mesh network. Most alerts are concentrated in ${mostAffectedZone}. ${dominantDisaster} is currently the dominant disaster (${maxCount} active incidents). ${stats.critical} alerts are classified as CRITICAL, including ${trappedCount} confirmed reports of trapped victims. Immediate prioritization of waterborne and heavy extrication assets is recommended.`;
    }

    generateSuggestedRescuePriority(stats, dominantDisaster) {
        if (stats.critical > 0) {
            return `Immediate priority: Deploy amphibious extraction teams and air assets to ${stats.critical} CRITICAL incidents with life-threatening trapped or medical reports. Maintain secondary sweep of HIGH-priority elderly/infant locations.`;
        }
        if (stats.high > 0) {
            return `Stage support teams for assisted evacuations and delivery of emergency potable water and medical supplies across active zones.`;
        }
        return `Monitor perimeter mesh nodes and sustain non-critical relief supplies staging.`;
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const alerts = sosService.getAllAlerts();
        const stats = sosService.getStats();
        const zones = disasterZoneService.calculateZones(alerts);

        let dominantDisaster = "Flood";
        let maxDisasterCount = 0;
        Object.entries(stats.disasterCounts || {}).forEach(([type, count]) => {
            if (count > maxDisasterCount) {
                maxDisasterCount = count;
                dominantDisaster = type;
            }
        });

        let mostAffectedZone = zones.length > 0 ? zones[0].name : "Northern Basin";
        let maxZReports = 0;
        zones.forEach(z => {
            if (z.reportsCount > maxZReports) {
                maxZReports = z.reportsCount;
                mostAffectedZone = z.name;
            }
        });

        const summaryText = this.generateSummaryText(alerts, stats, zones);
        const suggestedStrategy = this.generateSuggestedRescuePriority(stats, dominantDisaster);

        // If collapsed: show sleek 1-line tactical ticker bar to free up map space
        if (!this.isExpanded) {
            container.innerHTML = `
                <div class="ai-summary-pill flex items-center justify-between px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-lg cursor-pointer hover:border-cyan-400 transition" onclick="aiSummaryWidget.toggleExpand()">
                    <div class="flex items-center gap-2 overflow-hidden">
                        <span class="text-base">🧠</span>
                        <span class="text-xs font-bold text-white font-mono uppercase tracking-wider shrink-0">AI Briefing:</span>
                        <span class="text-xs text-slate-300 truncate font-sans">
                            ${stats.total} alerts • Dominant: <strong class="text-cyan-400">${dominantDisaster}</strong> • <strong class="text-red-400">${stats.critical} Critical</strong> • Area: <strong class="text-amber-400">${mostAffectedZone}</strong>
                        </span>
                    </div>
                    <div class="flex items-center gap-2 shrink-0 ml-3">
                        <span class="text-[10px] text-cyan-400 font-mono hidden sm:inline">Tap for Full Report ▾</span>
                        <span class="text-xs text-slate-400">▾</span>
                    </div>
                </div>
            `;
            return;
        }

        // If expanded: show full report with smooth collapse button
        container.innerHTML = `
            <div class="ai-summary-expanded card p-3.5 bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-lg shadow-2xl relative overflow-hidden transition">
                <!-- Header -->
                <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div class="flex items-center gap-2">
                        <span class="text-lg">🧠</span>
                        <div>
                            <h3 class="font-bold text-white text-xs md:text-sm tracking-wide flex items-center gap-2 font-mono">
                                AI DISASTER SITUATION SUMMARY
                                <span class="badge bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-[9px]">LIVE SYNTHESIS</span>
                            </h3>
                            <span class="text-[10px] text-amber-400/90 font-mono">
                                ⚠️ AI-generated analysis — Human verification required.
                            </span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button class="btn btn-secondary btn-xs" onclick="event.stopPropagation(); aiSummaryWidget.refresh()" title="Re-analyze">
                            🔄 Re-Analyze
                        </button>
                        <button class="btn btn-secondary btn-xs text-slate-300" onclick="aiSummaryWidget.toggleExpand()" title="Collapse to free up space">
                            Collapse ▴
                        </button>
                    </div>
                </div>

                <!-- Executive Narrative -->
                <div class="my-2 p-2.5 rounded bg-slate-800/80 border-l-2 border-cyan-400 text-xs text-slate-200 leading-relaxed font-sans">
                    "${summaryText}"
                </div>

                <!-- Key Metrics Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                    <div class="bg-slate-800/50 p-2 rounded border border-slate-700/60">
                        <span class="text-slate-400 text-[10px] block">DOMINANT DISASTER</span>
                        <span class="text-cyan-400 font-bold text-xs flex items-center gap-1">
                            ${DISASTER_TYPES[dominantDisaster]?.icon || '🌊'} ${dominantDisaster}
                        </span>
                    </div>

                    <div class="bg-slate-800/50 p-2 rounded border border-slate-700/60">
                        <span class="text-slate-400 text-[10px] block">CRITICAL CASUALTIES</span>
                        <span class="text-red-400 font-bold text-xs flex items-center gap-1">
                            🔴 ${stats.critical} Emergencies
                        </span>
                    </div>

                    <div class="bg-slate-800/50 p-2 rounded border border-slate-700/60">
                        <span class="text-slate-400 text-[10px] block">MOST AFFECTED AREA</span>
                        <span class="text-amber-400 font-bold text-[11px] truncate block" title="${mostAffectedZone}">
                            📍 ${mostAffectedZone}
                        </span>
                    </div>

                    <div class="bg-slate-800/50 p-2 rounded border border-slate-700/60">
                        <span class="text-slate-400 text-[10px] block">ACTIVE DISASTER ZONES</span>
                        <span class="text-emerald-400 font-bold text-xs">
                            🌪️ ${stats.activeZones} Identified
                        </span>
                    </div>
                </div>

                <!-- Suggested Strategy Bar -->
                <div class="mt-2 pt-2 border-t border-slate-800 flex items-start gap-2 text-xs">
                    <span class="badge bg-purple-950 text-purple-300 border border-purple-500/40 shrink-0 text-[9px]">
                        TACTICAL DIRECTIVE
                    </span>
                    <span class="text-slate-300 text-[11px] leading-snug">
                        ${suggestedStrategy}
                    </span>
                </div>
            </div>
        `;
    }

    refresh() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Briefly show tactical analyzing state
        container.innerHTML = `
            <div class="card p-6 bg-slate-900 border border-cyan-500/30 text-center">
                <div class="inline-block animate-spin text-2xl mb-2">⚙️</div>
                <div class="text-xs text-cyan-300 font-mono">Synthesizing multi-hop telemetry and disaster coordinates...</div>
            </div>
        `;

        setTimeout(() => {
            this.render();
        }, 500);
    }
}

const aiSummaryWidget = new AISituationSummaryWidget();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AISituationSummaryWidget, aiSummaryWidget };
}
