import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bellis e.V. Leipzig",
  description: "Fallverwaltung für Bellis e.V. Leipzig - Beratung für Betroffene sexualisierter Gewalt",
  icons: {
    icon: "/bellis-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
