const _PRIORITIES = (typeof PRIORITIES !== 'undefined')
    ? PRIORITIES
    : ((typeof require !== 'undefined') ? require('../config.js').PRIORITIES : {});

const _SAMPLE_SOS_ALERTS = (typeof SAMPLE_SOS_ALERTS !== 'undefined')
    ? SAMPLE_SOS_ALERTS
    : ((typeof require !== 'undefined') ? require('../data/sample_data.js').SAMPLE_SOS_ALERTS : []);

const _getAiService = () => (typeof aiAnalysisService !== 'undefined')
    ? aiAnalysisService
    : ((typeof require !== 'undefined') ? require('./aiAnalysisService.js').aiAnalysisService : null);

const _getRescueTeamService = () => (typeof rescueTeamService !== 'undefined')
    ? rescueTeamService
    : ((typeof require !== 'undefined') ? require('./rescueTeamService.js').rescueTeamService : null);

const _getHospitalService = () => (typeof hospitalService !== 'undefined')
    ? hospitalService
    : ((typeof require !== 'undefined') ? require('./hospitalService.js').hospitalService : null);

const _getDisasterZoneService = () => (typeof disasterZoneService !== 'undefined')
    ? disasterZoneService
    : ((typeof require !== 'undefined') ? require('./disasterZoneService.js').disasterZoneService : null);

class SOSService {
    constructor() {
        this.listeners = {};
        this.alerts = [];
        this.selectedAlertId = null;
        this.audioEnabled = true;
        this.networkStatus = "ACTIVE"; // ACTIVE, WEAK, OFFLINE
        this.filterState = {
            searchQuery: "",
            disasterType: "ALL",
            priority: "ALL",
            status: "ALL",
            reportType: "ALL", // "ALL", "SOS", "INCIDENT"
            assignmentState: "ALL", // "ALL", "UNASSIGNED", "ASSIGNED"
            zoneId: "ALL"
        };

        this.init();
    }

    init() {
        // Load from LocalStorage if available
        const saved = (typeof localStorage !== 'undefined') ? localStorage.getItem("drc_sos_alerts") : null;
        if (saved) {
            try {
                this.alerts = JSON.parse(saved);
            } catch (e) {
                console.warn("Failed to parse saved alerts, resetting to sample data.", e);
                this.alerts = JSON.parse(JSON.stringify(_SAMPLE_SOS_ALERTS));
            }
        } else {
            this.alerts = JSON.parse(JSON.stringify(_SAMPLE_SOS_ALERTS));
            this.saveToStorage();
        }

        // Schema integrity migration: ensure multilingual fields exist on all loaded alerts
        this.alerts.forEach(a => {
            if (!a.originalMessage) a.originalMessage = a.message || "Emergency report";
            if (!a.contactName) a.contactName = a.reportType === 'SOS' ? 'Citizen' : 'Observer';
            if (!a.contactPhone) a.contactPhone = '+91 94471 00000';
            if (!a.sourceLanguage) {
                if (typeof translationService !== 'undefined') {
                    a.sourceLanguage = translationService.detectScriptLanguage(a.originalMessage || a.message);
                    a.detectedLanguage = translationService.getLanguageName(a.sourceLanguage);
                } else {
                    a.sourceLanguage = 'en';
                    a.detectedLanguage = 'English';
                }
            }
            if (!a.translationStatus) {
                a.translationStatus = (a.sourceLanguage === 'en' ? 'TRANSLATED' : 'NOT_TRANSLATED');
            }
            if (a.isReviewed === undefined) a.isReviewed = false;
        });

        // Set initial selected alert to first critical alert if exists
        const firstCritical = this.alerts.find(a => this.getEffectivePriority(a) === 'CRITICAL');
        if (firstCritical) {
            this.selectedAlertId = firstCritical.id;
        } else if (this.alerts.length > 0) {
            this.selectedAlertId = this.alerts[0].id;
        }
    }

