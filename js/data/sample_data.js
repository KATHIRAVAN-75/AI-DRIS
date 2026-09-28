/**
 * Disaster Rescue Center - Realistic Demo Data
 * Enhanced for AI-DRIS with SOS vs Incident distinction, Danger Scores,
 * duplicate report clusters, and offline mesh telemetry.
 */

const SAMPLE_SOS_ALERTS = [
    {
        id: "SOS-82731",
        reportType: "SOS", // "SOS" (Immediate Help) or "INCIDENT" (Disaster Report)
        disasterType: "Flood",
        emergencyType: "Medical",
        message: "വെള്ളപ്പൊക്കം കാരണം ഞങ്ങൾ വീടിനുള്ളിൽ കുടുങ്ങിയിരിക്കുകയാണ്. 4 പേർ കുടുങ്ങിക്കിടക്കുന്നു, മുത്തശ്ശിക്ക് പരിക്കേറ്റു. ഉടൻ രക്ഷപ്പെടുത്തണം.",
        originalMessage: "വെള്ളപ്പൊക്കം കാരണം ഞങ്ങൾ വീടിനുള്ളിൽ കുടുങ്ങിയിരിക്കുകയാണ്. 4 പേർ കുടുങ്ങിക്കിടക്കുന്നു, മുത്തശ്ശിക്ക് പരിക്കേറ്റു. ഉടൻ രക്ഷപ്പെടുത്തണം.",
        contactName: "Manoj Varma",
        contactPhone: "+91 94471 88231",
        sourceLanguage: "ml",
        detectedLanguage: "Malayalam",
        translatedMessage: null,
        translationStatus: "NOT_TRANSLATED",
        isReviewed: false,
        reviewedBy: null,
        reviewedAt: null,
        latitude: 11.9139,
        longitude: 79.8145,
        address: "42 Riverfront Lane, Arumparthapuram Basin",
        timestamp: "2026-09-06T01:45:00Z",
        battery: 18,
        hopCount: 3,
        relayPath: ["Victim-Phone", "Node-Bravo-9", "Node-Charlie-2", "Gateway-South"],
        peopleCount: 4,
        injured: true,
        vulnerable: true,
        isVerified: false,
        verifiedBy: null,
        verifiedAt: null,
        status: "NEW",
        assignedTeam: null,
        hospitalId: "HOSP-01",
        voiceDurationSeconds: 8,
        hasVoice: true,
        photoUrl: null,
        aiAnalysis: {
            priority: "HIGH",
            dangerScore: 91,
            confidence: 96,
            extractedEntities: {
                disasterType: "Flood",
                disasterTypeConfidence: 96,
                peopleCount: 4,
                peopleCountConfidence: 99,
                medicalEmergency: true,
                medicalConfidence: 93,
                vulnerablePerson: true,
                vulnerableType: "ELDERLY (GRANDMOTHER)",
                vulnerableConfidence: 92,
                locationDetected: true,
                locationConfidence: 98,
                locationDescription: "42 Riverfront Lane, Arumparthapuram Basin",
                priorityConfidence: 91
            },
            reasons: [
                "Water rapidly entering residential dwelling (headroom diminishing)",
                "4 people trapped on upper level without dry egress",
                "Injured elderly grandmother requiring immediate medical stabilization",
                "Critically low battery (18%) risking imminent communications blackout"
            ],
            recommendedAction: "AI recommendation — Human verification required. Dispatch Team Alpha (Flood Boat) and alert City General Hospital trauma unit.",
            operatorOverride: null,
            analyzedAt: "2026-09-06T01:45:12Z"
        },
        history: [
            { timestamp: "2026-09-06T01:45:00Z", action: "SOS Transmitted via Android 3-Hop Mesh in Malayalam", author: "Victim Node" },
            { timestamp: "2026-09-06T01:45:04Z", action: "Gateway-South Ingested & Relayed Distress Packet", author: "Gateway" },
            { timestamp: "2026-09-06T01:45:12Z", action: "AI Classification: Danger Score 91/100 (HIGH Priority)", author: "AI Smart Reader" }
        ]
    },
    {
        id: "SOS-82745",
        reportType: "SOS",
        disasterType: "Flood",
        emergencyType: "Trapped",
        message: "வீட்டின் மேற்கூரையில் 4 பெரியவர்கள் மற்றும் 2 குழந்தைகள் சிக்கியுள்ளனர். தகர கூரை வளைகிறது, உடனடியாக படகு தேவை!",
        originalMessage: "வீட்டின் மேற்கூரையில் 4 பெரியவர்கள் மற்றும் 2 குழந்தைகள் சிக்கியுள்ளனர். தகர கூரை வளைகிறது, உடனடியாக படகு தேவை!",
        contactName: "Senthil Nathan",
        contactPhone: "+91 98402 11928",
        sourceLanguage: "ta",
        detectedLanguage: "Tamil",
        translatedMessage: null,
        translationStatus: "NOT_TRANSLATED",
        isReviewed: false,
        reviewedBy: null,
        reviewedAt: null,
        latitude: 11.9185,
        longitude: 79.8190,
        address: "Plot 15, Nehru Nagar Flood Sector",
        timestamp: "2026-09-06T01:52:00Z",
        battery: 24,
        hopCount: 2,
        relayPath: ["Mesh-Relay-12", "Gateway-South"],
        peopleCount: 6,
        injured: false,
        vulnerable: true,
        isVerified: true,
        verifiedBy: "Officer #04",
        verifiedAt: "2026-09-06T01:54:00Z",
        status: "OFFICER VERIFIED",
        assignedTeam: null,
        hospitalId: null,
        voiceDurationSeconds: 12,
        hasVoice: true,
        photoUrl: null,
        aiAnalysis: {
            priority: "CRITICAL",
            dangerScore: 94,
            confidence: 98,
            extractedEntities: {
                disasterType: "Flood",
                disasterTypeConfidence: 98,
                peopleCount: 6,
                peopleCountConfidence: 99,
                medicalEmergency: false,
                medicalConfidence: 90,
                vulnerablePerson: true,
                vulnerableType: "CHILDREN (2 MINORS)",
                vulnerableConfidence: 95,
                locationDetected: true,
                locationConfidence: 99,
                locationDescription: "Plot 15, Nehru Nagar Flood Sector",
                priorityConfidence: 94
            },
            reasons: [
                "Structural collapse threat: tin roof actively bending under victim weight",
                "Multiple vulnerable individuals including 2 young children",
                "High inundation levels leaving zero ground escape routes"
            ],
            recommendedAction: "AI recommendation — Human verification required. Deploy aerial hoist helicopter or high-capacity rescue raft.",
            operatorOverride: null,
            analyzedAt: "2026-09-06T01:52:10Z"
        },
        history: [
            { timestamp: "2026-09-06T01:52:00Z", action: "SOS Received from Mesh Relay 12 in Tamil", author: "Gateway" },
            { timestamp: "2026-09-06T01:52:10Z", action: "AI Danger Score: 94/100 (CRITICAL)", author: "AI Engine" },
            { timestamp: "2026-09-06T01:54:00Z", action: "Human Officer Verified AI Assessment", author: "Officer #04" }
        ]
    },
    {
        id: "SOS-82710",
        reportType: "SOS",
        disasterType: "Flood",
        emergencyType: "Medical",
        message: "हमारे इलाके में अचानक पानी भर गया है, बिजली नहीं है और एक बुज़ुर्ग व्यक्ति बहुत बीमार हैं। कृपया तुरंत सहायता भेजें।",
        originalMessage: "हमारे इलाके में अचानक पानी भर गया है, बिजली नहीं है और एक बुज़ुर्ग व्यक्ति बहुत बीमार हैं। कृपया तुरंत सहायता भेजें।",
        contactName: "Sunita Devi",
        contactPhone: "+91 91234 56789",
        sourceLanguage: "hi",
        detectedLanguage: "Hindi",
        translatedMessage: null,
        translationStatus: "NOT_TRANSLATED",
        isReviewed: false,
        reviewedBy: null,
        reviewedAt: null,
        latitude: 11.9360,
        longitude: 79.8290,
        address: "Heritage Commercial Complex, Central Avenue",
        timestamp: "2026-09-06T01:20:00Z",
        battery: 41,
        hopCount: 4,
        relayPath: ["Phone-K2", "Phone-M8", "Phone-Z1", "Gateway-Central"],
        peopleCount: 5,
        injured: true,
        vulnerable: true,
        isVerified: true,
        verifiedBy: "Officer #01",
        verifiedAt: "2026-09-06T01:25:00Z",
        status: "RESCUE IN PROGRESS",
        assignedTeam: "TEAM-BRAVO",
        hospitalId: "HOSP-01",
        voiceDurationSeconds: 15,
        hasVoice: true,
        photoUrl: null,
        aiAnalysis: {
            priority: "CRITICAL",
            dangerScore: 98,
            confidence: 99,
            extractedEntities: {
                disasterType: "Flood",
                disasterTypeConfidence: 99,
                peopleCount: 5,
                peopleCountConfidence: 99,
                medicalEmergency: true,
                medicalConfidence: 98,
                vulnerablePerson: true,
                vulnerableType: "ELDERLY SICK PERSON",
                vulnerableConfidence: 88,
                locationDetected: true,
                locationConfidence: 99,
                locationDescription: "Heritage Commercial Complex",
                priorityConfidence: 99
            },
            reasons: [
                "Heavy inundation with power severed across district",
                "Ill elderly family member requiring critical medical stabilization",
                "Water levels rising with rapid current"
            ],
            recommendedAction: "AI recommendation — Human verification required. Dispatch Team Bravo with medical personnel and rescue raft.",
            operatorOverride: null,
            analyzedAt: "2026-09-06T01:20:18Z"
        },
        history: [
            { timestamp: "2026-09-06T01:20:00Z", action: "Packet relayed across 4 hops in Hindi", author: "Mesh Network" },
            { timestamp: "2026-09-06T01:20:18Z", action: "AI Danger Score: 98/100 (CRITICAL)", author: "AI Engine" },
            { timestamp: "2026-09-06T01:25:00Z", action: "Verified by Officer #01", author: "Officer #01" },
            { timestamp: "2026-09-06T01:30:00Z", action: "Team Bravo Dispatched with Extrication Tools", author: "Officer #01" }
        ]
    },
    {
        id: "INC-2031",
        reportType: "INCIDENT",
        disasterType: "Bridge Damage",
        emergencyType: "Infrastructure Damage",
        message: "North river bridge central pillar cracked. Heavy water flow eroding eastern embankment. Bridge swaying dangerously; traffic halted.",
        latitude: 11.9290,
        longitude: 79.8180,
        address: "North River Causeway Marker #4",
        timestamp: "2026-09-06T01:30:00Z",
        battery: 68,
        hopCount: 1,
        relayPath: ["Citizen-Node", "Gateway-Central"],
        peopleCount: 0,
        injured: false,
        vulnerable: false,
        isVerified: true,
        verifiedBy: "Civil Defense Unit",
        verifiedAt: "2026-09-06T01:35:00Z",
        status: "ASSIGNED",
        assignedTeam: "TEAM-BRAVO",
        hospitalId: null,
        hasVoice: false,
        photoUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60",
        aiAnalysis: {
            priority: "MEDIUM",
            dangerScore: 58,
            confidence: 90,
            extractedEntities: {
                disasterType: "Bridge Damage",
                disasterTypeConfidence: 94,
                peopleCount: 0,
                peopleCountConfidence: 95,
                medicalEmergency: false,
                medicalConfidence: 92,
                vulnerablePerson: false,
                vulnerableType: null,
                vulnerableConfidence: 90,
                locationDetected: true,
                locationConfidence: 96,
                locationDescription: "North River Causeway",
                priorityConfidence: 89
            },
            reasons: [
                "Severe structural compromise of primary vehicular bridge",
                "High river current risk washing out embankment",
                "Critical route severance requiring immediate traffic barricade"
            ],
            recommendedAction: "AI recommendation — Human verification required. Deploy civil defense barricades and alert highway routing systems.",
            operatorOverride: null,
            analyzedAt: "2026-09-06T01:30:15Z"
        },
        history: [
            { timestamp: "2026-09-06T01:30:00Z", action: "Citizen Incident Report submitted with photo", author: "Public Citizen" },
            { timestamp: "2026-09-06T01:35:00Z", action: "Civil Defense verified barrier requirements", author: "Civil Defense Unit" }
        ]
    },
    {
        id: "INC-2045",
        reportType: "INCIDENT",
        disasterType: "Road Blockage",
        emergencyType: "Hazard",
        message: "Arumparthapuram main road submerged under 4.5ft flowing water. Two abandoned cars stalled in mid-flow. No pedestrians can cross.",
        latitude: 11.9215,
        longitude: 79.8170,
        address: "Arumparthapuram Main Arterial Junction",
        timestamp: "2026-09-06T01:40:00Z",
        battery: 85,
        hopCount: 2,
        relayPath: ["Police-Post", "Gateway-South"],
        peopleCount: 0,
        injured: false,
        vulnerable: false,
        isVerified: true,
        verifiedBy: "Traffic Police",
        verifiedAt: "2026-09-06T01:42:00Z",
        status: "NEW",
        assignedTeam: null,
        hospitalId: null,
        hasVoice: false,
        photoUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=600&auto=format&fit=crop&q=60",
        aiAnalysis: {
            priority: "HIGH",
            dangerScore: 72,
            confidence: 94,
            extractedEntities: {
                disasterType: "Road Blockage",
                disasterTypeConfidence: 96,
                peopleCount: 0,
                peopleCountConfidence: 95,
                medicalEmergency: false,
                medicalConfidence: 90,
                vulnerablePerson: false,
                vulnerableType: null,
                vulnerableConfidence: 90,
                locationDetected: true,
                locationConfidence: 99,
                locationDescription: "Arumparthapuram Main Arterial",
                priorityConfidence: 92
            },
            reasons: [
                "Primary rescue arterial road impassable due to 4.5ft flood crest",
                "Submerged vehicles creating navigational hazards",
                "Essential detour required for all ambulance & relief dispatches"
            ],
            recommendedAction: "AI recommendation — Human verification required. Update dynamic route navigation to avoid Route A arterial.",
            operatorOverride: null,
            analyzedAt: "2026-09-06T01:40:10Z"
        },
        history: [
            { timestamp: "2026-09-06T01:40:00Z", action: "Incident reported by field patrol", author: "Field Patrol" }
        ]
    },
    {
        id: "SOS-82670",
        reportType: "SOS",
        disasterType: "Flood",
        emergencyType: "Evacuation",
        message: "Water was knee-deep in lane. Elderly grandmother evacuated safely to high ground relief center.",
        latitude: 11.9080,
        longitude: 79.8160,
        address: "Old Colony Lane 3",
        timestamp: "2026-09-06T00:30:00Z",
        battery: 69,
        hopCount: 3,
        relayPath: ["Node-O1", "Node-O2", "Gateway-South"],
        peopleCount: 3,
        injured: false,
        vulnerable: true,
        isVerified: true,
        verifiedBy: "Officer #03",
        verifiedAt: "2026-09-06T00:32:00Z",
        status: "RESOLVED",
        assignedTeam: "TEAM-DELTA",
        hospitalId: "HOSP-03",
        hasVoice: false,
        photoUrl: null,
        aiAnalysis: {
            priority: "MEDIUM",
            dangerScore: 48,
            confidence: 86,
            extractedEntities: {
                disasterType: "Flood",
                disasterTypeConfidence: 90,
                peopleCount: 3,
                peopleCountConfidence: 95,
                medicalEmergency: false,
                medicalConfidence: 90,
                vulnerablePerson: true,
                vulnerableType: "ELDERLY",
                vulnerableConfidence: 88,
                locationDetected: true,
                locationConfidence: 95,
                locationDescription: "Old Colony Lane 3",
                priorityConfidence: 86
            },
            reasons: [
                "Non-acute assisted evacuation successfully completed",
                "Victims stabilized at Municipal Relief Shelter"
            ],
            recommendedAction: "Mission resolved. Unit returned to standby.",
            operatorOverride: null,
            analyzedAt: "2026-09-06T00:30:15Z"
        },
        history: [
            { timestamp: "2026-09-06T00:30:00Z", action: "Alert Received", author: "Gateway" },
            { timestamp: "2026-09-06T00:45:00Z", action: "Assigned to Boat Delta", author: "Officer #03" },
            { timestamp: "2026-09-06T01:40:00Z", action: "Victims safely transferred to Relief Camp. Mission RESOLVED.", author: "Team Delta" }
        ]
    }
];

