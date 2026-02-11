"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { saveAs } from "file-saver";
import Papa from "papaparse";

type FlatRow = {
  ebene: string; // Hierarchieebene für CSV
  kpi?: string;
  wert?: any;
};

// Rekursive Funktion, die nur echte Daten exportiert, Struktur dient nur als Label
const flattenDataHierarchical = (
  structureNode: any,
  dataNode: any,
  hauptLabel: string,
  unterLabel: string,
  rows: FlatRow[]
) => {
  if (!dataNode || typeof dataNode !== "object") return;

  // Hauptkategorie nur einmal
  if (!rows.some((r) => r.ebene === hauptLabel)) {
    rows.push({ ebene: hauptLabel });
  }

  // Unterkategorie nur einmal
  if (!rows.some((r) => r.ebene === unterLabel)) {
    rows.push({ ebene: "  " + unterLabel });
  }

  // Prüfen auf Abschnitte in structure
  if (structureNode?.abschnitte) {
    for (const abschnitt of structureNode.abschnitte) {
      const abschnittLabel = "    " + abschnitt.label;
      rows.push({ ebene: abschnittLabel });

      for (const kpi of abschnitt.kpis) {
        const value = dataNode[kpi.field];
        if (value !== undefined) {
          rows.push({
            ebene: "      " + kpi.label,
            kpi: kpi.field,
            wert: value,
          });
        }
      }
      rows.push({ ebene: "" }); // Leerzeile nach Abschnitt
    }
    return;
  }

  // Direkte KPIs, wenn keine Abschnitte
  const kpiKeys = Object.keys(dataNode).filter((k) => typeof dataNode[k] !== "object");
  kpiKeys.forEach((kpiKey) => {
    rows.push({
      ebene: "    " + kpiKey,
      kpi: kpiKey,
      wert: dataNode[kpiKey],
    });
  });
  if (kpiKeys.length) rows.push({ ebene: "" });

  // Rekursion für Unterkategorien
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

  // Nur den data-Teil durchlaufen
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


export default function ExportCSVButton({ structure }: { structure: any }) {
  const { data } = useStatistik();
  if (!data) return null;

  const handleExportCSV = () => {
    const flatData = flattenDataForExport(structure, data);
    if (!flatData.length) return;

    // CSV mit Hierarchie-Spalte
    const csvData = flatData.map((r) => ({
      Hierarchie: r.ebene + (r.wert !== undefined ? `: ${r.wert}` : ""),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "statistik.csv");
  };

  return (
    <button onClick={handleExportCSV} className="btn">
      CSV
    </button>
  );
}
