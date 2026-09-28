/**
 * Disaster Rescue Center - Configuration Constants & Types
 * Enhanced for AI-DRIS Command Operations, Flood-Aware Routing, and Hospital Coordination.
 */

const CONFIG = {
    APP_NAME: "AI-DRIS",
    FULL_NAME: "Disaster Rescue Center",
    SUBTITLE: "AI-Assisted Tactical Command & Mesh Response System",
    VERSION: "3.0.0-SIH-Tactical",
    API_BASE: "/api",
    REFRESH_INTERVAL: 10000,
    DEFAULT_CENTER: [11.9350, 79.8250], // Default theater: Coastal Disaster Zone
    DEFAULT_ZOOM: 13,
};

// Supported Disaster Types with icons, badges, colors
const DISASTER_TYPES = {
    Flood: {
        name: "Flood",
        icon: "🌊",
        color: "#38bdf8",
        bgClass: "disaster-flood",
        description: "Rising waters, flash floods, inundation"
    },
    Fire: {
        name: "Fire",
        icon: "🔥",
        color: "#ef4444",
        bgClass: "disaster-wildfire",
        description: "Urban or forest fires, blaze, smoke hazards"
    },
    Earthquake: {
        name: "Earthquake",
        icon: "🌎",
        color: "#f97316",
        bgClass: "disaster-earthquake",
        description: "Tremors, structural collapse, seismic shifts"
    },
    Cyclone: {
        name: "Cyclone",
        icon: "🌪️",
        color: "#a855f7",
        bgClass: "disaster-cyclone",
        description: "Gale-force winds, storm surge, typhoons"
    },
    Landslide: {
        name: "Landslide",
        icon: "⛰️",
        color: "#eab308",
        bgClass: "disaster-landslide",
        description: "Debris flow, mudslide, road blockage"
    },
    "Building Collapse": {
        name: "Building Collapse",
        icon: "🏚️",
        color: "#f43f5e",
        bgClass: "disaster-collapse",
        description: "Structural failure, trapped casualties"
    },
    Tsunami: {
        name: "Tsunami",
        icon: "🌊",
        color: "#06b6d4",
        bgClass: "disaster-tsunami",
        description: "Massive coastal waves, sea surges"
    },
    Wildfire: {
        name: "Wildfire",
        icon: "🔥",
        color: "#ef4444",
        bgClass: "disaster-wildfire",
        description: "Forest fires, advancing blaze, smoke hazards"
    },
    "Severe Storm": {
        name: "Severe Storm",
        icon: "⛈️",
        color: "#6366f1",
        bgClass: "disaster-storm",
        description: "Heavy thunderstorms, lightning, hail, flash rain"
    },
    "Bridge Damage": {
        name: "Bridge Damage",
        icon: "🌉",
        color: "#ea580c",
        bgClass: "disaster-infrastructure",
        description: "Damaged span, severed river crossing"
    },
    "Road Blockage": {
        name: "Road Blockage",
        icon: "🚧",
        color: "#ca8a04",
        bgClass: "disaster-infrastructure",
        description: "Submerged roadway, fallen debris"
    },
    Other: {
        name: "Other",
        icon: "⚠️",
        color: "#94a3b8",
        bgClass: "disaster-other",
        description: "General or unspecified crisis incident"
    }
};

// Priority definitions with numeric weights for strict sorting
const PRIORITIES = {
    CRITICAL: {
        key: "CRITICAL",
        label: "CRITICAL",
        rank: 4,
        color: "#ef4444",
        hex: "#ef4444",
        badgeClass: "badge-critical",
        borderClass: "border-critical",
        pulse: true,
        responseTime: "< 15 mins"
    },
    HIGH: {
        key: "HIGH",
        label: "HIGH",
        rank: 3,
        color: "#f97316",
        hex: "#f97316",
        badgeClass: "badge-high",
        borderClass: "border-high",
        pulse: false,
        responseTime: "< 45 mins"
    },
    MEDIUM: {
        key: "MEDIUM",
        label: "MEDIUM",
        rank: 2,
        color: "#eab308",
        hex: "#eab308",
        badgeClass: "badge-medium",
        borderClass: "border-medium",
        pulse: false,
        responseTime: "< 2 hours"
    },
    LOW: {
        key: "LOW",
        label: "LOW",
        rank: 1,
        color: "#22c55e",
        hex: "#22c55e",
        badgeClass: "badge-low",
        borderClass: "border-low",
        pulse: false,
        responseTime: "< 6 hours"
    }
};