// Predefined Disaster Zones (automatically grouped geographic sectors)
const SAMPLE_DISASTER_ZONES = [
    {
        id: "ZONE-A",
        name: "🌊 FLOOD ZONE A (Arumparthapuram Basin)",
        type: "Flood",
        color: "#38bdf8",
        center: [11.9150, 79.8160],
        radiusMeters: 1400,
        description: "Primary river overflow catchment. Rapidly rising waters, inundated causeway, and trapped residential pockets."
    },
    {
        id: "ZONE-B",
        name: "🌎 SEISMIC SECTOR B (Heritage Downtown)",
        type: "Earthquake",
        color: "#f97316",
        center: [11.9340, 79.8320],
        radiusMeters: 1100,
        description: "High-density commercial structures with localized stairwell and wall failures."
    },
    {
        id: "ZONE-C",
        name: "🔥 WILDFIRE FRONT C (Western Hill Ridge)",
        type: "Wildfire",
        color: "#ef4444",
        center: [11.9620, 79.8000],
        radiusMeters: 1600,
        description: "Fast-moving wildland brush fire threatening western residential outposts and access roads."
    }
];

// =========================================================================
// 1. RELIEFFUND SAMPLE DATA (Financial Assistance & Transparency Ledger)
// =========================================================================
const INITIAL_RELIEF_FUNDS = {
    totalCollected: 12500000, // ₹1,25,00,000 (₹1.25 Cr)
    totalDistributed: 7850000, // ₹78,50,000 (₹78.50 L)
    pendingRequests: 18,
    verifiedBeneficiaries: 142,
    categories: {
        "Food & Rations": 2400000,
        "Medical & First Aid": 1850000,
        "Temporary Shelter": 2100000,
        "Clothing & Blankets": 600000,
        "Direct Financial Aid": 900000
    }
};

