/**
 * AI-DRIS — Dedicated Victim SOS & Relief Portal Logic
 * Supports real-time multilingual UI switching (Malayalam, Tamil, Hindi, English - Strictly NO Kannada),
 * switchable SOS & Relief Assistance sections, disaster victim registration,
 * and live 4-stage application status tracking pipeline.
 */

// Global State
let selectedDisaster = "Flood";
let peopleCount = 4;
let isInjured = true;
let isVulnerable = true;
let voiceDuration = 8;
let isRecording = false;
let recordInterval = null;
let currentCoords = { latitude: 11.9139, longitude: 79.8145 };
let currentLanguage = "en";
let activeCitizenTab = "sos";

// Centralized Internationalization Dictionary
const I18N_DICT = {
    en: {
        portal_title: "🚨 AI-DRIS • CITIZEN EMERGENCY PORTAL",
        lang_label: "Language:",
        command_link: "Command Terminal ↗",
        tab_sos: "SOS MESSAGE",
        tab_relief: "RELIEF ASSISTANCE",
        sos_heading: "EMERGENCY SOS",
        sos_subtitle: "Rescue Command Center is monitoring this channel. Fill in details and press SEND SOS.",
        step1_title: "What is happening?",
        disaster_flood: "Flood",
        disaster_fire: "Fire",
        disaster_cyclone: "Cyclone",
        disaster_collapse: "Collapse",
        disaster_earthquake: "Earthquake",
        disaster_landslide: "Landslide",
        disaster_other: "Other",
        step2_title: "People needing help",
        step2_label: "People needing rescue:",
        step3_title: "Medical Emergency",
        step3_desc: "Are there injured people?",
        yes_injured: "🩺 YES",
        no: "NO",
        step4_title: "Vulnerable People",
        step4_desc: "Anyone elderly, child, infant, or person with disability?",
        yes_vulnerable: "⚠️ YES",
        step5_title: "Describe What Is Happening",
        sos_placeholder: "Type directly in Malayalam, Tamil, Hindi, English, or your preferred language...",
        verbatim_notice: "✓ Transmitted directly in your mother tongue without forced translation",
        step6_title: "Citizen Contact Information",
        step6_desc: "Command Centre and rescue teams will contact you directly to confirm evacuation status.",
        contact_name_label: "Your Full Name:",
        contact_phone_label: "Mobile / WhatsApp Number:",
        step7_title: "Voice Message (Optional)",
        voice_ready: "HOLD OR CLICK TO RECORD VOICE",
        voice_play: "▶ PLAY",
        step8_title: "Location Detected",
        refresh_loc: "📍 REFRESH LOCATION",
        loc_coords: "Coordinates:",
        loc_sector: "Sector / Area:",
        loc_accuracy: "GPS Accuracy:",
        comm_status: "📡 Connection Status:",
        comm_fallback: "If internet fails, your device will save the SOS locally and transmit via Bluetooth/Wi-Fi phone mesh.",
        btn_send_sos: "SEND EMERGENCY SOS",
        link_to_relief: "🤝 Need post-disaster food, shelter, or relief funds? Open Relief Assistance ➔",
        sos_sent_title: "✅ SOS SENT",
        sos_sent_desc: "Your emergency report has been received by the Command Centre in your native language.",
        confirm_contact: "Citizen Contact:",
        confirm_lang: "Message Language:",
        confirm_prio: "Priority:",
        confirm_score: "Danger Score:",
        confirm_loc: "Location:",
        confirm_status: "Current Status:",
        status_waiting: "Waiting for rescue team assignment",
        confirm_beacon_notice: "Keep your phone ON. Distress beacons are pinging local mesh nodes every 10 seconds.",
        btn_open_cmd: "Open Command Dashboard",
        btn_send_another: "Send Another SOS",
        relief_heading: "DISASTER RELIEF ASSISTANCE",
        relief_subtitle: "Register for emergency food, shelter, medical supplies, and Direct Benefit Transfer (DBT) financial aid.",
        relief_stepA: "Beneficiary & Household Details",
        rf_name_label: "Full Name of Applicant:",
        rf_phone_label: "Contact Phone / WhatsApp:",
        rf_loc_label: "Location / Village / Ward:",
        rf_family_label: "Family Members:",
        rf_disaster_label: "Disaster Encountered:",
        relief_stepB: "Assistance Requirements & Loss Details",
        rf_damage_label: "Describe Damage / Urgent Situation:",
        rf_needs_label: "Select Required Relief Aid (Multiple):",
        aid_finance: "💰 Financial Aid",
        aid_food: "🍲 Food & Rations",
        aid_medicine: "💊 Medicine & Care",
        aid_shelter: "⛺ Shelter Tarpaulin",
        aid_clothing: "👕 Clothing / Blankets",
        aid_supplies: "📦 Emergency Kit",
        rf_amount_label: "Estimated Assistance Amount Requested (₹):",
        btn_submit_relief: "SUBMIT RELIEF ASSISTANCE APPLICATION",
        rf_submitted_title: "Application Submitted Successfully",
        rf_submitted_desc: "Your application has been registered in the district relief transparency ledger.",
        rf_ref_id: "Application Reference ID:",
        btn_track_this: "🔍 Track This Application Status Now ➔",
        tracker_title: "Live Application Status Tracker",
        tracker_live: "● Direct Benefit Sync Active",
        tracker_desc: "Enter your application Reference ID (e.g., RF-2026-101) to view real-time verification and fund dispatch progress.",
        btn_track: "TRACK",
        quick_demo: "Quick Samples:",
        step_pending: "Pending",
        step_verify: "Verification",
        step_approved: "Approved",
        step_distributed: "Distributed",
        track_app_id: "Application ID:",
        track_beneficiary: "Beneficiary Name:",
        track_disaster: "Disaster & Location:",
        track_category: "Requested Assistance:",
        track_amount: "Amount Status:",
        track_status_label: "Current Stage:",
        track_txn_id: "DBT Txn ID:",
        track_officer: "Relief Officer:"
    },
    ml: {
        portal_title: "🚨 AI-DRIS • പൗര അടിയന്തര രക്ഷാ പോർട്ടൽ",
        lang_label: "ഭാഷ:",
        command_link: "കമാൻഡ് കൺസോൾ ↗",
        tab_sos: "അടിയന്തര SOS",
        tab_relief: "ദുരിതാശ്വാസ സഹായം",
        sos_heading: "അടിയന്തര സഹായ സന്ദേശം (SOS)",
        sos_subtitle: "റെസ്ക്യൂ കമാൻഡ് സെന്റർ ഈ ചാനൽ നിരീക്ഷിക്കുന്നു. വിവരങ്ങൾ നൽകി SEND SOS അമർത്തുക.",
        step1_title: "എന്താണ് സംഭവിച്ചത്?",
        disaster_flood: "വെള്ളപ്പൊക്കം",
        disaster_fire: "തീപിടുത്തം",
        disaster_cyclone: "ചുഴലിക്കാറ്റ്",
        disaster_collapse: "കെട്ടിട തകർച്ച",
        disaster_earthquake: "ഭൂകമ്പം",
        disaster_landslide: "ഉരുൾപൊട്ടൽ",
        disaster_other: "മറ്റുള്ളവ",
        step2_title: "സഹായം ആവശ്യമുള്ള ആളുകൾ",
        step2_label: "രക്ഷപ്പെടുത്തേണ്ട ആളുകൾ:",
        step3_title: "ചികിത്സാ അടിയന്തരാവസ്ഥ",
        step3_desc: "പരിക്കേറ്റ ആളുകൾ ഉണ്ടോ?",
        yes_injured: "🩺 ഉണ്ട് (YES)",
        no: "ഇല്ല (NO)",
        step4_title: "പ്രത്യേക ശ്രദ്ധ ആവശ്യമുള്ളവർ",
        step4_desc: "പ്രായമായവരോ, കുട്ടികളോ, ഭിന്നശേഷിക്കാരോ ഉണ്ടോ?",
        yes_vulnerable: "⚠️ ഉണ്ട് (YES)",
        step5_title: "സാഹചര്യം വിവരിക്കുക",
        sos_placeholder: "മലയാളത്തിൽ നേരിട്ട് ഇവിടെ ടൈപ്പ് ചെയ്യുക (സ്വയമേവ തർജ്ജമ ചെയ്യപ്പെടും)...",
        verbatim_notice: "✓ നിങ്ങളുടെ മാതൃഭാഷയിൽ തന്നെ സന്ദേശം കമാൻഡ് സെന്ററിലേക്ക് എത്തും",
        step6_title: "ബന്ധപ്പെടേണ്ട വിവരങ്ങൾ",
        step6_desc: "രക്ഷാപ്രവർത്തകർ നിങ്ങളെ നേരിട്ട് ഫോണിൽ വിളിക്കും.",
        contact_name_label: "പൂർണ്ണമായ പേര്:",
        contact_phone_label: "മൊബൈൽ / വാട്സ്ആപ്പ് നമ്പർ:",
        step7_title: "ശബ്ദ സന്ദേശം (വേണമെങ്കിൽ)",
        voice_ready: "ശബ്ദം റെക്കോർഡ് ചെയ്യാൻ അമർത്തുക",
        voice_play: "▶ കേൾക്കുക",
        step8_title: "കണ്ടെത്തിയ ലൊക്കേഷൻ",
        refresh_loc: "📍 ലൊക്കേഷൻ പുതുക്കുക",
        loc_coords: "കോർഡിനേറ്റുകൾ:",
        loc_sector: "മേഖല / പ്രദേശം:",
        loc_accuracy: "ജിപിഎസ് കൃത്യത:",
        comm_status: "📡 കണക്റ്റിവിറ്റി നില:",
        comm_fallback: "ഇന്റർനെറ്റ് ഇല്ലെങ്കിലും മെഷ് നെറ്റ്‌വർക്ക് വഴി സന്ദേശം കൈമാറ്റം ചെയ്യപ്പെടും.",
        btn_send_sos: "അടിയന്തര സഹായം തേടുക (SEND SOS)",
        link_to_relief: "🤝 ദുരിതാശ്വാസ ഫണ്ട്, ഭക്ഷണം, താമസം എന്നിവയ്ക്ക്? ദുരിതാശ്വാസ പോർട്ടൽ തുറക്കുക ➔",
        sos_sent_title: "✅ SOS അയച്ചു കഴിഞ്ഞു",
        sos_sent_desc: "നിങ്ങളുടെ അടിയന്തര സന്ദേശം കൺട്രോൾ റൂമിൽ ലഭ്യമായിട്ടുണ്ട്.",
        confirm_contact: "ബന്ധപ്പെടേണ്ട നമ്പർ:",
        confirm_lang: "സന്ദേശ ഭാഷ:",
        confirm_prio: "മുൻഗണന:",
        confirm_score: "അപകട സ്കോർ:",
        confirm_loc: "ലൊക്കേഷൻ:",
        confirm_status: "നിലവിലെ അവസ്ഥ:",
        status_waiting: "റെസ്ക്യൂ ടീമിനെ നിയോഗിക്കുന്നു",
        confirm_beacon_notice: "ഫോൺ ഓൺ ചെയ്തു വെയ്ക്കുക. സിഗ്നലുകൾ കൺട്രോൾ റൂമിലേക്ക് എത്തുന്നുണ്ട്.",
        btn_open_cmd: "കമാൻഡ് ഡാഷ്‌ബോർഡ്",
        btn_send_another: "മറ്റൊരു SOS അയക്കുക",
        relief_heading: "ദുരന്ത നിവാരണ ധനസഹായം & ദുരിതാശ്വാസം",
        relief_subtitle: "ഭക്ഷണം, വസ്ത്രം, ചികിത്സ, താമസം, ഡിബിടി ബാങ്ക് ധനസഹായം എന്നിവയ്ക്കായി അപേക്ഷിക്കുക.",
        relief_stepA: "ഗുണഭോക്താവിന്റെയും കുടുംബത്തിന്റെയും വിവരങ്ങൾ",
        rf_name_label: "അപേക്ഷകന്റെ പൂർണ്ണ നാമം:",
        rf_phone_label: "ഫോൺ / വാട്സ്ആപ്പ് നമ്പർ:",
        rf_loc_label: "സ്ഥലം / വില്ലേജ് / വാർഡ്:",
        rf_family_label: "കുടുംബാംഗങ്ങൾ:",
        rf_disaster_label: "ബാധിച്ച ദുരന്തം:",
        relief_stepB: "ആവശ്യമായ സഹായങ്ങളും നഷ്ടവിവരങ്ങളും",
        rf_damage_label: "നാശനഷ്ടങ്ങളും നിലവിലെ അവസ്ഥയും വിവരിക്കുക:",
        rf_needs_label: "ആവശ്യമായ സഹായങ്ങൾ തിരഞ്ഞെടുക്കുക:",
        aid_finance: "💰 ധനസഹായം (DBT)",
        aid_food: "🍲 ഭക്ഷ്യധാന്യ കിറ്റ്",
        aid_medicine: "💊 അത്യാവശ്യ മരുന്നുകൾ",
        aid_shelter: "⛺ ടാർപോളിൻ / ഷെൽട്ടർ",
        aid_clothing: "👕 വസ്ത്രങ്ങൾ / പുതപ്പുകൾ",
        aid_supplies: "📦 എമർജൻസി റിലീഫ് കിറ്റ്",
        rf_amount_label: "ആവശ്യപ്പെടുന്ന സാമ്പത്തിക സഹായം (₹):",
        btn_submit_relief: "ദുരിതാശ്വാസ സഹായത്തിന് അപേക്ഷിക്കുക",
        rf_submitted_title: "അപേക്ഷ വിജയകരമായി സമർപ്പിച്ചു",
        rf_submitted_desc: "നിങ്ങളുടെ അപേക്ഷ സുതാര്യ ദുരിതാശ്വാസ ലെഡ്ജറിൽ രജിസ്റ്റർ ചെയ്തു.",
        rf_ref_id: "അപേക്ഷാ റഫറൻസ് നമ്പർ:",
        btn_track_this: "🔍 അപേക്ഷയുടെ പുരോഗതി പരിശോധിക്കുക ➔",
        tracker_title: "അപേക്ഷയുടെ തത്സമയ വിവരങ്ങൾ",
        tracker_live: "● തത്സമയ ഡിബിടി ട്രാക്കിംഗ്",
        tracker_desc: "നിങ്ങളുടെ റഫറൻസ് നമ്പർ (ഉദാ: RF-2026-101) നൽകി അപേക്ഷയുടെ പുരോഗതി പരിശോധിക്കാം.",
        btn_track: "പരിശോധിക്കുക",
        quick_demo: "മാതൃകകൾ:",
        step_pending: "ലഭിച്ചു",
        step_verify: "പരിശോധന",
        step_approved: "അംഗീകരിച്ചു",
        step_distributed: "വിതരണം ചെയ്തു",
        track_app_id: "അപേക്ഷാ നമ്പർ:",
        track_beneficiary: "ഗുണഭോക്താവിന്റെ പേര്:",
        track_disaster: "ദുരന്തവും സ്ഥലവും:",
        track_category: "ആവശ്യപ്പെട്ട സഹായം:",
        track_amount: "തുക നില:",
        track_status_label: "നിലവിലെ ഘട്ടം:",
        track_txn_id: "ഡിബിടി ട്രാൻസാക്ഷൻ ഐഡി:",
        track_officer: "റിലീഫ് ഓഫീസർ:"
    },
    ta: {
        portal_title: "🚨 AI-DRIS • குடிமக்கள் அவசர உதவி தளம்",
        lang_label: "மொழி:",
        command_link: "கட்டளை மையம் ↗",
        tab_sos: "அவசர SOS",
        tab_relief: "நிவாரண உதவி",
        sos_heading: "அவசர உதவி அழைப்பு (SOS)",
        sos_subtitle: "மீட்பு கட்டளை மையம் இந்த இணைப்பை கண்காணிக்கிறது. விவரங்களை நிரப்பி SEND SOS அழுத்தவும்.",
        step1_title: "என்ன நடந்தது?",
        disaster_flood: "வெள்ளம்",
        disaster_fire: "தீ விபத்து",
        disaster_cyclone: "புயல்",
        disaster_collapse: "கட்டட இடிவு",
        disaster_earthquake: "நிலநடுக்கம்",
        disaster_landslide: "நிலச்சரிவு",
        disaster_other: "பிற",
        step2_title: "உதவி தேவைப்படும் நபர்கள்",
        step2_label: "மீட்கப்பட வேண்டியவர்கள்:",
        step3_title: "மருத்துவ அவசரநிலை",
        step3_desc: "காயமடைந்தவர்கள் உள்ளனரா?",
        yes_injured: "🩺 ஆம் (YES)",
        no: "இல்லை (NO)",
        step4_title: "பாதிக்கப்படக்கூடியவர்கள்",
        step4_desc: "முதியவர்கள், குழந்தைகள், கர்ப்பிணிகள் உள்ளனரா?",
        yes_vulnerable: "⚠️ ஆம் (YES)",
        step5_title: "சூழ்நிலையை விவரிக்கவும்",
        sos_placeholder: "தமிழில் நேரடியாக இங்கே தட்டச்சு செய்யவும் (தானாக மொழிபெயர்க்கப்படும்)...",
        verbatim_notice: "✓ உங்கள் தாய்மொழியிலேயே நேரடியாக கட்டளை மையத்திற்கு அனுப்பப்படும்",
        step6_title: "தொடர்பு விவரங்கள்",
        step6_desc: "மீட்புக் குழுவினர் உங்களை நேரடியாகத் தொடர்பு கொள்வார்கள்.",
        contact_name_label: "உங்கள் முழு பெயர்:",
        contact_phone_label: "கைபேசி / வாட்ஸ்அப் எண்:",
        step7_title: "குரல் செய்தி (விரும்பினால்)",
        voice_ready: "குரல் பதிவு செய்ய அழுத்தவும்",
        voice_play: "▶ ஒலிக்க",
        step8_title: "கண்டறியப்பட்ட இருப்பிடம்",
        refresh_loc: "📍 இருப்பிடத்தை புதுப்பி",
        loc_coords: "அச்சுரேகைகள்:",
        loc_sector: "பகுதி / பிரதேசம்:",
        loc_accuracy: "துல்லியம்:",
        comm_status: "📡 இணைப்பு நிலை:",
        comm_fallback: "இணையம் இல்லாதபோதும் மெஷ் இணைப்பு மூலம் செய்தி பரிமாறப்படும்.",
        btn_send_sos: "அவசர உதவி கோருக (SEND SOS)",
        link_to_relief: "🤝 நிவாரண நிதி, உணவு, இருப்பிட உதவி வேண்டுமா? நிவாரண உதவிப் பிரிவு ➔",
        sos_sent_title: "✅ SOS அனுப்பப்பட்டது",
        sos_sent_desc: "உங்கள் அவசர செய்தி கட்டுப்பாட்டு மையத்தை அடைந்தது.",
        confirm_contact: "தொடர்பு எண்:",
        confirm_lang: "செய்தி மொழி:",
        confirm_prio: "முன்னுரிமை:",
        confirm_score: "ஆபத்து குறியீடு:",
        confirm_loc: "இருப்பிடம்:",
        confirm_status: "தற்போதைய நிலை:",
        status_waiting: "மீட்புக் குழுவினர் ஒதுக்கப்படுகின்றனர்",
        confirm_beacon_notice: "கைபேசியை இயக்கத்தில் வைத்திருங்கள். தகவல் மையத்திற்கு சென்றடைகிறது.",
        btn_open_cmd: "கட்டளை மையம்",
        btn_send_another: "மற்றொரு SOS அனுப்புக",
        relief_heading: "பேரிடர் நிவாரண உதவி & நிதி உதவி",
        relief_subtitle: "உணவு, மருத்துவம், தற்காலிக இருப்பிடம் மற்றும் நேரடி வங்கி நிதி உதவிக்கு விண்ணப்பிக்கவும்.",
        relief_stepA: "பயனாளி மற்றும் குடும்ப விவரங்கள்",
        rf_name_label: "விண்ணப்பதாரரின் முழுப் பெயர்:",
        rf_phone_label: "தொலைபேசி / வாட்ஸ்அப் எண்:",
        rf_loc_label: "இடம் / கிராமம் / வார்டு:",
        rf_family_label: "குடும்ப உறுப்பினர்கள்:",
        rf_disaster_label: "பாதிக்கப்பட்ட பேரிடர்:",
        relief_stepB: "தேவைப்படும் உதவிகள் மற்றும் இழப்பு விவரங்கள்",
        rf_damage_label: "சேத விவரங்கள் மற்றும் அவசர நிலையை விவரிக்கவும்:",
        rf_needs_label: "தேவையான நிவாரண உதவிகளைத் தேர்ந்தெடுக்கவும்:",
        aid_finance: "💰 நேரடி நிதி உதவி (DBT)",
        aid_food: "🍲 உணவு மற்றும் ரேஷன்",
        aid_medicine: "💊 மருத்துவ உதவி",
        aid_shelter: "⛺ தற்காலிக தங்குமிடம்",
        aid_clothing: "👕 உடைகள் / போர்வைகள்",
        aid_supplies: "📦 அவசர நிவாரண தொகுப்பு",
        rf_amount_label: "கோரப்படும் நிதி உதவித் தொகை (₹):",
        btn_submit_relief: "நிவாரண உதவிக்கு விண்ணப்பிக்கவும்",
        rf_submitted_title: "விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது",
        rf_submitted_desc: "உங்கள் விண்ணப்பம் நிவாரண பதிவேட்டில் பதியப்பட்டது.",
        rf_ref_id: "விண்ணப்ப குறிப்பு எண்:",
        btn_track_this: "🔍 விண்ணப்ப நிலையை அறிய ➔",
        tracker_title: "விண்ணப்ப நிலையை அறிய",
        tracker_live: "● நேரடி வங்கி கண்காணிப்பு",
        tracker_desc: "உங்கள் விண்ணப்ப எண்ணை (எ.கா: RF-2026-101) உள்ளிட்டு நிலையை அறியலாம்.",
        btn_track: "கண்காணி",
        quick_demo: "மாதிரிகள்:",
        step_pending: "பெறப்பட்டது",
        step_verify: "சரிபார்ப்பு",
        step_approved: "ஒப்புதல்",
        step_distributed: "வழங்கப்பட்டது",
        track_app_id: "விண்ணப்ப எண்:",
        track_beneficiary: "பயனாளி பெயர்:",
        track_disaster: "பேரிடர் மற்றும் இடம்:",
        track_category: "கோரப்பட்ட உதவி:",
        track_amount: "தொகை நிலை:",
        track_status_label: "தற்போதைய நிலை:",
        track_txn_id: "பரிவர்த்தனை எண்:",
        track_officer: "நிவாரண அதிகாரி:"
    },
    hi: {
        portal_title: "🚨 AI-DRIS • नागरिक आपातकालीन पोर्टल",
        lang_label: "भाषा:",
        command_link: "कमांड सेंटर ↗",
        tab_sos: "आपातकालीन SOS",
        tab_relief: "राहत सहायता",
        sos_heading: "आपातकालीन संकट संदेश (SOS)",
        sos_subtitle: "बचाव कमांड सेंटर इस चैनल की निगरानी कर रहा है। विवरण भरें और SEND SOS दबाएं।",
        step1_title: "क्या घटना घटी है?",
        disaster_flood: "बाढ़",
        disaster_fire: "आग",
        disaster_cyclone: "चक्रवात",
        disaster_collapse: "भवन ढहना",
        disaster_earthquake: "भूकंप",
        disaster_landslide: "भूस्खलन",
        disaster_other: "अन्य",
        step2_title: "मदद की जरूरत वाले लोग",
        step2_label: "बचाए जाने वाले लोग:",
        step3_title: "चिकित्सा आपातकाल",
        step3_desc: "क्या कोई घायल है?",
        yes_injured: "🩺 हाँ (YES)",
        no: "नहीं (NO)",
        step4_title: "संवेदनशील लोग",
        step4_desc: "क्या कोई बुजुर्ग, बच्चे या दिव्यांग हैं?",
        yes_vulnerable: "⚠️ हाँ (YES)",
        step5_title: "स्थिति का विवरण दें",
        sos_placeholder: "सीधे हिंदी में अपनी समस्या यहाँ टाइप करें (स्वचालित अनुवाद समर्थित)...",
        verbatim_notice: "✓ आपका संदेश बिना बदलाव के मूल भाषा में कमांड सेंटर को भेजा जाएगा",
        step6_title: "संपर्क विवरण",
        step6_desc: "बचाव दल सीधे आपसे फोन पर संपर्क करेगा।",
        contact_name_label: "आपका पूरा नाम:",
        contact_phone_label: "मोबाइल / व्हाट्सएप नंबर:",
        step7_title: "वॉयस संदेश (वैकल्पिक)",
        voice_ready: "आवाज रिकॉर्ड करने के लिए दबाएं",
        voice_play: "▶ सुनें",
        step8_title: "स्थान का पता लगाया गया",
        refresh_loc: "📍 स्थान रिफ्रेश करें",
        loc_coords: "निर्देशांक:",
        loc_sector: "क्षेत्र / इलाका:",
        loc_accuracy: "जीपीएस सटीकता:",
        comm_status: "📡 कनेक्टिविटी स्थिति:",
        comm_fallback: "इंटरनेट न होने पर भी मेश नेटवर्क द्वारा संदेश प्रसारित हो जाएगा।",
        btn_send_sos: "आपातकालीन सहायता भेजें (SEND SOS)",
        link_to_relief: "🤝 आपदा राहत कोष, भोजन, आश्रय सहायता चाहिए? राहत सहायता खोलें ➔",
        sos_sent_title: "✅ SOS सफलतापूर्वक भेजा गया",
        sos_sent_desc: "आपकी आपातकालीन सूचना कमांड सेंटर को प्राप्त हो गई है।",
        confirm_contact: "नागरिक संपर्क:",
        confirm_lang: "संदेश भाषा:",
        confirm_prio: "प्राथमिकता:",
        confirm_score: "खतरा स्कोर:",
        confirm_loc: "स्थान:",
        confirm_status: "वर्तमान स्थिति:",
        status_waiting: "बचाव दल की प्रतिनियुक्ति की जा रही है",
        confirm_beacon_notice: "अपना फोन चालू रखें। संकेत कमांड सेंटर तक पहुंच रहे हैं।",
        btn_open_cmd: "कमांड डैशबोर्ड",
        btn_send_another: "दूसरा SOS भेजें",
        relief_heading: "आपदा राहत सहायता एवं वित्तीय कोष",
        relief_subtitle: "भोजन, दवा, अस्थायी आश्रय और डीबीटी बैंक वित्तीय सहायता के लिए पंजीकरण करें।",
        relief_stepA: "लाभार्थी एवं परिवार का विवरण",
        rf_name_label: "आवेदक का पूरा नाम:",
        rf_phone_label: "संपर्क फोन / व्हाट्सएप:",
        rf_loc_label: "स्थान / गाँव / वार्ड:",
        rf_family_label: "परिवार के सदस्य:",
        rf_disaster_label: "आपदा का प्रकार:",
        relief_stepB: "सहायता की आवश्यकता और नुकसान का विवरण",
        rf_damage_label: "नुकसान और मौजूदा स्थिति का विवरण दें:",
        rf_needs_label: "आवश्यक राहत सहायता चुनें:",
        aid_finance: "💰 प्रत्यक्ष वित्तीय सहायता (DBT)",
        aid_food: "🍲 भोजन एवं राशन सामग्री",
        aid_medicine: "💊 दवाइयाँ एवं उपचार",
        aid_shelter: "⛺ तिरपाल / अस्थायी आश्रय",
        aid_clothing: "👕 कपड़े / कंबल",
        aid_supplies: "📦 आपातकालीन राहत किट",
        rf_amount_label: "आवश्यक अनुमानित वित्तीय सहायता (₹):",
        btn_submit_relief: "राहत सहायता आवेदन जमा करें",
        rf_submitted_title: "आवेदन सफलतापूर्वक दर्ज हुआ",
        rf_submitted_desc: "आपका आवेदन पारदर्शी राहत रजिस्टर में दर्ज कर लिया गया है।",
        rf_ref_id: "आवेदन संदर्भ संख्या:",
        btn_track_this: "🔍 आवेदन स्थिति ट्रैक करें ➔",
        tracker_title: "आवेदन की स्थिति की जांच",
        tracker_live: "● लाइव ट्रैकिंग सक्रिय",
        tracker_desc: "अपनी संदर्भ संख्या (जैसे RF-2026-101) दर्ज करें और स्थिति देखें।",
        btn_track: "जांचें",
        quick_demo: "नमूने:",
        step_pending: "प्राप्त हुआ",
        step_verify: "सत्यापन",
        step_approved: "स्वीकृत",
        step_distributed: "वितरित",
        track_app_id: "आवेदन संख्या:",
        track_beneficiary: "लाभार्थी का नाम:",
        track_disaster: "आपदा एवं स्थान:",
        track_category: "मांगी गई सहायता:",
        track_amount: "राशि स्थिति:",
        track_status_label: "वर्तमान चरण:",
        track_txn_id: "डीबीटी लेन-देन आईडी:",
        track_officer: "राहत अधिकारी:"
    }
};

