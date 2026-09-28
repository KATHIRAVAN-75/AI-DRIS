/**
 * Disaster Rescue Center - Sidebar Navigation Controller
 * Handles seamless switching between Command Dashboard, Emergency Feed,
 * AI Analysis Hub, Teams, Live Map, Hospitals, Incidents, History, and Network Status.
 */

class SidebarNav {
    constructor() {
        this.currentView = "dashboard";
        this.isCollapsed = false;
        this.navItems = [
            { id: "dashboard", label: "Dashboard", icon: "🏠", badgeKey: "active" },
            { id: "feed", label: "Emergency Feed", icon: "🚨", badgeKey: "total" },
            { id: "ai-hub", label: "AI Analysis", icon: "🧠", badgeKey: null },
            { id: "teams", label: "Rescue Teams", icon: "👨‍🚒", badgeKey: "teams" },
            { id: "map", label: "Live Tactical Map", icon: "🗺️", badgeKey: null },
            { id: "hospitals", label: "Hospitals", icon: "🏥", badgeKey: "beds" },
            { id: "incidents", label: "Incident Reports", icon: "📢", badgeKey: "incidents" },
            { id: "history", label: "Incident History", icon: "📋", badgeKey: "resolved" },
            { id: "network", label: "Network & Mesh", icon: "📡", badgeKey: null },
            { id: "settings", label: "Settings / Sandbox", icon: "⚙️", badgeKey: null }
        ];
    }