const SAMPLE_BENEFICIARIES = [
    {
        id: "RF-2026-101",
        name: "Ramesh Kumar",
        phone: "+91 98401 23456",
        location: "Arumparthapuram Sector 2",
        disasterType: "Flood",
        familySize: 4,
        damageDetails: "Ground floor flooded up to 4 feet. Submerged grain storage, damaged electrical appliances, loss of bedding.",
        assistanceRequired: ["Food", "Clothing", "Financial Aid"],
        amountRequested: 25000,
        amountApproved: 20000,
        status: "Distributed",
        submittedAt: "2026-09-05T08:30:00Z",
        verifiedBy: "Disaster Relief Officer #04",
        distributedAt: "2026-09-06T10:15:00Z",
        txnId: "TXN-RF-90412"
    },
    {
        id: "RF-2026-102",
        name: "Lakshmi Narayanan",
        phone: "+91 94432 78901",
        location: "Coastal Fishermen Colony",
        disasterType: "Cyclone",
        familySize: 5,
        damageDetails: "Thatched roof blown away by 90 km/h wind gusts. Water damage to household items. 1 elderly person injured.",
        assistanceRequired: ["Shelter", "Medicine", "Food"],
        amountRequested: 35000,
        amountApproved: 30000,
        status: "Approved",
        submittedAt: "2026-09-05T11:20:00Z",
        verifiedBy: "Disaster Relief Officer #02",
        distributedAt: null,
        txnId: null
    },
    {
        id: "RF-2026-103",
        name: "Abdul Kareem",
        phone: "+91 97890 45612",
        location: "Heritage Downtown Market",
        disasterType: "Building Collapse",
        familySize: 3,
        damageDetails: "Staircase and boundary wall collapsed. Shop inventory damaged. Family relocated to relative's house.",
        assistanceRequired: ["Shelter", "Financial Aid"],
        amountRequested: 40000,
        amountApproved: 0,
        status: "Under Verification",
        submittedAt: "2026-09-06T07:45:00Z",
        verifiedBy: "Field Inspector #07",
        distributedAt: null,
        txnId: null
    },
    {
        id: "RF-2026-104",
        name: "Priya Sundaram",
        phone: "+91 98840 98765",
        location: "Riverbank Enclave Sector 4",
        disasterType: "Flood",
        familySize: 6,
        damageDetails: "Urgent need of drinking water, infant baby formula, and dry clothing. Completely isolated on terrace.",
        assistanceRequired: ["Food", "Medicine", "Clothing"],
        amountRequested: 18000,
        amountApproved: 0,
        status: "Pending",
        submittedAt: "2026-09-06T09:15:00Z",
        verifiedBy: null,
        distributedAt: null,
        txnId: null
    },
    {
        id: "RF-2026-105",
        name: "Murugan S.",
        phone: "+91 94862 33445",
        location: "West Hill Outpost",
        disasterType: "Landslide",
        familySize: 4,
        damageDetails: "Mud and boulders damaged rear kitchen wall. Access road blocked. Livestock evacuated.",
        assistanceRequired: ["Food", "Shelter", "Financial Aid"],
        amountRequested: 30000,
        amountApproved: 25000,
        status: "Distributed",
        submittedAt: "2026-09-05T06:10:00Z",
        verifiedBy: "Disaster Relief Officer #01",
        distributedAt: "2026-09-05T18:30:00Z",
        txnId: "TXN-RF-90388"
    }
];

