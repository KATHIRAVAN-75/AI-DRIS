/**
 * Disaster Rescue Center - SIH Demo Simulation Controls & 13-Step Guided Tour
 * Provides non-intrusive triggers for realistic emergency events, duplicate clusters,
 * network failures, and an interactive 13-Step End-to-End Walkthrough for judges.
 */

class SIHDemoBar {
    constructor() {
        this.isMinimized = true;
        this.currentDemoStep = 0;
        this.activeDemoSOSId = null;
    }

    init() {
        this.render();
    }

    render() {
        // Remove existing if any
        const existing = document.getElementById('sih-demo-floating-bar');
        if (existing) existing.remove();

        const bar = document.createElement('div');
        bar.id = 'sih-demo-floating-bar';
        bar.className = `sih-demo-floating-bar ${this.isMinimized ? 'minimized' : ''}`;

        bar.innerHTML = `
            <button id="btn-toggle-demo-bar" class="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5 focus:outline-none" onclick="sihDemoBar.toggleMinimize()">
                <span class="animate-pulse">⚡</span>
                <span>SIH DEMO CONTROLS</span>
                <span class="text-[10px] text-slate-400">${this.isMinimized ? '▲ Expand' : '▼ Minimize'}</span>
            </button>

            <div class="demo-bar-content flex items-center gap-1.5 flex-wrap">
                <!-- 13-Step Guided Flow Trigger -->
                <button class="btn btn-primary btn-xs bg-gradient-to-r from-sky-600 to-indigo-600 font-bold" onclick="sihDemoBar.startGuided13StepFlow()">
                    ▶ RUN 13-STEP DEMO FLOW
                </button>

                <!-- Individual Simulation Triggers -->
                <button class="btn btn-secondary btn-xs" onclick="sihDemoBar.simulateFloodSOS()" title="Simulate 4 people trapped with grandmother injured">
                    🌊 Flood SOS
                </button>
                <button class="btn btn-secondary btn-xs" onclick="sihDemoBar.simulateFireSOS()" title="Simulate fast-moving brush fire front">
                    🔥 Fire SOS
                </button>
                <button class="btn btn-secondary btn-xs" onclick="sihDemoBar.simulateIncident()" title="Simulate collapsed bridge community report">
                    📢 Incident Report
                </button>
                <button class="btn btn-secondary btn-xs text-amber-300" onclick="sihDemoBar.simulateDuplicateReports()" title="Simulate 3 simultaneous reports in same flooded building">
                    👥 Duplicates
                </button>
                <button class="btn btn-secondary btn-xs text-rose-300" onclick="sihDemoBar.simulateNetworkFailure()">
                    📡 Net Down
                </button>
                <button class="btn btn-secondary btn-xs text-emerald-300" onclick="sihDemoBar.simulateNetworkRecovery()">
                    🟢 Net Up
                </button>
            </div>
        `;

        document.body.appendChild(bar);
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.render();
    }

    // --- SIMULATION TRIGGERS ---

    simulateFloodSOS() {
        const sos = sosService.addSOS({
            id: `#RQ${Math.floor(1000 + Math.random() * 9000)}`,
            disasterType: "Flood",
            emergencyType: "Trapped / Medical",
            message: "Water entered our house. Four people are trapped and my grandmother is injured.",
            peopleCount: 4,
            injured: true,
            vulnerable: true,
            latitude: 11.9139,
            longitude: 79.8145,
            address: "42 Riverfront Lane, Arumparthapuram Basin",
            battery: 18,
            hopCount: 3,
            hasVoice: true,
            voiceDurationSeconds: 8
        });

        // Switch to dashboard view and inspect
        sidebarNav.switchView('dashboard');
        mapManager.focusOnAlert(sos);
        return sos;
    }

