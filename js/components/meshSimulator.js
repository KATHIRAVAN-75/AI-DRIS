/**
 * Disaster Rescue Center - Offline Mesh Simulation Component
 * Allows testing and demonstrating the full end-to-end SOS lifecycle as if sent from Android mesh devices.
 */

class MeshSimulator {
    constructor(modalId = "simulator-modal") {
        this.modalId = modalId;
        this.autoSimInterval = null;
        this.isAutoSimulating = false;

        this.presets = [
            {
                name: "🌊 Flood - Trapped on Roof",
                disasterType: "Flood",
                emergencyType: "Trapped",
                message: "Flash flood water reached 6 feet in 20 minutes. 3 adults and 1 infant trapped on roof. Battery low, please send boat!",
                latitude: 11.9142,
                longitude: 79.8130,
                address: "Plot 8, Riverside Enclave",
                battery: 14,
                hopCount: 3,
                peopleCount: 4,
                relayPath: ["Victim-PocoX3", "Relay-Redmi9", "Relay-SamsungM31", "Gateway-South"]
            },
            {
                name: "🔥 Wildfire - Approaching Flame Front",
                disasterType: "Wildfire",
                emergencyType: "Evacuation",
                message: "Wildfire breached the western ridge! Smoke so thick we can barely breathe. Access road is blocked by fallen burning branches. 8 people here.",
                latitude: 11.9610,
                longitude: 79.7920,
                address: "Sunset Hill Retreat, West Sector",
                battery: 22,
                hopCount: 4,
                peopleCount: 8,
                relayPath: ["Victim-Pixel6", "Relay-OnePlus8", "Relay-MotoG", "Relay-Nokia3", "Gateway-West"]
            },
            {
                name: "🌎 Earthquake - Structural Entrapment",
                disasterType: "Earthquake",
                emergencyType: "Medical",
                message: "Ceiling collapsed in workshop. Worker pinned under iron beam, bleeding heavily. Need immediate medical cut-off equipment!",
                latitude: 11.9380,
                longitude: 79.8270,
                address: "Industrial Estate Shed 4",
                battery: 48,
                hopCount: 2,
                peopleCount: 2,
                relayPath: ["Victim-GalaxyA52", "Relay-Realme8", "Gateway-Central"]
            },
            {
                name: "⛰️ Landslide - Stranded Vehicle",
                disasterType: "Landslide",
                emergencyType: "Trapped",
                message: "Boulders and mud rolled down mountain slope. School minibus halted between two landslides. 15 students safe inside but dark and cold.",
                latitude: 11.9680,
                longitude: 79.8150,
                address: "Mountain Pass Km 18",
                battery: 35,
                hopCount: 3,
                peopleCount: 16,
                relayPath: ["Driver-Phone", "Hiker-Mesh-03", "Relay-Tower-01", "Gateway-West"]
            }
        ];
    }

    init() {
        this.renderModal();
    }

    renderModal() {
        const modal = document.getElementById(this.modalId);
        if (!modal) return;

        modal.innerHTML = `
            <div class="modal-backdrop" onclick="meshSimulator.closeModal(event)">
                <div class="modal-card max-w-xl w-full" onclick="event.stopPropagation()">
                    <div class="modal-header flex items-center justify-between pb-3 border-b border-slate-700">
                        <div class="flex items-center gap-2">
                            <span class="text-xl">📡</span>
                            <div>
                                <h3 class="font-bold text-white text-base">Simulate Incoming Android Mesh SOS</h3>
                                <p class="text-[11px] text-slate-400 font-mono">Simulates an offline peer-to-peer packet reaching the Gateway</p>
                            </div>
                        </div>
                        <button class="btn btn-secondary btn-xs" onclick="meshSimulator.close()">✕</button>
                    </div>

                    <div class="modal-body py-3 space-y-3">
                        <!-- Quick Presets -->
                        <div>
                            <label class="text-xs text-slate-400 uppercase font-mono block mb-1.5">Load Realistic Scenario Preset:</label>
                            <div class="grid grid-cols-2 gap-1.5">
                                ${this.presets.map((p, idx) => `
                                    <button class="preset-btn text-left p-2 rounded bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-white"
                                            onclick="meshSimulator.applyPreset(${idx})">
                                        ${p.name}
                                    </button>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Form Fields -->
                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <label class="text-slate-400 block mb-1">Disaster Type:</label>
                                <select id="sim-disaster" class="tactical-select w-full text-xs">
                                    <option value="Flood">🌊 Flood</option>
                                    <option value="Earthquake">🌎 Earthquake</option>
                                    <option value="Cyclone">🌪️ Cyclone</option>
                                    <option value="Landslide">⛰️ Landslide</option>
                                    <option value="Wildfire">🔥 Wildfire</option>
                                    <option value="Tsunami">🌊 Tsunami</option>
                                    <option value="Severe Storm">⛈️ Severe Storm</option>
                                    <option value="Other">⚠️ Other</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-slate-400 block mb-1">Emergency Type:</label>
                                <select id="sim-emergency" class="tactical-select w-full text-xs">
                                    <option value="Trapped">Trapped / Inundated</option>
                                    <option value="Medical">Medical / Trauma</option>
                                    <option value="Structural Collapse">Structural Collapse</option>
                                    <option value="Evacuation">Urgent Evacuation</option>
                                    <option value="Food/Water">Food / Potable Water</option>
                                    <option value="Infant Care">Infant / Vulnerable</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="text-xs text-slate-400 block mb-1">Victim Distress Message:</label>
                            <textarea id="sim-message" class="tactical-input w-full text-xs h-16" placeholder="Describe the crisis, trapped status, water level, or injuries..."></textarea>
                        </div>

                        <div class="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <label class="text-slate-400 block mb-1">Latitude:</label>
                                <input type="number" step="0.0001" id="sim-lat" class="tactical-input w-full text-xs" value="11.9165">
                            </div>
                            <div>
                                <label class="text-slate-400 block mb-1">Longitude:</label>
                                <input type="number" step="0.0001" id="sim-lng" class="tactical-input w-full text-xs" value="79.8155">
                            </div>
                            <div>
                                <label class="text-slate-400 block mb-1">People Count:</label>
                                <input type="number" id="sim-people" class="tactical-input w-full text-xs" value="4">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <label class="text-slate-400 block mb-1">Phone Battery (%):</label>
                                <input type="number" id="sim-battery" class="tactical-input w-full text-xs" value="18" min="1" max="100">
                            </div>
                            <div>
                                <label class="text-slate-400 block mb-1">Mesh Hop Count:</label>
                                <input type="number" id="sim-hops" class="tactical-input w-full text-xs" value="3" min="1" max="10">
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer pt-3 border-t border-slate-700 flex items-center justify-between">
                        <button class="btn btn-secondary btn-sm" onclick="meshSimulator.toggleAutoSimulation()" id="auto-sim-btn">
                            ⏱️ Auto-Simulation: OFF
                        </button>
                        <div class="flex items-center gap-2">
                            <button class="btn btn-secondary btn-sm" onclick="meshSimulator.close()">Cancel</button>
                            <button class="btn btn-primary btn-sm flex items-center gap-1" onclick="meshSimulator.dispatchSimulatedSOS()">
                                <span>📡</span>
                                <span>Transmit Mesh SOS</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Apply first preset by default
        this.applyPreset(0);
    }