    /**
     * Multilingual SOS Translation Trigger
     */
    async translateAlert(alertId, forceRetry = false) {
        const alert = this.getAlertById(alertId);
        if (!alert) return null;

        if (alert.translationStatus === 'TRANSLATED' && !forceRetry && alert.translatedMessage) {
            return alert;
        }

        alert.translationStatus = 'TRANSLATING';
        this.emit('alert-updated', alert);
        this.emit('alerts-updated', this.getFilteredAlerts());

        try {
            const trService = (typeof translationService !== 'undefined')
                ? translationService
                : ((typeof require !== 'undefined') ? require('./translationService.js').translationService : null);

            if (!trService) throw new Error("Translation service unavailable");

            const res = await trService.translateToEnglish(alert.originalMessage || alert.message, alert.sourceLanguage || 'auto');

            alert.translatedMessage = res.translatedText;
            alert.detectedLanguage = res.detectedLanguage || alert.detectedLanguage;
            alert.sourceLanguage = res.sourceLanguage || alert.sourceLanguage;
            alert.translationStatus = 'TRANSLATED';

            if (!alert.history) alert.history = [];
            alert.history.push({
                timestamp: new Date().toISOString(),
                action: `Translated message into English (${res.provider || 'AI Engine'})`,
                author: "Translation Engine"
            });

            this.saveToStorage();
            this.emit('alert-updated', alert);
            this.emit('alerts-updated', this.getFilteredAlerts());

            // Try server sync
            try {
                if (typeof fetch !== 'undefined') {
                    fetch(`/api/sos/${alert.id}/translate`, { method: 'POST' }).catch(() => {});
                }
            } catch (e) {}

            return alert;
        } catch (err) {
            console.error("Translation error for alert:", alertId, err);
            alert.translationStatus = 'FAILED';
            this.saveToStorage();
            this.emit('alert-updated', alert);
            this.emit('alerts-updated', this.getFilteredAlerts());
            return alert;
        }
    }