    init() {
        this.renderSidebar();
        this.bindEvents();

        // Listen for URL hash changes (e.g. #/feed, #/teams, #/hospitals)
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#/', '').replace('#', '');
            if (hash && this.navItems.some(item => item.id === hash)) {
                this.switchView(hash, false);
            }
        });

        // Initialize view based on initial hash or default to dashboard
        const initialHash = window.location.hash.replace('#/', '').replace('#', '');
        if (initialHash && this.navItems.some(item => item.id === initialHash)) {
            this.switchView(initialHash, false);
        } else {
            this.switchView('dashboard', false);
        }

        // Subscribe to stats updates to refresh sidebar badges
        sosService.on('stats-updated', (stats) => {
            this.updateBadges(stats);
        });
    }

    renderSidebar() {
        const sidebarContainer = document.getElementById('command-sidebar-container');
        if (!sidebarContainer) return;

        const stats = sosService.getStats();

        sidebarContainer.innerHTML = `
            <aside id="main-sidebar" class="command-sidebar ${this.isCollapsed ? 'collapsed' : ''}">
                <div>
                    <!-- Sidebar Header / Brand -->
                    <div class="p-3 border-b border-slate-800 flex items-center justify-between">
                        <div class="flex items-center gap-2 overflow-hidden">
                            <div class="w-7 h-7 rounded bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sm shrink-0">
                                🛡️
                            </div>
                            <div class="sidebar-text">
                                <div class="text-xs font-black font-mono tracking-wider text-white">AI-DRIS COMMAND</div>
                                <div class="text-[9px] font-mono text-cyan-400">SIH DEFENSE SUITE</div>
                            </div>
                        </div>
                        <button id="btn-toggle-sidebar" class="text-slate-400 hover:text-white text-xs p-1 rounded" title="Toggle Sidebar Collapse">
                            ${this.isCollapsed ? '➔' : '◀'}
                        </button>
                    </div>

                    <!-- Navigation Items List -->
                    <nav class="sidebar-nav-list">
                        ${this.navItems.map(item => {
                            const isActive = this.currentView === item.id;
                            let badgeHtml = '';
                            if (item.badgeKey === 'active') {
                                const count = stats.active || 15;
                                badgeHtml = `<span class="sidebar-badge bg-rose-950/80 text-rose-400 border border-rose-500/40">${count}</span>`;
                            } else if (item.badgeKey === 'total') {
                                const count = stats.total || 14;
                                badgeHtml = `<span class="sidebar-badge bg-slate-800 text-slate-300 border border-slate-700">${count}</span>`;
                            } else if (item.badgeKey === 'teams') {
                                const tCount = (typeof rescueTeamService !== 'undefined') ? rescueTeamService.getStats().available : 3;
                                badgeHtml = `<span class="sidebar-badge bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">${tCount}</span>`;
                            } else if (item.badgeKey === 'beds') {
                                const bCount = (typeof hospitalService !== 'undefined') ? hospitalService.getStats().totalAvailableBeds : 35;
                                badgeHtml = `<span class="sidebar-badge bg-purple-950/80 text-purple-300 border border-purple-500/40">${bCount}</span>`;
                            } else if (item.badgeKey === 'incidents') {
                                const iCount = (typeof sosService !== 'undefined') ? sosService.alerts.filter(a => a.reportType === 'INCIDENT').length : 5;
                                badgeHtml = `<span class="sidebar-badge bg-amber-950/80 text-amber-400 border border-amber-500/40">${iCount || 5}</span>`;
                            } else if (item.badgeKey === 'resolved') {
                                const rCount = stats.resolved || 1;
                                badgeHtml = `<span class="sidebar-badge bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">${rCount}</span>`;
                            }

                            return `
                                <a class="sidebar-nav-item ${isActive ? 'active' : ''}" data-view="${item.id}" href="#/${item.id}">
                                    <span class="sidebar-icon">${item.icon}</span>
                                    <span class="sidebar-text">${item.label}</span>
                                    ${badgeHtml}
                                </a>
                            `;
                        }).join('')}
                    </nav>
                </div>

                <!-- Public Web Gateways Quick Links (Victim SOS, Relief, Funds, Incident Report) -->
                <div class="p-2.5 border-t border-[#1a2742] bg-[#070b14]/90 space-y-1.5">
                    <div class="sidebar-text text-[10px] text-slate-400 uppercase font-mono tracking-wider mb-1">
                        Public & Management Portals:
                    </div>
                    <a href="sos.html" target="_blank" class="flex items-center gap-2 p-1.5 rounded bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-mono hover:bg-rose-900/40 transition">
                        <span>🚨</span>
                        <span class="sidebar-text">/sos Victim Portal ↗</span>
                    </a>
                    <a href="relief.html" target="_blank" class="flex items-center gap-2 p-1.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-mono hover:bg-emerald-900/40 transition">
                        <span>🤝</span>
                        <span class="sidebar-text">/relief Assistance ↗</span>
                    </a>
                    <a href="funds.html" target="_blank" class="flex items-center gap-2 p-1.5 rounded bg-sky-950/30 border border-sky-500/30 text-sky-300 text-xs font-mono hover:bg-sky-900/40 transition">
                        <span>💼</span>
                        <span class="sidebar-text">/funds Treasury ↗</span>
                    </a>
                    <a href="report.html" target="_blank" class="flex items-center gap-2 p-1.5 rounded bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs font-mono hover:bg-amber-900/40 transition">
                        <span>📢</span>
                        <span class="sidebar-text">/report Hazard ↗</span>
                    </a>
                    
                    <!-- Mesh Status Pill -->
                    <div class="sidebar-text flex items-center justify-between text-[10px] font-mono text-cyan-400 bg-cyan-950/30 p-1.5 rounded border border-cyan-500/20 mt-1.5">
                        <span class="flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"></span> MESH ACTIVE
                        </span>
                        <span>8 Nodes</span>
                    </div>
                </div>
            </aside>
        `;
    }

    bindEvents() {
        // Toggle Collapse Button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#btn-toggle-sidebar')) {
                this.isCollapsed = !this.isCollapsed;
                this.renderSidebar();
            }

            // Navigation Item Click
            const navLink = e.target.closest('.sidebar-nav-item');
            if (navLink) {
                e.preventDefault();
                const targetView = navLink.getAttribute('data-view');
                if (targetView) {
                    this.switchView(targetView);
                }
            }

            // Mobile Hamburger Button
            if (e.target.closest('#btn-mobile-menu')) {
                const sidebar = document.getElementById('main-sidebar');
                if (sidebar) sidebar.classList.toggle('mobile-open');
            }
        });
    }

    switchView(viewId, updateHash = true) {
        this.currentView = viewId;
        if (updateHash) {
            window.location.hash = `#/${viewId}`;
        }

        // Close mobile drawer if open
        const sidebar = document.getElementById('main-sidebar');
        if (sidebar) sidebar.classList.remove('mobile-open');

        // Update active class in sidebar items
        document.querySelectorAll('.sidebar-nav-item').forEach(el => {
            el.classList.toggle('active', el.getAttribute('data-view') === viewId);
        });

        // Hide all view containers
        const viewContainers = [
            'view-dashboard',
            'view-map',
            'view-feed',
            'view-alertshield',
            'view-bhashaalert',
            'view-relieffund',
            'view-volunteers',
            'view-camps',
            'view-admin',
            'view-ai-hub',
            'view-teams',
            'view-hospitals',
            'view-incidents',
            'view-history',
            'view-network',
            'view-settings'
        ];

        viewContainers.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });

        // Show selected view container
        const activeContainer = document.getElementById(`view-${viewId}`);
        if (activeContainer) {
            activeContainer.classList.remove('hidden');
        }

        // Trigger view-specific renderers
        if (viewId === 'dashboard') {
            if (mapManager && mapManager.map) {
                setTimeout(() => mapManager.map.invalidateSize(), 100);
            }
        } else if (viewId === 'map') {
            this.renderFullMapView();
        } else if (viewId === 'feed' && typeof emergencyFeedView !== 'undefined') {
            emergencyFeedView.render();
        } else if (viewId === 'alertshield' && typeof alertShieldView !== 'undefined') {
            alertShieldView.render();
        } else if (viewId === 'bhashaalert' && typeof bhashaAlertView !== 'undefined') {
            bhashaAlertView.render();
        } else if (viewId === 'relieffund' && typeof reliefFundView !== 'undefined') {
            reliefFundView.render();
        } else if (viewId === 'volunteers' && typeof volunteersView !== 'undefined') {
            volunteersView.render();
        } else if (viewId === 'camps' && typeof reliefCampsView !== 'undefined') {
            reliefCampsView.render();
        } else if (viewId === 'admin' && typeof adminDashboardView !== 'undefined') {
            adminDashboardView.render();
        } else if (viewId === 'teams') {
            this.renderTeamsView();
        } else if (viewId === 'hospitals') {
            this.renderHospitalsView();
        } else if (viewId === 'history') {
            this.renderHistoryView();
        } else if (viewId === 'ai-hub') {
            this.renderAiHubView();
        } else if (viewId === 'incidents') {
            this.renderIncidentsView();
        } else if (viewId === 'network') {
            this.renderNetworkView();
        } else if (viewId === 'settings') {
            this.renderSettingsView();
        }
    }

    updateBadges(stats) {
        // Re-render sidebar to reflect live badge counts
        this.renderSidebar();
    }

    // --- VIEW RENDERERS ---

    renderTeamsView() {
        const container = document.getElementById('view-teams');
        if (!container) return;

        const teams = rescueTeamService.getAllTeams();

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-7xl mx-auto">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                        <h2 class="text-base font-bold font-mono text-white flex items-center gap-2">
                            <span>👨‍🚒</span>
                            <span>TACTICAL RESCUE UNITS & FLEET MANAGEMENT</span>
                        </h2>
                        <p class="text-xs text-slate-400 font-mono">Real-time GPS telemetry, capability readiness, and mission status.</p>
                    </div>
                    <div class="flex items-center gap-2 font-mono text-xs">
                        <span class="bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded">
                            🟢 Available: ${teams.filter(t => t.status === 'AVAILABLE').length}
                        </span>
                        <span class="bg-rose-950 text-rose-400 border border-rose-500/40 px-2.5 py-1 rounded">
                            🔴 On Mission: ${teams.filter(t => t.status === 'ON MISSION').length}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${teams.map(team => {
                        let statusColor = "text-emerald-400 bg-emerald-950/60 border-emerald-500/40";
                        let statusIcon = "🟢";
                        if (team.status === "ON MISSION") {
                            statusColor = "text-rose-400 bg-rose-950/60 border-rose-500/40";
                            statusIcon = "🔴";
                        } else if (team.status === "STANDBY") {
                            statusColor = "text-amber-400 bg-amber-950/60 border-amber-500/40";
                            statusIcon = "🟠";
                        } else if (team.status === "OFFLINE") {
                            statusColor = "text-slate-400 bg-slate-900 border-slate-700";
                            statusIcon = "⚫";
                        }

                        return `
                            <div class="card p-3.5 bg-slate-900/90 border border-slate-700 hover:border-slate-500 transition">
                                <div class="flex items-start justify-between mb-2">
                                    <div class="flex items-center gap-2.5">
                                        <div class="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                                            ${team.icon}
                                        </div>
                                        <div>
                                            <h3 class="font-bold text-white text-sm">${team.name}</h3>
                                            <div class="text-[11px] text-slate-400 font-mono">${team.type} • 👥 ${team.personnel} Members</div>
                                        </div>
                                    </div>
                                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${statusColor}">
                                        ${statusIcon} ${team.status}
                                    </span>
                                </div>

                                <div class="space-y-1.5 text-xs font-mono my-3 bg-slate-800/50 p-2 rounded">
                                    <div class="flex justify-between">
                                        <span class="text-slate-400">Vehicle / Unit:</span>
                                        <span class="text-white">${team.vehicle || 'All-Terrain Transport'}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-400">Position GPS:</span>
                                        <span class="text-cyan-300 font-bold">${team.latitude.toFixed(4)}, ${team.longitude.toFixed(4)}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-400">Comms Relay:</span>
                                        <span class="text-slate-300">${team.contactFreq}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-slate-400">Current Mission:</span>
                                        <span class="${team.currentAssignment ? 'text-amber-300 font-bold' : 'text-slate-500'}">
                                            ${team.currentAssignment || 'None (Standby)'}
                                        </span>
                                    </div>
                                </div>

                                <div class="text-[11px] text-slate-400 font-mono mb-3">
                                    <span class="block text-slate-500 uppercase text-[10px]">Equipment Inventory:</span>
                                    <span class="text-slate-300">${team.equipment.join(", ")}</span>
                                </div>

                                <div class="flex items-center gap-2 pt-2 border-t border-slate-800">
                                    <button class="btn btn-secondary btn-xs flex-1" onclick="sidebarNav.dispatchUnitModal('${team.id}')">
                                        Manual Dispatch
                                    </button>
                                    <button class="btn ${team.status === 'AVAILABLE' ? 'btn-primary' : 'btn-secondary'} btn-xs" onclick="sidebarNav.toggleTeamStatus('${team.id}')">
                                        ${team.status === 'AVAILABLE' ? 'Set Standby' : 'Set Available'}
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderHospitalsView() {
        const container = document.getElementById('view-hospitals');
        if (!container || typeof hospitalService === 'undefined') return;

        const hospitals = hospitalService.getAllHospitals();

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-7xl mx-auto">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                        <h2 class="text-base font-bold font-mono text-white flex items-center gap-2">
                            <span>🏥</span>
                            <span>EMERGENCY HOSPITAL CAPACITY & AMBULANCE DISPATCH</span>
                        </h2>
                        <p class="text-xs text-slate-400 font-mono">Live critical care telemetry, ICU bed availability, and trauma capabilities.</p>
                    </div>
                    <div class="flex items-center gap-2 font-mono text-xs">
                        <span class="bg-purple-950 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded">
                            Total Beds Available: ${hospitalService.getStats().availableBeds}
                        </span>
                        <span class="bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded">
                            Ambulances: ${hospitalService.getStats().ambulancesAvailable}
                        </span>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    ${hospitals.map(h => `
                        <div class="hospital-card card p-4 bg-slate-900/90 border border-slate-700">
                            <div class="flex items-start justify-between mb-3">
                                <div>
                                    <h3 class="font-bold text-white text-sm flex items-center gap-1.5">
                                        <span>🏥</span>
                                        <span>${h.name}</span>
                                    </h3>
                                    <span class="text-[11px] text-cyan-400 font-mono">${h.type}</span>
                                </div>
                                <span class="badge badge-low">${h.status}</span>
                            </div>

                            <div class="grid grid-cols-2 gap-2 my-3 font-mono text-xs">
                                <div class="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                                    <span class="text-[10px] text-slate-400 uppercase block">Emergency Beds</span>
                                    <strong class="text-xl text-cyan-400">${h.emergencyBeds}</strong>
                                    <span class="text-[10px] text-slate-400 block">Available</span>
                                </div>
                                <div class="bg-slate-800/80 p-2.5 rounded border border-slate-700">
                                    <span class="text-[10px] text-slate-400 uppercase block">ICU Trauma Beds</span>
                                    <strong class="text-xl text-purple-400">${h.icuBeds}</strong>
                                    <span class="text-[10px] text-slate-400 block">Critical Units</span>
                                </div>
                            </div>

                            <div class="space-y-1.5 text-xs font-mono bg-slate-800/50 p-2 rounded mb-3">
                                <div class="flex justify-between">
                                    <span class="text-slate-400">Active Ambulances:</span>
                                    <span class="text-emerald-400 font-bold">🚑 ${h.ambulances} On Standby</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-slate-400">Position GPS:</span>
                                    <span class="text-white">${h.latitude.toFixed(4)}, ${h.longitude.toFixed(4)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-slate-400">Direct Hotline:</span>
                                    <span class="text-slate-300">${h.phone}</span>
                                </div>
                            </div>

                            <div class="text-[11px] font-mono text-slate-400 mb-3">
                                <span class="block text-slate-500 uppercase text-[10px] mb-1">Medical Capabilities:</span>
                                <div class="flex flex-wrap gap-1">
                                    ${h.capabilities.map(cap => `
                                        <span class="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-700">
                                            ✓ ${cap}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="flex items-center gap-2 pt-2 border-t border-slate-800">
                                <button class="btn btn-primary btn-xs w-full" onclick="sidebarNav.allocateBedModal('${h.id}')">
                                    Reserve Emergency Bed ➔
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderHistoryView() {
        const container = document.getElementById('view-history');
        if (!container) return;

        const resolved = sosService.getAllAlerts().filter(a => a.status === 'RESOLVED');

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-7xl mx-auto">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                        <h2 class="text-base font-bold font-mono text-white flex items-center gap-2">
                            <span>📋</span>
                            <span>INCIDENT HISTORY & RESOLVED EMERGENCIES</span>
                        </h2>
                        <p class="text-xs text-slate-400 font-mono">Archived missions, response time telemetry, and rescue resolution records.</p>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <button class="feed-filter-chip active">All Time</button>
                        <button class="feed-filter-chip">Today</button>
                        <button class="feed-filter-chip">Last 7 Days</button>
                    </div>
                </div>

                ${resolved.length === 0 ? `
                    <div class="card p-8 text-center bg-slate-900 border border-slate-800 font-mono text-xs text-slate-400">
                        No resolved incidents currently in archive. Complete rescue missions in the Command Center to record history logs.
                    </div>
                ` : `
                    <div class="card bg-slate-900/90 border border-slate-700 overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="w-full text-left font-mono text-xs">
                                <thead class="bg-slate-800/80 text-slate-400 border-b border-slate-700 text-[11px] uppercase">
                                    <tr>
                                        <th class="p-3">Incident ID</th>
                                        <th class="p-3">Type</th>
                                        <th class="p-3">Disaster</th>
                                        <th class="p-3">Victims</th>
                                        <th class="p-3">Danger Score</th>
                                        <th class="p-3">Assigned Team</th>
                                        <th class="p-3">Resolution Date</th>
                                        <th class="p-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-800 text-slate-300">
                                    ${resolved.map(alert => `
                                        <tr class="hover:bg-slate-800/40 transition">
                                            <td class="p-3 font-bold text-white">${alert.id}</td>
                                            <td class="p-3">
                                                <span class="${alert.reportType === 'INCIDENT' ? 'report-type-badge-incident' : 'report-type-badge-sos'}">
                                                    ${alert.reportType || 'SOS'}
                                                </span>
                                            </td>
                                            <td class="p-3 text-cyan-300">${alert.disasterType}</td>
                                            <td class="p-3">👥 ${alert.peopleCount || 1}</td>
                                            <td class="p-3 font-bold text-amber-400">${alert.aiAnalysis?.dangerScore || 65}/100</td>
                                            <td class="p-3 text-white">${alert.assignedTeam || 'Team Delta'}</td>
                                            <td class="p-3 text-slate-400">${new Date(alert.timestamp).toLocaleDateString()}</td>
                                            <td class="p-3">
                                                <button class="btn btn-secondary btn-xs" onclick="detailModal.openForAlert('${alert.id}')">
                                                    Inspect Log
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `}
            </div>
        `;
    }

    renderAiHubView() {
        const container = document.getElementById('view-ai-hub');
        if (!container) return;

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-5xl mx-auto font-mono">
                <div class="pb-3 border-b border-slate-800">
                    <h2 class="text-base font-bold text-white flex items-center gap-2">
                        <span>🧠</span>
                        <span>AI SMART MESSAGE READER & DANGER SCORE ENGINE</span>
                    </h2>
                    <p class="text-xs text-slate-400">Interactive NLP entity extraction sandbox and deterministic Danger Score (0-100) demonstrator.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Live NLP Text Extraction Tester -->
                    <div class="card p-4 bg-slate-900/90 border border-slate-700 space-y-3">
                        <div class="text-xs font-bold text-cyan-400 uppercase">Test Victim Distress Transmission:</div>
                        <textarea id="ai-test-input" class="tactical-input w-full h-28 text-xs leading-relaxed" placeholder="Type or paste emergency message...">Water entered our house. 4 people trapped. My grandmother is injured.</textarea>
                        
                        <div class="flex items-center gap-2">
                            <button class="btn btn-primary btn-sm w-full" onclick="sidebarNav.runAiTest()">
                                ⚡ Run AI Smart Extraction
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('ai-test-input').value = 'Ground floor completely submerged! 4 adults and 2 children sitting on tin roof. Roof bending!'; sidebarNav.runAiTest();">
                                Preset 2
                            </button>
                        </div>
                    </div>

                    <!-- AI Result Output -->
                    <div id="ai-test-output" class="card p-4 bg-slate-900/90 border border-cyan-500/40 space-y-3">
                        <div class="text-xs font-bold text-white uppercase flex items-center justify-between">
                            <span>Extraction Output</span>
                            <span class="text-emerald-400 text-[10px]">MODEL: BERT-TACTICAL-NLP</span>
                        </div>
                        <div class="text-xs text-slate-400 space-y-2" id="ai-test-results-inner">
                            <div class="p-3 bg-slate-800/80 rounded border border-slate-700 text-xs">
                                Click "Run AI Smart Extraction" to test real-time entity recognition and Danger Score calculation.
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Danger Score Formula Explainer -->
                <div class="card p-4 bg-slate-900/90 border border-slate-700 text-xs space-y-2 text-slate-300">
                    <div class="font-bold text-white uppercase text-xs flex items-center gap-1.5">
                        <span>📊</span> <span>Deterministic Danger Score Matrix (0–100)</span>
                    </div>
                    <p class="text-slate-400 text-[11px]">
                        The AI-DRIS Danger Score uses a weighted multi-factor formula rather than random estimation:
                    </p>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] pt-1">
                        <div class="bg-slate-800 p-2 rounded border border-slate-700">
                            <span class="text-cyan-400 font-bold block">1. Disaster Base:</span>
                            <span>Flood (22), Earthquake (24), Collapse (25)</span>
                        </div>
                        <div class="bg-slate-800 p-2 rounded border border-slate-700">
                            <span class="text-rose-400 font-bold block">2. Medical Emergency:</span>
                            <span>+25 pts for injury, hemorrhage, trauma</span>
                        </div>
                        <div class="bg-slate-800 p-2 rounded border border-slate-700">
                            <span class="text-amber-400 font-bold block">3. Vulnerability:</span>
                            <span>+18 pts for elderly, infants, disabled</span>
                        </div>
                        <div class="bg-slate-800 p-2 rounded border border-slate-700">
                            <span class="text-purple-400 font-bold block">4. Entrapment / Risk:</span>
                            <span>+14 pts for rising waters, low battery</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    runAiTest() {
        const input = document.getElementById('ai-test-input');
        const output = document.getElementById('ai-test-results-inner');
        if (!input || !output) return;

        const text = input.value;
        const mockSOS = {
            message: text,
            disasterType: "Flood",
            peopleCount: 4,
            injured: true,
            vulnerable: true,
            battery: 18,
            latitude: 11.9139,
            longitude: 79.8145
        };

        const analysis = aiAnalysisService.analyze(mockSOS);
        const extracted = analysis.extractedEntities;

        output.innerHTML = `
            <div class="space-y-2 font-mono text-xs">
                <div class="flex items-center justify-between p-2 rounded bg-rose-950/40 border border-rose-500/40">
                    <span class="text-rose-300 font-bold">DANGER SCORE:</span>
                    <span class="text-base font-black text-rose-400">${analysis.dangerScore} / 100 (${analysis.priority})</span>
                </div>

                <div class="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div class="bg-slate-800 p-1.5 rounded">Disaster: <strong class="text-white">${extracted.disasterType}</strong> (${extracted.disasterTypeConfidence}%)</div>
                    <div class="bg-slate-800 p-1.5 rounded">People: <strong class="text-cyan-300">${extracted.peopleCount}</strong> (${extracted.peopleCountConfidence}%)</div>
                    <div class="bg-slate-800 p-1.5 rounded">Medical: <strong class="text-rose-400">${extracted.medicalEmergency ? 'YES' : 'NO'}</strong> (${extracted.medicalConfidence}%)</div>
                    <div class="bg-slate-800 p-1.5 rounded">Vulnerable: <strong class="text-amber-400">${extracted.vulnerableType || 'YES'}</strong> (${extracted.vulnerableConfidence}%)</div>
                </div>

                <div class="p-2 bg-slate-800/80 rounded border-l-2 border-cyan-400 text-[11px]">
                    <span class="text-cyan-300 font-bold block">Recommended Tactical Action:</span>
                    <span class="text-slate-200">${analysis.recommendedAction}</span>
                </div>

                <div class="text-[10px] text-amber-300 bg-amber-950/30 p-1.5 rounded border border-amber-500/30">
                    ⚠️ AI recommendation — Human verification required before unit dispatch.
                </div>
            </div>
        `;
    }

    renderIncidentsView() {
        const container = document.getElementById('view-incidents');
        if (!container) return;

        const incidents = sosService.getAllAlerts().filter(a => a.reportType === 'INCIDENT');

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-7xl mx-auto">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                        <h2 class="text-base font-bold font-mono text-white flex items-center gap-2">
                            <span>📢</span>
                            <span>CITIZEN INCIDENT REPORTS & COMMUNITY DAMAGE LEDGER</span>
                        </h2>
                        <p class="text-xs text-slate-400 font-mono">Hazard reporting distinct from immediate life-rescue SOS calls.</p>
                    </div>
                    <a href="report.html" target="_blank" class="btn btn-primary btn-xs">
                        + Submit Incident Report ↗
                    </a>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${incidents.map(inc => `
                        <div class="card p-3.5 bg-slate-900/90 border border-slate-700 hover:border-amber-500/50 transition">
                            <div class="flex items-center justify-between mb-2">
                                <span class="report-type-badge-incident">📢 INCIDENT ${inc.id}</span>
                                <span class="badge badge-medium">${inc.aiAnalysis?.priority || 'MEDIUM'}</span>
                            </div>

                            <p class="text-xs text-white italic mb-2 font-medium">"${inc.message}"</p>

                            ${inc.photoUrl ? `
                                <div class="rounded overflow-hidden border border-slate-700 mb-2 max-h-36">
                                    <img src="${inc.photoUrl}" class="w-full h-36 object-cover" alt="Damage evidence">
                                </div>
                            ` : ''}

                            <div class="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-800/50 p-2 rounded mb-2">
                                <div>Disaster: <strong class="text-amber-400">${inc.disasterType}</strong></div>
                                <div>Location: <strong class="text-slate-300">${inc.address}</strong></div>
                                <div>Danger Score: <strong class="text-amber-400">${inc.aiAnalysis?.dangerScore || 50}/100</strong></div>
                            </div>

                            <button class="btn btn-secondary btn-xs w-full" onclick="detailModal.openForAlert('${inc.id}')">
                                Inspect Incident ↗
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderNetworkView() {
        const container = document.getElementById('view-network');
        if (!container) return;

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-5xl mx-auto font-mono text-xs">
                <div class="pb-3 border-b border-slate-800">
                    <h2 class="text-base font-bold text-white flex items-center gap-2">
                        <span>📡</span>
                        <span>OFFLINE COMMUNICATION & MESH NETWORK TELEMETRY</span>
                    </h2>
                    <p class="text-xs text-slate-400">Tactical multi-hop topology monitoring during infrastructure blackout.</p>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div class="card p-3 bg-slate-900 border border-slate-700">
                        <span class="text-slate-400 text-[10px] block">INTERNET BACKBONE</span>
                        <div class="flex items-center gap-1.5 mt-1">
                            <span class="w-2.5 h-2.5 rounded-full ${sosService.networkStatus === 'OFFLINE' ? 'bg-red-500' : 'bg-emerald-400'}"></span>
                            <strong class="text-sm text-white">${sosService.networkStatus === 'OFFLINE' ? 'UNAVAILABLE' : 'ACTIVE'}</strong>
                        </div>
                        <span class="text-[10px] text-slate-500 block mt-1">Fiber Uplink / Starlink</span>
                    </div>

                    <div class="card p-3 bg-slate-900 border border-slate-700">
                        <span class="text-slate-400 text-[10px] block">CELLULAR 4G/5G</span>
                        <div class="flex items-center gap-1.5 mt-1">
                            <span class="w-2.5 h-2.5 rounded-full ${sosService.networkStatus === 'OFFLINE' ? 'bg-red-500' : 'bg-amber-400'}"></span>
                            <strong class="text-sm text-white">${sosService.networkStatus === 'OFFLINE' ? 'DOWN' : 'DEGRADED (1 Bar)'}</strong>
                        </div>
                        <span class="text-[10px] text-slate-500 block mt-1">Tower Intermittent</span>
                    </div>

                    <div class="card p-3 bg-slate-900 border border-emerald-500/40">
                        <span class="text-slate-400 text-[10px] block">ANDROID PHONE MESH</span>
                        <div class="flex items-center gap-1.5 mt-1">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <strong class="text-sm text-emerald-400">ACTIVE (8 RELAYS)</strong>
                        </div>
                        <span class="text-[10px] text-emerald-300 block mt-1">Zero-Internet Bluetooth/Wi-Fi Direct</span>
                    </div>

                    <div class="card p-3 bg-slate-900 border border-slate-700">
                        <span class="text-slate-400 text-[10px] block">SMS EMERGENCY FALLBACK</span>
                        <div class="flex items-center gap-1.5 mt-1">
                            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                            <strong class="text-sm text-cyan-400">STANDBY (AVAILABLE)</strong>
                        </div>
                        <span class="text-[10px] text-slate-500 block mt-1">GSM Protocol Active</span>
                    </div>
                </div>

                <div class="card p-4 bg-slate-900/90 border border-slate-700 space-y-2">
                    <div class="font-bold text-white text-xs uppercase">Simulate Network Failure & Recovery:</div>
                    <p class="text-slate-400 text-[11px]">Toggle communication failure to demonstrate offline victim SOS queuing and automatic relay recovery.</p>
                    <div class="flex items-center gap-2 pt-1">
                        <button class="btn btn-secondary btn-xs text-rose-300" onclick="sosService.networkStatus = 'OFFLINE'; sidebarNav.renderNetworkView(); alert('Simulated Network Blackout: Internet and Cellular marked UNAVAILABLE. Android Mesh is now the sole gateway.');">
                            🔴 Simulate Network Blackout
                        </button>
                        <button class="btn btn-secondary btn-xs text-emerald-300" onclick="sosService.networkStatus = 'ACTIVE'; sidebarNav.renderNetworkView(); alert('Network Restored: Internet and Cellular recovered. Queued messages ingested.');">
                            🟢 Simulate Network Recovery
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderSettingsView() {
        const container = document.getElementById('view-settings');
        if (!container) return;

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-7xl mx-auto font-mono text-xs">
                <!-- System Header & Sandbox Tools -->
                <div class="card p-3 bg-slate-900/90 border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div class="font-bold text-white uppercase text-xs flex items-center gap-2">
                            <span>⚙️</span>
                            <span>COMMAND CENTRE SETTINGS & SIH DEMO SANDBOX</span>
                        </div>
                        <p class="text-slate-400 text-[11px] mt-0.5">
                            Manage prototype simulation parameters, reset demo data, and access governance modules.
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="btn btn-secondary btn-xs flex items-center gap-1" onclick="sosService.resetToDemoData(); alert('Dashboard reset to standard demo dataset.');">
                            <span>🔄</span> <span>Reset Demo State</span>
                        </button>
                        <button class="btn btn-primary btn-xs bg-indigo-600 hover:bg-indigo-500 border-indigo-400 flex items-center gap-1" onclick="sihDemoBar.runFullDemoFlow();">
                            <span>⚡</span> <span>Run SIH Demo Flow</span>
                        </button>
                    </div>
                </div>

                <!-- Admin & Governance Hub (ReliefFund, AlertShield, Multilingual SOS) -->
                <div id="view-admin" class="space-y-4"></div>
            </div>
        `;

        if (typeof adminDashboardView !== 'undefined') {
            adminDashboardView.render();
        }
    }

    renderFullMapView() {
        // Switch back to dashboard where full map is embedded, fit markers
        this.switchView('dashboard');
        setTimeout(() => {
            if (mapManager) mapManager.fitAllMarkers();
        }, 150);
    }

    dispatchUnitModal(teamId) {
        const alertId = prompt(`Select Alert ID to dispatch ${teamId} to:`, sosService.getAllAlerts()[0]?.id || "SOS-82731");
        if (alertId) {
            sosService.assignTeam(alertId, teamId, "Officer #01");
            this.renderTeamsView();
        }
    }

    toggleTeamStatus(teamId) {
        const team = rescueTeamService.getTeamById(teamId);
        if (team) {
            const next = team.status === 'AVAILABLE' ? 'STANDBY' : 'AVAILABLE';
            rescueTeamService.setTeamStatus(teamId, next);
            this.renderTeamsView();
        }
    }

    allocateBedModal(hospitalId) {
        const h = hospitalService.getHospitalById(hospitalId);
        if (h) {
            hospitalService.admitPatient(hospitalId, false);
            alert(`Reserved 1 emergency bed at ${h.name}. Remaining beds: ${h.emergencyBeds}`);
            this.renderHospitalsView();
        }
    }
}

const sidebarNav = new SidebarNav();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SidebarNav, sidebarNav };
}
