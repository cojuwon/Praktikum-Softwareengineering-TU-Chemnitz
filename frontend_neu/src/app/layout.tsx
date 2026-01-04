import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar, Header } from "@/components";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bellis Statistik",
  description: "Dashboard für soziale Beratungs-Statistiken",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Main App Container with dynamic viewport height */}
        <div className="flex h-dvh bg-slate-50">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <Header />

            {/* Scrollable Content */}
            <main className="flex-1 overflow-y-auto">
              <div className="p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
