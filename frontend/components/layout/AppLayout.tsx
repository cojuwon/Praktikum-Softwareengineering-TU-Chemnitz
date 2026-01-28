'use client';

import { usePathname } from 'next/navigation';
import SideNav from '@/components/ui/dashboard/sidenav';

import Image from 'next/image';

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
            <div className="grow md:overflow-y-auto flex flex-col justify-between">
                <div className="flex-1">
                    {children}
                </div>
                <Image
                    src="/drei-welle-zusammenblau.png"
                    alt=""
                    width={1400}
                    height={100}
                    className="w-full h-auto object-cover block mt-auto"
                />
            </div>
        </div>
    );
}