    applyPreset(index) {
        const p = this.presets[index];
        if (!p) return;

        const disaster = document.getElementById('sim-disaster');
        const emergency = document.getElementById('sim-emergency');
        const msg = document.getElementById('sim-message');
        const lat = document.getElementById('sim-lat');
        const lng = document.getElementById('sim-lng');
        const people = document.getElementById('sim-people');
        const battery = document.getElementById('sim-battery');
        const hops = document.getElementById('sim-hops');

        if (disaster) disaster.value = p.disasterType;
        if (emergency) emergency.value = p.emergencyType;
        if (msg) msg.value = p.message;
        if (lat) lat.value = p.latitude;
        if (lng) lng.value = p.longitude;
        if (people) people.value = p.peopleCount;
        if (battery) battery.value = p.battery;
        if (hops) hops.value = p.hopCount;
    }

    open() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    close() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    closeModal(e) {
        this.close();
    }

    dispatchSimulatedSOS() {
        const disaster = document.getElementById('sim-disaster')?.value || "Flood";
        const emergency = document.getElementById('sim-emergency')?.value || "General";
        const message = document.getElementById('sim-message')?.value || "SOS Emergency help needed.";
        const lat = parseFloat(document.getElementById('sim-lat')?.value || "11.9200");
        const lng = parseFloat(document.getElementById('sim-lng')?.value || "79.8200");
        const people = parseInt(document.getElementById('sim-people')?.value || "2");
        const battery = parseInt(document.getElementById('sim-battery')?.value || "25");
        const hops = parseInt(document.getElementById('sim-hops')?.value || "3");

        // Generate synthetic relay path
        const relayPath = ["Victim-Node"];
        for (let i = 1; i < hops; i++) {
            relayPath.push(`Mesh-Relay-${Math.floor(10 + Math.random() * 89)}`);
        }
        relayPath.push("Gateway-Main");

        const payload = {
            id: `SOS-${Math.floor(80000 + Math.random() * 19999)}`,
            disasterType: disaster,
            emergencyType: emergency,
            message: message,
            latitude: lat + (Math.random() - 0.5) * 0.003, // Slight jitter for natural variation
            longitude: lng + (Math.random() - 0.5) * 0.003,
            timestamp: new Date().toISOString(),
            battery: battery,
            hopCount: hops,
            relayPath: relayPath,
            peopleCount: people
        };

        // Inject into sosService
        sosService.addSOS(payload);

        // Close modal
        this.close();
    }

    toggleAutoSimulation() {
        this.isAutoSimulating = !this.isAutoSimulating;
        const btn = document.getElementById('auto-sim-btn');

        if (this.isAutoSimulating) {
            if (btn) {
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary');
                btn.innerText = "⏱️ Auto-Simulation: ACTIVE";
            }

            this.autoSimInterval = setInterval(() => {
                const randomPreset = this.presets[Math.floor(Math.random() * this.presets.length)];
                const payload = {
                    id: `SOS-${Math.floor(80000 + Math.random() * 19999)}`,
                    disasterType: randomPreset.disasterType,
                    emergencyType: randomPreset.emergencyType,
                    message: randomPreset.message,
                    latitude: randomPreset.latitude + (Math.random() - 0.5) * 0.008,
                    longitude: randomPreset.longitude + (Math.random() - 0.5) * 0.008,
                    timestamp: new Date().toISOString(),
                    battery: Math.floor(10 + Math.random() * 70),
                    hopCount: Math.floor(1 + Math.random() * 4),
                    relayPath: randomPreset.relayPath,
                    peopleCount: Math.floor(1 + Math.random() * 6)
                };
                sosService.addSOS(payload);
            }, 30000); // Trigger every 30 seconds
        } else {
            if (btn) {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-secondary');
                btn.innerText = "⏱️ Auto-Simulation: OFF";
            }
            if (this.autoSimInterval) {
                clearInterval(this.autoSimInterval);
                this.autoSimInterval = null;
            }
        }
    }
}

const meshSimulator = new MeshSimulator();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MeshSimulator, meshSimulator };
}
