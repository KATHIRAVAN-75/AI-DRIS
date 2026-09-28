const _DISASTER_TYPES = (typeof DISASTER_TYPES !== 'undefined') 
    ? DISASTER_TYPES 
    : ((typeof require !== 'undefined') ? require('../config.js').DISASTER_TYPES : {});

const _SAMPLE_DISASTER_ZONES = (typeof SAMPLE_DISASTER_ZONES !== 'undefined')
    ? SAMPLE_DISASTER_ZONES
    : ((typeof require !== 'undefined') ? require('../data/sample_data.js').SAMPLE_DISASTER_ZONES : []);

class DisasterZoneService {
    constructor() {
        this.baseZones = _SAMPLE_DISASTER_ZONES ? [..._SAMPLE_DISASTER_ZONES] : [];
    }

    /**
     * Compute and enrich disaster zones based on the current active SOS alerts.
     * @param {Array} alerts - List of all SOS alerts
     * @returns {Array} Array of enriched zone objects with statistics
     */
    calculateZones(alerts = []) {
        // We match each alert to the nearest predefined zone or cluster
        const zonesMap = new Map();

        // Initialize base zones
        this.baseZones.forEach(bz => {
            zonesMap.set(bz.id, {
                ...bz,
                alerts: [],
                reportsCount: 0,
                criticalCount: 0,
                highCount: 0,
                mediumCount: 0,
                lowCount: 0,
                affectedPopulation: 0,
                activeCount: 0,
                resolvedCount: 0
            });
        });

        // Assign alerts to zones
        alerts.forEach(alert => {
            let assignedZoneId = null;
            let minDistance = Infinity;

            // Find closest matching zone within reasonable radius (e.g., 3.5 km)
            this.baseZones.forEach(bz => {
                const dist = this.getHaversineDistance(
                    alert.latitude, alert.longitude,
                    bz.center[0], bz.center[1]
                );
                if (dist <= 3.5 && dist < minDistance) {
                    minDistance = dist;
                    assignedZoneId = bz.id;
                }
            });

            // If an alert is outside predefined zones, we can either place it in a general zone or dynamically create one
            if (!assignedZoneId) {
                const dynamicId = `ZONE-EXT-${alert.disasterType.toUpperCase()}`;
                if (!zonesMap.has(dynamicId)) {
                    zonesMap.set(dynamicId, {
                        id: dynamicId,
                        name: `${_DISASTER_TYPES[alert.disasterType]?.icon || '⚠️'} ${alert.disasterType.toUpperCase()} SECTOR (Outer)`,
                        type: alert.disasterType,
                        color: _DISASTER_TYPES[alert.disasterType]?.color || '#94a3b8',
                        center: [alert.latitude, alert.longitude],
                        radiusMeters: 1200,
                        description: `Outlying ${alert.disasterType} activity cluster.`,
                        alerts: [],
                        reportsCount: 0,
                        criticalCount: 0,
                        highCount: 0,
                        mediumCount: 0,
                        lowCount: 0,
                        affectedPopulation: 0,
                        activeCount: 0,
                        resolvedCount: 0
                    });
                }
                assignedZoneId = dynamicId;
            }

            const zone = zonesMap.get(assignedZoneId);
            if (zone) {
                zone.alerts.push(alert);
                zone.reportsCount++;
                zone.affectedPopulation += (alert.peopleCount || 1);

                const effPriority = (alert.aiAnalysis?.operatorOverride?.effectivePriority) || alert.aiAnalysis?.priority || 'MEDIUM';
                if (effPriority === 'CRITICAL') zone.criticalCount++;
                else if (effPriority === 'HIGH') zone.highCount++;
                else if (effPriority === 'MEDIUM') zone.mediumCount++;
                else if (effPriority === 'LOW') zone.lowCount++;

                if (alert.status === 'RESOLVED') {
                    zone.resolvedCount++;
                } else {
                    zone.activeCount++;
                }
            }
        });

        // Return array filtered to zones that either have alerts or are primary pre-configured ones
        return Array.from(zonesMap.values());
    }

    /**
     * Compute Haversine distance between two coordinates in kilometers
     */
    getHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth radius in km
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

const disasterZoneService = new DisasterZoneService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DisasterZoneService, disasterZoneService };
}
