import Link from 'next/link';

interface NavigationLink {
  href: string;
  label: string;
}

const NAV_LINKS: NavigationLink[] = [
  { href: "/dashboard/anfrage", label: "Anfrage" },
  { href: "/dashboard/fall", label: "Fall" },
  { href: "/dashboard/statistik", label: "Statistik" },
  { href: "/dashboard/extended/edit", label: "Eingabemaske" },
];

export default function ExtendedNavigation() {
  return (
    <div className="bg-white px-5 py-10 mx-5 rounded-b-xl flex flex-col items-center gap-4">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="w-full max-w-sm bg-transparent text-black border-4 border-[#A0A8CD] rounded-lg px-4 py-2.5 text-base font-medium text-center block no-underline hover:bg-gray-50 transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
