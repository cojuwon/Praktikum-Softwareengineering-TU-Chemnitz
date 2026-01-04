import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 'h-dvh' garantiert, dass der Container exakt die Bildschirmhöhe hat (auch mobil).
    // 'flex' setzt Sidebar und Hauptbereich nebeneinander.
    <div className="flex h-dvh overflow-hidden bg-slate-50">
      
      {/* Sidebar - auf Desktop statisch, mobil fixed (wird in der Komponente geregelt) */}
      <Sidebar />

      {/* Rechter Bereich: Header + Scrollbarer Inhalt */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <Header />

        {/* Hier scrollt nur der Inhalt, nicht die ganze Seite */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}