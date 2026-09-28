/**
 * ReliefFund Service - Disaster Relief Assistance & Financial Transparency
 * Manages victim registrations, assistance requirements, application approval lifecycle,
 * and transparent distribution ledgers with simulated financial metrics.
 */

class ReliefFundService {
    constructor() {
        let initFunds = typeof INITIAL_RELIEF_FUNDS !== 'undefined' ? INITIAL_RELIEF_FUNDS : null;
        let initBeneficiaries = typeof SAMPLE_BENEFICIARIES !== 'undefined' ? SAMPLE_BENEFICIARIES : null;
        let initDistributions = typeof SAMPLE_FUND_DISTRIBUTIONS !== 'undefined' ? SAMPLE_FUND_DISTRIBUTIONS : null;

        if ((!initFunds || !initBeneficiaries) && typeof require !== 'undefined') {
            try {
                const sample = require('../data/sample_data.js');
                initFunds = initFunds || sample.INITIAL_RELIEF_FUNDS;
                initBeneficiaries = initBeneficiaries || sample.SAMPLE_BENEFICIARIES;
                initDistributions = initDistributions || sample.SAMPLE_FUND_DISTRIBUTIONS;
            } catch(e) {}
        }

        this.fundStats = JSON.parse(JSON.stringify(initFunds || { totalCollected: 5000000, totalDistributed: 2850000, pendingRequests: 12, verifiedBeneficiaries: 48, categories: {} }));
        this.beneficiaries = JSON.parse(JSON.stringify(initBeneficiaries || []));
        this.distributions = JSON.parse(JSON.stringify(initDistributions || []));
        this.listeners = {};

        if (typeof localStorage !== 'undefined') {
            try {
                const storedBeneficiaries = localStorage.getItem('drc_relief_beneficiaries');
                if (storedBeneficiaries) {
                    this.beneficiaries = JSON.parse(storedBeneficiaries);
                }
                const storedStats = localStorage.getItem('drc_relief_stats');
                if (storedStats) {
                    this.fundStats = JSON.parse(storedStats);
                }
                const storedDistributions = localStorage.getItem('drc_relief_distributions');
                if (storedDistributions) {
                    this.distributions = JSON.parse(storedDistributions);
                }
            } catch(e) {}
        }
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => {
                try { cb(data); } catch(e) { console.error("ReliefFund event error:", e); }
            });
        }
    }

    getStats() {
        // Recalculate dynamic counts
        const pendingCount = this.beneficiaries.filter(b => b.status === "Pending" || b.status === "Under Verification").length;
        const verifiedCount = this.beneficiaries.filter(b => b.status === "Approved" || b.status === "Distributed").length;
        
        return {
            ...this.fundStats,
            pendingRequests: pendingCount,
            verifiedBeneficiaries: verifiedCount,
            remainingFunds: Math.max(0, this.fundStats.totalCollected - this.fundStats.totalDistributed)
        };
    }

    getBeneficiaries(filterStatus = "ALL", searchQuery = "") {
        let results = [...this.beneficiaries];
        
        if (filterStatus && filterStatus !== "ALL") {
            results = results.filter(b => b.status.toLowerCase() === filterStatus.toLowerCase());
        }

        if (searchQuery && searchQuery.trim() !== "") {
            const q = searchQuery.toLowerCase().trim();
            results = results.filter(b => 
                b.id.toLowerCase().includes(q) ||
                b.name.toLowerCase().includes(q) ||
                b.phone.toLowerCase().includes(q) ||
                b.location.toLowerCase().includes(q) ||
                b.disasterType.toLowerCase().includes(q)
            );
        }

        // Sort: Pending and Under Verification first, then by submittedAt desc
        const statusWeight = { "Pending": 4, "Under Verification": 3, "Approved": 2, "Distributed": 1 };
        results.sort((a, b) => (statusWeight[b.status] || 0) - (statusWeight[a.status] || 0));
        return results;
    }

    getBeneficiaryById(id) {
        return this.beneficiaries.find(b => b.id.toLowerCase() === id.toLowerCase());
    }

    registerVictim(data) {
        const nextNum = Math.floor(100 + Math.random() * 900);
        const newId = `RF-2026-${nextNum}`;

        const newRecord = {
            id: newId,
            name: (data.name || "").trim(),
            phone: (data.phone || "").trim(),
            location: (data.location || "").trim(),
            disasterType: data.disasterType || "Flood",
            familySize: parseInt(data.familySize, 10) || 1,
            damageDetails: (data.damageDetails || "").trim(),
            assistanceRequired: Array.isArray(data.assistanceRequired) ? data.assistanceRequired : ["Food"],
            amountRequested: parseFloat(data.amountRequested) || 15000,
            amountApproved: 0,
            status: "Pending",
            submittedAt: new Date().toISOString(),
            verifiedBy: null,
            distributedAt: null,
            txnId: null
        };

        this.beneficiaries.unshift(newRecord);
        this.fundStats.pendingRequests += 1;
        this.saveToStorage();
        this.emit('beneficiary-registered', newRecord);
        this.emit('stats-updated', this.getStats());
        return newRecord;
    }

    updateApplicationStatus(id, newStatus, approvedAmount = null, officerName = "Relief Officer", notes = "") {
        const beneficiary = this.getBeneficiaryById(id);
        if (!beneficiary) return null;

        const oldStatus = beneficiary.status;
        beneficiary.status = newStatus;

        if (newStatus === "Approved") {
            beneficiary.amountApproved = approvedAmount !== null ? parseFloat(approvedAmount) : beneficiary.amountRequested;
            beneficiary.verifiedBy = officerName;
            beneficiary.approvedAt = new Date().toISOString();
        } else if (newStatus === "Distributed") {
            const finalAmount = approvedAmount !== null ? parseFloat(approvedAmount) : (beneficiary.amountApproved || beneficiary.amountRequested);
            beneficiary.amountApproved = finalAmount;
            beneficiary.distributedAt = new Date().toISOString();
            beneficiary.verifiedBy = officerName;

            const txnId = `TXN-RF-${Math.floor(10000 + Math.random() * 90000)}`;
            beneficiary.txnId = txnId;

            // Add to distribution ledger
            const ledgerEntry = {
                id: `DIST-${String(this.distributions.length + 1).padStart(3, '0')}`,
                txnId: txnId,
                beneficiaryId: beneficiary.id,
                beneficiaryName: beneficiary.name,
                location: beneficiary.location,
                category: beneficiary.assistanceRequired.join(", "),
                amount: finalAmount,
                date: new Date().toLocaleString(),
                paymentMode: "Direct Benefit Transfer (DBT Simulation)",
                status: "Completed"
            };
            this.distributions.unshift(ledgerEntry);

            // Update fund balances
            this.fundStats.totalDistributed += finalAmount;
            
            // Allocate to primary category
            const primaryCat = beneficiary.assistanceRequired[0] || "Food & Rations";
            if (this.fundStats.categories[primaryCat]) {
                this.fundStats.categories[primaryCat] += finalAmount;
            }
        }

        this.saveToStorage();
        this.emit('status-changed', { beneficiary, oldStatus, newStatus });
        this.emit('stats-updated', this.getStats());
        return beneficiary;
    }

    saveToStorage() {
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('drc_relief_beneficiaries', JSON.stringify(this.beneficiaries));
                localStorage.setItem('drc_relief_stats', JSON.stringify(this.fundStats));
                localStorage.setItem('drc_relief_distributions', JSON.stringify(this.distributions));
            } catch (e) {}
        }
    }

    getDistributions() {
        return [...this.distributions];
    }
}

const reliefFundService = new ReliefFundService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ReliefFundService, reliefFundService };
}
