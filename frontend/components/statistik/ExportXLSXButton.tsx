"use client";

import { useStatistik } from "../../app/dashboard/statistik/StatistikContext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

type FlatRow = {
  ebene: string;
  wert?: any;
};

// --- Flatten-Funktionen (identisch zu PDF-Version, nur leicht angepasst) ---

const flattenDataHierarchical = (
  structureNode: any,
  dataNode: any,
  hauptLabel: string,
  unterLabel: string,
  rows: FlatRow[]
) => {
  if (!dataNode || typeof dataNode !== "object") return;

  // Hauptkategorie (0 Einrückung)
  if (!rows.some((r) => r.ebene === hauptLabel)) {
    rows.push({ ebene: hauptLabel });
  }

  // Unterkategorie (2 Leerzeichen)
  if (!rows.some((r) => r.ebene === "  " + unterLabel)) {
    rows.push({ ebene: "  " + unterLabel });
  }

  if (structureNode?.abschnitte) {
    for (const abschnitt of structureNode.abschnitte) {
      rows.push({ ebene: "    " + abschnitt.label }); // 4 Leerzeichen

      for (const kpi of abschnitt.kpis) {
        const value = dataNode[kpi.field];
        if (value !== undefined) {
          rows.push({
            ebene: "      " + kpi.label, // 6 Leerzeichen
            wert: value,
          });
        }
      }

      rows.push({ ebene: "", wert: "" }); // Leerzeile
    }
    return;
  }

  const kpiKeys = Object.keys(dataNode).filter((k) => typeof dataNode[k] !== "object");
  kpiKeys.forEach((kpiKey) => {
    rows.push({
      ebene: "    " + kpiKey,
      wert: dataNode[kpiKey],
    });
  });
  if (kpiKeys.length) rows.push({ ebene: "", wert: "" });

  for (const key in dataNode) {
    if (typeof dataNode[key] === "object") {
      const childStructure = structureNode?.unterkategorien?.[key] || {};
      const childLabel = childStructure?.label || key;
      flattenDataHierarchical(childStructure, dataNode[key], hauptLabel, childLabel, rows);
    }
  }
};

const flattenDataForExport = (structure: any, fullData: any): FlatRow[] => {
  const rows: FlatRow[] = [];
  const data = fullData.data;
  if (!data) return rows;

  for (const hauptKey in data) {
    const dataNode = data[hauptKey];
    const structureNode = structure[hauptKey] || {};
    const hauptLabel = structureNode?.label || hauptKey;

    for (const unterKey in dataNode) {
      const unterStructure = structureNode?.unterkategorien?.[unterKey] || {};
      const unterLabel = unterStructure?.label || unterKey;
      flattenDataHierarchical(unterStructure, dataNode[unterKey], hauptLabel, unterLabel, rows);
    }
  }

  return rows;
};

// --- XLSX Export Button -----------------------------------------------------

export default function ExportXLSXButton({ structure }: { structure: any }) {
  const { data } = useStatistik();
  if (!data) return null;

  const handleExportXLSX = () => {
    const flatData = flattenDataForExport(structure, data);
    if (!flatData.length) return;

    const worksheetData = flatData.map((r) => ({
      Kategorie: r.ebene,
      Wert: r.wert ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Überschrift fett machen (A1 und B1)
    const headerStyle = { font: { bold: true } };
    worksheet["A1"].s = headerStyle;
    worksheet["B1"].s = headerStyle;

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