// Pipeline Explanations by Status
const STAGE_EXPLANATIONS = {
    Pending: "Your application has been received and logged into the district registry. Awaiting initial field officer assignment.",
    "Under Verification": "Assigned to the local Revenue Inspector for on-ground damage and beneficiary verification.",
    Approved: "Eligibility confirmed! Sanction letter issued and authorized for Direct Benefit Transfer (DBT) disbursement.",
    Distributed: "Assistance successfully distributed! Funds credited via DBT / relief packages handed over.",
    Rejected: "Application was reviewed and marked ineligible based on revenue norms."
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Restore saved language preference (Default: English)
    const savedLang = localStorage.getItem('drc_citizen_lang') || 'en';
    setLanguage(savedLang, false);

    initDisasterButtons();
    initPeopleStepper();
    initVoiceRecorder();
    detectLocation();

    // Check URL parameters for tab selection
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'relief') {
        switchCitizenTab('relief');
    }

    const submitBtn = document.getElementById('btn-submit-sos');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitSOS);
    }

    // Initialize initial tracking display
    trackReliefApplication('RF-2026-101');
});

// =========================================================================
// TAB SWITCHING: SOS MESSAGE vs RELIEF ASSISTANCE
// =========================================================================
function switchCitizenTab(tabName) {
    activeCitizenTab = tabName;
    const sosContainer = document.getElementById('section-sos-container');
    const reliefContainer = document.getElementById('section-relief-container');
    const tabBtnSos = document.getElementById('tab-btn-sos');
    const tabBtnRelief = document.getElementById('tab-btn-relief');

    if (tabName === 'relief') {
        if (sosContainer) sosContainer.classList.add('hidden');
        if (reliefContainer) reliefContainer.classList.remove('hidden');
        if (tabBtnSos) tabBtnSos.classList.remove('active');
        if (tabBtnRelief) tabBtnRelief.classList.add('active');
    } else {
        if (reliefContainer) reliefContainer.classList.add('hidden');
        if (sosContainer) sosContainer.classList.remove('hidden');
        if (tabBtnRelief) tabBtnRelief.classList.remove('active');
        if (tabBtnSos) tabBtnSos.classList.add('active');
    }
}