const SAMPLE_FUND_DISTRIBUTIONS = [
    {
        id: "DIST-001",
        txnId: "TXN-RF-90412",
        beneficiaryId: "RF-2026-101",
        beneficiaryName: "Ramesh Kumar",
        location: "Arumparthapuram Sector 2",
        category: "Food & Household Relief",
        amount: 20000,
        date: "2026-09-06 10:15 AM",
        paymentMode: "Direct Benefit Transfer (DBT Simulation)",
        status: "Completed"
    },
    {
        id: "DIST-002",
        txnId: "TXN-RF-90388",
        beneficiaryId: "RF-2026-105",
        beneficiaryName: "Murugan S.",
        location: "West Hill Outpost",
        category: "Shelter Repair & Financial Aid",
        amount: 25000,
        date: "2026-09-05 06:30 PM",
        paymentMode: "Direct Benefit Transfer (DBT Simulation)",
        status: "Completed"
    },
    {
        id: "DIST-003",
        txnId: "TXN-RF-90299",
        beneficiaryId: "RF-2026-089",
        beneficiaryName: "Anandharaj V.",
        location: "Lakeview Colony",
        category: "Medical & Critical Aid",
        amount: 15000,
        date: "2026-09-05 02:40 PM",
        paymentMode: "Direct Benefit Transfer (DBT Simulation)",
        status: "Completed"
    },
    {
        id: "DIST-004",
        txnId: "TXN-RF-90180",
        beneficiaryId: "RF-2026-072",
        beneficiaryName: "Fatima Begum",
        location: "Old Town Market",
        category: "Food & Rations Package",
        amount: 12000,
        date: "2026-09-04 11:20 AM",
        paymentMode: "Direct Benefit Transfer (DBT Simulation)",
        status: "Completed"
    }
];