    /**
     * Mark message as reviewed and actioned by human officer
     */
    markAsReviewed(alertId, officerId = "Officer #01") {
        const alert = this.getAlertById(alertId);
        if (!alert) return null;

        alert.isReviewed = true;
        alert.reviewedBy = officerId;
        alert.reviewedAt = new Date().toISOString();

        if (!alert.history) alert.history = [];
        alert.history.push({
            timestamp: new Date().toISOString(),
            action: `Distress message reviewed and confirmed by ${officerId}`,
            author: officerId
        });

        this.saveToStorage();
        this.emit('alert-updated', alert);
        this.emit('alerts-updated', this.getFilteredAlerts());

        // Sync to backend if available
        try {
            if (typeof fetch !== 'undefined') {
                fetch(`/api/sos/${alert.id}/review`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ officerId })
                }).catch(() => {});
            }
        } catch (e) {}

        return alert;
    }

    /**
     * Automatic translation toggle settings
     */
    setAutoTranslate(enabled) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('drc_auto_translate', enabled ? 'true' : 'false');
        }
        this.emit('auto-translate-changed', enabled);

        // If enabled, auto-translate any non-English un-translated alerts
        if (enabled) {
            this.alerts.forEach(a => {
                if (a.sourceLanguage !== 'en' && a.translationStatus !== 'TRANSLATED') {
                    this.translateAlert(a.id);
                }
            });
        }
    }

    isAutoTranslateEnabled() {
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem('drc_auto_translate') === 'true';
        }
        return false;
    }

    saveToStorage() {
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem("drc_sos_alerts", JSON.stringify(this.alerts));
            } catch (e) {
                console.error("Storage error:", e);
            }
        }
    }

    resetToDemoData() {
        this.alerts = JSON.parse(JSON.stringify(_SAMPLE_SOS_ALERTS));
        this.saveToStorage();
        this.emit('alerts-updated', this.getFilteredAlerts());
        this.emit('stats-updated', this.getStats());
        if (this.alerts.length > 0) {
            this.selectAlert(this.alerts[0].id);
        }
    }

    // Pub/Sub system
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    getEffectivePriority(alert) {
        if (alert.aiAnalysis && alert.aiAnalysis.operatorOverride && alert.aiAnalysis.operatorOverride.effectivePriority) {
            return alert.aiAnalysis.operatorOverride.effectivePriority;
        }
        return alert.aiAnalysis ? alert.aiAnalysis.priority : (alert.priority || "MEDIUM");
    }

    getEffectiveDangerScore(alert) {
        return alert.aiAnalysis?.dangerScore || 65;
    }

    getAllAlerts() {
        return [...this.alerts];
    }

    getAlertById(id) {
        return this.alerts.find(a => a.id === id);
    }

    getSelectedAlert() {
        return this.alerts.find(a => a.id === this.selectedAlertId) || null;
    }

    selectAlert(id) {
        this.selectedAlertId = id;
        const alert = this.getAlertById(id);
        this.emit('alert-selected', alert);
    }

    /**
     * Add a new incoming SOS alert (Victim route /sos or simulated)
     */
    addSOS(rawPayload) {
        const id = rawPayload.id || `#RQ${Math.floor(1000 + Math.random() * 9000)}`;

        const detectedSrc = rawPayload.sourceLanguage || 
            (typeof translationService !== 'undefined' ? translationService.detectScriptLanguage(rawPayload.message) : "auto");
        const detectedName = rawPayload.detectedLanguage || 
            (typeof translationService !== 'undefined' ? translationService.getLanguageName(detectedSrc) : "Detected");

        const newSOS = {
            id: id,
            reportType: "SOS",
            disasterType: rawPayload.disasterType || "Flood",
            emergencyType: rawPayload.emergencyType || "Trapped",
            message: rawPayload.message || "Emergency assistance requested.",
            originalMessage: rawPayload.originalMessage || rawPayload.message || "Emergency assistance requested.",
            contactName: rawPayload.contactName || "Citizen Victim",
            contactPhone: rawPayload.contactPhone || "+91 94471 00000",
            sourceLanguage: detectedSrc,
            detectedLanguage: detectedName,
            translatedMessage: rawPayload.translatedMessage || null,
            translationStatus: rawPayload.translationStatus || (detectedSrc === 'en' ? 'TRANSLATED' : 'NOT_TRANSLATED'),
            isReviewed: !!rawPayload.isReviewed,
            reviewedBy: rawPayload.reviewedBy || null,
            reviewedAt: rawPayload.reviewedAt || null,
            latitude: parseFloat(rawPayload.latitude) || 11.9139,
            longitude: parseFloat(rawPayload.longitude) || 79.8145,
            address: rawPayload.address || `Detected GPS [${parseFloat(rawPayload.latitude || 11.9139).toFixed(4)}, ${parseFloat(rawPayload.longitude || 79.8145).toFixed(4)}]`,
            timestamp: rawPayload.timestamp || new Date().toISOString(),
            battery: rawPayload.battery !== undefined ? parseInt(rawPayload.battery) : 42,
            hopCount: rawPayload.hopCount !== undefined ? parseInt(rawPayload.hopCount) : 3,
            relayPath: rawPayload.relayPath || ["Victim-Node", "Mesh-Hop-1", "Gateway-South"],
            peopleCount: rawPayload.peopleCount ? parseInt(rawPayload.peopleCount) : 4,
            injured: rawPayload.injured !== undefined ? !!rawPayload.injured : false,
            vulnerable: rawPayload.vulnerable !== undefined ? !!rawPayload.vulnerable : false,
            isVerified: false,
            verifiedBy: null,
            verifiedAt: null,
            status: "NEW",
            assignedTeam: null,
            hospitalId: null,
            hasVoice: !!rawPayload.hasVoice,
            voiceDurationSeconds: rawPayload.voiceDurationSeconds || 8,
            photoUrl: rawPayload.photoUrl || null,
            history: [
                { timestamp: new Date().toISOString(), action: `SOS Transmitted via ${rawPayload.hopCount || 3}-Hop Android Mesh in ${detectedName}`, author: "Victim Node" }
            ]
        };

        // Run AI Analysis & Danger Score Engine
        const aiService = _getAiService();
        const analysis = aiService ? aiService.analyze(newSOS) : { priority: "HIGH", dangerScore: 91, confidence: 95 };
        newSOS.aiAnalysis = analysis;
        newSOS.history.push({
            timestamp: new Date().toISOString(),
            action: `AI Classification: Danger Score ${analysis.dangerScore}/100 (${analysis.priority} Priority, ${analysis.confidence}% Conf)`,
            author: "AI Smart Reader"
        });

        // Insert at beginning of queue
        this.alerts.unshift(newSOS);
        this.saveToStorage();

        // Audio chime
        if (this.audioEnabled) {
            this.playAlertSound(analysis.priority === 'CRITICAL' || analysis.dangerScore >= 80);
        }

        // Notify
        this.emit('new-sos-received', newSOS);
        this.emit('alerts-updated', this.getFilteredAlerts());
        this.emit('stats-updated', this.getStats());

        // Check if auto-translate is enabled and alert needs translation
        if (this.isAutoTranslateEnabled() && newSOS.sourceLanguage !== 'en' && newSOS.translationStatus !== 'TRANSLATED') {
            this.translateAlert(newSOS.id);
        }

        this.selectAlert(newSOS.id);
        return newSOS;
    }

    /**
     * Add a citizen incident report (/report route)
     */
    addIncident(rawPayload) {
        const id = rawPayload.id || `#IN${Math.floor(2000 + Math.random() * 8000)}`;

        const newIncident = {
            id: id,
            reportType: "INCIDENT",
            disasterType: rawPayload.disasterType || "Bridge Damage",
            emergencyType: "Disaster Hazard",
            message: rawPayload.message || "Hazardous condition reported by community observer.",
            latitude: parseFloat(rawPayload.latitude) || 11.9280,
            longitude: parseFloat(rawPayload.longitude) || 79.8220,
            address: rawPayload.address || `Hazard Location [${parseFloat(rawPayload.latitude || 11.9280).toFixed(4)}, ${parseFloat(rawPayload.longitude || 79.8220).toFixed(4)}]`,
            timestamp: rawPayload.timestamp || new Date().toISOString(),
            battery: 75,
            hopCount: 1,
            relayPath: ["Citizen-Node", "Gateway-Central"],
            peopleCount: rawPayload.peopleCount ? parseInt(rawPayload.peopleCount) : 0,
            injured: false,
            vulnerable: false,
            isVerified: false,
            verifiedBy: null,
            verifiedAt: null,
            status: "NEW",
            assignedTeam: null,
            hospitalId: null,
            hasVoice: !!rawPayload.hasVoice,
            voiceDurationSeconds: rawPayload.voiceDurationSeconds || 0,
            photoUrl: rawPayload.photoUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60",
            history: [
                { timestamp: new Date().toISOString(), action: `Community Incident Report registered`, author: "Public Citizen" }
            ]
        };

        const aiService = _getAiService();
        const analysis = aiService ? aiService.analyze(newIncident) : { priority: "MEDIUM", dangerScore: 55, confidence: 90 };
        newIncident.aiAnalysis = analysis;
        newIncident.history.push({
            timestamp: new Date().toISOString(),
            action: `AI Classification: Danger Score ${analysis.dangerScore}/100 (${analysis.priority} Priority)`,
            author: "AI Engine"
        });

        this.alerts.unshift(newIncident);
        this.saveToStorage();

        if (this.audioEnabled) {
            this.playAlertSound(false);
        }

        this.emit('new-sos-received', newIncident);
        this.emit('alerts-updated', this.getFilteredAlerts());
        this.emit('stats-updated', this.getStats());

        this.selectAlert(newIncident.id);
        return newIncident;
    }

    /**
     * Verify AI Analysis by human officer
     */
    verifyAIAnalysis(id, officerId = "Officer #01") {
        const alert = this.getAlertById(id);
        if (!alert) return false;

        alert.isVerified = true;
        alert.verifiedBy = officerId;
        alert.verifiedAt = new Date().toISOString();
        alert.status = "OFFICER VERIFIED";

        const aiService = _getAiService();
        if (alert.aiAnalysis && aiService) {
            alert.aiAnalysis = aiService.verifyAnalysis(alert.aiAnalysis, officerId);
        }

        if (!alert.history) alert.history = [];
        alert.history.push({
            timestamp: new Date().toISOString(),
            action: `AI Analysis verified by ${officerId}. Dispatch authorized.`,
            author: officerId
        });

        this.saveToStorage();
        this.emit('alerts-updated', this.getFilteredAlerts());
        this.emit('stats-updated', this.getStats());
        this.emit('alert-updated', alert);
        return true;
    }

    /**
     * Update status along the rescue pipeline
     */
    updateStatus(id, newStatus, author = "Officer #01") {
        const alert = this.getAlertById(id);
        if (!alert) return false;

        alert.status = newStatus;
        if (!alert.history) alert.history = [];
        alert.history.push({
            timestamp: new Date().toISOString(),
            action: `Status transitioned to ${newStatus}`,
            author: author
        });

        if (newStatus === "RESOLVED" && alert.assignedTeam) {
            const teamService = _getRescueTeamService();
            if (teamService) teamService.releaseTeam(alert.assignedTeam);
        }

        this.saveToStorage();
        this.emit('alerts-updated', this.getFilteredAlerts());
        this.emit('stats-updated', this.getStats());
        this.emit('alert-updated', alert);
        return true;
    }

    /**
     * Override priority
     */
    overridePriority(id, newPriority, operatorNotes, operatorId = "Officer #01") {
        const alert = this.getAlertById(id);
        if (!alert) return false;

        const aiService = _getAiService();
        if (aiService) {
            alert.aiAnalysis = aiService.applyOperatorOverride(
                alert.aiAnalysis,
                newPriority,
                operatorNotes,
                operatorId
            );
        }
        alert.isVerified = true;

        if (!alert.history) alert.history = [];
        alert.history.push({
            timestamp: new Date().toISOString(),
            action: `Officer Override: Priority adjusted to ${newPriority}. Note: "${operatorNotes || 'None'}"`,
            author: operatorId
        });

        this.saveToStorage();
        this.emit('alerts-updated', this.getFilteredAlerts());
        this.emit('stats-updated', this.getStats());
        this.emit('alert-updated', alert);
        return true;
    }

    /**
     * Assign team to an alert
     */
    assignTeam(sosId, teamId, operatorId = "Officer #01") {
        const alert = this.getAlertById(sosId);
        if (!alert) return false;

        const teamService = _getRescueTeamService();
        const team = teamService ? teamService.getTeamById(teamId) : null;
        if (!team) return false;

        teamService.assignTeam(teamId, sosId);
        alert.assignedTeam = teamId;
        alert.status = "ASSIGNED";

        if (!alert.history) alert.history = [];
        alert.history.push({
            timestamp: new Date().toISOString(),
            action: `Assigned unit ${team.name} (Status: RESPONDING)`,
            author: operatorId
        });

        this.saveToStorage();
        this.emit('alerts-updated', this.getFilteredAlerts());
        this.emit('stats-updated', this.getStats());
        this.emit('alert-updated', alert);
        return true;
    }

    /**
     * Assign hospital destination
     */
    assignHospital(sosId, hospitalId, operatorId = "Officer #01") {
        const alert = this.getAlertById(sosId);
        if (!alert) return false;

        const hospService = _getHospitalService();
        const hospital = hospService ? hospService.getHospitalById(hospitalId) : null;
        if (!hospital) return false;

        alert.hospitalId = hospitalId;
        if (!alert.history) alert.history = [];
        alert.history.push({
            timestamp: new Date().toISOString(),
            action: `Medical transfer destination set to ${hospital.name}`,
            author: operatorId
        });

        this.saveToStorage();
        this.emit('alert-updated', alert);
        return true;
    }

    /**
     * Duplicate Incident Detection:
     * Finds reports with close geographic proximity (<= 350m) and matching disaster type.
     */
    getDuplicatesForAlert(alertId) {
        const alert = this.getAlertById(alertId);
        if (!alert) return [];

        return this.alerts.filter(other => {
            if (other.id === alertId) return false;
            if (other.mergedInto) return false;
            if (other.disasterType !== alert.disasterType) return false;

            const distanceMeters = this.getHaversineDistance(
                alert.latitude, alert.longitude,
                other.latitude, other.longitude
            ) * 1000;

            return distanceMeters <= 350;
        });
    }

    /**
     * Merge multiple duplicate reports into a primary incident
     */
    mergeIncidents(primaryId, duplicateIds, operatorId = "Officer #01") {
        const primary = this.getAlertById(primaryId);
        if (!primary) return false;

        let addedPeople = 0;
        const mergedIds = [];

        duplicateIds.forEach(dupId => {
            const dup = this.getAlertById(dupId);
            if (dup && dup.id !== primaryId) {
                dup.mergedInto = primaryId;
                dup.status = "RESOLVED";
                addedPeople += (dup.peopleCount || 1);
                mergedIds.push(dup.id);
                dup.history.push({
                    timestamp: new Date().toISOString(),
                    action: `Merged into primary incident ${primaryId}`,
                    author: operatorId
                });
            }
        });

        primary.peopleCount = (primary.peopleCount || 1) + addedPeople;
        if (!primary.duplicateReports) primary.duplicateReports = [];
        primary.duplicateReports.push(...mergedIds);

        primary.history.push({
            timestamp: new Date().toISOString(),
            action: `Merged ${mergedIds.length} duplicate reports (${mergedIds.join(', ')}). Total victims consolidated: ${primary.peopleCount}`,
            author: operatorId
        });

        this.saveToStorage();
        this.emit('alerts-updated', this.getFilteredAlerts());
        this.emit('stats-updated', this.getStats());
        this.emit('alert-updated', primary);
        return true;
    }

    /**
     * Filter alerts based on current search & filter criteria
     */
    getFilteredAlerts() {
        let filtered = [...this.alerts].filter(a => !a.mergedInto);

        // Search query (ID, message, address, disaster, type)
        if (this.filterState.searchQuery) {
            const query = this.filterState.searchQuery.toLowerCase().trim();
            filtered = filtered.filter(a =>
                (a.id && a.id.toLowerCase().includes(query)) ||
                (a.message && a.message.toLowerCase().includes(query)) ||
                (a.address && a.address.toLowerCase().includes(query)) ||
                (a.disasterType && a.disasterType.toLowerCase().includes(query)) ||
                (a.emergencyType && a.emergencyType.toLowerCase().includes(query)) ||
                (a.reportType && a.reportType.toLowerCase().includes(query))
            );
        }

        // Report Type (SOS vs INCIDENT)
        if (this.filterState.reportType !== "ALL") {
            filtered = filtered.filter(a => a.reportType === this.filterState.reportType);
        }

        // Disaster Type filter
        if (this.filterState.disasterType !== "ALL") {
            filtered = filtered.filter(a => a.disasterType === this.filterState.disasterType);
        }

        // Priority filter
        if (this.filterState.priority !== "ALL") {
            filtered = filtered.filter(a => this.getEffectivePriority(a) === this.filterState.priority);
        }

        // Status filter
        if (this.filterState.status !== "ALL") {
            filtered = filtered.filter(a => a.status === this.filterState.status);
        }

        // Assignment state filter
        if (this.filterState.assignmentState === "ASSIGNED") {
            filtered = filtered.filter(a => !!a.assignedTeam);
        } else if (this.filterState.assignmentState === "UNASSIGNED") {
            filtered = filtered.filter(a => !a.assignedTeam && a.status !== 'RESOLVED');
        }

        // Strict Sorting: CRITICAL first, then HIGH, then MEDIUM, then LOW, non-resolved before resolved, newest first
        filtered.sort((a, b) => {
            const rankA = _PRIORITIES[this.getEffectivePriority(a)]?.rank || 0;
            const rankB = _PRIORITIES[this.getEffectivePriority(b)]?.rank || 0;

            if (rankA !== rankB) return rankB - rankA;

            if (a.status === 'RESOLVED' && b.status !== 'RESOLVED') return 1;
            if (a.status !== 'RESOLVED' && b.status === 'RESOLVED') return -1;

            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        return filtered;
    }

    setFilter(key, value) {
        this.filterState[key] = value;
        this.emit('alerts-updated', this.getFilteredAlerts());
    }

    /**
     * Top Statistics Calculator for SIH Command Centre
     */
    getStats() {
        const stats = {
            total: this.alerts.length,
            activeEmergencies: 0,
            highPriorityCases: 0,
            resolvedCases: 0,
            peopleInDanger: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            totalPeople: 0,
            activeZones: 0,
            resolved: 0,
            active: 0,
            // Additional SIH metrics:
            ambulancesAvailable: 0,
            rescueTeamsAvailable: 0,
            hospitalBedsAvailable: 0,
            totalHospitals: 0,
            networkStatus: this.networkStatus,
            sosCount: 0,
            incidentCount: 0
        };

        this.alerts.forEach(a => {
            if (a.mergedInto) return;

            const effPri = this.getEffectivePriority(a);
            if (effPri === 'CRITICAL') stats.critical++;
            else if (effPri === 'HIGH') stats.high++;
            else if (effPri === 'MEDIUM') stats.medium++;
            else if (effPri === 'LOW') stats.low++;

            if (a.reportType === 'SOS') stats.sosCount++;
            else stats.incidentCount++;

            stats.totalPeople += (a.peopleCount || 1);

            if (a.status === 'RESOLVED') {
                stats.resolved++;
                stats.resolvedCases++;
            } else {
                stats.active++;
                stats.activeEmergencies++;
                stats.peopleInDanger += (a.peopleCount || 1);
                if (effPri === 'HIGH' || effPri === 'CRITICAL') {
                    stats.highPriorityCases++;
                }
            }
        });

        // Integrate hospital telemetry
        const hospService = _getHospitalService();
        if (hospService) {
            const hStats = hospService.getStats();
            stats.ambulancesAvailable = hStats.ambulancesAvailable;
            stats.hospitalBedsAvailable = hStats.availableBeds;
            stats.totalHospitals = hStats.totalHospitals;
        }

        // Integrate rescue teams telemetry
        const teamService = _getRescueTeamService();
        if (teamService) {
            const tStats = teamService.getStats();
            stats.rescueTeamsAvailable = tStats.available;
        }

        // Zones
        const zoneService = _getDisasterZoneService();
        if (zoneService) {
            const zones = zoneService.calculateZones(this.alerts);
            stats.activeZones = zones.filter(z => z.reportsCount > 0).length;
        }

        return stats;
    }

    /**
     * Web Audio API alert sound
     */
    playAlertSound(isCritical = false) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            if (isCritical) {
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();

                osc1.type = "sawtooth";
                osc2.type = "sine";

                osc1.frequency.setValueAtTime(880, ctx.currentTime);
                osc1.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

                osc2.frequency.setValueAtTime(659, ctx.currentTime);
                osc2.frequency.exponentialRampToValueAtTime(329, ctx.currentTime + 0.3);

                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);

                osc1.start();
                osc2.start();
                osc1.stop(ctx.currentTime + 0.35);
                osc2.stop(ctx.currentTime + 0.35);
            } else {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = "sine";
                osc.frequency.setValueAtTime(587.33, ctx.currentTime);
                osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);

                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.25);
            }
        } catch (e) {
            // Audio context policy
        }
    }

    getHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

const sosService = new SOSService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SOSService, sosService };
}