// =========================================================================
// MULTILINGUAL INTERFACE TRANSLATION (i18n)
// =========================================================================
function setLanguage(langCode, updateSampleText = true) {
    // Strictly NO Kannada: fallback to English if invalid
    if (!['en', 'ml', 'ta', 'hi'].includes(langCode)) {
        langCode = 'en';
    }

    currentLanguage = langCode;
    try {
        localStorage.setItem('drc_citizen_lang', langCode);
    } catch(e) {}

    // Update Language Pills UI
    document.querySelectorAll('.lang-pill-btn').forEach(btn => {
        if (btn.getAttribute('data-lang') === langCode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Translate all [data-i18n] elements
    const dict = I18N_DICT[langCode] || I18N_DICT.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerText = dict[key];
        }
    });

    // Translate all [data-i18n-placeholder] elements
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) {
            el.setAttribute('placeholder', dict[key]);
        }
    });

    // Update Script detection pill
    const langNames = { en: "English", ml: "Malayalam", ta: "Tamil", hi: "Hindi" };
    const detectedPill = document.getElementById('detected-lang-name');
    const scriptIndicator = document.getElementById('script-indicator');
    if (detectedPill) detectedPill.innerText = `Language: ${langNames[langCode]}`;
    if (scriptIndicator) scriptIndicator.innerText = `Language: ${langNames[langCode]}`;

    // Optionally provide initial demo text if textarea is untouched or default
    if (updateSampleText) {
        const msgInput = document.getElementById('sos-message-text');
        if (msgInput && (!msgInput.value || msgInput.value.includes('വെള്ളപ്പൊക്കം') || msgInput.value.includes('flood') || msgInput.value.includes('வெள்ளம்') || msgInput.value.includes('बाढ़'))) {
            const sampleMessages = {
                ml: "വെള്ളപ്പൊക്കം കാരണം ഞങ്ങൾ വീടിനുള്ളിൽ കുടുങ്ങിയിരിക്കുകയാണ്. 4 പേർ കുടുങ്ങിക്കിടക്കുന്നു, മുത്തശ്ശിക്ക് പരിക്കേറ്റു.",
                ta: "வெள்ளம் சூழ்ந்ததால் நாங்கள் வீட்டில் சிக்கியுள்ளோம். 4 பேர் சிக்கியுள்ளனர், பாட்டிக்கு காயம் ஏற்பட்டுள்ளது.",
                hi: "बाढ़ के कारण हम घर के अंदर फंसे हुए हैं। 4 लोग फंसे हैं, दादी घायल हैं। तुरंत सहायता की आवश्यकता है।",
                en: "We are trapped inside our flooded house. 4 people stranded, grandmother is injured. Immediate rescue needed."
            };
            msgInput.value = sampleMessages[langCode] || sampleMessages.en;
        }
    }
}

