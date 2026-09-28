/**
 * Disaster Rescue Center - Main Application Coordinator
 * Enhanced for AI-DRIS: bootstraps sidebar navigation, 8-metric top statistics ticker,
 * Leaflet dark cartography, SIH demo controls, and reactive SSE/LocalStorage pipelines.
 */

class App {
    constructor() {
        this.clockInterval = null;
    }

    init() {
        console.log("Initializing AI-DRIS Command Operations Suite v" + CONFIG.VERSION);

        // 1. Initialize Components
        mapManager.init();
        alertPanel.init();
        detailModal.init();
        aiSummaryWidget.init();
        meshSimulator.init();
        analyticsModal.init();

        // New SIH Upgrade Components
        if (typeof sidebarNav !== 'undefined') sidebarNav.init();
        if (typeof emergencyFeedView !== 'undefined') emergencyFeedView.init();
        if (typeof sihDemoBar !== 'undefined') sihDemoBar.init();

        // 2. Setup Top 8-Metric Statistics & Live Tactical Clock
        this.updateStatsCounters(sosService.getStats());
        this.startLiveClock();

        // 3. Bind Top Bar Action Buttons
        this.bindTopBarEvents();

        // 4. Subscribe to stats updates
        sosService.on('stats-updated', (stats) => {
            this.updateStatsCounters(stats);
        });

        // 5. If first alert exists, select it
        const current = sosService.getSelectedAlert();
        if (current) {
            sosService.selectAlert(current.id);
        }

        // 6. Check if backend server is online
        this.probeBackendServer();
    }

    startLiveClock() {
        const clockEl = document.getElementById('live-clock');
        const updateClock = () => {
            if (!clockEl) return;
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0];
            const dateStr = now.toISOString().split('T')[0];
            clockEl.innerHTML = `<span class="text-white">${timeStr}</span> <span class="text-slate-400 text-xs">LOCAL | ${dateStr}</span>`;
        };
        updateClock();
        this.clockInterval = setInterval(updateClock, 1000);
    }

    /**
     * Update all 8 Command Centre Top Statistics:
     * 🔴 Active Emergencies
     * 🟠 High Priority Cases
     * 🟢 Resolved Cases
     * 👥 People at Risk
     * 🚑 Ambulances Available
     * 👨‍🚒 Rescue Teams Available
     * 🏥 Hospitals / Available Beds
     * 📡 Network / Mesh Status
     */
    updateStatsCounters(stats) {
        // 1. Active Emergencies
        const activeEl = document.getElementById('stat-active-emergencies');
        if (activeEl) activeEl.innerText = stats.activeEmergencies;

        // 2. High Priority Cases (Critical + High)
        const highPriorityEl = document.getElementById('stat-high-priority');
        if (highPriorityEl) highPriorityEl.innerText = stats.highPriorityCases;

        // 3. Resolved Cases
        const resolvedEl = document.getElementById('stat-resolved-cases');
        if (resolvedEl) resolvedEl.innerText = stats.resolvedCases;

        // 4. People at Risk
        const peopleEl = document.getElementById('stat-people-at-risk');
        if (peopleEl) peopleEl.innerText = stats.peopleInDanger;

        // 5. Ambulances Available
        const ambEl = document.getElementById('stat-ambulances');
        if (ambEl) ambEl.innerText = stats.ambulancesAvailable || 6;

        // 6. Rescue Teams Available
        const teamsEl = document.getElementById('stat-rescue-teams');
        if (teamsEl) teamsEl.innerText = stats.rescueTeamsAvailable || 3;

        // 7. Hospital Beds Available
        const bedsEl = document.getElementById('stat-hospital-beds');
        if (bedsEl) bedsEl.innerText = stats.hospitalBedsAvailable || 24;

        // 8. Network / Mesh Status
        const netEl = document.getElementById('stat-network-status');
        if (netEl) {
            if (stats.networkStatus === 'OFFLINE') {
                netEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500 inline-block"></span> MESH ONLY`;
                netEl.className = "text-red-400 font-extrabold text-xs font-mono";
            } else {
                netEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span> MESH ACTIVE`;
                netEl.className = "text-emerald-400 font-extrabold text-xs font-mono";
            }
        }

        // Backward compatibility counters (if still referenced)
        const critEl = document.getElementById('stat-critical');
        const highEl = document.getElementById('stat-high');
        const medEl = document.getElementById('stat-medium');
        const lowEl = document.getElementById('stat-low');
        const zonesEl = document.getElementById('stat-zones');

        if (critEl) critEl.innerText = stats.critical;
        if (highEl) highEl.innerText = stats.high;
        if (medEl) medEl.innerText = stats.medium;
        if (lowEl) lowEl.innerText = stats.low;
        if (zonesEl) zonesEl.innerText = stats.activeZones;
    }

    bindTopBarEvents() {
        // Simulate SOS Button
        const simBtn = document.getElementById('btn-simulate-sos');
        if (simBtn) {
            simBtn.addEventListener('click', () => {
                meshSimulator.open();
            });
        }

        // Analytics Button
        const analyticsBtn = document.getElementById('btn-analytics');
        if (analyticsBtn) {
            analyticsBtn.addEventListener('click', () => {
                analyticsModal.open();
            });
        }

        // Audio Toggle Button
        const audioBtn = document.getElementById('btn-audio-toggle');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => {
                sosService.audioEnabled = !sosService.audioEnabled;
                audioBtn.innerHTML = sosService.audioEnabled ? '🔔 Sound: ON' : '🔕 Sound: OFF';
                audioBtn.classList.toggle('text-emerald-400', sosService.audioEnabled);
                audioBtn.classList.toggle('text-slate-400', !sosService.audioEnabled);
            });
        }

        // Reset Demo Data Button
        const resetBtn = document.getElementById('btn-reset-demo');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm("Reset dashboard back to standard demo data?")) {
                    sosService.resetToDemoData();
                }
            });
        }

        // Fit Map Bounds Button
        const fitMapBtn = document.getElementById('btn-fit-map');
        if (fitMapBtn) {
            fitMapBtn.addEventListener('click', () => {
                mapManager.fitAllMarkers();
            });
        }
    }

    async probeBackendServer() {
        const badge = document.getElementById('backend-status-badge');
        try {
            const resp = await fetch('/api/stats', { method: 'GET' });
            if (resp.ok) {
                if (badge) {
                    badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span> SERVER CONNECTED`;
                    badge.className = "text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30";
                }
            }
        } catch (e) {
            // Running in zero-setup standalone mode (file:// or static server)
            if (badge) {
                badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span> STANDALONE MESH SIMULATOR`;
                badge.className = "text-[11px] font-mono text-cyan-400 flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30";
            }
        }
    }
}

const app = new App();
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
