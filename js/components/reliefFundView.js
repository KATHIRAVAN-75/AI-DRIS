/**
 * ReliefFund View - Disaster Relief Funding & Financial Transparency Module
 * Renders donation analytics, victim registration form, application status tracker,
 * and transparent distribution ledger.
 */

class ReliefFundView {
    constructor() {
        this.activeTab = "overview"; // overview | register | track | ledger
        this.searchQuery = "";
        this.statusFilter = "ALL";
    }

    render() {
        const container = document.getElementById('view-relieffund');
        if (!container) return;

        const stats = reliefFundService.getStats();

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-7xl mx-auto">
                <!-- Module Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xl">💰</span>
                            <h2 class="text-base font-bold font-mono text-white tracking-wider">
                                RELIEFFUND — DISASTER FINANCIAL ASSISTANCE & TRANSPARENCY
                            </h2>
                            <span class="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40">
                                SIMULATED PUBLIC LEDGER
                            </span>
                        </div>
                        <p class="text-xs text-slate-400 font-mono mt-0.5">
                            Direct beneficiary grants, transparent fund tracking, and multi-tier emergency relief assistance.
                        </p>
                    </div>

                    <!-- Action Tabs -->
                    <div class="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 flex-wrap">
                        <button class="rf-tab-btn ${this.activeTab === 'overview' ? 'active' : ''}" data-tab="overview">
                            📊 Overview
                        </button>
                        <button class="rf-tab-btn ${this.activeTab === 'register' ? 'active' : ''}" data-tab="register">
                            ✍️ Apply for Aid
                        </button>
                        <button class="rf-tab-btn ${this.activeTab === 'track' ? 'active' : ''}" data-tab="track">
                            🔍 Track Status
                        </button>
                        <button class="rf-tab-btn ${this.activeTab === 'ledger' ? 'active' : ''}" data-tab="ledger">
                            📜 Public Ledger
                        </button>
                    </div>
                </div>

                <!-- Simulation Disclaimer Banner -->
                <div class="p-2.5 rounded bg-sky-950/40 border border-sky-500/30 flex items-center justify-between text-xs font-mono text-sky-300">
                    <div class="flex items-center gap-2">
                        <span>ℹ️</span>
                        <span>All financial metrics, disbursements, and transaction IDs are simulated for demonstration purposes. No real bank transfers or payments occur.</span>
                    </div>
                    <span class="text-[10px] bg-sky-900/60 px-2 py-0.5 rounded text-sky-200">DBT SIMULATION MODE</span>
                </div>

                <!-- 4 Top Transparency Metric Cards -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div class="card p-3.5 bg-slate-900/90 border border-slate-700/80">
                        <div class="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                            <span>TOTAL FUNDS ALLOCATED</span>
                            <span>🏛️</span>
                        </div>
                        <div class="text-xl font-black font-mono text-emerald-400">
                            ₹${(stats.totalCollected).toLocaleString('en-IN')}
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono mt-1">Disaster Relief Corpus Pool</div>
                    </div>

                    <div class="card p-3.5 bg-slate-900/90 border border-slate-700/80">
                        <div class="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                            <span>FUNDS DISBURSED</span>
                            <span>💸</span>
                        </div>
                        <div class="text-xl font-black font-mono text-cyan-400">
                            ₹${(stats.totalDistributed).toLocaleString('en-IN')}
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                            <span class="text-emerald-400 font-bold">${Math.round((stats.totalDistributed / stats.totalCollected) * 100)}%</span>
                            <span>distributed to victims</span>
                        </div>
                    </div>

                    <div class="card p-3.5 bg-slate-900/90 border border-slate-700/80">
                        <div class="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                            <span>PENDING VERIFICATION</span>
                            <span>⏳</span>
                        </div>
                        <div class="text-xl font-black font-mono text-amber-400">
                            ${stats.pendingRequests} Applications
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono mt-1">Awaiting field inspection</div>
                    </div>

                    <div class="card p-3.5 bg-slate-900/90 border border-slate-700/80">
                        <div class="flex items-center justify-between text-slate-400 text-xs font-mono mb-1">
                            <span>VERIFIED BENEFICIARIES</span>
                            <span>✅</span>
                        </div>
                        <div class="text-xl font-black font-mono text-purple-400">
                            ${stats.verifiedBeneficiaries} Families
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono mt-1">Aid approved & documented</div>
                    </div>
                </div>

                <!-- Dynamic Tab Content -->
                <div id="rf-tab-content">
                    ${this.renderTabContent(stats)}
                </div>
            </div>
        `;

        this.bindEvents();
    }

    renderTabContent(stats) {
        if (this.activeTab === "register") {
            return this.renderRegisterForm();
        } else if (this.activeTab === "track") {
            return this.renderApplicationTracker();
        } else if (this.activeTab === "ledger") {
            return this.renderLedgerView();
        } else {
            return this.renderOverviewTab(stats);
        }
    }
    renderOverviewTab(stats) {
        const categories = stats.categories || {};
        const total = stats.totalDistributed || 1;

        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="lg:col-span-2 space-y-4">
                    <div class="card p-4 bg-slate-900/80 border border-slate-800">
                        <h3 class="text-xs font-bold font-mono text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                            <span>Relief Category Allocation Breakdown</span>
                            <span class="text-slate-400 text-[11px]">Audit Year 2026</span>
                        </h3>
                        <div class="space-y-3 font-mono text-xs">
                            ${Object.keys(categories).map(cat => {
                                const amount = categories[cat];
                                const pct = Math.round((amount / total) * 100);
                                return `
                                    <div>
                                        <div class="flex justify-between text-slate-300 text-[11px] mb-1">
                                            <span>${cat}</span>
                                            <span class="text-emerald-400 font-bold">₹${amount.toLocaleString('en-IN')} (${pct}%)</span>
                                        </div>
                                        <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div class="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full" style="width: ${pct}%"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="card p-4 bg-slate-900/80 border border-slate-800">
                        <div class="flex items-center justify-between mb-3">
                            <h3 class="text-xs font-bold font-mono text-white uppercase tracking-wider">
                                Recent Relief Applications
                            </h3>
                            <button class="text-xs text-sky-400 hover:underline font-mono" onclick="reliefFundView.switchTab('track')">
                                View All ➔
                            </button>
                        </div>
                        <div class="space-y-2">
                            ${reliefFundService.getBeneficiaries().slice(0, 4).map(b => this.renderBeneficiaryCard(b)).join('')}
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="card p-4 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80">
                        <div class="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xl mb-3">🤝</div>
                        <h3 class="text-sm font-bold font-mono text-white mb-1">Disaster Victim Assistance</h3>
                        <p class="text-xs text-slate-400 font-mono mb-4 leading-relaxed">
                            Are you or your family affected by flood, cyclone, or building collapse? Register immediately to request rations, medical aid, temporary shelter, or direct financial support.
                        </p>
                        <button class="btn btn-primary w-full text-xs font-mono py-2" onclick="reliefFundView.switchTab('register')">
                            ✍️ Submit Relief Application
                        </button>
                    </div>

                    <div class="card p-3.5 bg-slate-900/60 border border-slate-800 font-mono text-xs text-slate-400 space-y-2">
                        <div class="text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <span>🛡️</span>
                            <span>Integrity & Verification Controls</span>
                        </div>
                        <p class="text-[11px] leading-relaxed">• Geo-tagged damage photo and field revenue inspector validation.</p>
                        <p class="text-[11px] leading-relaxed">• Multi-agency deduplication against district ration and Aadhaar cards.</p>
                        <p class="text-[11px] leading-relaxed">• Public audit hash recorded on transparent ledger for every disbursed rupee.</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderRegisterForm() {
        return `
            <div class="card p-5 bg-slate-900/90 border border-slate-700 max-w-3xl mx-auto">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <div>
                        <h3 class="text-sm font-bold font-mono text-white">VICTIM RELIEF ASSISTANCE APPLICATION</h3>
                        <p class="text-xs text-slate-400 font-mono">Fill in details for immediate food, medicine, shelter, or grant assistance.</p>
                    </div>
                    <span class="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">FORM #RF-2026</span>
                </div>

                <form id="rf-register-form" class="space-y-4 text-xs font-mono">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-300 mb-1">Full Name / Head of Household *</label>
                            <input type="text" id="rf-name" required class="tactical-input w-full" placeholder="e.g. Ramesh Kumar">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1">Contact Phone / Mobile Number *</label>
                            <input type="tel" id="rf-phone" required class="tactical-input w-full" placeholder="e.g. +91 98401 23456">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label class="block text-slate-300 mb-1">Location / Ward / Sector *</label>
                            <input type="text" id="rf-location" required class="tactical-input w-full" placeholder="e.g. Arumparthapuram Sector 2">
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1">Disaster Type *</label>
                            <select id="rf-disaster" class="tactical-select w-full">
                                <option value="Flood">🌊 Flood</option>
                                <option value="Cyclone">🌪️ Cyclone</option>
                                <option value="Building Collapse">🏚️ Building Collapse</option>
                                <option value="Earthquake">🌎 Earthquake</option>
                                <option value="Landslide">⛰️ Landslide</option>
                                <option value="Fire">🔥 Fire</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1">Family Members Affected *</label>
                            <input type="number" id="rf-family" min="1" max="25" value="4" required class="tactical-input w-full">
                        </div>
                    </div>

                    <div>
                        <label class="block text-slate-300 mb-1">Assistance Required (Select All Applicable) *</label>
                        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
                            <label class="flex items-center gap-2 p-2 rounded bg-slate-800/80 border border-slate-700 cursor-pointer hover:border-slate-500">
                                <input type="checkbox" name="rf-needs" value="Food" checked class="rounded border-slate-600 text-sky-500">
                                <span class="text-[11px] text-slate-200">🍚 Food & Water</span>
                            </label>
                            <label class="flex items-center gap-2 p-2 rounded bg-slate-800/80 border border-slate-700 cursor-pointer hover:border-slate-500">
                                <input type="checkbox" name="rf-needs" value="Medicine" checked class="rounded border-slate-600 text-sky-500">
                                <span class="text-[11px] text-slate-200">🩺 Medicine</span>
                            </label>
                            <label class="flex items-center gap-2 p-2 rounded bg-slate-800/80 border border-slate-700 cursor-pointer hover:border-slate-500">
                                <input type="checkbox" name="rf-needs" value="Shelter" class="rounded border-slate-600 text-sky-500">
                                <span class="text-[11px] text-slate-200">⛺ Shelter</span>
                            </label>
                            <label class="flex items-center gap-2 p-2 rounded bg-slate-800/80 border border-slate-700 cursor-pointer hover:border-slate-500">
                                <input type="checkbox" name="rf-needs" value="Clothing" class="rounded border-slate-600 text-sky-500">
                                <span class="text-[11px] text-slate-200">👕 Clothing</span>
                            </label>
                            <label class="flex items-center gap-2 p-2 rounded bg-slate-800/80 border border-slate-700 cursor-pointer hover:border-slate-500">
                                <input type="checkbox" name="rf-needs" value="Financial Aid" checked class="rounded border-slate-600 text-sky-500">
                                <span class="text-[11px] text-slate-200">💵 Direct Aid</span>
                            </label>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-slate-300 mb-1">Estimated Relief Amount Requested (₹ INR)</label>
                            <input type="number" id="rf-amount" step="1000" min="2000" max="100000" value="20000" class="tactical-input w-full">
                            <span class="text-[10px] text-slate-400">Standard emergency relief slab: ₹10,000 – ₹40,000</span>
                        </div>
                        <div>
                            <label class="block text-slate-300 mb-1">Damage Description & Urgent Needs *</label>
                            <textarea id="rf-damage" rows="3" required class="tactical-input w-full text-xs" placeholder="Describe water level, structural destruction, loss of food grains, injured persons..."></textarea>
                        </div>
                    </div>

                    <div class="flex items-center justify-between pt-3 border-t border-slate-800">
                        <button type="button" class="btn btn-secondary text-xs" onclick="reliefFundView.switchTab('overview')">Cancel</button>
                        <button type="submit" class="btn btn-primary text-xs flex items-center gap-2">
                            <span>🚀</span>
                            <span>Submit Relief Application</span>
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    renderApplicationTracker() {
        const beneficiaries = reliefFundService.getBeneficiaries(this.statusFilter, this.searchQuery);

        return `
            <div class="space-y-4">
                <div class="card p-3 bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 font-mono text-xs">
                    <div class="relative w-full md:w-80">
                        <input type="text" id="rf-search-input" value="${this.searchQuery}" class="tactical-input w-full pl-8 text-xs" placeholder="Search ID (RF-2026-101), Name, Location...">
                        <span class="absolute left-2.5 top-2.5 text-slate-400">🔍</span>
                    </div>

                    <div class="flex items-center gap-2 w-full md:w-auto">
                        <span class="text-slate-400 text-xs">Status:</span>
                        <select id="rf-status-filter" class="tactical-select text-xs">
                            <option value="ALL" ${this.statusFilter === 'ALL' ? 'selected' : ''}>All Statuses</option>
                            <option value="Pending" ${this.statusFilter === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                            <option value="Under Verification" ${this.statusFilter === 'Under Verification' ? 'selected' : ''}>🔎 Under Verification</option>
                            <option value="Approved" ${this.statusFilter === 'Approved' ? 'selected' : ''}>✅ Approved</option>
                            <option value="Distributed" ${this.statusFilter === 'Distributed' ? 'selected' : ''}>💸 Distributed</option>
                        </select>
                        <button class="btn btn-secondary btn-xs text-sky-400" onclick="reliefFundView.resetFilters()">
                            Reset
                        </button>
                    </div>
                </div>

                <div class="space-y-3">
                    ${beneficiaries.length === 0 ? `
                        <div class="card p-8 bg-slate-900/60 border border-slate-800 text-center font-mono text-slate-400 text-xs">
                            No relief applications found matching "${this.searchQuery}".
                        </div>
                    ` : beneficiaries.map(b => this.renderBeneficiaryCard(b, true)).join('')}
                </div>
            </div>
        `;
    }

    renderBeneficiaryCard(b, detailed = false) {
        let badgeColor = "bg-amber-950 text-amber-400 border-amber-500/40";
        let statusStep = 1;
        if (b.status === "Under Verification") {
            badgeColor = "bg-sky-950 text-sky-400 border-sky-500/40";
            statusStep = 2;
        } else if (b.status === "Approved") {
            badgeColor = "bg-emerald-950 text-emerald-400 border-emerald-500/40";
            statusStep = 3;
        } else if (b.status === "Distributed") {
            badgeColor = "bg-purple-950 text-purple-300 border-purple-500/40";
            statusStep = 4;
        }

        return `
            <div class="card p-3.5 bg-slate-900 border border-slate-700/80 hover:border-slate-500 transition font-mono">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-white">${b.name}</span>
                        <span class="text-[11px] text-cyan-400 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">${b.id}</span>
                        <span class="text-[10px] text-slate-400">📍 ${b.location}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="text-[11px] font-bold px-2 py-0.5 rounded border ${badgeColor}">
                            ${b.status}
                        </span>
                        <span class="text-emerald-400 font-bold text-xs">
                            ₹${(b.amountApproved > 0 ? b.amountApproved : b.amountRequested).toLocaleString('en-IN')}
                        </span>
                    </div>
                </div>

                <div class="text-xs text-slate-300 mb-2">
                    <span class="text-slate-400">Assistance:</span>
                    ${b.assistanceRequired.map(need => `<span class="inline-block bg-slate-800 text-slate-200 text-[10px] px-1.5 py-0.5 rounded mr-1">${need}</span>`).join('')}
                    <span class="text-slate-400 ml-2">Family: ${b.familySize} members</span>
                </div>

                <div class="text-xs text-slate-400 italic mb-3 bg-slate-950/60 p-2 rounded border border-slate-800">
                    "${b.damageDetails}"
                </div>

                <div class="pt-2 border-t border-slate-800/80">
                    <div class="flex items-center justify-between text-[10px] text-slate-400">
                        <span class="${statusStep >= 1 ? 'text-amber-400 font-bold' : ''}">1. Pending</span>
                        <span class="text-slate-600">➔</span>
                        <span class="${statusStep >= 2 ? 'text-sky-400 font-bold' : ''}">2. Under Verification</span>
                        <span class="text-slate-600">➔</span>
                        <span class="${statusStep >= 3 ? 'text-emerald-400 font-bold' : ''}">3. Approved</span>
                        <span class="text-slate-600">➔</span>
                        <span class="${statusStep >= 4 ? 'text-purple-400 font-bold' : ''}">4. Distributed</span>
                    </div>
                    <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div class="bg-gradient-to-r from-amber-500 via-sky-500 to-emerald-400 h-full rounded-full" style="width: ${statusStep * 25}%"></div>
                    </div>
                </div>

                ${b.txnId ? `
                    <div class="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Transaction ID: <span class="text-purple-300 font-bold">${b.txnId}</span></span>
                        <span>Disbursed on: ${new Date(b.distributedAt || b.submittedAt).toLocaleDateString()}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderLedgerView() {
        const ledger = reliefFundService.getDistributions();

        return `
            <div class="card p-4 bg-slate-900/90 border border-slate-800 font-mono">
                <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div>
                        <h3 class="text-sm font-bold text-white uppercase tracking-wider">
                            Public Disaster Relief Distribution Ledger
                        </h3>
                        <p class="text-xs text-slate-400">Transparent historical disbursement log for citizen and auditor verification.</p>
                    </div>
                    <span class="text-xs text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/40">
                        ✓ 100% Audit Verified
                    </span>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead>
                            <tr class="text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                                <th class="pb-2">TXN ID</th>
                                <th class="pb-2">Date / Time</th>
                                <th class="pb-2">Beneficiary</th>
                                <th class="pb-2">Location</th>
                                <th class="pb-2">Category</th>
                                <th class="pb-2">Disbursed Amount</th>
                                <th class="pb-2">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800/60 text-slate-300">
                            ${ledger.map(tx => `
                                <tr class="hover:bg-slate-800/40 transition">
                                    <td class="py-2.5 text-cyan-400 font-bold">${tx.txnId}</td>
                                    <td class="py-2.5 text-slate-400 text-[11px]">${tx.date}</td>
                                    <td class="py-2.5 text-white font-bold">${tx.beneficiaryName}</td>
                                    <td class="py-2.5 text-slate-400">${tx.location}</td>
                                    <td class="py-2.5">
                                        <span class="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded">${tx.category}</span>
                                    </td>
                                    <td class="py-2.5 text-emerald-400 font-bold">₹${tx.amount.toLocaleString('en-IN')}</td>
                                    <td class="py-2.5">
                                        <span class="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">${tx.status}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    bindEvents() {
        document.querySelectorAll('.rf-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        const form = document.getElementById('rf-register-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const needs = Array.from(document.querySelectorAll('input[name="rf-needs"]:checked')).map(cb => cb.value);
                if (needs.length === 0) {
                    alert("Please select at least one assistance requirement.");
                    return;
                }

                const data = {
                    name: document.getElementById('rf-name').value,
                    phone: document.getElementById('rf-phone').value,
                    location: document.getElementById('rf-location').value,
                    disasterType: document.getElementById('rf-disaster').value,
                    familySize: document.getElementById('rf-family').value,
                    assistanceRequired: needs,
                    amountRequested: document.getElementById('rf-amount').value,
                    damageDetails: document.getElementById('rf-damage').value
                };

                const newRec = reliefFundService.registerVictim(data);
                alert(`✓ Relief Application Registered Successfully!\nReference ID: ${newRec.id}\nStatus: Pending Officer Verification.`);
                this.switchTab('track');
            });
        }

        const searchInput = document.getElementById('rf-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.refreshTracker();
            });
        }

        const filterSelect = document.getElementById('rf-status-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.statusFilter = e.target.value;
                this.refreshTracker();
            });
        }
    }

    switchTab(tab) {
        this.activeTab = tab;
        this.render();
    }

    resetFilters() {
        this.searchQuery = "";
        this.statusFilter = "ALL";
        this.refreshTracker();
    }

    refreshTracker() {
        const tabContent = document.getElementById('rf-tab-content');
        if (tabContent && this.activeTab === 'track') {
            tabContent.innerHTML = this.renderApplicationTracker();
            this.bindEvents();
        }
    }
}

const reliefFundView = new ReliefFundView();