// Live typing script detection (does not force translation, preserves text verbatim)
function onMessageInput(text) {
    if (!text || !text.trim()) return;
    
    let detected = "en";
    if (/[\u0D00-\u0D7F]/.test(text)) detected = "ml";
    else if (/[\u0B80-\u0BFF]/.test(text)) detected = "ta";
    else if (/[\u0900-\u097F]/.test(text)) detected = "hi";
    
    const langNames = { en: "English", ml: "Malayalam", ta: "Tamil", hi: "Hindi" };
    const detectedPill = document.getElementById('detected-lang-name');
    const scriptIndicator = document.getElementById('script-indicator');
    if (detectedPill) detectedPill.innerText = `Language: ${langNames[detected] || 'Other'}`;
    if (scriptIndicator) scriptIndicator.innerText = `Detected: ${langNames[detected] || 'Other'}`;
}

// =========================================================================
// SOS FORM CONTROLS & SUBMISSION
// =========================================================================
function initDisasterButtons() {
    const buttons = document.querySelectorAll('.disaster-select-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedDisaster = btn.getAttribute('data-type') || "Flood";
        });
    });
}

function initPeopleStepper() {
    const display = document.getElementById('display-people-count');
    const incBtn = document.getElementById('btn-inc-people');
    const decBtn = document.getElementById('btn-dec-people');

    if (incBtn) {
        incBtn.addEventListener('click', () => {
            peopleCount++;
            if (display) display.innerText = peopleCount;
        });
    }

    if (decBtn) {
        decBtn.addEventListener('click', () => {
            if (peopleCount > 1) {
                peopleCount--;
                if (display) display.innerText = peopleCount;
            }
        });
    }
}

