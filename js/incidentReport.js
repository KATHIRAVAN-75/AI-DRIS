/**
 * AI-DRIS — Citizen Incident Report Client Logic
 * Handles incident hazard category selection, photo attachment, and ingestion as INCIDENT.
 */

let selectedIncidentType = "Bridge Damage";
let affectedPeople = 10;
let reportCoords = { latitude: 11.9290, longitude: 79.8180 };
let currentPhotoUrl = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60";

document.addEventListener('DOMContentLoaded', () => {
    initIncidentTypeButtons();
    initAffectedStepper();

    const submitBtn = document.getElementById('btn-submit-incident');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitIncidentReport);
    }
});

function initIncidentTypeButtons() {
    const buttons = document.querySelectorAll('.incident-type-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedIncidentType = btn.getAttribute('data-type') || "Other";
        });
    });
}

function initAffectedStepper() {
    const display = document.getElementById('display-affected-count');
    const incBtn = document.getElementById('btn-inc-affected');
    const decBtn = document.getElementById('btn-dec-affected');

    if (incBtn) {
        incBtn.addEventListener('click', () => {
            affectedPeople += 5;
            if (display) display.innerText = affectedPeople;
        });
    }

    if (decBtn) {
        decBtn.addEventListener('click', () => {
            if (affectedPeople > 0) {
                affectedPeople = Math.max(0, affectedPeople - 5);
                if (display) display.innerText = affectedPeople;
            }
        });
    }
}

function onPresetPhotoSelected(url) {
    currentPhotoUrl = url;
    const preview = document.getElementById('report-photo-preview');
    if (preview) preview.src = url;
}

function detectReportLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                reportCoords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                document.getElementById('report-loc-coords').innerText = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
                document.getElementById('report-loc-name').innerText = "Live Device GPS Position";
            },
            () => {
                reportCoords = { latitude: 11.9290, longitude: 79.8180 };
                document.getElementById('report-loc-coords').innerText = "11.9290° N, 79.8180° E";
                document.getElementById('report-loc-name').innerText = "North River Causeway (DEMO LOCATION)";
            }
        );
    }
}

async function submitIncidentReport() {
    const descInput = document.getElementById('report-description');
    const description = descInput ? descInput.value.trim() : "Hazardous situation reported.";

    const incidentPayload = {
        id: `#IN${Math.floor(2000 + Math.random() * 8000)}`,
        reportType: "INCIDENT",
        disasterType: selectedIncidentType,
        emergencyType: "Disaster Hazard",
        message: description,
        peopleCount: affectedPeople,
        latitude: reportCoords.latitude,
        longitude: reportCoords.longitude,
        address: "North River Causeway Marker #4",
        photoUrl: currentPhotoUrl,
        hasVoice: false
    };

    // Add to sosService state
    let savedIncident = null;
    if (typeof sosService !== 'undefined') {
        savedIncident = sosService.addIncident(incidentPayload);
    }

    // Try posting to backend if available
    try {
        await fetch('/api/incidents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(incidentPayload)
        });
    } catch (e) {}

    // Show Confirmation View
    const formView = document.getElementById('report-form-view');
    const confirmView = document.getElementById('report-confirmation-view');

    if (formView && confirmView) {
        formView.classList.add('hidden');
        confirmView.classList.remove('hidden');

        document.getElementById('incident-confirm-id').innerText = savedIncident ? savedIncident.id : incidentPayload.id;
        document.getElementById('incident-confirm-type').innerText = selectedIncidentType;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function resetIncidentForm() {
    const formView = document.getElementById('report-form-view');
    const confirmView = document.getElementById('report-confirmation-view');
    if (formView && confirmView) {
        confirmView.classList.add('hidden');
        formView.classList.remove('hidden');
    }
}
