/**
 * Disaster Rescue Center - Hospital Management & Allocation Service
 * Tracks emergency beds, ICU beds, ambulance fleets, and casualty transfer routing.
 */

const _INITIAL_HOSPITALS = (typeof INITIAL_HOSPITALS !== 'undefined')
    ? INITIAL_HOSPITALS
    : ((typeof require !== 'undefined') ? require('../config.js').INITIAL_HOSPITALS : []);

class HospitalService {
    constructor() {
        this.hospitals = _INITIAL_HOSPITALS
            ? JSON.parse(JSON.stringify(_INITIAL_HOSPITALS))
            : [];
        this.loadFromStorage();
    }

    loadFromStorage() {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem("drc_hospitals");
            if (saved) {
                try {
                    this.hospitals = JSON.parse(saved);
                } catch (e) {
                    console.warn("Could not parse saved hospitals, using initial defaults.", e);
                }
            }
        }
    }

    saveToStorage() {
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem("drc_hospitals", JSON.stringify(this.hospitals));
            } catch (e) {
                console.error("Failed to save hospitals to localStorage", e);
            }
        }
    }

    getAllHospitals() {
        return this.hospitals;
    }

    getHospitalById(id) {
        return this.hospitals.find(h => h.id === id);
    }

    /**
     * Get hospitals ranked by proximity and available emergency/ICU beds
     * @param {number} targetLat - Victim / SOS latitude
     * @param {number} targetLng - Victim / SOS longitude
     * @param {boolean} requiresIcu - True if patient is in critical ICU condition
     */
    getHospitalsWithProximity(targetLat, targetLng, requiresIcu = false) {
        return this.hospitals.map(h => {
            const distanceKm = this.getHaversineDistance(
                h.latitude, h.longitude,
                targetLat, targetLng
            );

            // Transit time in emergency ambulance (~50 km/h)
            const transitMinutes = Math.max(4, Math.round((distanceKm / 50) * 60));

            // Suitability score
            let matchScore = 80;
            if (h.emergencyBeds > 5) matchScore += 10;
            if (requiresIcu && h.icuBeds > 0) matchScore += 10;
            if (h.status === 'AVAILABLE') matchScore += 5;
            matchScore -= Math.min(25, Math.round(distanceKm * 2));

            return {
                ...h,
                distanceKm: parseFloat(distanceKm.toFixed(1)),
                transitMinutes: transitMinutes,
                matchScore: Math.min(99, Math.max(40, matchScore))
            };
        }).sort((a, b) => b.matchScore - a.matchScore);
    }

    /**
     * Admit a patient into a hospital (decrements bed)
     */
    admitPatient(hospitalId, isIcu = false) {
        const hospital = this.getHospitalById(hospitalId);
        if (!hospital) return false;

        if (isIcu && hospital.icuBeds > 0) {
            hospital.icuBeds--;
        } else if (hospital.emergencyBeds > 0) {
            hospital.emergencyBeds--;
        }
        this.saveToStorage();
        return true;
    }

    /**
     * Dispatch an ambulance from hospital
     */
    dispatchAmbulance(hospitalId) {
        const hospital = this.getHospitalById(hospitalId);
        if (!hospital || hospital.ambulances <= 0) return false;
        hospital.ambulances--;
        this.saveToStorage();
        return true;
    }

    /**
     * Get aggregate stats for top ticker
     */
    getStats() {
        let totalEmergencyBeds = 0;
        let totalIcuBeds = 0;
        let totalAmbulances = 0;

        this.hospitals.forEach(h => {
            totalEmergencyBeds += (h.emergencyBeds || 0);
            totalIcuBeds += (h.icuBeds || 0);
            totalAmbulances += (h.ambulances || 0);
        });

        return {
            totalHospitals: this.hospitals.length,
            availableBeds: totalEmergencyBeds + totalIcuBeds,
            emergencyBeds: totalEmergencyBeds,
            icuBeds: totalIcuBeds,
            ambulancesAvailable: totalAmbulances
        };
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

const hospitalService = new HospitalService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HospitalService, hospitalService };
}