// =========================================================================
// 2. ALERTSHIELD SAMPLE DATA (Fake Message Detection & Review Sandbox)
// =========================================================================
const SAMPLE_VERIFIED_BULLETINS = [
    {
        id: "BULLETIN-001",
        authority: "IMD (India Meteorological Department)",
        title: "Red Alert for Heavy Inundation in Coastal Puducherry & Cuddalore",
        content: "Isolated extremely heavy rainfall (>204.4 mm) expected in next 24 hours. Residents in low-lying areas advised to move to designated relief shelters. Helpline: 1070 / 1077.",
        issuedAt: "2026-09-06T06:00:00Z",
        verifiedBy: "State Disaster Management Authority (SDMA)"
    },
    {
        id: "BULLETIN-002",
        authority: "District Collectorate & Police EOC",
        title: "Controlled Water Discharge from Sathanur Reservoir",
        content: "5,000 cusecs released through spillway gates in a phased, controlled manner. No danger to town embankments. Avoid riverside causeways.",
        issuedAt: "2026-09-06T08:30:00Z",
        verifiedBy: "Public Works Department (PWD)"
    }
];

const SAMPLE_REPORTED_HOAXES = [
    {
        id: "HOAX-2026-01",
        submittedBy: "Citizen Sentinel #12",
        rawMessage: "URGENT WARNING!! Sathanur Dam breached! 50ft tsunami wave entering Arumparthapuram in 20 minutes! Entire city drowning! FORWARD TO EVERYONE IMMEDIATELY!!",
        receivedAt: "2026-09-06T08:45:00Z",
        analysis: {
            status: "Rejected", // Confirmed Fake Hoax
            trustScore: 8, // Very Low
            threatLevel: "CRITICAL PANIC HOAX",
            flags: [
                "No official agency attribution (claims dam breach without PWD/District validation)",
                "Excessive sensationalist language ('50ft tsunami wave', 'Entire city drowning')",
                "Viral forward signature detected ('FORWARD TO EVERYONE IMMEDIATELY')",
                "Direct contradiction: Official PWD bulletin confirms controlled 5,000 cusecs discharge"
            ],
            advice: "DO NOT FORWARD. This is a malicious panic-inducing viral rumor. Dam gates are operating normally under PWD supervision."
        },
        reportCount: 38,
        adminStatus: "Flagged as False Rumor",
        reviewedBy: "Cyber Cell & EOC Desk #02"
    },
    {
        id: "HOAX-2026-02",
        submittedBy: "Field Volunteer #09",
        rawMessage: "Official Relief Grant: Government distributing ₹50,000 flood grant to all affected citizens immediately! Click here to claim your cash aid: http://bit.ly/pm-flood-grant-instant",
        receivedAt: "2026-09-06T09:10:00Z",
        analysis: {
            status: "Rejected", // Phishing Scam
            trustScore: 4,
            threatLevel: "FINANCIAL PHISHING SCAM",
            flags: [
                "Suspicious short URL detected (bit.ly/...) hiding real destination",
                "Non-government domain: Not hosted on gov.in or nic.in portal",
                "Demands banking credentials under guise of flood aid grant",
                "Fraudulent financial lure designed to exploit disaster victims"
            ],
            advice: "WARNING: High-risk phishing scam! Do NOT click the link or provide UPI / Bank OTP credentials."
        },
        reportCount: 52,
        adminStatus: "Blocked & Domain Reported to CERT-In",
        reviewedBy: "EOC Cyber Security Lead"
    },
    {
        id: "ALERT-2026-03",
        submittedBy: "Citizen User",
        rawMessage: "Arumparthapuram Main Arterial causeway flooded with 4.5ft water. Traffic halted. Detour via East Elevated Bypass Route B. SDMA emergency team on site. Helpline 112.",
        receivedAt: "2026-09-06T09:25:00Z",
        analysis: {
            status: "Verified",
            trustScore: 96,
            threatLevel: "GENUINE ADVISORY",
            flags: [
                "Matches verified Traffic Police & Incident #INC-2031 hazard telemetry",
                "Contains official helpline (112) and precise alternative bypass routing",
                "No panic-baiting or suspicious links detected",
                "Cross-verified with field patrol units"
            ],
            advice: "GENUINE: Valid road safety warning verified against command center road sensors."
        },
        reportCount: 0,
        adminStatus: "Verified & Broadcast to Feed",
        reviewedBy: "Operations Commander"
    },
    {
        id: "HOAX-2026-04",
        submittedBy: "WhatsApp Group Forward",
        rawMessage: "Drinking water in whole district contaminated with chemical poison due to factory leak. Do not drink tap water today. Municipal hospital overwhelmed with 500 dead!!",
        receivedAt: "2026-09-06T09:40:00Z",
        analysis: {
            status: "Under Review",
            trustScore: 28,
            threatLevel: "UNVERIFIED EXAGGERATION",
            flags: [
                "Zero official reports from Municipal Health Department or Water Authority",
                "Extreme casualty claims ('500 dead') directly contradicted by hospital ICU telemetry (11 beds occupied)",
                "Water treatment plants operating normally on backup generator power"
            ],
            advice: "UNDER REVIEW: Awaiting final water sample assay from Municipal Corporation laboratory."
        },
        reportCount: 19,
        adminStatus: "Under Verification with Health Department",
        reviewedBy: "Health Liaison Officer"
    }
];

