"use client";

import { createContext, useContext, useState } from "react";

type StatistikContextType = {
  data: any | null;
  setData: (d: any) => void;
};

const StatistikContext = createContext<StatistikContextType | undefined>(undefined);

export function StatistikProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any | null>(null);

  return (
    <StatistikContext.Provider value={{ data, setData }}>
      {children}
    </StatistikContext.Provider>
  );
}

export function useStatistik() {
  const ctx = useContext(StatistikContext);
  if (!ctx) {
    throw new Error("useStatistik must be used inside StatistikProvider");
  }
  return ctx;
}
