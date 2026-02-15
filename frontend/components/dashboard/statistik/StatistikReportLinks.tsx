import Link from 'next/link';

const REPORT_LINKS = [
  { href: "/dashboard/statistik/auslastung", label: "Auslastung" },
  { href: "/dashboard/statistik/berichtsdaten", label: "Berichtsdaten" },
  { href: "/dashboard/statistik/finanzierung", label: "Finanzierung" },
  { href: "/dashboard/statistik/netzwerk", label: "Netzwerk" },

];

export default function StatistikReportLinks() {
  return (
    <div className="flex flex-col gap-2.5 mb-5">
      {REPORT_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="bg-gray-50 text-[#42446F] border-2 border-gray-200 rounded-lg px-4 py-2.5 no-underline text-center transition-all hover:bg-gray-100 hover:border-gray-300"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}