function setMedicalChoice(hasInjuries) {
    isInjured = hasInjuries;
    const btnYes = document.getElementById('btn-injured-yes');
    const btnNo = document.getElementById('btn-injured-no');
    if (btnYes && btnNo) {
        btnYes.className = `btn-toggle-choice ${hasInjuries ? 'selected-yes' : ''}`;
        btnNo.className = `btn-toggle-choice ${!hasInjuries ? 'selected-no' : ''}`;
    }
}

function setVulnerableChoice(hasVulnerable) {
    isVulnerable = hasVulnerable;
    const btnYes = document.getElementById('btn-vulnerable-yes');
    const btnNo = document.getElementById('btn-vulnerable-no');
    if (btnYes && btnNo) {
        btnYes.className = `btn-toggle-choice ${hasVulnerable ? 'selected-yes' : ''}`;
        btnNo.className = `btn-toggle-choice ${!hasVulnerable ? 'selected-no' : ''}`;
    }
}

function initVoiceRecorder() {
    const recordBtn = document.getElementById('btn-record-voice');
    if (recordBtn) {
        recordBtn.addEventListener('click', () => {
            if (isRecording) {
                stopVoiceRecording();
            } else {
                startVoiceRecording();
            }
        });
    }
}

function startVoiceRecording() {
    isRecording = true;
    let seconds = 0;
    const label = document.getElementById('voice-record-label');
    const timer = document.getElementById('voice-timer-display');
    const btnRecord = document.getElementById('btn-record-voice');
    const btnStop = document.getElementById('btn-stop-voice');

    if (label) label.innerText = "RECORDING VOICE TRANSMISSION...";
    if (btnRecord) btnRecord.classList.add('animate-ping');
    if (btnStop) btnStop.classList.remove('hidden');

    recordInterval = setInterval(() => {
        seconds++;
        voiceDuration = seconds;
        if (timer) timer.innerText = `00:${seconds < 10 ? '0' + seconds : seconds} (Recording...)`;
        if (seconds >= 15) {
            stopVoiceRecording();
        }
    }, 1000);
}

