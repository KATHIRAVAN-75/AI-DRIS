/**
 * AlertShield View - Fake Emergency Alert & Misinformation Detection
 * Analyzes unverified disaster messages, identifies phishing/hoaxes,
 * presents side-by-side verification reports, and accepts citizen reports.
 */

class AlertShieldView {
    constructor() {
        this.currentAnalysis = null;
        this.currentInput = "";
        this.activeFilter = "ALL";
    }

    render() {
        const container = document.getElementById('view-alertshield');
        if (!container) return;

        const stats = alertShieldService.getStats();

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-7xl mx-auto">
                <!-- Module Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xl">🛡️</span>
                            <h2 class="text-base font-bold font-mono text-white tracking-wider">
                                ALERTSHIELD — FAKE EMERGENCY MESSAGE DETECTION & VERIFICATION
                            </h2>
                            <span class="text-[10px] font-mono uppercase bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-500/40">
                                ANTI-MISINFORMATION HEURISTICS
                            </span>
                        </div>
                        <p class="text-xs text-slate-400 font-mono mt-0.5">
                            Automated rumor analysis, phishing link inspection, and crowdsourced emergency verification.
                        </p>
                    </div>

                    <!-- Counter Ticker -->
                    <div class="flex items-center gap-2 font-mono text-xs">
                        <span class="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">
                            Total Audited: <b class="text-white">${stats.total}</b>
                        </span>
                        <span class="bg-rose-950/80 border border-rose-500/40 px-2.5 py-1 rounded text-rose-300">
                            Hoaxes Blocked: <b class="text-rose-400">${stats.rejected}</b>
                        </span>
                        <span class="bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded text-emerald-300">
                            Verified: <b class="text-emerald-400">${stats.verified}</b>
                        </span>
                    </div>
                </div>

                <!-- Mandatory Automated Warning Banner -->
                <div class="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-start gap-2.5 text-xs font-mono text-amber-200">
                    <span class="text-base shrink-0">⚠️</span>
                    <div>
                        <b class="uppercase">Notice Regarding Automated Verification:</b>
                        Automated heuristic analysis is provided for preliminary guidance and decision support. It does not constitute definitive proof of authenticity. Always cross-check alerts with official District EOC, IMD, or NDRF emergency control rooms (Helpline 112 / 1070 / 1077).
                    </div>
                </div>

                <!-- Main Analysis Workspace: Input Left, Results Right -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <!-- Left Column: Input Sandbox (5 cols) -->
                    <div class="lg:col-span-5 space-y-3">
                        <div class="card p-4 bg-slate-900/90 border border-slate-700 font-mono">
                            <div class="flex items-center justify-between mb-2">
                                <label class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                    <span>📥</span> <span>Message Analysis Input</span>
                                </label>
                                <span class="text-[10px] text-slate-400">SMS • WhatsApp • Social Media</span>
                            </div>

                            <textarea id="as-input-text" rows="6" class="tactical-input w-full text-xs font-mono mb-3" placeholder="Paste emergency message, viral forward, or SMS here to analyze...">${this.currentInput}</textarea>

                            <!-- Quick Sample Presets -->
                            <div class="mb-3">
                                <div class="text-[10px] uppercase text-slate-400 mb-1.5 font-bold">
                                    Try Standard Sample Test Scenarios:
                                </div>
                                <div class="grid grid-cols-2 gap-1.5">
                                    <button type="button" class="as-sample-btn" data-sample="dam">
                                        🌊 Dam Breach Hoax
                                    </button>
                                    <button type="button" class="as-sample-btn" data-sample="phishing">
                                        💳 Relief Grant Scam
                                    </button>
                                    <button type="button" class="as-sample-btn" data-sample="verified">
                                        🟢 Verified Road Alert
                                    </button>
                                    <button type="button" class="as-sample-btn" data-sample="water">
                                        ☣️ Water Poison Rumor
                                    </button>
                                </div>
                            </div>

                            <div class="flex items-center gap-2 pt-2 border-t border-slate-800">
                                <button id="btn-as-analyze" class="btn btn-primary flex-1 text-xs flex items-center justify-center gap-1.5 py-2">
                                    <span>🔍</span>
                                    <span>Analyze Emergency Message</span>
                                </button>
                                <button id="btn-as-clear" class="btn btn-secondary text-xs px-3">
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Analysis Output (7 cols) -->
                    <div class="lg:col-span-7">
                        <div id="as-results-container">
                            ${this.renderAnalysisResults()}
                        </div>
                    </div>
                </div>

                <!-- Community Reported Alerts & Hoax Ledger -->
                <div class="card p-4 bg-slate-900/90 border border-slate-800 font-mono">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3">
                        <div>
                            <h3 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <span>📢</span> <span>Crowdsourced & Officer-Audited Alerts Ledger</span>
                            </h3>
                            <p class="text-xs text-slate-400">Suspicious messages flagged by citizens and verified by Disaster Operations officers.</p>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-xs text-slate-400">Filter:</span>
                            <select id="as-ledger-filter" class="tactical-select text-xs">
                                <option value="ALL">All Reports</option>
                                <option value="Rejected">🔴 Rejected Hoaxes</option>
                                <option value="Verified">🟢 Verified Announcements</option>
                                <option value="Under Review">🟠 Under Review</option>
                            </select>
                        </div>
                    </div>

                    <div id="as-ledger-list" class="space-y-2.5">
                        ${this.renderLedgerList()}
                    </div>
                </div>
            </div>

            <!-- Report Message Modal -->
            <div id="as-report-modal" class="modal-backdrop hidden">
                <div class="modal-card max-w-lg w-full font-mono">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                        <h3 class="text-sm font-bold text-white flex items-center gap-2">
                            <span>🚨</span> <span>Report Suspicious Disaster Alert</span>
                        </h3>
                        <button class="text-slate-400 hover:text-white text-base" onclick="alertShieldView.closeReportModal()">✕</button>
                    </div>
                    <form id="as-report-form" class="space-y-3 text-xs">
                        <div>
                            <label class="block text-slate-300 mb-1">Message Content to Report *</label>
                            <textarea id="as-report-text" rows="3" required class="tactical-input w-full"></textarea>
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1">Threat Category *</label>
                            <select id="as-report-cat" class="tactical-select w-full">
                                <option value="Panic Hoax">Fake Dam Breach / Tsunami Panic</option>
                                <option value="Financial Phishing Scam">Fake Donation / UPI Grant Link</option>
                                <option value="Outdated Alert">Outdated Old Year Flood Photo/Alert</option>
                                <option value="Fabricated Curfew/Contamination">Fake Curfew / Contamination Rumor</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1">Additional Observations / Source Info</label>
                            <input type="text" id="as-report-notes" class="tactical-input w-full" placeholder="e.g. Received on WhatsApp family group...">
                        </div>
                        <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
                            <button type="button" class="btn btn-secondary text-xs" onclick="alertShieldView.closeReportModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary text-xs bg-rose-600 hover:bg-rose-500">Submit Report</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.bindEvents();
    }
    renderAnalysisResults() {
        if (!this.currentAnalysis) {
            return `
                <div class="card p-10 bg-slate-900/60 border border-slate-800 text-center font-mono text-slate-400">
                    <div class="text-3xl mb-2">🛡️</div>
                    <div class="text-sm font-bold text-white mb-1">Awaiting Emergency Alert for Inspection</div>
                    <p class="text-xs text-slate-500 max-w-md mx-auto">
                        Paste any forwarded SMS, WhatsApp broadcast, or social media post on the left or select a sample scenario to run multi-factor heuristic threat checks.
                    </p>
                </div>
            `;
        }

        const a = this.currentAnalysis;
        let badgeColor = "bg-amber-950 text-amber-400 border-amber-500/40";
        let statusIcon = "🟡";

        if (a.status === "Verified") {
            badgeColor = "bg-emerald-950 text-emerald-400 border-emerald-500/40";
            statusIcon = "🟢";
        } else if (a.status === "Rejected") {
            badgeColor = "bg-rose-950 text-rose-400 border-rose-500/40";
            statusIcon = "🔴";
        } else if (a.status === "Under Review") {
            badgeColor = "bg-sky-950 text-sky-400 border-sky-500/40";
            statusIcon = "🟠";
        }

        return `
            <div class="card p-4 bg-slate-900/90 border border-slate-700 font-mono space-y-4">
                <!-- Status Header -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-bold uppercase tracking-wider text-slate-400">Analysis Verdict:</span>
                        <span class="px-2.5 py-1 rounded text-xs font-bold border ${badgeColor} flex items-center gap-1.5">
                            <span>${statusIcon}</span>
                            <span>${a.status.toUpperCase()} (${a.threatLevel})</span>
                        </span>
                    </div>

                    <div class="flex items-center gap-2 text-xs">
                        <span class="text-slate-400">Trust Score:</span>
                        <span class="text-base font-black ${a.trustScore >= 70 ? 'text-emerald-400' : (a.trustScore <= 30 ? 'text-rose-400' : 'text-amber-400')}">
                            ${a.trustScore} / 100
                        </span>
                    </div>
                </div>

                <!-- Side-by-Side: Original Message vs Threat Breakdown -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <!-- Original Message Box -->
                    <div class="bg-slate-950/80 p-3 rounded border border-slate-800 space-y-2">
                        <div class="text-[11px] font-bold uppercase text-slate-400 flex items-center justify-between">
                            <span>Original Submitted Message</span>
                            <span class="text-[10px] text-cyan-400">RAW TELEMETRY</span>
                        </div>
                        <div class="p-2.5 rounded bg-slate-900/90 border border-slate-800 text-slate-200 italic leading-relaxed text-xs">
                            "${this.currentInput}"
                        </div>
                    </div>

                    <!-- Heuristic Findings Box -->
                    <div class="bg-slate-950/80 p-3 rounded border border-slate-800 space-y-2">
                        <div class="text-[11px] font-bold uppercase text-slate-400 flex items-center justify-between">
                            <span>Automated Threat Indicators</span>
                            <span class="text-[10px] text-purple-400">HEURISTICS</span>
                        </div>
                        <ul class="space-y-1.5 text-[11px]">
                            ${a.flags.map(f => `
                                <li class="flex items-start gap-1.5 ${f.includes('Suspicious') || f.includes('CONTRADICTION') || f.includes('Non-gov') ? 'text-rose-400' : (f.includes('Official') ? 'text-emerald-400' : 'text-slate-300')}">
                                    <span class="shrink-0">•</span>
                                    <span>${f}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <!-- Advisory Action Recommendation -->
                <div class="p-3 rounded bg-slate-800/80 border ${a.status === 'Rejected' ? 'border-rose-500/40 bg-rose-950/20' : 'border-slate-700'} text-xs">
                    <div class="text-[11px] font-bold uppercase text-slate-400 mb-1">
                        Operational Safety Guidance:
                    </div>
                    <div class="${a.status === 'Rejected' ? 'text-rose-300 font-bold' : 'text-slate-200'}">
                        ${a.advice}
                    </div>
                </div>

                <!-- Report Action Button -->
                <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span class="text-slate-400 text-[11px]">Suspect this alert is spreading panic or fraud?</span>
                    <button class="btn btn-secondary text-xs text-rose-300 border-rose-500/40 hover:bg-rose-900/40" onclick="alertShieldView.openReportModal()">
                        🚨 Report Message to Command Center
                    </button>
                </div>
            </div>
        `;
    }

    renderLedgerList() {
        const reports = alertShieldService.getReportedMessages(this.activeFilter);
        if (reports.length === 0) {
            return `
                <div class="p-6 text-center text-slate-500 text-xs">
                    No emergency alerts recorded under filter "${this.activeFilter}".
                </div>
            `;
        }

        return reports.map(r => {
            const status = r.analysis.status;
            let badge = "bg-amber-950 text-amber-400 border-amber-500/40";
            if (status === "Verified") badge = "bg-emerald-950 text-emerald-400 border-emerald-500/40";
            else if (status === "Rejected") badge = "bg-rose-950 text-rose-400 border-rose-500/40";
            else if (status === "Under Review") badge = "bg-sky-950 text-sky-400 border-sky-500/40";

            return `
                <div class="p-3 bg-slate-950/80 border border-slate-800 rounded hover:border-slate-700 transition text-xs">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <div class="flex items-center gap-2">
                            <span class="text-cyan-400 font-bold">${r.id}</span>
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badge}">${status}</span>
                            <span class="text-slate-400 text-[11px]">${r.analysis.threatLevel}</span>
                        </div>
                        <div class="flex items-center gap-3 text-[11px] text-slate-400">
                            <span>Reports: <b class="text-white">${r.reportCount || 1}</b></span>
                            <span>${new Date(r.receivedAt).toLocaleTimeString()}</span>
                        </div>
                    </div>
                    <div class="text-slate-300 italic mb-2 bg-slate-900/80 p-2 rounded text-[11px]">
                        "${r.rawMessage}"
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>Status: <b class="text-slate-300">${r.adminStatus || 'Logged'}</b></span>
                        ${r.reviewedBy ? `<span>Reviewed by: <b class="text-purple-300">${r.reviewedBy}</b></span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    bindEvents() {
        const analyzeBtn = document.getElementById('btn-as-analyze');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                const text = document.getElementById('as-input-text').value;
                if (!text || !text.trim()) {
                    alert("Please paste or type an emergency message to analyze.");
                    return;
                }
                this.currentInput = text.trim();
                this.currentAnalysis = alertShieldService.analyzeMessage(this.currentInput);
                const resultsContainer = document.getElementById('as-results-container');
                if (resultsContainer) {
                    resultsContainer.innerHTML = this.renderAnalysisResults();
                }
            });
        }

        const clearBtn = document.getElementById('btn-as-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.currentInput = "";
                this.currentAnalysis = null;
                const textarea = document.getElementById('as-input-text');
                if (textarea) textarea.value = "";
                const resultsContainer = document.getElementById('as-results-container');
                if (resultsContainer) {
                    resultsContainer.innerHTML = this.renderAnalysisResults();
                }
            });
        }

        document.querySelectorAll('.as-sample-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.getAttribute('data-sample');
                let sampleText = "";
                if (type === "dam") {
                    sampleText = "URGENT WARNING!! Sathanur Dam breached! 50ft tsunami wave entering Arumparthapuram in 20 minutes! Entire city drowning! FORWARD TO EVERYONE IMMEDIATELY!!";
                } else if (type === "phishing") {
                    sampleText = "Official Relief Grant: Government distributing ₹50,000 flood grant to all affected citizens immediately! Click here to claim your cash aid: http://bit.ly/pm-flood-grant-instant";
                } else if (type === "verified") {
                    sampleText = "Arumparthapuram Main Arterial causeway flooded with 4.5ft water. Traffic halted. Detour via East Elevated Bypass Route B. SDMA emergency team on site. Helpline 112.";
                } else if (type === "water") {
                    sampleText = "Drinking water in whole district contaminated with chemical poison due to factory leak. Do not drink tap water today. Municipal hospital overwhelmed with 500 dead!!";
                }

                this.currentInput = sampleText;
                const textarea = document.getElementById('as-input-text');
                if (textarea) textarea.value = sampleText;
                this.currentAnalysis = alertShieldService.analyzeMessage(sampleText);
                const resultsContainer = document.getElementById('as-results-container');
                if (resultsContainer) {
                    resultsContainer.innerHTML = this.renderAnalysisResults();
                }
            });
        });

        const filterSelect = document.getElementById('as-ledger-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.activeFilter = e.target.value;
                const list = document.getElementById('as-ledger-list');
                if (list) list.innerHTML = this.renderLedgerList();
            });
        }

        const reportForm = document.getElementById('as-report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const msg = document.getElementById('as-report-text').value;
                const cat = document.getElementById('as-report-cat').value;
                const notes = document.getElementById('as-report-notes').value;

                alertShieldService.reportSuspiciousMessage(msg, cat, notes);
                alert("✓ Emergency Message Reported to Command Center Desk for Review.");
                this.closeReportModal();
                this.render();
            });
        }
    }

    openReportModal() {
        const modal = document.getElementById('as-report-modal');
        const reportText = document.getElementById('as-report-text');
        if (reportText && this.currentInput) {
            reportText.value = this.currentInput;
        }
        if (modal) modal.classList.remove('hidden');
    }

    closeReportModal() {
        const modal = document.getElementById('as-report-modal');
        if (modal) modal.classList.add('hidden');
    }
}

const alertShieldView = new AlertShieldView();
