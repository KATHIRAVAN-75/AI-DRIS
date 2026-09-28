/**
 * Disaster Rescue Center - SOS Alert Panel Component
 * Displays real-time prioritized list of emergencies with search, filter pills, and quick actions.
 */

class AlertPanel {
    constructor(containerId = "sos-alert-list") {
        this.containerId = containerId;
        this.selectedId = null;
    }

    init() {
        // Subscribe to SOS service events
        sosService.on('alerts-updated', (alerts) => {
            this.render(alerts);
        });

        sosService.on('alert-selected', (alert) => {
            this.selectedId = alert ? alert.id : null;
            this.updateSelection();
        });

        // Setup filter input listeners
        this.bindEvents();

        // Initial render
        this.render(sosService.getFilteredAlerts());
    }

    bindEvents() {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                sosService.setFilter('searchQuery', e.target.value);
            });
        }

        const disasterFilter = document.getElementById('filter-disaster');
        if (disasterFilter) {
            disasterFilter.addEventListener('change', (e) => {
                sosService.setFilter('disasterType', e.target.value);
            });
        }

        const priorityFilter = document.getElementById('filter-priority');
        if (priorityFilter) {
            priorityFilter.addEventListener('change', (e) => {
                sosService.setFilter('priority', e.target.value);
            });
        }

        const statusFilter = document.getElementById('filter-status');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                sosService.setFilter('status', e.target.value);
            });
        }
    }

    render(alerts) {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        if (alerts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="text-3xl">🔍</span>
                    <p class="text-slate-400 mt-2 font-mono text-sm">No emergency alerts match the active filters.</p>
                    <button class="btn btn-secondary btn-sm mt-3" onclick="alertPanel.resetFilters()">Reset Filters</button>
                </div>
            `;
            return;
        }

        const currentSelected = sosService.getSelectedAlert();
        this.selectedId = currentSelected ? currentSelected.id : null;

        const html = alerts.map(alert => {
            const priority = sosService.getEffectivePriority(alert);
            const prioConfig = PRIORITIES[priority] || PRIORITIES.MEDIUM;
            const disaster = DISASTER_TYPES[alert.disasterType] || DISASTER_TYPES.Other;
            const isSelected = this.selectedId === alert.id;
            const isOverridden = alert.aiAnalysis?.operatorOverride;

            // Multilingual detection
            const langCode = alert.sourceLanguage || (typeof translationService !== 'undefined' ? translationService.detectScript(alert.originalMessage || alert.message) : 'en');
            const langName = alert.detectedLanguage || (typeof translationService !== 'undefined' ? translationService.getLanguageName(langCode) : 'English');
            const isNonEnglish = langCode !== 'en' || (alert.detectedLanguage && alert.detectedLanguage.toLowerCase() !== 'english');

            // Battery style
            let batteryColor = "#22c55e"; // Green
            if (alert.battery < 20) batteryColor = "#ef4444"; // Red
            else if (alert.battery < 50) batteryColor = "#f59e0b"; // Amber

            // Relay path string
            const relayStr = (alert.relayPath && alert.relayPath.length > 0)
                ? alert.relayPath.join(' → ')
                : 'Direct to Gateway';

            // Relative or formatted time
            const timeStr = this.formatTime(alert.timestamp);

            return `
                <div class="sos-card ${isSelected ? 'sos-card-active' : ''}" 
                     style="border-left: 4px solid ${prioConfig.color};"
                     onclick="sosService.selectAlert('${alert.id}')"
                     id="card-${alert.id}">
                    
                    <div class="sos-card-header flex items-center justify-between mb-1.5 flex-wrap gap-1">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="sos-id font-mono font-bold text-sm text-white">${alert.id}</span>
                            <span class="sos-disaster-badge text-xs">
                                ${disaster.icon} ${alert.disasterType}
                            </span>
                            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/40" title="Source Language">
                                🌐 ${langName}
                            </span>
                            ${alert.isReviewed ? '<span class="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-950/60 px-1 rounded border border-indigo-500/30">✓ Reviewed</span>' : ''}
                        </div>
                        <div class="flex items-center gap-1.5">
                            ${isOverridden ? '<span class="override-pill">OVERRIDE</span>' : ''}
                            <span class="badge ${prioConfig.badgeClass}">
                                ${priority === 'CRITICAL' ? '<span class="pulse-dot mr-1"></span>' : ''}
                                ${priority}
                            </span>
                        </div>
                    </div>

                    <!-- Citizen Contact Quick Preview -->
                    <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                        <span class="truncate">👤 <strong class="text-white">${this.escapeHtml(alert.contactName || 'Citizen')}</strong></span>
                        <a href="tel:${this.escapeHtml(alert.contactPhone || '+91 94471 00000')}" class="text-cyan-400 hover:underline font-bold" onclick="event.stopPropagation()">
                            📞 ${this.escapeHtml(alert.contactPhone || '+91 94471 00000')}
                        </a>
                    </div>

                    <!-- Message Body + Multilingual Display -->
                    <div class="mb-2">
                        <p class="sos-message text-xs text-slate-200 leading-relaxed italic">
                            "${this.escapeHtml(alert.originalMessage || alert.message)}"
                        </p>
                        ${alert.translationStatus === 'TRANSLATED' && (alert.translatedMessage || alert.englishTranslation) ? `
                            <div class="mt-1 text-[11px] font-mono text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/30">
                                🇬🇧 "${this.escapeHtml(alert.translatedMessage || alert.englishTranslation)}"
                            </div>
                        ` : isNonEnglish ? `
                            <div class="mt-1 flex items-center justify-between text-[10px] font-mono bg-slate-900/70 px-2 py-1 rounded">
                                <span class="text-slate-400">Native ${langName}</span>
                                <button class="text-cyan-400 hover:text-cyan-300 underline font-bold" onclick="event.stopPropagation(); alertPanel.quickTranslate('${alert.id}')">
                                    🌐 Translate to English
                                </button>
                            </div>
                        ` : ''}
                    </div>

                    <div class="sos-meta-row flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 mb-2.5 pb-2 border-b border-slate-800/80">
                        <span class="flex items-center gap-1">
                            <span>📍</span>
                            <span class="text-slate-300 truncate max-w-[140px]">${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}</span>
                        </span>
                        <span class="flex items-center gap-1">
                            <span>🔋</span>
                            <span class="font-bold" style="color: ${batteryColor};">${alert.battery}%</span>
                        </span>
                        <span class="flex items-center gap-1">
                            <span>👥</span>
                            <span class="text-slate-300">${alert.peopleCount || 1} Persons</span>
                        </span>
                        <span class="flex items-center gap-1 text-slate-500">
                            <span>⏱️</span>
                            <span>${timeStr}</span>
                        </span>
                    </div>

                    <div class="sos-card-footer flex items-center justify-between">
                        <div class="relay-path-preview truncate font-mono text-[11px] text-slate-400" title="Relay: ${relayStr}">
                            📡 ${relayStr}
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                            <span class="status-pill status-${alert.status.replace(/\s+/g, '-').toLowerCase()} text-[10px]">
                                ${alert.status}
                            </span>
                            <button class="btn btn-primary btn-xs py-0.5 px-2 text-[11px]" onclick="event.stopPropagation(); detailModal.openForAlert('${alert.id}')">
                                Inspect ↗
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    updateSelection() {
        document.querySelectorAll('.sos-card').forEach(card => {
            card.classList.remove('sos-card-active');
        });
        if (this.selectedId) {
            const activeCard = document.getElementById(`card-${this.selectedId}`);
            if (activeCard) {
                activeCard.classList.add('sos-card-active');
                activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    resetFilters() {
        const search = document.getElementById('search-input');
        const disaster = document.getElementById('filter-disaster');
        const priority = document.getElementById('filter-priority');
        const status = document.getElementById('filter-status');

        if (search) search.value = '';
        if (disaster) disaster.value = 'ALL';
        if (priority) priority.value = 'ALL';
        if (status) status.value = 'ALL';

        sosService.filterState = {
            searchQuery: "",
            disasterType: "ALL",
            priority: "ALL",
            status: "ALL",
            zoneId: "ALL"
        };
        sosService.emit('alerts-updated', sosService.getFilteredAlerts());
    }

    formatTime(isoString) {
        if (!isoString) return '--:--';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return isoString;
        }
    }

    async quickTranslate(alertId) {
        if (typeof sosService !== 'undefined') {
            await sosService.translateAlert(alertId, true);
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

const alertPanel = new AlertPanel();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AlertPanel, alertPanel };
}
