"use client";

import { StatistikProvider } from "./StatistikContext";

export default function StatistikLayout({ children }: { children: React.ReactNode }) {
  return (
    <StatistikProvider>
      {children}
    </StatistikProvider>
  );
}
