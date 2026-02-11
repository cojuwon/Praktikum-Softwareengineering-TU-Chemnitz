import Link from 'next/link';

interface SettingsActionButtonProps {
  href: string;
  label: string;
}

export default function SettingsActionButton({
  href,
  label,
}: SettingsActionButtonProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 w-fit"
    >
      {label}
    </Link>
  );
}