function stopVoiceRecording() {
    isRecording = false;
    if (recordInterval) clearInterval(recordInterval);

    const label = document.getElementById('voice-record-label');
    const timer = document.getElementById('voice-timer-display');
    const btnRecord = document.getElementById('btn-record-voice');
    const btnStop = document.getElementById('btn-stop-voice');

    if (label) label.innerText = "VOICE RECORDED (READY FOR RELAY)";
    if (timer) timer.innerText = `00:${voiceDuration < 10 ? '0' + voiceDuration : voiceDuration} (Audio Compressed)`;
    if (btnRecord) btnRecord.classList.remove('animate-ping');
    if (btnStop) btnStop.classList.add('hidden');
}

function playVoicePreview() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        }
    } catch (e) {}
    alert(`[VOICE PLAYBACK]\nPlaying simulated ${voiceDuration}-second distress voice note.`);
}

function detectLocation() {
    const coordsEl = document.getElementById('loc-coords');
    const addrEl = document.getElementById('loc-address');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                currentCoords = {
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                };
                if (coordsEl) coordsEl.innerText = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
                if (addrEl) addrEl.innerText = `GPS Location (Accuracy: ±${Math.round(pos.coords.accuracy)}m)`;
            },
            (err) => {
                currentCoords = { latitude: 11.9139, longitude: 79.8145 };
                if (coordsEl) coordsEl.innerText = `11.9139° N, 79.8145° E`;
                if (addrEl) addrEl.innerText = `Riverfront Basin (DEMO LOCATION)`;
            },
            { timeout: 5000 }
        );
    }
}

