'use client';

import KlientList from "@/components/dashboard/klienten/KlientList";

export default function KlientenPage() {
    return (
        <div className="flex flex-col h-full">
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Personen</h1>
                    <p className="text-slate-500 mt-2">Verwalten Sie hier Klient:innen und zugeordnete Personen.</p>
                </div>

                <KlientList />
            </div>
        </div>
    );
}
