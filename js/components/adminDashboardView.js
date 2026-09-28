/**
 * Admin Dashboard View - Unified Executive Control Room
 * Handles administrative reviews and approvals for ReliefFund aid applications,
 * AlertShield crowdsourced hoax audits, and system security telemetry.
 */

class AdminDashboardView {
    constructor() {
        this.activeTab = "relieffund"; // relieffund | alertshield | telemetry
    }

    render() {
        const container = document.getElementById('view-admin');
        if (!container) return;

        const rfStats = reliefFundService.getStats();
        const asStats = alertShieldService.getStats();
        const sosAlerts = (typeof sosService !== 'undefined') ? sosService.alerts : [];
        const nonEnglishCount = sosAlerts.filter(a => a.sourceLanguage !== 'en' || (a.detectedLanguage && a.detectedLanguage.toLowerCase() !== 'english')).length;

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-7xl mx-auto font-mono">
                <!-- Module Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xl">⚙️</span>
                            <h2 class="text-base font-bold text-white tracking-wider">
                                UNIFIED ADMIN DASHBOARD & APPROVAL CONSOLE
                            </h2>
                            <span class="text-[10px] uppercase bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40">
                                OFFICER LEVEL 4 ACCESS
                            </span>
                        </div>
                        <p class="text-xs text-slate-400 mt-0.5">
                            Authorize disaster grants, inspect crowdsourced alert reports, and monitor relief operations.
                        </p>
                    </div>

                    <!-- Admin Tabs -->
                    <div class="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 flex-wrap">
                        <button class="adm-tab-btn ${this.activeTab === 'relieffund' ? 'active' : ''}" data-tab="relieffund">
                            💰 ReliefFund Applications (${rfStats.pendingRequests})
                        </button>
                        <button class="adm-tab-btn ${this.activeTab === 'alertshield' ? 'active' : ''}" data-tab="alertshield">
                            🛡️ AlertShield Audits (${asStats.underReview})
                        </button>
                        <button class="adm-tab-btn ${this.activeTab === 'multilingual_sos' ? 'active' : ''}" data-tab="multilingual_sos">
                            🌐 Multilingual SOS (${nonEnglishCount})
                        </button>
                        <button class="adm-tab-btn ${this.activeTab === 'telemetry' ? 'active' : ''}" data-tab="telemetry">
                            📊 Operations Log
                        </button>
                    </div>
                </div>

                <!-- Tab Content -->
                <div id="adm-tab-content">
                    ${this.renderTabContent()}
                </div>
            </div>
        `;

        this.bindEvents();
    }

    renderTabContent() {
        if (this.activeTab === "alertshield") {
            return this.renderAlertShieldAdmin();
        } else if (this.activeTab === "multilingual_sos") {
            return this.renderMultilingualSosAdmin();
        } else if (this.activeTab === "telemetry") {
            return this.renderTelemetryAdmin();
        } else {
            return this.renderReliefFundAdmin();
        }
    }

    renderReliefFundAdmin() {
        const beneficiaries = reliefFundService.getBeneficiaries();

        return `
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold text-white uppercase tracking-wider">
                        Beneficiary Assistance Application Approval Queue
                    </h3>
                    <span class="text-xs text-slate-400">Total Applications: <b>${beneficiaries.length}</b></span>
                </div>

                <div class="overflow-x-auto card p-3 bg-slate-900/90 border border-slate-800">
                    <table class="w-full text-left text-xs">
                        <thead>
                            <tr class="text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                                <th class="pb-2">Application ID</th>
                                <th class="pb-2">Applicant</th>
                                <th class="pb-2">Location & Disaster</th>
                                <th class="pb-2">Assistance Needed</th>
                                <th class="pb-2">Requested / Approved</th>
                                <th class="pb-2">Status</th>
                                <th class="pb-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/60 text-slate-300">
                            ${beneficiaries.map(b => `
                                <tr class="hover:bg-slate-800/40 transition">
                                    <td class="py-2.5 text-cyan-400 font-bold">${b.id}</td>
                                    <td class="py-2.5">
                                        <div class="font-bold text-white">${b.name}</div>
                                        <div class="text-[10px] text-slate-400">${b.phone} (Fam: ${b.familySize})</div>
                                    </td>
                                    <td class="py-2.5">
                                        <div class="text-slate-200">${b.location}</div>
                                        <div class="text-[10px] text-amber-400">${b.disasterType}</div>
                                    </td>
                                    <td class="py-2.5">
                                        ${b.assistanceRequired.map(need => `<span class="bg-slate-800 text-[10px] px-1.5 py-0.5 rounded mr-1">${need}</span>`).join('')}
                                    </td>
                                    <td class="py-2.5">
                                        <div>Req: ₹${b.amountRequested.toLocaleString('en-IN')}</div>
                                        <div class="text-emerald-400 font-bold">Appr: ₹${b.amountApproved.toLocaleString('en-IN')}</div>
                                    </td>
                                    <td class="py-2.5">
                                        <span class="text-[10px] px-2 py-0.5 rounded font-bold ${
                                            b.status === 'Distributed' ? 'bg-purple-950 text-purple-300 border border-purple-500/40' :
                                            b.status === 'Approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' :
                                            b.status === 'Under Verification' ? 'bg-sky-950 text-sky-400 border border-sky-500/40' :
                                            'bg-amber-950 text-amber-400 border border-amber-500/40'
                                        }">${b.status}</span>
                                    </td>
                                    <td class="py-2.5 text-right space-x-1">
                                        ${b.status === 'Pending' ? `
                                            <button class="btn btn-secondary btn-xs text-sky-300" onclick="adminDashboardView.updateRfStatus('${b.id}', 'Under Verification')">
                                                Verify
                                            </button>
                                            <button class="btn btn-primary btn-xs bg-emerald-700 hover:bg-emerald-600 text-white" onclick="adminDashboardView.quickApproveRf('${b.id}', ${b.amountRequested})">
                                                Approve
                                            </button>
                                        ` : b.status === 'Under Verification' ? `
                                            <button class="btn btn-primary btn-xs bg-emerald-700 hover:bg-emerald-600 text-white" onclick="adminDashboardView.quickApproveRf('${b.id}', ${b.amountRequested})">
                                                Approve
                                            </button>
                                        ` : b.status === 'Approved' ? `
                                            <button class="btn btn-primary btn-xs bg-purple-700 hover:bg-purple-600 text-white" onclick="adminDashboardView.disburseRf('${b.id}')">
                                                💸 Disburse DBT
                                            </button>
                                        ` : `
                                            <span class="text-[11px] text-purple-300 font-bold">✓ Complete</span>
                                        `}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    renderAlertShieldAdmin() {
        const reports = alertShieldService.getReportedMessages();

        return `
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <h3 class="text-xs font-bold text-white uppercase tracking-wider">
                        Crowdsourced Alert Misinformation & Hoax Review
                    </h3>
                    <span class="text-xs text-slate-400">Total Flagged: <b>${reports.length}</b></span>
                </div>

                <div class="space-y-3">
                    ${reports.map(r => `
                        <div class="card p-3.5 bg-slate-900 border border-slate-700 space-y-2">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <div class="flex items-center gap-2">
                                    <span class="text-cyan-400 font-bold">${r.id}</span>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${
                                        r.analysis.status === 'Rejected' ? 'bg-rose-950 text-rose-400 border-rose-500/40' :
                                        r.analysis.status === 'Verified' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' :
                                        'bg-amber-950 text-amber-400 border-amber-500/40'
                                    }">${r.analysis.status}</span>
                                    <span class="text-slate-400 text-xs">${r.category}</span>
                                </div>
                                <div class="text-[11px] text-slate-400">
                                    Reported by: <b class="text-slate-200">${r.submittedBy}</b> (${r.reportCount} reports)
                                </div>
                            </div>

                            <div class="text-xs text-slate-200 bg-slate-950/80 p-2.5 rounded border border-slate-800 italic">
                                "${r.rawMessage}"
                            </div>

                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[11px]">
                                <div class="text-slate-400">
                                    Trust Score: <b class="${r.analysis.trustScore >= 70 ? 'text-emerald-400' : 'text-rose-400'}">${r.analysis.trustScore}/100</b>
                                    ${r.adminNotes ? `• Note: <i class="text-slate-300">${r.adminNotes}</i>` : ''}
                                </div>
                                <div class="space-x-1">
                                    <button class="btn btn-secondary btn-xs text-rose-400 border-rose-500/40 hover:bg-rose-950" onclick="adminDashboardView.markHoax('${r.id}', 'Rejected')">
                                        🔴 Confirm Fake / Hoax
                                    </button>
                                    <button class="btn btn-secondary btn-xs text-emerald-400 border-emerald-500/40 hover:bg-emerald-950" onclick="adminDashboardView.markHoax('${r.id}', 'Verified')">
                                        🟢 Mark Verified Official
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderTelemetryAdmin() {
        return `
            <div class="card p-4 bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs">
                <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-2">
                    Command Platform Operational Audit Log
                </h3>
                <div class="space-y-2 text-slate-300">
                    <div class="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                        <span>[2026-09-28 19:35] System startup: Offline Android Mesh Gateway synchronized (8 nodes online).</span>
                        <span class="text-emerald-400 font-bold">INFO</span>
                    </div>
                    <div class="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                        <span>[2026-09-28 19:30] ReliefFund audit hash verified against municipal disaster corpus.</span>
                        <span class="text-cyan-400 font-bold">AUDIT</span>
                    </div>
                    <div class="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                        <span>[2026-09-28 19:25] AlertShield heuristic database updated with 4 new viral panic rumor signatures.</span>
                        <span class="text-purple-400 font-bold">SECURITY</span>
                    </div>
                    <div class="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between">
                        <span>[2026-09-28 19:15] BhashaAlert Web Speech synthesized voice stream active for 5 regional languages.</span>
                        <span class="text-emerald-400 font-bold">SPEECH</span>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.querySelectorAll('.adm-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('data-tab');
                this.activeTab = tab;
                this.render();
            });
        });
    }

    updateRfStatus(id, newStatus) {
        reliefFundService.updateApplicationStatus(id, newStatus, null, "Officer Admin #01");
        this.render();
    }

    quickApproveRf(id, amount) {
        const approved = prompt(`Enter Approved Aid Amount (₹) for ${id}:`, amount);
        if (approved !== null) {
            reliefFundService.updateApplicationStatus(id, "Approved", parseFloat(approved), "Officer Admin #01");
            alert(`✓ Application ${id} Approved for ₹${parseFloat(approved).toLocaleString('en-IN')}!`);
            this.render();
        }
    }

    disburseRf(id) {
        if (confirm(`Authorize direct DBT grant disbursement for Application ${id}?`)) {
            const res = reliefFundService.updateApplicationStatus(id, "Distributed", null, "Officer Admin #01");
            alert(`✓ Fund Disbursed Successfully!\nTransaction ID: ${res.txnId}\nAmount: ₹${res.amountApproved.toLocaleString('en-IN')}`);
            this.render();
        }
    }

    renderMultilingualSosAdmin() {
        const alerts = (typeof sosService !== 'undefined') ? sosService.alerts : [];
        const nonEnglishAlerts = alerts.filter(a => a.sourceLanguage !== 'en' || (a.detectedLanguage && a.detectedLanguage.toLowerCase() !== 'english'));
        const translatedCount = alerts.filter(a => a.translationStatus === 'TRANSLATED').length;
        const reviewedCount = alerts.filter(a => a.isReviewed).length;
        const langCounts = {};
        alerts.forEach(a => {
            const lang = a.detectedLanguage || a.sourceLanguage || 'English';
            langCounts[lang] = (langCounts[lang] || 0) + 1;
        });

        return `
            <div class="space-y-4">
                <!-- Summary KPI Cards -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div class="card p-3 bg-slate-900/90 border border-slate-800">
                        <span class="text-[10px] text-slate-400 uppercase font-mono block">Incoming SOS Total</span>
                        <div class="text-xl font-bold text-white mt-1">${alerts.length}</div>
                        <span class="text-[10px] text-slate-500 font-mono">Real-time distress log</span>
                    </div>
                    <div class="card p-3 bg-slate-900/90 border border-slate-800">
                        <span class="text-[10px] text-cyan-400 uppercase font-mono block">Multilingual SOS</span>
                        <div class="text-xl font-bold text-cyan-300 mt-1">${nonEnglishAlerts.length}</div>
                        <span class="text-[10px] text-slate-500 font-mono">Native script transmissions</span>
                    </div>
                    <div class="card p-3 bg-slate-900/90 border border-slate-800">
                        <span class="text-[10px] text-emerald-400 uppercase font-mono block">English Translated</span>
                        <div class="text-xl font-bold text-emerald-300 mt-1">${translatedCount}</div>
                        <span class="text-[10px] text-slate-500 font-mono">Neural engine translated</span>
                    </div>
                    <div class="card p-3 bg-slate-900/90 border border-slate-800">
                        <span class="text-[10px] text-indigo-400 uppercase font-mono block">Officer Actioned</span>
                        <div class="text-xl font-bold text-indigo-300 mt-1">${reviewedCount}</div>
                        <span class="text-[10px] text-slate-500 font-mono">Reviewed & confirmed</span>
                    </div>
                </div>

                <!-- Languages Distribution Badges -->
                <div class="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span class="text-slate-400 font-bold uppercase">Language Breakdown:</span>
                    <div class="flex items-center gap-2 flex-wrap">
                        ${Object.entries(langCounts).map(([lang, count]) => `
                            <span class="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30 text-xs">
                                🌐 ${lang}: <b>${count}</b>
                            </span>
                        `).join('')}
                    </div>
                </div>

                <!-- Multilingual Alerts Audit Table -->
                <div class="overflow-x-auto card p-3 bg-slate-900/90 border border-slate-800">
                    <table class="w-full text-left text-xs">
                        <thead>
                            <tr class="text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                                <th class="pb-2">SOS ID & Priority</th>
                                <th class="pb-2">Citizen Contact</th>
                                <th class="pb-2">Source Language</th>
                                <th class="pb-2">Original Distress Message</th>
                                <th class="pb-2">English Translation</th>
                                <th class="pb-2">Status</th>
                                <th class="pb-2 text-right">Officer Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/60 text-slate-300">
                            ${alerts.map(a => {
                                const isNonEng = a.sourceLanguage !== 'en' || (a.detectedLanguage && a.detectedLanguage.toLowerCase() !== 'english');
                                const langBadge = a.detectedLanguage || a.sourceLanguage || 'English';
                                return `
                                    <tr class="hover:bg-slate-800/40 transition">
                                        <td class="py-2.5">
                                            <div class="font-bold text-white">${a.id}</div>
                                            <span class="text-[10px] font-mono text-rose-400">${a.emergencyType || a.disasterType}</span>
                                        </td>
                                        <td class="py-2.5">
                                            <div class="font-bold text-white">${this.escapeHtml(a.contactName || 'Citizen')}</div>
                                            <a href="tel:${this.escapeHtml(a.contactPhone || '+91 94471 00000')}" class="text-[11px] text-cyan-400 hover:underline">
                                                ${this.escapeHtml(a.contactPhone || '+91 94471 00000')}
                                            </a>
                                        </td>
                                        <td class="py-2.5">
                                            <span class="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30 text-[11px]">
                                                🌐 ${langBadge}
                                            </span>
                                        </td>
                                        <td class="py-2.5 max-w-xs">
                                            <div class="text-xs text-white italic truncate max-w-[220px]" title="${this.escapeHtml(a.originalMessage || a.message)}">
                                                "${this.escapeHtml(a.originalMessage || a.message)}"
                                            </div>
                                        </td>
                                        <td class="py-2.5 max-w-xs">
                                            ${a.translationStatus === 'TRANSLATED' && (a.translatedMessage || a.englishTranslation) ? `
                                                <div class="text-xs text-emerald-300 italic truncate max-w-[220px]" title="${this.escapeHtml(a.translatedMessage || a.englishTranslation)}">
                                                    "${this.escapeHtml(a.translatedMessage || a.englishTranslation)}"
                                                </div>
                                            ` : a.translationStatus === 'TRANSLATING' ? `
                                                <span class="text-amber-400 animate-pulse">⏳ Translating...</span>
                                            ` : a.translationStatus === 'FAILED' ? `
                                                <span class="text-rose-400">⚠️ Failed</span>
                                            ` : isNonEng ? `
                                                <span class="text-slate-500">Not Translated</span>
                                            ` : `
                                                <span class="text-slate-500 italic">Native English</span>
                                            `}
                                        </td>
                                        <td class="py-2.5">
                                            <div class="space-y-1">
                                                ${a.isReviewed ? `
                                                    <span class="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40 text-[10px] block w-fit">
                                                        ✓ Reviewed
                                                    </span>
                                                ` : `
                                                    <span class="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] block w-fit">
                                                        ⚠️ Unreviewed
                                                    </span>
                                                `}
                                                <span class="text-[10px] text-slate-400 block">${a.status}</span>
                                            </div>
                                        </td>
                                        <td class="py-2.5 text-right space-x-1.5 whitespace-nowrap">
                                            ${isNonEng ? `
                                                <button class="btn btn-secondary btn-xs text-cyan-300 hover:bg-cyan-950" onclick="adminDashboardView.translateSos('${a.id}')" title="Translate or re-translate">
                                                    🌐 Translate
                                                </button>
                                            ` : ''}
                                            ${!a.isReviewed ? `
                                                <button class="btn btn-secondary btn-xs text-amber-300 hover:bg-amber-950" onclick="adminDashboardView.reviewSos('${a.id}')">
                                                    ✓ Review
                                                </button>
                                            ` : ''}
                                            <button class="btn btn-primary btn-xs" onclick="detailModal.openForAlert('${a.id}')">
                                                Inspect ↗
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async translateSos(id) {
        if (typeof sosService !== 'undefined') {
            await sosService.translateAlert(id, true);
            this.render();
        }
    }

    reviewSos(id) {
        if (typeof sosService !== 'undefined') {
            sosService.markAsReviewed(id, "Officer Admin #01");
            this.render();
        }
    }

    markHoax(id, status) {
        const notes = prompt(`Add Officer Audit Note for ${id}:`, status === 'Rejected' ? 'Fabricated panic viral forward' : 'Verified by District EOC');
        if (notes !== null) {
            alertShieldService.updateReportStatus(id, status, notes, "Cyber Cell Officer #04");
            alert(`✓ Alert ${id} updated to status: ${status}`);
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

const adminDashboardView = new AdminDashboardView();
