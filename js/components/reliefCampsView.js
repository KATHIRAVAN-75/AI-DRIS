/**
 * Relief Camps View - Shelter Capacities, Logistics, and Supplies Tracking
 */

class ReliefCampsView {
    constructor() {
        this.camps = typeof SAMPLE_RELIEF_CAMPS !== 'undefined' ? SAMPLE_RELIEF_CAMPS : [];
    }

    render() {
        const container = document.getElementById('view-camps');
        if (!container) return;

        const totalCapacity = this.camps.reduce((acc, c) => acc + c.capacity, 0);
        const totalOccupied = this.camps.reduce((acc, c) => acc + c.occupied, 0);

        container.innerHTML = `
            <div class="p-4 space-y-4 max-w-7xl mx-auto font-mono">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-xl">⛺</span>
                            <h2 class="text-base font-bold text-white tracking-wider">
                                DESIGNATED RELIEF CAMPS & SHELTER LOGISTICS
                            </h2>
                            <span class="text-[10px] uppercase bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/40">
                                4 ACTIVE SECTOR BASES
                            </span>
                        </div>
                        <p class="text-xs text-slate-400 mt-0.5">
                            Real-time occupancy tracking, ration stock telemetry, medical doctor readiness, and coordinator helplines.
                        </p>
                    </div>

                    <div class="flex items-center gap-2 text-xs">
                        <span class="bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-slate-300">
                            Total Capacity: <b class="text-white">${totalCapacity}</b>
                        </span>
                        <span class="bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded text-emerald-300">
                            Occupied: <b class="text-emerald-400">${totalOccupied}</b> (${Math.round((totalOccupied/totalCapacity)*100)}%)
                        </span>
                        <span class="bg-purple-950/80 border border-purple-500/40 px-2.5 py-1 rounded text-purple-300">
                            Vacant Beds: <b class="text-purple-400">${totalCapacity - totalOccupied}</b>
                        </span>
                    </div>
                </div>

                <!-- Camps Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${this.camps.map(camp => {
                        const pct = Math.round((camp.occupied / camp.capacity) * 100);
                        const isHigh = pct >= 85;
                        const isCritical = pct >= 95;

                        return `
                            <div class="card p-4 bg-slate-900/90 border border-slate-700/80 hover:border-slate-500 transition space-y-3">
                                <div class="flex items-start justify-between">
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <span class="text-base">🏫</span>
                                            <h3 class="text-sm font-bold text-white">${camp.name}</h3>
                                        </div>
                                        <div class="text-[11px] text-slate-400 mt-0.5">📍 ${camp.location} (${camp.coordinates.join(', ')})</div>
                                    </div>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${
                                        camp.suppliesStatus === 'ADEQUATE' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' : 'bg-rose-950 text-rose-400 border-rose-500/40'
                                    }">
                                        ${camp.suppliesStatus}
                                    </span>
                                </div>

                                <!-- Capacity Bar -->
                                <div>
                                    <div class="flex justify-between text-xs mb-1">
                                        <span class="text-slate-400">Occupancy:</span>
                                        <span class="font-bold ${isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'}">
                                            ${camp.occupied} / ${camp.capacity} Persons (${pct}%)
                                        </span>
                                    </div>
                                    <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div class="h-full rounded-full ${isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${pct}%"></div>
                                    </div>
                                </div>

                                <!-- Facilities -->
                                <div class="text-[11px] text-slate-300">
                                    <span class="text-slate-500">Facilities:</span>
                                    ${camp.facilities.map(f => `<span class="bg-slate-800 text-slate-200 text-[10px] px-1.5 py-0.5 rounded mr-1">${f}</span>`).join('')}
                                </div>

                                <!-- Contacts -->
                                <div class="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-400">
                                    <div>🩺 Medical Officer: <b class="text-slate-200">${camp.medicalDoctor}</b></div>
                                    <div class="flex items-center justify-between">
                                        <span>👤 Coordinator: <b class="text-slate-200">${camp.coordinator}</b></span>
                                        <span class="text-cyan-400 font-bold">📞 ${camp.contactPhone}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
}

const reliefCampsView = new ReliefCampsView();
