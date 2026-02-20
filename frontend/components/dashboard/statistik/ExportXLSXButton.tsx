"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { flattenDataForExport } from "@/lib/statistikExportUtils";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// --- XLSX Export Button -----------------------------------------------------

export default function ExportXLSXButton({ structure }: { structure: any }) {
  const { data } = useStatistik();
  if (!data) return null;

  const handleExportXLSX = () => {
    const flatData = flattenDataForExport(structure, data);
    if (!flatData.length) return;

    const worksheetData = flatData.map((r) => ({
      Kategorie: r.ebene,
      Wert: r.wert !== undefined ? r.wert : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Überschrift fett machen (A1 und B1)
    if (worksheet["A1"]) worksheet["A1"].s = { font: { bold: true } };
    if (worksheet["B1"]) worksheet["B1"].s = { font: { bold: true } };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistik");
    XLSX.writeFile(workbook, "statistik.xlsx");
  };

  return (
    <button onClick={handleExportXLSX} className="btn">
      XLSX
    </button>
  );
}