// =========================================================================
// 3. BHASHAALERT SAMPLE DATA (Multilingual Emergency Translation & TTS)
// =========================================================================
const SAMPLE_MULTILINGUAL_ALERTS = [
    {
        id: "TRANS-01",
        category: "Flash Flood Evacuation Notice",
        originalLang: "English",
        english: "URGENT EVACUATION ADVISORY: Flash flood waters rising rapidly in Sector 2 Arumparthapuram. All residents in low-lying houses must evacuate immediately to Govt Higher Secondary School Relief Camp. Emergency boats deployed. Contact Helpline: 1077 / 112.",
        tamil: "அவசர வெளியேற்ற எச்சரிக்கை: செக்டார் 2 அரும்பார்த்தபுரத்தில் திடீர் வெள்ள நீர் வேகமாக உயர்ந்து வருகிறது. தாழ்வான பகுதிகளில் உள்ள குடியிருப்பாளர்கள் உடனடியாக அரசு மேல்நிலைப் பள்ளி நிவாரண முகாமிற்கு வெளியேற வேண்டும். மீட்பு படகுகள் தயார் நிலையில் உள்ளன. உதவி எண்: 1077 / 112.",
        malayalam: "അടിയന്തിര ഒഴിപ്പിക്കൽ മുന്നറിയിപ്പ്: സെക്ടർ 2 അരുമ്പാർത്ഥപുരത്ത് മിന്നൽ പ്രളയജലം അതിവേഗം ഉയരുന്നു. താഴ്ന്ന പ്രദേശങ്ങളിലെ താമസക്കാർ ഉടൻ തന്നെ ഗവൺമെന്റ് ഹയർ സെക്കൻഡറി സ്കൂൾ ദുരിതാശ്വാസ ക്യാമ്പിലേക്ക് മാറേണ്ടതാണ്. റെസ്ക്യൂ ബോട്ടുകൾ വിന്യസിച്ചിട്ടുണ്ട്. ഹെൽപ്പ് ലൈൻ: 1077 / 112.",
        hindi: "आपातकालीन निकासी चेतावनी: सेक्टर 2 अरुम्पार्थपुरम में अचानक बाढ़ का पानी तेजी से बढ़ रहा है। निचले इलाकों के सभी निवासी तुरंत सरकारी उच्चतर माध्यमिक विद्यालय राहत शिविर में चले जाएं। राहत नौकाएं तैनात हैं। हेल्पलाइन: 1077 / 112।",
        criticalTokens: ["Sector 2 Arumparthapuram", "Govt Higher Secondary School Relief Camp", "1077", "112"]
    },
    {
        id: "TRANS-02",
        category: "Relief Camp & Supply Distribution",
        originalLang: "English",
        english: "RELIEF CAMP UPDATE: Clean drinking water, hot meals, baby nutrition packages, and emergency medicines are now available at Community Hall Sector 4 Relief Camp. Doctors on site for medical triage. Camp Coordinator Phone: +91 94432 10111.",
        tamil: "நிவாரண முகாம் தகவல்: செக்டார் 4 சமுதாய நலக்கூட முகாமில் சுத்தமான குடிநீர், சூடான உணவு, குழந்தைகள் ஊட்டச்சத்து மற்றும் அவசர மருந்துகள் கிடைக்கின்றன. மருத்துவர்கள் பணியில் உள்ளனர். முகாம் ஒருங்கிணைப்பாளர் தொலைபேசி: +91 94432 10111.",
        malayalam: "ദുരിതാശ്വാസ ക്യാമ്പ് അപ്‌ഡേറ്റ്: സെക്ടർ 4 കമ്മ്യൂണിറ്റി ഹാൾ ക്യാമ്പിൽ ശുദ്ധമായ കുടിവെള്ളം, ചൂടുള്ള ഭക്ഷണം, ശിശു പോഷകാഹാരം, അടിയന്തിര മരുന്നുകൾ എന്നിവ ലഭ്യമാണ്. ഡോക്ടർമാർ ക്യാമ്പിൽ ഉണ്ട്. കോർഡിനേറ്റർ ഫോൺ: +91 94432 10111.",
        hindi: "राहत शिविर सूचना: कम्युनिटी हॉल सेक्टर 4 राहत शिविर में स्वच्छ पेयजल, गर्म भोजन, शिशु पोषण और आपातकालीन दवाएं उपलब्ध हैं। डॉक्टर शिविर में उपस्थित हैं। समन्वयक फोन: +91 94432 10111।",
        criticalTokens: ["Community Hall Sector 4", "+91 94432 10111", "Clean drinking water", "baby nutrition"]
    },
    {
        id: "TRANS-03",
        category: "Coastal Surge & Cyclone Advisory",
        originalLang: "English",
        english: "COASTAL SAFETY BULLETIN: Gale winds of 85-95 km/h and high tidal surge forecast along coastline for the next 18 hours. Fishermen are strictly warned not to venture into the sea. Move boats and valuable gear to elevated inland storage. Helpline: 1070.",
        tamil: "கடலோர பாதுகாப்பு எச்சரிக்கை: அடுத்த 18 மணி நேரத்திற்கு கடலோரப் பகுதிகளில் மணிக்கு 85-95 கி.மீ வேகத்தில் பலத்த காற்று மற்றும் அலை சீற்றம் இருக்கும் என எச்சரிக்கப்பட்டுள்ளது. மீனவர்கள் கடலுக்குச் செல்ல வேண்டாம் என அறிவுறுத்தப்படுகிறார்கள். உதவி எண்: 1070.",
        malayalam: "തീരദേശ സുരക്ഷാ മുന്നറിയിപ്പ്: അടുത്ത 18 മണിക്കൂറിൽ തീരപ്രദേശങ്ങളിൽ 85-95 കി.മീ വേഗതയിൽ ശക്തമായ കാറ്റും ഉയർന്ന തിരമാലകളും ഉണ്ടാകാൻ സാധ്യതയുണ്ട്. മത്സ്യത്തൊഴിലാളികൾ കടലിൽ പോകരുത്. ഹെൽപ്പ് ലൈൻ: 1070.",
        hindi: "तटीय सुरक्षा चेतावनी: अगले 18 घंटों के दौरान तटीय क्षेत्रों में 85-95 किमी/घंटे की रफ्तार से तेज हवाएं और ऊंची लहरें उठने की संभावना है। मछुआरे समुद्र में न जाएं। नौकाओं को सुरक्षित स्थान पर रखें। हेल्पलाइन: 1070।",
        criticalTokens: ["85-95 km/h", "18 hours", "1070"]
    }
];

