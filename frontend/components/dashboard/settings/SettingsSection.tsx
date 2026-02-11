interface SettingsSectionProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function SettingsSection({
  title,
  description,
  children,
  disabled = false,
}: SettingsSectionProps) {
  return (
    <div
      className={`rounded-lg bg-gray-50 p-6 md:p-8 border border-gray-200 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      {children}
    </div>
  );
}
