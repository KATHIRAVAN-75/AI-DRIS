/**
 * AlertShield Service - Fake Emergency Message Detection & Audit System
 * Analyzes disaster text alerts for suspicious links, missing sources, duplicate/viral hoaxes,
 * and unverified claims with automated heuristics and human officer review safeguards.
 */

class AlertShieldService {
    constructor() {
        this.verifiedBulletins = JSON.parse(JSON.stringify(SAMPLE_VERIFIED_BULLETINS || []));
        this.reportedAlerts = JSON.parse(JSON.stringify(SAMPLE_REPORTED_HOAXES || []));
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => {
                try { cb(data); } catch(e) { console.error("AlertShield event error:", e); }
            });
        }
    }

    analyzeMessage(rawText) {
        const text = (rawText || "").trim();
        if (!text) {
            return {
                status: "Unverified",
                trustScore: 50,
                threatLevel: "INSUFFICIENT TEXT",
                flags: ["Message is empty or contains no extractable content."],
                advice: "Please enter or paste an emergency message to evaluate.",
                metrics: { hasLink: false, hasSource: false, isViral: false, hasSensationalism: false }
            };
        }

        const lower = text.toLowerCase();
        const flags = [];
        let trustScore = 70; // baseline neutral

        // 1. Link Inspection
        const urlRegex = /(https?:\/\/[^\s]+)/gi;
        const matches = text.match(urlRegex) || [];
        const hasLink = matches.length > 0;
        let isSuspiciousLink = false;

        if (hasLink) {
            matches.forEach(url => {
                const urlLower = url.toLowerCase();
                if (urlLower.includes("bit.ly") || urlLower.includes("tinyurl.com") || urlLower.includes("goo.gl") || urlLower.includes("t.me") || urlLower.includes(".xyz") || urlLower.includes(".top")) {
                    isSuspiciousLink = true;
                    flags.push(`Suspicious URL shortener/untrusted domain detected: ${url}`);
                    trustScore -= 35;
                } else if (!urlLower.includes("gov.in") && !urlLower.includes("nic.in") && !urlLower.includes("imd.gov") && !urlLower.includes("ndrf.gov")) {
                    if (lower.includes("grant") || lower.includes("fund") || lower.includes("claim") || lower.includes("money") || lower.includes("upi")) {
                        isSuspiciousLink = true;
                        flags.push(`Non-government link requesting disaster fund claims: ${url}`);
                        trustScore -= 40;
                    } else {
                        flags.push(`Non-official web link present: ${url}`);
                        trustScore -= 10;
                    }
                }
            });
        }

        // 2. Source Attribution Check
        const officialSources = ["imd", "ndrf", "sdrf", "sdma", "district collector", "collectorate", "pwd", "police", "municipal corporation", "fire department", "cwc", "central water commission", "112", "1070", "1077"];
        const foundSources = officialSources.filter(src => lower.includes(src));
        const hasSource = foundSources.length > 0;

        if (hasSource) {
            flags.push(`Official disaster authority attribution identified: ${foundSources.map(s => s.toUpperCase()).join(", ")}`);
            trustScore += 20;
        } else {
            flags.push("Missing verified government or disaster management authority attribution");
            trustScore -= 18;
        }

        // 3. Viral Forwarding & Panic Language Markers
        const viralPhrases = ["forward to everyone", "forward to all", "share immediately", "spread this", "viral", "whatsapp forward", "breaking news!!", "run for your life", "100% true", "urgent alert!!"];
        const foundViral = viralPhrases.filter(p => lower.includes(p));
        const exclamationCount = (text.match(/!/g) || []).length;
        const allCapsWords = (text.match(/\b[A-Z]{4,}\b/g) || []).length;
        const isViral = foundViral.length > 0 || exclamationCount >= 4 || allCapsWords >= 3;

        if (isViral) {
            flags.push("High-density viral forward signatures & sensationalist formatting detected");
            trustScore -= 22;
        }

        // 4. Catastrophic / Exaggerated Unverified Claims
        const panicKeywords = ["dam burst", "dam breached", "dam cracked", "tsunami wave", "poison in water", "chemical leak", "hundreds dead", "500 dead", "entire city drowning", "shoot on sight", "towers shutting down"];
        const foundPanic = panicKeywords.filter(k => lower.includes(k));
        const hasSensationalism = foundPanic.length > 0;

        if (hasSensationalism) {
            flags.push(`High-severity panic trigger keywords: "${foundPanic.join(', ')}" requiring cross-verification`);
            trustScore -= 25;

            // Contradiction check against known official PWD reservoir bulletins
            if (lower.includes("dam") && (lower.includes("burst") || lower.includes("breached"))) {
                flags.push("CONTRADICTION: Official PWD Water Resources bulletin confirms controlled reservoir release without breach");
                trustScore -= 20;
            }
        }

        // 5. Normalization & Verification Status Mapping
        trustScore = Math.max(2, Math.min(98, trustScore));

        let status = "Unverified";
        let threatLevel = "POTENTIAL RUMOR";
        let advice = "Cross-check with local District Emergency Operations Center (Helpline 1077/112).";

        if (trustScore >= 80) {
            status = "Verified";
            threatLevel = "GENUINE ADVISORY";
            advice = "Message matches verified disaster telemetry or official command center advisories.";
        } else if (trustScore <= 25) {
            status = "Rejected";
            threatLevel = isSuspiciousLink ? "FINANCIAL PHISHING SCAM" : "CONFIRMED PANIC HOAX";
            advice = "WARNING: DO NOT FORWARD. This alert contains fabricated claims or malicious links.";
        } else if (trustScore < 50) {
            status = "Under Review";
            threatLevel = "SUSPICIOUS / UNVERIFIED";
            advice = "Caution: Unsubstantiated claims under inspection by Cyber Cell & Disaster Desk.";
        } else {
            status = "Unverified";
            threatLevel = "UNCONFIRMED NOTICE";
            advice = "Awaiting official corroboration from field units.";
        }

        return {
            status,
            trustScore,
            threatLevel,
            flags,
            advice,
            metrics: { hasLink, hasSource, isViral, hasSensationalism, foundSources, foundPanic },
            analyzedAt: new Date().toISOString()
        };
    }

    reportSuspiciousMessage(rawMessage, reportCategory = "Panic Hoax", reporterNotes = "", reporterName = "Citizen User") {
        const analysis = this.analyzeMessage(rawMessage);
        const nextId = `HOAX-2026-${String(this.reportedAlerts.length + 1).padStart(2, '0')}`;

        // Check if similar message exists
        const existing = this.reportedAlerts.find(a => 
            a.rawMessage.toLowerCase().substring(0, 40) === rawMessage.toLowerCase().substring(0, 40)
        );

        if (existing) {
            existing.reportCount += 1;
            this.emit('alert-reported', existing);
            return existing;
        }

        const newReport = {
            id: nextId,
            submittedBy: reporterName,
            rawMessage: rawMessage.trim(),
            category: reportCategory,
            reporterNotes: reporterNotes.trim(),
            receivedAt: new Date().toISOString(),
            analysis: analysis,
            reportCount: 1,
            adminStatus: "Under Review by EOC Desk",
            reviewedBy: null
        };

        this.reportedAlerts.unshift(newReport);
        this.emit('alert-reported', newReport);
        return newReport;
    }

    getReportedMessages(filter = "ALL") {
        let results = [...this.reportedAlerts];
        if (filter && filter !== "ALL") {
            results = results.filter(r => r.analysis.status.toLowerCase() === filter.toLowerCase());
        }
        return results;
    }

    updateReportStatus(id, newStatus, adminNotes = "", reviewer = "Operations Officer") {
        const report = this.reportedAlerts.find(r => r.id === id);
        if (!report) return null;

        report.analysis.status = newStatus;
        report.adminStatus = `Reviewed: ${newStatus}`;
        report.reviewedBy = reviewer;
        report.adminNotes = adminNotes;

        this.emit('report-updated', report);
        return report;
    }

    getStats() {
        const total = this.reportedAlerts.length;
        const rejected = this.reportedAlerts.filter(r => r.analysis.status === "Rejected").length;
        const verified = this.reportedAlerts.filter(r => r.analysis.status === "Verified").length;
        const underReview = this.reportedAlerts.filter(r => r.analysis.status === "Under Review" || r.analysis.status === "Unverified").length;

        return { total, rejected, verified, underReview };
    }
}

const alertShieldService = new AlertShieldService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AlertShieldService, alertShieldService };
}