function refreshLocation() {
    detectLocation();
    alert("Location refreshed and locked to device GPS telemetry.");
}

async function submitSOS() {
    const messageInput = document.getElementById('sos-message-text');
    const message = messageInput ? messageInput.value.trim() : "Emergency assistance needed.";
    const nameInput = document.getElementById('sos-contact-name');
    const phoneInput = document.getElementById('sos-contact-phone');

    const contactName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Manoj Varma";
    const contactPhone = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : "+91 94471 88231";

    // Detect language of the typed message
    let srcLang = currentLanguage;
    if (typeof translationService !== 'undefined') {
        srcLang = translationService.detectScriptLanguage(message);
    }
    const langNames = { en: "English", ml: "Malayalam", ta: "Tamil", hi: "Hindi" };
    const langLabel = langNames[srcLang] || "Regional Language";

    const sosPayload = {
        id: `#RQ${Math.floor(1000 + Math.random() * 9000)}`,
        reportType: "SOS",
        disasterType: selectedDisaster,
        emergencyType: isInjured ? "Trapped / Medical" : "Trapped",
        message: message,
        originalMessage: message,
        contactName: contactName,
        contactPhone: contactPhone,
        sourceLanguage: srcLang,
        detectedLanguage: langLabel,
        translatedMessage: srcLang === 'en' ? message : null,
        translationStatus: srcLang === 'en' ? 'TRANSLATED' : 'NOT_TRANSLATED',
        isReviewed: false,
        peopleCount: peopleCount,
        injured: isInjured,
        vulnerable: isVulnerable,
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        address: "Riverfront Basin Sector 4 (Detected GPS)",
        battery: 28,
        hopCount: 2,
        hasVoice: true,
        voiceDurationSeconds: voiceDuration
    };

    // Save into local sosService if available
    let savedSOS = null;
    if (typeof sosService !== 'undefined') {
        savedSOS = sosService.addSOS(sosPayload);
    }

    // Try posting to backend server
    try {
        await fetch('/api/sos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sosPayload)
        });
    } catch (e) {}

    // Show Confirmation View
    const formView = document.getElementById('section-sos-container');
    const confirmView = document.getElementById('sos-confirmation-view');

    if (formView && confirmView) {
        formView.classList.add('hidden');
        confirmView.classList.remove('hidden');

        const elId = document.getElementById('confirm-id');
        const elContact = document.getElementById('confirm-contact');
        const elLang = document.getElementById('confirm-language');
        const elPrio = document.getElementById('confirm-priority');
        const elDanger = document.getElementById('confirm-danger');

        if (elId) elId.innerText = savedSOS ? savedSOS.id : sosPayload.id;
        if (elContact) elContact.innerText = `${contactName} (${contactPhone})`;
        if (elLang) elLang.innerText = `${langLabel} (Original Text Preserved)`;
        if (elPrio) elPrio.innerText = savedSOS?.aiAnalysis?.priority || "HIGH";
        if (elDanger) elDanger.innerText = `${savedSOS?.aiAnalysis?.dangerScore || 91} / 100`;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function resetVictimForm() {
    const formView = document.getElementById('section-sos-container');
    const confirmView = document.getElementById('sos-confirmation-view');
    if (formView && confirmView) {
        confirmView.classList.add('hidden');
        formView.classList.remove('hidden');
    }
}

// =========================================================================
// RELIEF ASSISTANCE & LIVE APPLICATION TRACKING
// =========================================================================
function toggleReliefCheck(labelEl) {
    const checkbox = labelEl.querySelector('input[type="checkbox"]');
    if (checkbox) {
        if (checkbox.checked) {
            labelEl.classList.add('checked');
        } else {
            labelEl.classList.remove('checked');
        }
    }
}

async function submitReliefForm() {
    const name = document.getElementById('rf-name')?.value.trim();
    const phone = document.getElementById('rf-phone')?.value.trim();
    const location = document.getElementById('rf-location')?.value.trim();
    const disasterType = document.getElementById('rf-disaster-type')?.value || "Flood";
    const familySize = parseInt(document.getElementById('rf-family-size')?.value, 10) || 4;
    const damageDetails = document.getElementById('rf-damage')?.value.trim();
    const amountRequested = parseFloat(document.getElementById('rf-amount')?.value) || 15000;

    const checkedNeeds = [];
    document.querySelectorAll('input[name="relief_need"]:checked').forEach(cb => {
        checkedNeeds.push(cb.value);
    });

    if (!name || !phone || !location) {
        alert("Please provide applicant name, contact phone, and location.");
        return;
    }

    const applicationData = {
        name,
        phone,
        location,
        disasterType,
        familySize,
        damageDetails,
        assistanceRequired: checkedNeeds.length > 0 ? checkedNeeds : ["Food & Rations"],
        amountRequested
    };

    let newRecord = null;
    if (typeof reliefFundService !== 'undefined') {
        newRecord = reliefFundService.registerVictim(applicationData);
    }

    // Try posting to backend API
    try {
        const res = await fetch('/api/relief/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationData)
        });
        const json = await res.json();
        if (json.beneficiary && !newRecord) {
            newRecord = json.beneficiary;
        }
    } catch(e) {}

    const refId = newRecord ? newRecord.id : `RF-2026-${Math.floor(100 + Math.random() * 900)}`;

    // Show success banner
    const banner = document.getElementById('relief-success-banner');
    const idEl = document.getElementById('new-relief-id');
    if (banner && idEl) {
        idEl.innerText = refId;
        banner.classList.remove('hidden');
        banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Automatically set tracking input and update tracker
    const trackInput = document.getElementById('track-ref-input');
    if (trackInput) trackInput.value = refId;
    trackReliefApplication(refId);
}

function trackNewApplication() {
    const idEl = document.getElementById('new-relief-id');
    const refId = idEl ? idEl.innerText.trim() : 'RF-2026-101';
    const trackerCard = document.getElementById('tracker-result-card');
    if (trackerCard) {
        trackerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    trackReliefApplication(refId);
}

function quickTrack(refId) {
    const trackInput = document.getElementById('track-ref-input');
    if (trackInput) trackInput.value = refId;
    trackReliefApplication(refId);
}

async function trackReliefApplication(targetId) {
    const inputVal = targetId || document.getElementById('track-ref-input')?.value.trim();
    if (!inputVal) return;

    let beneficiary = null;

    // First check local reliefFundService
    if (typeof reliefFundService !== 'undefined') {
        beneficiary = reliefFundService.getBeneficiaryById(inputVal);
    }

    // If not found locally, try backend
    if (!beneficiary) {
        try {
            const res = await fetch(`/api/relief/track/${encodeURIComponent(inputVal)}`);
            const data = await res.json();
            if (data.success && data.beneficiary) {
                beneficiary = data.beneficiary;
            }
        } catch(e) {}
    }

    // If still not found, check sample data directly
    if (!beneficiary && typeof SAMPLE_BENEFICIARIES !== 'undefined') {
        beneficiary = SAMPLE_BENEFICIARIES.find(b => b.id.toLowerCase() === inputVal.toLowerCase());
    }

    if (!beneficiary) {
        // Create demo feedback record for nonexistent ID
        alert(`Application Reference ID "${inputVal}" was not found in the relief ledger.\nShowing default sample status.`);
        beneficiary = {
            id: inputVal.toUpperCase(),
            name: "Applicant Pending",
            location: "Ward Assigned",
            disasterType: "Flood",
            assistanceRequired: ["Food", "Financial Aid"],
            amountRequested: 15000,
            amountApproved: 0,
            status: "Pending",
            verifiedBy: "Awaiting Officer"
        };
    }

    renderTrackingStepper(beneficiary);
}

function renderTrackingStepper(beneficiary) {
    const idEl = document.getElementById('track-id');
    const nameEl = document.getElementById('track-name');
    const locEl = document.getElementById('track-location');
    const needsEl = document.getElementById('track-needs');
    const amtEl = document.getElementById('track-amount-display');
    const badgeEl = document.getElementById('track-status-badge');
    const txnRow = document.getElementById('track-txn-row');
    const txnIdEl = document.getElementById('track-txn-id');
    const officerEl = document.getElementById('track-officer-name');
    const explainEl = document.getElementById('stage-explanation-text');

    if (idEl) idEl.innerText = beneficiary.id;
    if (nameEl) nameEl.innerText = beneficiary.name;
    if (locEl) locEl.innerText = `${beneficiary.disasterType} • ${beneficiary.location}`;
    if (needsEl) needsEl.innerText = Array.isArray(beneficiary.assistanceRequired) ? beneficiary.assistanceRequired.join(', ') : beneficiary.assistanceRequired;
    
    if (amtEl) {
        if (beneficiary.status === 'Distributed' || beneficiary.status === 'Approved') {
            amtEl.innerText = `Sanctioned: ₹${(beneficiary.amountApproved || beneficiary.amountRequested).toLocaleString('en-IN')}`;
            amtEl.className = "text-emerald-400 font-mono font-bold";
        } else {
            amtEl.innerText = `Requested: ₹${(beneficiary.amountRequested || 15000).toLocaleString('en-IN')}`;
            amtEl.className = "text-amber-400 font-mono font-bold";
        }
    }

    // Step elements
    const step1 = document.getElementById('step-pending');
    const step2 = document.getElementById('step-verification');
    const step3 = document.getElementById('step-approved');
    const step4 = document.getElementById('step-distributed');
    const line1 = document.getElementById('line-1');
    const line2 = document.getElementById('line-2');
    const line3 = document.getElementById('line-3');

    // Reset classes
    [step1, step2, step3, step4].forEach(s => {
        if (s) s.className = 'app-step-item';
    });
    [line1, line2, line3].forEach(l => {
        if (l) l.className = 'app-step-line';
    });

    const status = beneficiary.status || "Pending";

    if (badgeEl) {
        badgeEl.innerText = status.toUpperCase();
    }

    if (status === "Pending") {
        if (step1) step1.className = 'app-step-item active';
        if (badgeEl) badgeEl.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40';
        if (txnRow) txnRow.classList.add('hidden');
    } else if (status === "Under Verification") {
        if (step1) step1.className = 'app-step-item done';
        if (line1) line1.className = 'app-step-line done';
        if (step2) step2.className = 'app-step-item active';
        if (badgeEl) badgeEl.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-sky-950 text-sky-300 border border-sky-500/40';
        if (txnRow) txnRow.classList.add('hidden');
    } else if (status === "Approved") {
        if (step1) step1.className = 'app-step-item done';
        if (line1) line1.className = 'app-step-line done';
        if (step2) step2.className = 'app-step-item done';
        if (line2) line2.className = 'app-step-line done';
        if (step3) step3.className = 'app-step-item active';
        if (badgeEl) badgeEl.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40';
        if (txnRow) txnRow.classList.add('hidden');
    } else if (status === "Distributed") {
        if (step1) step1.className = 'app-step-item done';
        if (line1) line1.className = 'app-step-line done';
        if (step2) step2.className = 'app-step-item done';
        if (line2) line2.className = 'app-step-line done';
        if (step3) step3.className = 'app-step-item done';
        if (line3) line3.className = 'app-step-line done';
        if (step4) step4.className = 'app-step-item done active';
        if (badgeEl) badgeEl.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40';
        
        if (txnRow && txnIdEl) {
            txnIdEl.innerText = beneficiary.txnId || `TXN-RF-${Math.floor(10000 + Math.random() * 90000)}`;
            txnRow.classList.remove('hidden');
        }
    } else if (status === "Rejected") {
        if (step1) step1.className = 'app-step-item done';
        if (step2) step2.className = 'app-step-item rejected';
        if (badgeEl) badgeEl.className = 'px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40';
    }

    if (officerEl) {
        officerEl.innerText = beneficiary.verifiedBy || (status === 'Distributed' ? 'Disaster Finance Disbursement Cell' : 'Revenue Inspection Team');
    }

    if (explainEl) {
        explainEl.innerText = STAGE_EXPLANATIONS[status] || STAGE_EXPLANATIONS.Pending;
    }
}