// =========================================================================
// 4. RELIEF CAMPS & VOLUNTEERS SAMPLE DATA
// =========================================================================
const SAMPLE_RELIEF_CAMPS = [
    {
        id: "CAMP-01",
        name: "Govt Higher Secondary School Relief Camp",
        location: "Arumparthapuram Central",
        coordinates: [11.9180, 79.8130],
        capacity: 450,
        occupied: 310,
        facilities: ["Clean Water", "Hot Kitchen", "Medical Post", "Sanitation", "Baby Care"],
        suppliesStatus: "ADEQUATE",
        medicalDoctor: "Dr. K. Swaminathan (MBBS, Emergency Care)",
        coordinator: "S. Murugesan (Tahsil Officer)",
        contactPhone: "+91 94432 10111"
    },
    {
        id: "CAMP-02",
        name: "Community Hall Sector 4 Shelter",
        location: "Riverbank Sector 4",
        coordinates: [11.9120, 79.8220],
        capacity: 250,
        occupied: 235,
        facilities: ["Drinking Water", "Bedding", "First Aid Post"],
        suppliesStatus: "RATIONS NEEDED",
        medicalDoctor: "Dr. Ananya Roy (Paramedic Lead)",
        coordinator: "P. Radhakrishnan",
        contactPhone: "+91 94432 10222"
    },
    {
        id: "CAMP-03",
        name: "St. Joseph College Evacuation Center",
        location: "Heritage Downtown North",
        coordinates: [11.9360, 79.8280],
        capacity: 600,
        occupied: 415,
        facilities: ["Power Generator", "Large Hall", "Full Kitchen", "Pharmacy", "Solar Lights"],
        suppliesStatus: "ADEQUATE",
        medicalDoctor: "Dr. V. Ramanathan (Chief Medical Officer)",
        coordinator: "Rev. Thomas D'Souza",
        contactPhone: "+91 94432 10333"
    },
    {
        id: "CAMP-04",
        name: "Red Cross West Outpost Shelter",
        location: "Western Foothills Sector",
        coordinates: [11.9540, 79.8050],
        capacity: 300,
        occupied: 145,
        facilities: ["Ambulance Bay", "Field Tents", "Purified Water", "Satellite Phone"],
        suppliesStatus: "ADEQUATE",
        medicalDoctor: "Dr. Farooq Ahmed",
        coordinator: "M. Selvi (Red Cross Field Lead)",
        contactPhone: "+91 94432 10444"
    }
];

