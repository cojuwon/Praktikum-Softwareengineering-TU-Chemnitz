import { lusitana } from '@/components/ui/fonts';
import SettingsSection from '@/components/dashboard/settings/SettingsSection';
import SettingsActionButton from '@/components/dashboard/settings/SettingsActionButton';

export default function SettingsPage() {
  return (
    <main className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Einstellungen</h1>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {/* Account Settings Section */}
        <SettingsSection
          title="Account Sicherheit"
          description="Hier können Sie Ihre Passworteinstellungen verwalten."
        >
          <SettingsActionButton
            href="/dashboard/change-password"
            label="Passwort ändern"
          />
        </SettingsSection>

        {/* Placeholder for future settings */}
        <SettingsSection
          title="Allgemeine Einstellungen"
          description="Weitere Einstellungen werden hier verfügbar sein."
          disabled
        />
      </div>
    </main>
  );
}
