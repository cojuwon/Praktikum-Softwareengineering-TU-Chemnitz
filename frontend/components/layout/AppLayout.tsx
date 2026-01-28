'use client';

import { usePathname } from 'next/navigation';
import SideNav from '@/components/ui/dashboard/sidenav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Pages where sidebar should be hidden
    const hideSidebar =
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/' ||
        pathname === '/forgot-password';

    if (hideSidebar) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-[#F3EEEE]">
            <div className="w-full flex-none md:w-64">
                <SideNav />
            </div>
            <div className="grow md:overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