const SAMPLE_VOLUNTEERS = [
    {
        id: "VOL-01",
        name: "Karthik Raja",
        phone: "+91 98401 55667",
        skills: ["Boat Navigation", "Swift Water Rescue", "Swimmer"],
        assignedCamp: "CAMP-01",
        status: "ACTIVE",
        missionsCompleted: 8
    },
    {
        id: "VOL-02",
        name: "Dr. Shalini Menon",
        phone: "+91 94433 88990",
        skills: ["First Aid", "Triage Paramedic", "Emergency Medicine"],
        assignedCamp: "CAMP-02",
        status: "ACTIVE",
        missionsCompleted: 14
    },
    {
        id: "VOL-03",
        name: "Vigneshwaran P.",
        phone: "+91 97891 22334",
        skills: ["Ham Radio Operator", "Mesh Networking", "Drone Scouting"],
        assignedCamp: "CAMP-03",
        status: "ACTIVE",
        missionsCompleted: 5
    },
    {
        id: "VOL-04",
        name: "Deepa Narayanan",
        phone: "+91 98842 44556",
        skills: ["Food Distribution", "Multilingual Translator (TA/ML/HI)", "Logistics"],
        assignedCamp: "CAMP-01",
        status: "STANDBY",
        missionsCompleted: 11
    },
    {
        id: "VOL-05",
        name: "Mohammed Ziyad",
        phone: "+91 95000 66778",
        skills: ["Heavy Vehicle Driver", "Clearance / Chainsaw", "Shelter Construction"],
        assignedCamp: "CAMP-04",
        status: "ACTIVE",
        missionsCompleted: 9
    }
];

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SAMPLE_SOS_ALERTS,
        SAMPLE_DISASTER_ZONES,
        INITIAL_RELIEF_FUNDS,
        SAMPLE_BENEFICIARIES,
        SAMPLE_FUND_DISTRIBUTIONS,
        SAMPLE_VERIFIED_BULLETINS,
        SAMPLE_REPORTED_HOAXES,
        SAMPLE_MULTILINGUAL_ALERTS,
        SAMPLE_RELIEF_CAMPS,
        SAMPLE_VOLUNTEERS
    };
}
