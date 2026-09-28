/**
 * Disaster Rescue Center - Tactical Analytics Component
 * Renders statistical breakdowns, priority distributions, and disaster casualty graphs.
 */

class AnalyticsModal {
    constructor(modalId = "analytics-modal") {
        this.modalId = modalId;
    }

    init() {
        this.renderModal();
    }

    open() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.remove('hidden');
            this.renderCharts();
        }
    }

    close() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    renderModal() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal-backdrop" onclick="analyticsModal.close()">
                <div class="modal-card max-w-4xl w-full" onclick="event.stopPropagation()">
                    <div class="modal-header flex items-center justify-between pb-3 border-b border-slate-700">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">📊</span>
                            <div>
                                <h3 class="font-bold text-white text-base">Disaster Theater Analytics & Telemetry</h3>
                                <p class="text-[11px] text-slate-400 font-mono">Real-time incident distribution, priority triage, and resolution velocity</p>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-xs" onclick="analyticsModal.close()">✕</button>
                    </div>

                    <div class="modal-body py-4 space-y-4 max-h-[75vh] overflow-y-auto pr-2" id="analytics-content">
                        <!-- Chart Grid will be rendered dynamically -->
                    </div>

                    <div class="modal-footer pt-3 border-t border-slate-700 flex items-center justify-between">
                        <span class="text-xs text-slate-400 font-mono">Live telemetry synced across all mesh gateways.</span>
                        <button class="btn btn-secondary btn-sm" onclick="analyticsModal.close()">Close Analytics</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderCharts() {
        const container = document.getElementById('analytics-content');
        if (!container) return;

        const alerts = sosService.getAllAlerts();
        const stats = sosService.getStats();
        const zones = disasterZoneService.calculateZones(alerts);

        // Calculate disaster breakdown
        const disasterEntries = Object.entries(stats.disasterCounts || {});

        // Calculate priority percentages
        const total = stats.total || 1;
        const critPct = Math.round((stats.critical / total) * 100);
        const highPct = Math.round((stats.high / total) * 100);
        const medPct = Math.round((stats.medium / total) * 100);
        const lowPct = Math.round((stats.low / total) * 100);

        // Calculate resolved ratio
        const resolvedPct = Math.round((stats.resolved / total) * 100);
        const activePct = 100 - resolvedPct;

        container.innerHTML = `
            <!-- Top Summary Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                <div class="card p-2.5 bg-slate-800/80 border border-slate-700">
                    <span class="text-slate-400 block text-[11px]">TOTAL SOS PACKETS</span>
                    <span class="text-xl font-bold text-white">${stats.total}</span>
                    <span class="text-[10px] text-cyan-400 block mt-0.5">Ingested via Mesh</span>
                </div>
                <div class="card p-2.5 bg-slate-800/80 border border-slate-700">
                    <span class="text-slate-400 block text-[11px]">CRITICAL CASUALTIES</span>
                    <span class="text-xl font-bold text-red-400">${stats.critical}</span>
                    <span class="text-[10px] text-red-400/80 block mt-0.5">${critPct}% of all incidents</span>
                </div>
                <div class="card p-2.5 bg-slate-800/80 border border-slate-700">
                    <span class="text-slate-400 block text-[11px]">PEOPLE IN DANGER</span>
                    <span class="text-xl font-bold text-amber-400">${stats.totalPeople}</span>
                    <span class="text-[10px] text-amber-400/80 block mt-0.5">Reported Victims</span>
                </div>
                <div class="card p-2.5 bg-slate-800/80 border border-slate-700">
                    <span class="text-slate-400 block text-[11px]">RESOLUTION RATE</span>
                    <span class="text-xl font-bold text-emerald-400">${resolvedPct}%</span>
                    <span class="text-[10px] text-emerald-400/80 block mt-0.5">${stats.resolved} Rescued / ${stats.active} Active</span>
                </div>
            </div>

            <!-- Two-Column Chart Sections -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- 1. Priority Breakdown Bar -->
                <div class="card p-3 bg-slate-900/90 border border-slate-700">
                    <h4 class="font-bold text-white text-xs uppercase font-mono mb-2 flex items-center justify-between">
                        <span>Emergencies by Priority</span>
                        <span class="text-[11px] text-slate-400">Total: ${stats.total}</span>
                    </h4>

                    <!-- Visual Segmented Bar -->
                    <div class="h-3 w-full rounded-full overflow-hidden flex mb-3 bg-slate-800">
                        <div style="width: ${critPct}%; background-color: #ef4444;" title="Critical: ${stats.critical} (${critPct}%)"></div>
                        <div style="width: ${highPct}%; background-color: #f97316;" title="High: ${stats.high} (${highPct}%)"></div>
                        <div style="width: ${medPct}%; background-color: #eab308;" title="Medium: ${stats.medium} (${medPct}%)"></div>
                        <div style="width: ${lowPct}%; background-color: #22c55e;" title="Low: ${stats.low} (${lowPct}%)"></div>
                    </div>

                    <div class="space-y-2 text-xs font-mono">
                        <div class="flex items-center justify-between p-1.5 rounded bg-slate-800/40">
                            <span class="flex items-center gap-1.5 text-red-400">
                                <span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                                CRITICAL
                            </span>
                            <span class="text-white font-bold">${stats.critical} alerts (${critPct}%)</span>
                        </div>
                        <div class="flex items-center justify-between p-1.5 rounded bg-slate-800/40">
                            <span class="flex items-center gap-1.5 text-orange-400">
                                <span class="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
                                HIGH
                            </span>
                            <span class="text-white font-bold">${stats.high} alerts (${highPct}%)</span>
                        </div>
                        <div class="flex items-center justify-between p-1.5 rounded bg-slate-800/40">
                            <span class="flex items-center gap-1.5 text-yellow-400">
                                <span class="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
                                MEDIUM
                            </span>
                            <span class="text-white font-bold">${stats.medium} alerts (${medPct}%)</span>
                        </div>
                        <div class="flex items-center justify-between p-1.5 rounded bg-slate-800/40">
                            <span class="flex items-center gap-1.5 text-emerald-400">
                                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                                LOW
                            </span>
                            <span class="text-white font-bold">${stats.low} alerts (${lowPct}%)</span>
                        </div>
                    </div>
                </div>

                <!-- 2. Emergencies by Disaster Type -->
                <div class="card p-3 bg-slate-900/90 border border-slate-700">
                    <h4 class="font-bold text-white text-xs uppercase font-mono mb-2 flex items-center justify-between">
                        <span>Emergencies by Disaster Type</span>
                        <span class="text-[11px] text-slate-400">${disasterEntries.length} Types</span>
                    </h4>

                    <div class="space-y-2 text-xs font-mono">
                        ${disasterEntries.map(([type, count]) => {
                            const conf = DISASTER_TYPES[type] || DISASTER_TYPES.Other;
                            const pct = Math.round((count / total) * 100);
                            return `
                                <div>
                                    <div class="flex items-center justify-between text-xs mb-1">
                                        <span class="text-slate-300">${conf.icon} ${type}</span>
                                        <span class="text-white font-bold">${count} (${pct}%)</span>
                                    </div>
                                    <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div class="h-full rounded-full" style="width: ${pct}%; background-color: ${conf.color};"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- 3. Most Affected Disaster Zones -->
                <div class="card p-3 bg-slate-900/90 border border-slate-700">
                    <h4 class="font-bold text-white text-xs uppercase font-mono mb-2">
                        Most Affected Tactical Zones
                    </h4>

                    <div class="space-y-2 text-xs font-mono">
                        ${zones.map(z => `
                            <div class="p-2 rounded bg-slate-800/60 border border-slate-700/60">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="font-bold text-white">${z.name}</span>
                                    <span class="text-cyan-400 font-bold">${z.reportsCount} Reports</span>
                                </div>
                                <div class="flex items-center justify-between text-[11px] text-slate-400">
                                    <span>🔴 Critical: <strong class="text-red-400">${z.criticalCount}</strong></span>
                                    <span>🟠 High: <strong class="text-orange-400">${z.highCount}</strong></span>
                                    <span>👥 Population: <strong class="text-white">${z.affectedPopulation}</strong></span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 4. Operational Status & Resolved vs Active -->
                <div class="card p-3 bg-slate-900/90 border border-slate-700">
                    <h4 class="font-bold text-white text-xs uppercase font-mono mb-2">
                        Rescue Operations Progress
                    </h4>

                    <div class="space-y-2 text-xs font-mono">
                        <div class="p-2 rounded bg-slate-800/40">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-slate-300">Active In-Progress Operations</span>
                                <span class="text-amber-400 font-bold">${stats.active} Alerts</span>
                            </div>
                            <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full bg-amber-500 rounded-full" style="width: ${activePct}%;"></div>
                            </div>
                        </div>

                        <div class="p-2 rounded bg-slate-800/40">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-slate-300">Resolved & Evacuated</span>
                                <span class="text-emerald-400 font-bold">${stats.resolved} Alerts</span>
                            </div>
                            <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full bg-emerald-500 rounded-full" style="width: ${resolvedPct}%;"></div>
                            </div>
                        </div>

                        <div class="mt-3 p-2 rounded bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                            <span>📡 Average Mesh Propagation: <strong>2.8 Hops</strong> across offline Android ad-hoc clusters.</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

const analyticsModal = new AnalyticsModal();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnalyticsModal, analyticsModal };
}
