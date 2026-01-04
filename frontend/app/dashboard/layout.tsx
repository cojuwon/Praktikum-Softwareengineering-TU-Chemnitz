'use client';

import { AuthProvider } from '@/src/hooks/useAuth';
import { Sidebar, Header } from '@/src/components/dashboard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content - offset by sidebar width on desktop */}
        <div className="lg:pl-64">
          <main className="flex flex-col min-h-screen">
            {/* Top Header */}
            <Header />

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-8">
              <div className="max-w-6xl mx-auto space-y-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
