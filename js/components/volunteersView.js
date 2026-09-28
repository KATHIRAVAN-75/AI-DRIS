/**
 * Volunteers View - Volunteer Management & Skill Allocation
 */

class VolunteersView {
    constructor() {
        this.volunteers = typeof SAMPLE_VOLUNTEERS !== 'undefined' ? SAMPLE_VOLUNTEERS : [];
    }

    render() {
        const container = document.getElementById('view-volunteers');
        if (!container) return;

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-7xl mx-auto font-mono">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xl">👥</span>
                            <h2 class="text-base font-bold text-white tracking-wider">
                                CIVIL RESCUE VOLUNTEER CORPS & SKILL DISPATCH
                            </h2>
                            <span class="text-[10px] uppercase bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40">
                                RAPID MOBILIZATION
                            </span>
                        </div>
                        <p class="text-xs text-slate-400 mt-0.5">
                            Specialized volunteer rosters (boat handlers, medical triage, ham radio, translators) assigned to relief sectors.
                        </p>
                    </div>

                    <div class="flex items-center gap-2 text-xs">
                        <span class="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">
                            Registered: <b class="text-white">${this.volunteers.length}</b>
                        </span>
                        <span class="bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded text-emerald-300">
                            Active: <b class="text-emerald-400">${this.volunteers.filter(v => v.status === 'ACTIVE').length}</b>
                        </span>
                        <button class="btn btn-primary btn-xs" onclick="volunteersView.registerPrompt()">
                            + Register Volunteer
                        </button>
                    </div>
                </div>

                <!-- Volunteers Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${this.volunteers.map(v => `
                        <div class="card p-3.5 bg-slate-900 border border-slate-700 space-y-2.5">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                                        ${v.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div class="text-xs font-bold text-white">${v.name}</div>
                                        <div class="text-[10px] text-cyan-400 font-bold">${v.id}</div>
                                    </div>
                                </div>
                                <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${
                                    v.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
                                }">
                                    ${v.status}
                                </span>
                            </div>

                            <div class="text-[11px] text-slate-300">
                                <span class="text-slate-500">Skills:</span>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    ${v.skills.map(s => `<span class="bg-slate-800 text-slate-200 text-[10px] px-1.5 py-0.5 rounded border border-slate-700">${s}</span>`).join('')}
                                </div>
                            </div>

                            <div class="pt-2 border-t border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
                                <span>Camp: <b class="text-slate-200">${v.assignedCamp}</b></span>
                                <span>Missions: <b class="text-purple-300 font-bold">${v.missionsCompleted}</b></span>
                            </div>

                            <div class="text-[11px] text-cyan-400 flex items-center justify-between pt-1">
                                <span>📞 ${v.phone}</span>
                                <button class="btn btn-secondary btn-xs text-[10px] py-0.5" onclick="alert('Dispatch alert pinged to ${v.name} (${v.phone})')">
                                    📡 Alert Unit
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    registerPrompt() {
        const name = prompt("Enter Volunteer Full Name:");
        if (!name) return;
        const phone = prompt("Enter Contact Mobile Number:", "+91 ");
        if (!phone) return;
        const skills = prompt("Enter Specialized Skills (comma separated):", "First Aid, Logistics");

        const newVol = {
            id: `VOL-0${this.volunteers.length + 1}`,
            name: name.trim(),
            phone: phone.trim(),
            skills: skills.split(',').map(s => s.trim()),
            assignedCamp: "CAMP-01",
            status: "ACTIVE",
            missionsCompleted: 0
        };

        this.volunteers.unshift(newVol);
        alert(`✓ Volunteer ${name} registered successfully! Assigned ID: ${newVol.id}`);
        this.render();
    }
}

const volunteersView = new VolunteersView();
