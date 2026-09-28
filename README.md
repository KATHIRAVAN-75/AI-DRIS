# 🚑 Disaster Rescue Center — AI Emergency Response Dashboard

A modern, professional **web-based Rescue Center emergency operations dashboard** for a disaster-resilient communication system.

When standard cellular towers and power infrastructure fail during catastrophic natural disasters, victims transmit SOS signals through an **offline peer-to-peer Android phone mesh network**. This dashboard serves as the central command headquarters that receives, maps, and analyzes those alerts in real time.

---

## 🌟 Key Features

1. **🗺️ Live Interactive Tactical SOS Map (Leaflet.js)**
   * High-performance dark tactical map with color-coded priority markers:
     * 🔴 **Critical**: Flashing radar pulse ring for immediate life threats
     * 🟠 **High Priority**
     * 🟡 **Medium Priority**
     * 🟢 **Low Priority**
   * Disaster type icon badges on pins (🌊 Flood, 🌎 Earthquake, 🌪️ Cyclone, ⛰️ Landslide, 🌊 Tsunami, 🔥 Wildfire, ⛈️ Severe Storm).
   * Direct navigation link to Google Maps / external GPS.
   * Visual overlays for active **Disaster Threat Zones** and field **Rescue Unit positions**.

2. **🤖 AI SOS Decision-Support Analysis**
   * Real-time NLP and heuristic analysis of distress messages and hardware telemetry:
     * Analyzes entrapment, rising water, acute trauma, structural collapse, smoke asphyxiation, demographic vulnerability (infants, elderly), and battery depletion.
     * Assigns priority: `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`.
     * Calculates AI confidence percentage.
     * Provides concise, structured reasons for the classification.
     * Formulates actionable tactical recommendations.
   * **Human Operator Override**: In compliance with emergency protocols, operators can manually adjust priorities with logged justification notes.

3. **🧠 AI Disaster Situation Summary**
   * Synthesizes incoming alerts into an executive situation briefing:
     * Total SOS reports received across the mesh.
     * Dominant disaster type and percentage.
     * Critical casualties and confirmed entrapments count.
     * Most heavily impacted geographic zone.
     * Suggested tactical rescue strategy.
   * Clearly marked with advisory: *"AI-generated analysis — Human verification required."*

4. **📍 Disaster Zone Clustering**
   * Automatically correlates and groups nearby SOS alerts into tactical response zones (e.g. `🌊 FLOOD ZONE A`, `🌎 SEISMIC SECTOR B`, `🔥 WILDFIRE FRONT C`).
   * Displays total incident reports, critical casualty breakdown, and estimated affected population.

5. **🚑 Rescue Team Management & Proximity Dispatch**
   * Tracks active rescue teams (🚑 Team Alpha, 🚒 Team Bravo, 🚁 Team Charlie, 🚤 Boat Delta, 🐕 K9 Echo).
   * Calculates real-time distance (Haversine formula) and estimated transit ETA to the selected emergency.
   * Intelligent capability matching (e.g. recommending water rescue boats for flood victims or heavy shoring for structural collapses).
   * Single-click team assignment updating unit status to `RESPONDING`.

6. **🔄 5-Stage Rescue Lifecycle Pipeline**
   ```
   NEW ➔ AI ANALYZED ➔ ASSIGNED ➔ RESCUE IN PROGRESS ➔ RESOLVED
   ```
   * Interactive status stepper allowing operators to transition alerts through the complete resolution lifecycle.

7. **📡 Mesh Relay Path Visualizer**
   * Visually maps how the SOS packet traversed the offline Android mesh:
     ```
     📱 Victim A ➔ 📡 Phone B ➔ 📡 Phone C ➔ 🛰️ Gateway D ➔ 🏢 Rescue Center
     ```
   * Displays hop count, received timestamp, and network telemetry.

8. **📊 Tactical Analytics & Telemetry Modal**
   * Incident distribution by disaster type.
   * Priority triage breakdown (Critical, High, Medium, Low).
   * Operational velocity: Resolved vs. Active ratio.
   * Tactical zone casualty ranking.

9. **⚡ Live Mesh SOS Simulator**
   * Interactive simulation tool to test the entire lifecycle. Includes preconfigured disaster scenarios (Flood roof entrapment, Wildfire firefront, Earthquake basement collapse, Landslide bus stranding) and an auto-simulation generator for live presentations.

---

## 🌐 Accessing the Live Dashboard