// Danger Score thresholds
const DANGER_SCORE_TIERS = {
    CRITICAL: { min: 81, max: 100, label: "CRITICAL", color: "#ef4444", bgClass: "bg-red-500/20 text-red-400 border-red-500/50" },
    HIGH: { min: 61, max: 80, label: "HIGH", color: "#f97316", bgClass: "bg-orange-500/20 text-orange-400 border-orange-500/50" },
    MEDIUM: { min: 31, max: 60, label: "MEDIUM", color: "#eab308", bgClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
    LOW: { min: 0, max: 30, label: "LOW", color: "#22c55e", bgClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" }
};

// Full 7-stage Rescue Status Pipeline
const RESCUE_STATUSES = [
    { key: "NEW", label: "SOS RECEIVED", color: "#eab308", icon: "🟡", step: 1 },
    { key: "AI ANALYZED", label: "AI ANALYSIS", color: "#38bdf8", icon: "🔵", step: 2 },
    { key: "OFFICER VERIFIED", label: "OFFICER VERIFIED", color: "#f97316", icon: "🟠", step: 3 },
    { key: "ASSIGNED", label: "TEAM ASSIGNED", color: "#a855f7", icon: "🟣", step: 4 },
    { key: "RESCUE IN PROGRESS", label: "RESCUE IN PROGRESS", color: "#ef4444", icon: "🚒", step: 5 },
    { key: "MEDICAL TRANSFER", label: "MEDICAL TRANSFER", color: "#06b6d4", icon: "🏥", step: 6 },
    { key: "RESOLVED", label: "RESOLVED", color: "#22c55e", icon: "🟢", step: 7 }
];

// Initial Rescue Teams operating in the theater
const INITIAL_RESCUE_TEAMS = [
    {
        id: "TEAM-ALPHA",
        name: "Team Alpha (Rapid Flood & Medical Triage)",
        type: "Water Rescue & Medical",
        icon: "👨‍🚒",
        vehicle: "🚤 Motorized Flood Boat",
        personnel: 5,
        equipment: ["Amphibious Inflatable Boat", "Advanced Life Support Kit", "Mobile Defibrillator", "Life Jackets & Throw Bags"],
        latitude: 11.9210,
        longitude: 79.8080,
        status: "AVAILABLE", // AVAILABLE, STANDBY, ON MISSION, OFFLINE
        currentAssignment: null,
        contactFreq: "VHF-Ch16 / Mesh ID: RESCUE-01",
        capabilities: ["Flood", "Water Rescue", "Medical", "Boat", "Elderly Evacuation"]
    },
    {
        id: "TEAM-BRAVO",
        name: "Team Bravo (Urban Search & Heavy Rescue)",
        type: "Search & Rescue",
        icon: "🚒",
        vehicle: "🚛 Heavy Rescue Truck",
        personnel: 8,
        equipment: ["Hydraulic Cutters & Spreaders", "Acoustic Search Sensors", "Shoring Struts", "Pneumatic Lifting Bags"],
        latitude: 11.9420,
        longitude: 79.8320,
        status: "ON MISSION",
        currentAssignment: "SOS-82710",
        contactFreq: "VHF-Ch08 / Mesh ID: RESCUE-02",
        capabilities: ["Earthquake", "Building Collapse", "Extrication", "Heavy Machinery"]
    },
    {
        id: "TEAM-CHARLIE",
        name: "Team Charlie (Air Evacuation Heli 1)",
        type: "Aerial Support",
        icon: "🚁",
        vehicle: "🚁 Tactical Air Ambulance",
        personnel: 4,
        equipment: ["Rescue Hoist Winch", "Thermal FLIR Camera", "Basket Stretcher", "Satellite Uplink"],
        latitude: 11.9600,
        longitude: 79.7900,
        status: "AVAILABLE",
        currentAssignment: null,
        contactFreq: "Air-Band 121.5 / Mesh ID: AIR-01",
        capabilities: ["Flood", "Wildfire", "Landslide", "Hoist", "Rapid Evacuation"]
    },
    {
        id: "TEAM-DELTA",
        name: "Team Delta (Swift Water Rescue Boat 2)",
        type: "Water Rescue",
        icon: "🚤",
        vehicle: "🚤 Zodiac Inflatable Raft",
        personnel: 5,
        equipment: ["Motorized Zodiac Boat", "Throw Bags", "Drysuits & PFDs", "Emergency Rations"],
        latitude: 11.9100,
        longitude: 79.8300,
        status: "AVAILABLE",
        currentAssignment: null,
        contactFreq: "Marine-VHF 16 / Mesh ID: BOAT-01",
        capabilities: ["Flood", "Tsunami", "Water Rescue", "Supply Drop"]
    },
    {
        id: "TEAM-ECHO",
        name: "Team Echo (Canine Search & Extraction)",
        type: "K9 Search",
        icon: "🐕",
        vehicle: "🚐 K9 Mobile Unit",
        personnel: 4,
        equipment: ["2 Scent Search Dogs", "GPS Collars", "Borescope Cameras", "Trauma First Aid"],
        latitude: 11.9300,
        longitude: 79.8450,
        status: "STANDBY",
        currentAssignment: null,
        contactFreq: "VHF-Ch12 / Mesh ID: K9-01",
        capabilities: ["Earthquake", "Landslide", "Building Collapse", "K9 Detection"]
    }
];

// Hospitals with real-time bed telemetry & emergency capabilities
const INITIAL_HOSPITALS = [
    {
        id: "HOSP-01",
        name: "City General Hospital",
        type: "Level 1 Trauma Center",
        icon: "🏥",
        status: "AVAILABLE", // AVAILABLE, BUSY, CRITICAL
        emergencyBeds: 12,
        icuBeds: 4,
        ambulances: 2,
        latitude: 11.9390,
        longitude: 79.8290,
        address: "Hospital Road, Central Sector",
        phone: "+91 413 2234000",
        capabilities: ["Trauma", "Emergency Surgery", "ICU", "Blood Bank", "Burn Ward"],
        burnCare: true,
        pediatricCare: true
    },
    {
        id: "HOSP-02",
        name: "Apollo Emergency Disaster Center",
        type: "Specialty Critical Care",
        icon: "🏥",
        status: "AVAILABLE",
        emergencyBeds: 8,
        icuBeds: 6,
        ambulances: 3,
        latitude: 11.9520,
        longitude: 79.8150,
        address: "North Bypass Medical Park",
        phone: "+91 413 2277100",
        capabilities: ["Severe Trauma", "ICU", "Neurosurgery", "Pediatrics", "Dialysis"],
        burnCare: true,
        pediatricCare: true
    },
    {
        id: "HOSP-03",
        name: "St. Jude Emergency Triage Clinic",
        type: "Community Triage & Stabilisation",
        icon: "🏥",
        status: "AVAILABLE",
        emergencyBeds: 4,
        icuBeds: 1,
        ambulances: 1,
        latitude: 11.9210,
        longitude: 79.8350,
        address: "Coastal Beach Road",
        phone: "+91 413 2341200",
        capabilities: ["Triage", "First Aid", "Oxygenation", "Ambulance Station"],
        burnCare: false,
        pediatricCare: false
    }
];

// Road Hazards & Inundated Segments for Flood-Aware Routing
const ROAD_HAZARDS = [
    {
        id: "HAZARD-01",
        name: "Arumparthapuram Causeway",
        status: "BLOCKED",
        reason: "Submerged under 4.5ft flowing flood water",
        coordinates: [
            [11.9180, 79.8120],
            [11.9195, 79.8160],
            [11.9210, 79.8200]
        ]
    },
    {
        id: "HAZARD-02",
        name: "North Canal Bridge",
        status: "BLOCKED",
        reason: "Debris accumulation and structural washaway",
        coordinates: [
            [11.9290, 79.8180],
            [11.9310, 79.8210]
        ]
    }
];

// Simulated Communication Network Telemetry
const DEFAULT_NETWORK_STATUS = {
    internet: { status: "ACTIVE", label: "Internet Gateway", ping: "42ms", fallback: false },
    mobile: { status: "WEAK", label: "Cellular 4G/5G", signal: "1 Bar", fallback: false },
    mesh: { status: "ACTIVE", label: "Android Mesh Network", nodes: 8, hops: 3, active: true },
    sms: { status: "READY", label: "Emergency SMS Fallback", ready: true }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        DISASTER_TYPES,
        PRIORITIES,
        DANGER_SCORE_TIERS,
        RESCUE_STATUSES,
        INITIAL_RESCUE_TEAMS,
        INITIAL_HOSPITALS,
        ROAD_HAZARDS,
        DEFAULT_NETWORK_STATUS
    };
}
