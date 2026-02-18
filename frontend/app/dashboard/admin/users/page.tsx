'use client';

import UserList from '@/components/dashboard/admin/UserList';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
                <Link
                    href="/dashboard/admin"
                    className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="font-medium">Zurück zur Übersicht</span>
                </Link>
            </div>

            <UserList />
        </div>
    );
}
