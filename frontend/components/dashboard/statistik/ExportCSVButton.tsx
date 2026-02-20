"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { flattenDataForExport } from "@/lib/statistikExportUtils";
import { saveAs } from "file-saver";
import Papa from "papaparse";

export default function ExportCSVButton({ structure }: { structure: any }) {
  const { data } = useStatistik();
  if (!data) return null;

  const handleExportCSV = () => {
    const flatData = flattenDataForExport(structure, data);
    if (!flatData.length) return;

    // CSV mit separaten Spalten für Kategorie und Wert
    const csvData = flatData.map((r) => ({
      Kategorie: r.ebene.trim(),
      Wert: r.wert !== undefined ? r.wert : "", // Ensure 0 is printed
    }));

    const csv = Papa.unparse(csvData, { quotes: false });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "statistik.csv");
  };

  return (
    <button onClick={handleExportCSV} className="btn">
      CSV
    </button>
  );
}
