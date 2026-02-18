"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// -------------------------------------------------------
// Typen
// -------------------------------------------------------

type FlatRow = {
  ebene: string; // Hierarchie-Ebene als Text (inkl. Einrückung)
  kpi?: string;
  wert?: any;
};

// -------------------------------------------------------
// Flatten-Funktionen (aus deinem CSV-Exporter übernommen)
// -------------------------------------------------------

const flattenDataHierarchical = (
  structureNode: any,
  dataNode: any,
  hauptLabel: string,
  unterLabel: string,
  rows: FlatRow[]
) => {
  if (!dataNode || typeof dataNode !== "object") return;

  // Hauptkategorie
  if (!rows.some((r) => r.ebene === hauptLabel)) {
    rows.push({ ebene: hauptLabel });
  }

  // Unterkategorie
  if (!rows.some((r) => r.ebene === "  " + unterLabel)) {
    rows.push({ ebene: "  " + unterLabel });
  }

  // Abschnitte prüfen
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

  // Direkte KPIs (wenn keine Abschnitte)
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
  const data = fullData.data;
  if (!data) return rows;

  for (const hauptKey in data) {
    const dataNode = data[hauptKey];
    const structureNode = structure[hauptKey] || {};
    const hauptLabel = structureNode?.label || hauptKey;

    for (const unterKey in dataNode) {
      const unterStructure = structureNode?.unterkategorien?.[unterKey] || {};
      const unterLabel = unterStructure?.label || unterKey;

      flattenDataHierarchical(
        unterStructure,
        dataNode[unterKey],
        hauptLabel,
        unterLabel,
        rows
      );
    }
  }

  return rows;
};

// -------------------------------------------------------
// PDF Export Button
// -------------------------------------------------------

export default function ExportPDFButton({ structure }: { structure: any }) {
  const { data } = useStatistik();
  if (!data) return null;

  const handleExportPDF = () => {
    const flatData = flattenDataForExport(structure, data);
    if (!flatData.length) return;

    const doc = new jsPDF();

    // Titel
    doc.setFontSize(16);
    doc.text("Statistik Export", 14, 15);

    // Daten in Tabelle wandeln
    const tableRows = flatData.map((r) => [
      r.ebene ?? "",
      r.wert !== undefined ? String(r.wert) : "",
    ]);

    autoTable(doc, {
      startY: 25,
      head: [["Bereich", "Wert"]],
      body: tableRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 30, 30] },
      didParseCell: (data) => {
        const text = data.cell.raw;

        // Fette Unterkategorien
        if (typeof text === "string") {
          if (text.startsWith("  ") && !text.startsWith("      ")) {
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    doc.save("statistik.pdf");
  };

  return (
    <button onClick={handleExportPDF} className="btn">
      PDF
    </button>
  );
}
