/**
 * Disaster Rescue Center - Live SOS Interactive Map Component (Leaflet.js)
 * High-performance tactical map with priority-coded markers, hospital telemetry,
 * road hazard overlays, and Flood-Aware Route Visualizer (Victim -> Team -> Hospital).
 */

class MapManager {
    constructor(containerId = "sos-map") {
        this.containerId = containerId;
        this.map = null;
        this.markersLayer = null;
        this.zonesLayer = null;
        this.teamsLayer = null;
        this.hospitalsLayer = null;
        this.hazardsLayer = null;
        this.routesLayer = null;
        this.sosMarkers = new Map();
        this.teamMarkers = new Map();
        this.hospitalMarkers = new Map();
        this.activeRoute = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized || !document.getElementById(this.containerId)) return;

        // Initialize Leaflet map
        this.map = L.map(this.containerId, {
            center: CONFIG.DEFAULT_CENTER,
            zoom: CONFIG.DEFAULT_ZOOM,
            zoomControl: false,
            attributionControl: true
        });

        // Reliable Map Tile Providers with Documented Usage Policies (Zero 403 Volunteer Blocks)
        // 1. CARTO Dark Matter (Primary Tactical Dark Basemap)
        const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; <a href="https://carto.com/basemaps" target="_blank" rel="noopener">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
        });

        // 2. CARTO Voyager (Clean Street Navigation Basemap)
        const cartoVoyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; <a href="https://carto.com/basemaps" target="_blank" rel="noopener">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
        });

        // 3. Esri World Satellite Imagery (High-Resolution Aerial Cartography)
        const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a> &mdash; Earthstar Geographics'
        });

        // 4. Esri World Street Map (Alternative Reliable Global Streets)
        const esriStreet = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: 'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a> &mdash; DeLorme, NAVTEQ'
        });

        // 5. CARTO Positron (High-Contrast Clean Light Basemap)
        const cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; <a href="https://carto.com/basemaps" target="_blank" rel="noopener">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
        });

        // Error Handling: Graceful Tile Recovery (Prevents 403 Access Blocked Tiles)
        let tileFailCount = 0;
        let isFallbackActive = false;
        cartoDark.on('tileerror', (error) => {
            tileFailCount++;
            if (tileFailCount > 4 && !isFallbackActive) {
                isFallbackActive = true;
                console.warn("[MAP TILE RECOVERY] Primary tile layer connectivity issue detected. Activating secondary reliable tile provider (CARTO Voyager / Esri).");
                this.showMapNotice("⚠️ Primary tiles offline. Switched to backup tactical cartography.");
                cartoVoyager.addTo(this.map);
            }
        });

        // Add default dark matter layer
        cartoDark.addTo(this.map);

        // Add zoom control to top-right
        L.control.zoom({ position: 'topright' }).addTo(this.map);

        // Tactical Overlay Layers
        this.zonesLayer = L.layerGroup().addTo(this.map);
        this.hazardsLayer = L.layerGroup().addTo(this.map);
        this.routesLayer = L.layerGroup().addTo(this.map);
        this.hospitalsLayer = L.layerGroup().addTo(this.map);
        this.teamsLayer = L.layerGroup().addTo(this.map);
        this.markersLayer = L.layerGroup().addTo(this.map);

        // Reliable Basemap & Overlay Switcher (Completely excludes restricted OpenStreetMap volunteer endpoints)
        const baseMaps = {
            "🌙 CARTO Dark Matter": cartoDark,
            "🗺️ CARTO Voyager": cartoVoyager,
            "🛰️ Esri Satellite Imagery": esriSatellite,
            "🛣️ Esri World Street Map": esriStreet,
            "☀️ CARTO Positron Light": cartoPositron
        };
        const overlays = {
            "⚠️ Disaster Zones": this.zonesLayer,
            "🚧 Road Hazards": this.hazardsLayer,
            "🚑 Safe Routes": this.routesLayer,
            "🏥 Hospitals & Beds": this.hospitalsLayer,
            "👥 Rescue Teams": this.teamsLayer,
            "🚨 SOS Alerts": this.markersLayer
        };
        L.control.layers(baseMaps, overlays, { position: 'topright', collapsed: true }).addTo(this.map);

        this.isInitialized = true;

        // Force Leaflet recalculation on container resize
        const triggerInvalidate = () => {
            if (this.map) {
                this.map.invalidateSize();
            }
        };
        setTimeout(triggerInvalidate, 150);
        setTimeout(triggerInvalidate, 500);
        setTimeout(triggerInvalidate, 1200);

        window.addEventListener('resize', triggerInvalidate);
        window.addEventListener('orientationchange', () => {
            setTimeout(triggerInvalidate, 300);
        });

        // Listen for alert selection from other components
        sosService.on('alert-selected', (alert) => {
            if (alert) {
                this.focusOnAlert(alert);
                // If alert has assigned team, automatically display route
                if (alert.assignedTeam) {
                    this.visualizeRescueRoute(alert, alert.assignedTeam, alert.hospitalId || "HOSP-01");
                } else {
                    this.clearRescueRoute();
                }
            }
        });

        sosService.on('alerts-updated', (alerts) => {
            this.renderAlertMarkers(alerts);
            this.renderZones();
        });

        sosService.on('alert-updated', (alert) => {
            if (alert.assignedTeam) {
                this.visualizeRescueRoute(alert, alert.assignedTeam, alert.hospitalId || "HOSP-01");
            }
        });

        // Initial render
        this.renderZones();
        this.renderRoadHazards();
        this.renderHospitals();
        this.renderRescueTeams();
        this.renderAlertMarkers(sosService.getFilteredAlerts());
    }

    /**
     * Create custom tactical HTML marker for an SOS or Incident
     */
    createSOSMarkerIcon(alert, isSelected = false) {
        const priority = sosService.getEffectivePriority(alert);
        const prioConfig = PRIORITIES[priority] || PRIORITIES.MEDIUM;
        const disasterConfig = DISASTER_TYPES[alert.disasterType] || DISASTER_TYPES.Other;
        const isCritical = priority === "CRITICAL";
        const isIncident = alert.reportType === "INCIDENT";

        const pulseHtml = isCritical ? `<div class="marker-radar-ring"></div>` : '';
        const selectedClass = isSelected ? 'marker-selected' : '';
        const markerColor = isIncident ? "#f59e0b" : prioConfig.color;

        const html = `
            <div class="custom-sos-marker ${prioConfig.badgeClass} ${selectedClass}">
                ${pulseHtml}
                <div class="marker-core" style="background-color: ${markerColor}; border: 2px solid ${isSelected ? '#ffffff' : '#1e293b'};">
                    <span class="marker-emoji">${isIncident ? '📢' : disasterConfig.icon}</span>
                </div>
                <div class="marker-pointer" style="border-top-color: ${markerColor};"></div>
            </div>
        `;

        return L.divIcon({
            html: html,
            className: 'leaflet-sos-div-icon',
            iconSize: [36, 46],
            iconAnchor: [18, 44],
            popupAnchor: [0, -42]
        });
    }

    /**
     * Render all SOS markers on the map
     */
    renderAlertMarkers(alerts) {
        if (!this.map) return;
        this.markersLayer.clearLayers();
        this.sosMarkers.clear();

        const selectedAlert = sosService.getSelectedAlert();

        alerts.forEach(alert => {
            const isSelected = selectedAlert && selectedAlert.id === alert.id;
            const icon = this.createSOSMarkerIcon(alert, isSelected);

            const marker = L.marker([alert.latitude, alert.longitude], {
                icon: icon,
                zIndexOffset: isSelected ? 1000 : (PRIORITIES[sosService.getEffectivePriority(alert)]?.rank || 1) * 100
            });

            // Popup content
            const priority = sosService.getEffectivePriority(alert);
            const prioConfig = PRIORITIES[priority] || PRIORITIES.MEDIUM;
            const disaster = DISASTER_TYPES[alert.disasterType] || DISASTER_TYPES.Other;
            const dangerScore = sosService.getEffectiveDangerScore(alert);
            const isIncident = alert.reportType === "INCIDENT";

            const popupContent = `
                <div class="tactical-popup">
                    <div class="popup-header">
                        <div class="flex items-center gap-1.5">
                            <span class="${isIncident ? 'report-type-badge-incident' : 'report-type-badge-sos'}">
                                ${isIncident ? '📢 INCIDENT' : '🚨 SOS'}
                            </span>
                            <span class="popup-id">${alert.id}</span>
                        </div>
                        <span class="badge ${prioConfig.badgeClass}">${priority}</span>
                    </div>
                    <div class="popup-body">
                        <div class="popup-type-row">
                            <span class="popup-disaster">${disaster.icon} ${alert.disasterType}</span>
                            <span class="text-xs text-amber-400 font-mono font-bold">Score: ${dangerScore}/100</span>
                        </div>
                        <p class="popup-message">"${this.escapeHtml(alert.message)}"</p>
                        <div class="popup-meta">
                            <span>📍 ${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}</span>
                            <span>👥 ${alert.peopleCount || 1} at risk</span>
                            <span>🔋 ${alert.battery}%</span>
                        </div>
                        ${alert.assignedTeam ? `
                            <div class="text-[11px] text-emerald-400 font-mono bg-emerald-950/40 p-1 rounded border border-emerald-500/30 my-1">
                                ✓ Unit Assigned: ${alert.assignedTeam}
                            </div>
                        ` : ''}
                    </div>
                    <div class="popup-actions">
                        <button class="btn btn-primary btn-sm w-full" onclick="detailModal.openForAlert('${alert.id}')">
                            Inspect Emergency Details ↗
                        </button>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent, {
                className: 'tactical-leaflet-popup',
                maxWidth: 320
            });

            marker.on('click', () => {
                sosService.selectAlert(alert.id);
            });

            marker.addTo(this.markersLayer);
            this.sosMarkers.set(alert.id, marker);
        });
    }

    /**
     * Render Hospitals on the tactical map
     */
    renderHospitals() {
        if (!this.map || typeof hospitalService === 'undefined') return;
        this.hospitalsLayer.clearLayers();
        this.hospitalMarkers.clear();

        const hospitals = hospitalService.getAllHospitals();

        hospitals.forEach(h => {
            const html = `
                <div class="custom-hospital-marker cursor-pointer">
                    <div class="w-8 h-8 rounded bg-emerald-900 border-2 border-emerald-400 flex items-center justify-center text-sm shadow-lg shadow-emerald-500/30">
                        🏥
                    </div>
                    <span class="text-[9px] font-mono bg-slate-900 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/40 block text-center whitespace-nowrap mt-0.5">
                        ${h.emergencyBeds} Beds
                    </span>
                </div>
            `;

            const icon = L.divIcon({
                html: html,
                className: 'leaflet-hospital-div-icon',
                iconSize: [32, 44],
                iconAnchor: [16, 22]
            });

            const marker = L.marker([h.latitude, h.longitude], {
                icon: icon,
                zIndexOffset: 600
            });

            const popup = `
                <div class="tactical-popup">
                    <div class="popup-header">
                        <span class="font-bold text-emerald-400">🏥 ${h.name}</span>
                        <span class="badge badge-low">${h.status}</span>
                    </div>
                    <div class="popup-body text-xs space-y-1 text-slate-300 font-mono">
                        <div>Type: <strong class="text-white">${h.type}</strong></div>
                        <div class="grid grid-cols-2 gap-1 py-1">
                            <span class="bg-slate-800/80 p-1 rounded text-cyan-300">Emerg Beds: <strong>${h.emergencyBeds}</strong></span>
                            <span class="bg-slate-800/80 p-1 rounded text-purple-300">ICU Beds: <strong>${h.icuBeds}</strong></span>
                        </div>
                        <div class="text-slate-400">Ambulances: <strong class="text-white">${h.ambulances}</strong> active</div>
                        <div class="text-slate-400">Capabilities: ${h.capabilities.join(", ")}</div>
                    </div>
                </div>
            `;

            marker.bindPopup(popup, { className: 'tactical-leaflet-popup' });
            marker.addTo(this.hospitalsLayer);
            this.hospitalMarkers.set(h.id, marker);
        });
    }

    /**
     * Render Road Hazards & Inundated Causeways
     */
    renderRoadHazards() {
        if (!this.map) return;
        this.hazardsLayer.clearLayers();

        const hazards = (typeof ROAD_HAZARDS !== 'undefined') ? ROAD_HAZARDS : [];

        hazards.forEach(hazard => {
            // Draw hazard line
            const polyline = L.polyline(hazard.coordinates, {
                color: "#ef4444",
                weight: 5,
                opacity: 0.8,
                dashArray: "10, 10"
            });

            const popup = `
                <div class="tactical-popup">
                    <div class="popup-header">
                        <span class="font-bold text-rose-400">⚠️ ROAD HAZARD: ${hazard.name}</span>
                        <span class="badge badge-critical">${hazard.status}</span>
                    </div>
                    <div class="popup-body text-xs text-slate-300 font-mono">
                        <p class="text-rose-300">${hazard.reason}</p>
                        <p class="text-slate-400 mt-1">Autonomous routing avoids this sector.</p>
                    </div>
                </div>
            `;
            polyline.bindPopup(popup, { className: 'tactical-leaflet-popup' });
            polyline.addTo(this.hazardsLayer);

            // Add hazard icon marker at midpoint
            const midCoord = hazard.coordinates[Math.floor(hazard.coordinates.length / 2)];
            const hazardIcon = L.divIcon({
                html: `<div class="bg-rose-950 border border-rose-500 text-rose-300 text-xs px-1.5 py-0.5 rounded font-mono font-bold shadow animate-pulse">🚧 BLOCKED</div>`,
                className: 'leaflet-hazard-div-icon',
                iconSize: [65, 20],
                iconAnchor: [32, 10]
            });

            L.marker(midCoord, { icon: hazardIcon }).addTo(this.hazardsLayer);
        });
    }

    /**
     * Flood-Aware Route Visualizer:
     * Shows Victim -> Team -> Hospital routing with comparative blocked vs safe bypass.
     */
    visualizeRescueRoute(alert, teamId, hospitalId = "HOSP-01") {
        if (!this.map || typeof routingService === 'undefined') return;
        this.routesLayer.clearLayers();

        const team = rescueTeamService.getTeamById(teamId);
        const hospital = (typeof hospitalService !== 'undefined') ? hospitalService.getHospitalById(hospitalId) : null;

        const routeData = routingService.calculateRescueRoute(alert, team, hospital);
        this.activeRoute = routeData;

        // 1. Draw Blocked Route A (Red dashed line)
        const blockedLine = L.polyline(routeData.blockedRoute.coordinates, {
            color: routeData.blockedRoute.color,
            weight: 4,
            dashArray: routeData.blockedRoute.dashArray,
            opacity: 0.85
        });

        blockedLine.bindPopup(`
            <div class="tactical-popup">
                <div class="popup-header">
                    <span class="font-bold text-red-400">⚠️ ${routeData.blockedRoute.name}</span>
                    <span class="badge badge-critical">IMPASSABLE</span>
                </div>
                <div class="popup-body text-xs text-slate-300 font-mono">
                    <div>Distance: ${routeData.blockedRoute.distanceKm} km</div>
                    <div class="text-red-300 font-bold mt-1">${routeData.blockedRoute.warning}</div>
                </div>
            </div>
        `, { className: 'tactical-leaflet-popup' });
        blockedLine.addTo(this.routesLayer);

        // 2. Draw Safe Recommended Route B (Solid glowing emerald/cyan line)
        const safeLine = L.polyline(routeData.recommendedRoute.coordinates, {
            color: routeData.recommendedRoute.color,
            weight: 5,
            opacity: 0.95
        });

        safeLine.bindPopup(`
            <div class="tactical-popup">
                <div class="popup-header">
                    <span class="font-bold text-emerald-400">✓ ${routeData.recommendedRoute.name}</span>
                    <span class="badge badge-low">SAFE ROUTE</span>
                </div>
                <div class="popup-body text-xs text-slate-300 font-mono space-y-1">
                    <div>Distance: <strong class="text-white">${routeData.recommendedRoute.distanceKm} km</strong></div>
                    <div>Est. Transit: <strong class="text-cyan-400">${routeData.recommendedRoute.estimatedTimeMinutes} mins</strong></div>
                    <div class="text-emerald-300">${routeData.recommendedRoute.description}</div>
                </div>
            </div>
        `, { className: 'tactical-leaflet-popup' });
        safeLine.addTo(this.routesLayer);

        // Fit map bounds to encompass the route
        this.map.fitBounds(safeLine.getBounds().pad(0.2));

        // Update AI Situation Summary Widget with routing intelligence
        if (typeof aiSummaryWidget !== 'undefined' && aiSummaryWidget.updateRoutingHud) {
            aiSummaryWidget.updateRoutingHud(routeData);
        }
    }

    clearRescueRoute() {
        if (this.routesLayer) {
            this.routesLayer.clearLayers();
        }
        this.activeRoute = null;
    }

    /**
     * Render Disaster Zones
     */
    renderZones() {
        if (!this.map) return;
        this.zonesLayer.clearLayers();

        const zones = disasterZoneService.calculateZones(sosService.getAllAlerts());

        zones.forEach(zone => {
            if (zone.reportsCount === 0 && !zone.center) return;

            const circle = L.circle(zone.center, {
                radius: zone.radiusMeters || 1200,
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.12,
                weight: 2,
                dashArray: '6, 6'
            });

            const zonePopup = `
                <div class="tactical-popup">
                    <div class="popup-header">
                        <span class="font-bold text-amber-400">${zone.name}</span>
                    </div>
                    <div class="popup-body text-xs space-y-1">
                        <div class="text-slate-300 font-mono">REPORTS: <strong class="text-white">${zone.reportsCount}</strong> | CRITICAL: <strong class="text-red-400">${zone.criticalCount}</strong></div>
                        <div class="text-slate-300 font-mono">HIGH: <strong class="text-orange-400">${zone.highCount}</strong> | MED: <strong class="text-yellow-400">${zone.mediumCount}</strong></div>
                        <div class="text-slate-300 font-mono">ESTIMATED AFFECTED: <strong class="text-cyan-400">${zone.affectedPopulation} Persons</strong></div>
                        <p class="text-slate-400 mt-1">${zone.description}</p>
                    </div>
                </div>
            `;

            circle.bindPopup(zonePopup, { className: 'tactical-leaflet-popup' });
            circle.addTo(this.zonesLayer);
        });
    }

    /**
     * Render Rescue Teams on map
     */
    renderRescueTeams() {
        if (!this.map) return;
        this.teamsLayer.clearLayers();
        this.teamMarkers.clear();

        const teams = rescueTeamService.getAllTeams();

        teams.forEach(team => {
            const teamHtml = `
                <div class="custom-team-marker">
                    <div class="team-marker-core">
                        <span>${team.icon}</span>
                    </div>
                    <span class="team-marker-label">${team.id.replace('TEAM-', '')}</span>
                </div>
            `;

            const icon = L.divIcon({
                html: teamHtml,
                className: 'leaflet-team-div-icon',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const marker = L.marker([team.latitude, team.longitude], {
                icon: icon,
                zIndexOffset: 500
            });

            const popup = `
                <div class="tactical-popup">
                    <div class="popup-header">
                        <span class="font-bold text-cyan-400">${team.icon} ${team.name}</span>
                        <span class="badge badge-outline">${team.status}</span>
                    </div>
                    <div class="popup-body text-xs space-y-1 text-slate-300 font-mono">
                        <div>Vehicle: <span class="text-white">${team.vehicle || 'Standard'}</span> (${team.personnel} Personnel)</div>
                        <div>Comms: <span class="text-slate-400">${team.contactFreq}</span></div>
                        <div class="text-slate-400 mt-1">Equipment: ${team.equipment.join(", ")}</div>
                    </div>
                </div>
            `;

            marker.bindPopup(popup, { className: 'tactical-leaflet-popup' });
            marker.addTo(this.teamsLayer);
            this.teamMarkers.set(team.id, marker);
        });
    }

    /**
     * Pan and zoom to specific alert
     */
    focusOnAlert(alert) {
        if (!this.map || !alert) return;
        this.map.flyTo([alert.latitude, alert.longitude], 15, {
            duration: 1.2,
            easeLinearity: 0.25
        });

        const marker = this.sosMarkers.get(alert.id);
        if (marker) {
            setTimeout(() => {
                marker.openPopup();
            }, 600);
        }
    }

    fitAllMarkers() {
        if (!this.map || this.sosMarkers.size === 0) return;
        const group = new L.featureGroup(Array.from(this.sosMarkers.values()));
        this.map.fitBounds(group.getBounds().pad(0.15));
    }

    showMapNotice(msg) {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        let notice = container.querySelector('.map-notice-banner');
        if (!notice) {
            notice = document.createElement('div');
            notice.className = 'map-notice-banner';
            container.appendChild(notice);
        }
        notice.innerHTML = `<span>${this.escapeHtml(msg)}</span>`;
        notice.style.display = 'block';
        notice.style.opacity = '1';
        setTimeout(() => {
            if (notice) notice.style.opacity = '0';
            setTimeout(() => { if (notice && notice.parentNode) notice.remove(); }, 1000);
        }, 6000);
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

const mapManager = new MapManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MapManager, mapManager };
}