    simulateFireSOS() {
        const sos = sosService.addSOS({
            id: `#RQ${Math.floor(1000 + Math.random() * 9000)}`,
            disasterType: "Fire",
            emergencyType: "Evacuation",
            message: "Fast-moving brush fire 300 meters away! Heavy smoke entering homes, road blocked by flames. 6 people trapped.",
            peopleCount: 6,
            injured: false,
            vulnerable: true,
            latitude: 11.9580,
            longitude: 79.7950,
            address: "Hillside Enclave, Western Ridge Sector",
            battery: 22,
            hopCount: 4,
            hasVoice: true
        });
        sidebarNav.switchView('dashboard');
        mapManager.focusOnAlert(sos);
        return sos;
    }

    simulateIncident() {
        const inc = sosService.addIncident({
            id: `#IN${Math.floor(2000 + Math.random() * 8000)}`,
            disasterType: "Bridge Damage",
            message: "North river bridge central pillar cracked. River overflow eroding foundation. Traffic halted.",
            latitude: 11.9290,
            longitude: 79.8180,
            address: "North River Causeway Marker #4",
            photoUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60"
        });
        sidebarNav.switchView('incidents');
        return inc;
    }

    simulateDuplicateReports() {
        const primaryId = `#RQ${Math.floor(1000 + Math.random() * 9000)}`;
        const dup1Id = `#RQ${Math.floor(1000 + Math.random() * 9000)}`;
        const dup2Id = `#RQ${Math.floor(1000 + Math.random() * 9000)}`;

        const baseLat = 11.9150;
        const baseLng = 79.8160;

        // Primary
        const p = sosService.addSOS({
            id: primaryId,
            disasterType: "Flood",
            message: "Ground floor flooded! 3 people trapped on roof of building A.",
            peopleCount: 3,
            latitude: baseLat,
            longitude: baseLng,
            address: "Arumparthapuram Block 12, River Basin"
        });

        // Duplicates within 100 meters
        sosService.addSOS({
            id: dup1Id,
            disasterType: "Flood",
            message: "Floodwater entered building A. Need rescue boat for residents.",
            peopleCount: 2,
            latitude: baseLat + 0.0008,
            longitude: baseLng + 0.0006,
            address: "Block 12 Building A rear stairs"
        });

        sosService.addSOS({
            id: dup2Id,
            disasterType: "Flood",
            message: "Same building A corner flat, water waist high. 2 adults waiting for assistance.",
            peopleCount: 2,
            latitude: baseLat - 0.0005,
            longitude: baseLng - 0.0004,
            address: "Block 12 Building A entrance"
        });

        sidebarNav.switchView('dashboard');
        detailModal.openForAlert(primaryId);
    }

    simulateNetworkFailure() {
        sosService.networkStatus = "OFFLINE";
        sidebarNav.renderSidebar();
        if (sidebarNav.currentView === 'network') sidebarNav.renderNetworkView();
        alert("[SIMULATION ALERT] Public Internet & Cellular Gateway Disconnected!\n\nAll subsequent reports will automatically queue to Offline Local Storage & Android Mesh Fallback.");
    }

    simulateNetworkRecovery() {
        sosService.networkStatus = "ACTIVE";
        sidebarNav.renderSidebar();
        if (sidebarNav.currentView === 'network') sidebarNav.renderNetworkView();
        alert("[SIMULATION ALERT] Network Gateway Reconnected!\n\nOffline queued transmissions ingested and broadcasted to Rescue Command Terminal.");
    }

    // --- GUIDED 13-STEP DEMO FLOW ---