### 🌍 Worldwide Public Access (Open on Any Device Anywhere)
Share this live public URL with anyone in the world. Works on all mobile devices (4G/5G/Wi-Fi), tablets, and computers:
👉 **`https://create-deferred-tions-environment.trycloudflare.com`**

### 💻 Local Computer Access
Open directly in your PC browser:
* **`http://localhost:3000`** (or double-click `Open-Dashboard.bat`)

### 📱 Local Wi-Fi Mobile Access
When on the same Wi-Fi network:
* **`http://10.65.82.249:3000`** or **`http://LAPTOP-U9BAEA7K.local:3000`**

### 🚀 Permanent Launchers (Windows)
* **Auto-Start on Boot**: Pre-configured in your Windows Startup folder (`StartDisasterRescueCenter.vbs`). Starts automatically in the background whenever Windows starts!
* **1-Click Launcher**: Double-click [`start-server.bat`](file:///C:/New%20folder/start-server.bat) to launch the watchdog and view live packet transmission logs.
* **Zero-Server Standalone**: Double-click [`index.html`](file:///C:/New%20folder/index.html) to run 100% offline in any browser.

---

## 🔌 Android Mesh Gateway Integration API

The backend server (`server.js`) exposes RESTful endpoints for real-time integration with the Android Disaster Mesh Gateway:

### Ingest SOS Alert
* **Endpoint**: `POST /api/sos`
* **Content-Type**: `application/json`
* **Payload**:
```json
{
  "id": "SOS-82731",
  "disasterType": "Flood",
  "emergencyType": "Medical",
  "message": "Water has entered my house. I am trapped on the second floor.",
  "latitude": 11.9139,
  "longitude": 79.8145,
  "timestamp": "2026-09-06T01:45:00Z",
  "battery": 18,
  "hopCount": 3,
  "relayPath": ["Phone-A", "Phone-B", "Phone-C", "Gateway-Main"],
  "peopleCount": 3
}
```

* **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "SOS alert successfully registered and analyzed by AI",
  "sos": { ... }
}
```

### Other Endpoints
* `GET /api/sos`: Retrieve all active and historical alerts.
* `PATCH /api/sos/:id`: Update status, assign rescue team, or apply human operator priority override.
* `GET /api/stats`: Retrieve theater-wide statistics, active zone counts, and AI situation data.
* `GET /api/teams`: Retrieve all rescue units and their current status.
* `GET /api/events`: Server-Sent Events (SSE) stream for real-time push notifications to multiple command room screens.

---

## 🎯 Demonstration Flow for Presentations / Viva

1. **Initial View**: The dashboard immediately displays live tactical metrics, color-coded priority markers on the dark map, and the priority queue sorted with Critical emergencies first.
2. **Review AI Situation Briefing**: Read the AI Disaster Situation Summary synthesizing the entire disaster theater.
3. **Simulate Incoming SOS**:
   * Click the **"📡 Simulate Mesh SOS"** button in the top bar.
   * Select a scenario (e.g. *"Flood - Trapped on Roof"*).
   * Click **"Transmit Mesh SOS"**.
4. **Observe Real-Time Ingestion**:
   * The tactical audio alert chime sounds.
   * The new SOS marker drops onto the map with an animated pulsing radar ring.
   * The AI engine analyzes the message and classifies it as `CRITICAL`.
   * The alert appears at the top of the priority queue.
5. **Inspect Emergency Dossier**:
   * Click **"Inspect ↗"** on the alert card or click the map marker.
   * Review the AI analysis reasons and recommended action.
   * Trace the packet through the **Mesh Relay Network Telemetry** visualizer.
6. **Assign Rescue Team**:
   * Review the nearest rescue units with calculated distances (e.g., Team Alpha 1.2 km away).
   * Click **"ASSIGN TEAM"** — status updates to `ASSIGNED` and team status becomes `RESPONDING`.
7. **Advance & Resolve Lifecycle**:
   * Click `RESCUE IN PROGRESS` on the status pipeline.
   * Once evacuated, click `RESOLVED`.
8. **View Analytics**:
   * Click **"📊 Analytics"** in the top bar to inspect incident distributions, priority breakdowns, and resolution velocity.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, Modern Vanilla JavaScript (ES6+), Leaflet.js 1.9.4, Tailwind CSS, Custom Tactical Command Center Theme, Web Audio API.
* **Backend**: Node.js HTTP/REST Engine (Zero-dependency modular architecture).
* **Storage**: In-memory store with LocalStorage persistence and REST bidirectional synchronization.
