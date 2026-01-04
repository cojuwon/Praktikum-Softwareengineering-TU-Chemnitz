import '@/app/global.css';
import { inter } from '@/components/ui/fonts';

export const metadata = {
  title: 'Bellis Statistik',
  description: 'Statistiksystem für Fachberatungsstellen',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
