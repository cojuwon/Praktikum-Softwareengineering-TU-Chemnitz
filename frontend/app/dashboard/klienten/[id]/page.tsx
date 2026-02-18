import KlientDetails from "@/components/dashboard/klienten/KlientDetails";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <div className="flex flex-col h-full">
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
                <div className="mb-6">
                    <a href="/dashboard/klienten" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                        &larr; Zurück zur Übersicht
                    </a>
                </div>
                <KlientDetails id={id} />
            </div>
        </div>
    );
}