    startGuided13StepFlow() {
        const proceed = confirm(
            "START GUIDED 13-STEP SIH DEMO FLOW?\n\n" +
            "This will walk through the exact end-to-end scenario:\n" +
            "1. Victim submits Flood SOS (4 people, grandmother injured)\n" +
            "2. Ingestion into Command Centre\n" +
            "3. Officer inspects emergency\n" +
            "4. AI extraction & 91/100 Danger Score\n" +
            "5. Human Verification\n" +
            "6. Smart Team Matching (Team Alpha)\n" +
            "7. Assignment confirmation\n" +
            "8. Live Route (Victim -> Team -> Hospital)\n" +
            "9. Flood-aware detour avoiding Route A\n" +
            "10. Status -> RESCUE IN PROGRESS\n" +
            "11. Medical transfer to Hospital\n" +
            "12. Resolution\n" +
            "13. Incident History logging\n\n" +
            "Click OK to begin Step 1."
        );

        if (!proceed) return;

        // Step 1 & 2: Simulate Victim SOS Ingestion
        const sos = this.simulateFloodSOS();
        this.activeDemoSOSId = sos.id;

        alert(`[STEP 1 & 2 COMPLETE]\nVictim transmitted SOS via Mesh:\n"Water entered our house. Four people are trapped and my grandmother is injured."\n\nIncoming ID: ${sos.id}\nAppeared dynamically in Command Centre.`);

        // Step 3 & 4: Open Details & Demonstrate AI Extraction
        detailModal.openForAlert(sos.id);

        setTimeout(() => {
            alert(`[STEP 3 & 4: AI SMART MESSAGE READER]\nExtracted Entities:\n• Disaster: FLOOD (96% Conf)\n• People: 4 (99% Conf)\n• Vulnerable: ELDERLY (92% Conf)\n• Injury: YES (93% Conf)\n• Danger Score: 91/100 (CRITICAL)\n\nNote banner: "AI recommendation — Human verification required". Click OK to simulate Officer Verification (Step 5).`);

            // Step 5: Officer Verification
            sosService.verifyAIAnalysis(sos.id, "Officer #01");
            detailModal.render(sos);

            alert(`[STEP 5 & 6: HUMAN VERIFICATION & SMART TEAM MATCHING]\nOfficer verified AI result.\nSmart Team Matching evaluated units:\n• BEST MATCH: Team Alpha (Match Score: 94/100)\n• Reason: Equipped with Flood Boat, 2.4 km away, Available.\n\nClick OK to confirm assignment (Step 7 & 8).`);

            // Step 7 & 8 & 9: Confirm Team Alpha & Map Route
            sosService.assignTeam(sos.id, "TEAM-ALPHA", "Officer #01");
            sosService.assignHospital(sos.id, "HOSP-01", "Officer #01");
            detailModal.render(sos);
            mapManager.visualizeRescueRoute(sos, "TEAM-ALPHA", "HOSP-01");

            alert(`[STEP 7, 8 & 9: FLOOD-AWARE ROUTING]\nTeam Alpha assigned!\nRoute visualized on map:\n🚨 Victim ➔ 👨‍🚒 Team Alpha ➔ 🏥 City General Hospital\n\n⚠️ Autonomous Routing Notice:\nPrimary Route A is BLOCKED due to 4.5ft flood waters on Arumparthapuram causeway.\n✓ Safe Alternative Route B recommended (4.2 km, 11 min ETA).\n\nClick OK to advance status to RESCUE IN PROGRESS (Step 10).`);

            // Step 10: Rescue in progress
            sosService.updateStatus(sos.id, "RESCUE IN PROGRESS", "Officer #01");
            detailModal.render(sos);

            setTimeout(() => {
                alert(`[STEP 10 & 11: RESCUE & MEDICAL TRANSFER]\nTeam Alpha on-site with boat. Victims extracted safely.\nTransferring elderly grandmother to City General Hospital Trauma Ward.\n\nClick OK to mark mission RESOLVED (Step 12 & 13).`);

                // Step 12: Mark Resolved
                sosService.updateStatus(sos.id, "RESOLVED", "Officer #01");
                hospitalService.admitPatient("HOSP-01", true);
                detailModal.render(sos);

                alert(`[STEP 12 & 13: RESOLVED & ARCHIVED]\nEmergency marked RESOLVED!\nEmergency bed reserved at City General Hospital.\n\nOpening Incident History ledger to verify permanent record.`);

                detailModal.close();
                sidebarNav.switchView('history');
            }, 1000);
        }, 1000);
    }
}

const sihDemoBar = new SIHDemoBar();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SIHDemoBar, sihDemoBar };
}
