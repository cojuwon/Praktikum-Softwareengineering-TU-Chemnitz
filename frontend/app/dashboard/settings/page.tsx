import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';

export default function SettingsPage() {
    return (
        <main className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className={`${lusitana.className} text-2xl`}>Einstellungen</h1>
            </div>

            <div className="mt-8 flex flex-col gap-6">
                {/* Account Settings Section */}
                <div className="rounded-lg bg-gray-50 p-6 md:p-8 border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Account Sicherheit</h2>
                    <p className="text-gray-600 mb-6">
                        Hier können Sie Ihre Passworteinstellungen verwalten.
                    </p>

                    <Link
                        href="/dashboard/change-password"
                        className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 w-fit"
                    >
                        Passwort ändern
                    </Link>
                </div>

                {/* Placeholder for future settings */}
                <div className="rounded-lg bg-gray-50 p-6 md:p-8 border border-gray-200 opacity-60">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Allgemeine Einstellungen</h2>
                    <p className="text-gray-600">
                        Weitere Einstellungen werden hier verfügbar sein.
                    </p>
                </div>
            </div>
        </main>
    );
}
