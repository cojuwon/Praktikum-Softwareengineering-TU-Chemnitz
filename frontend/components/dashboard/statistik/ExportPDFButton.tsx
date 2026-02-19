"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { flattenDataForExport } from "@/lib/statistikExportUtils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// -------------------------------------------------------
// PDF Export Button
// -------------------------------------------------------

export default function ExportPDFButton({ structure }: { structure: any }) {
  const { data } = useStatistik();
  if (!data) return null;

  const handleExportPDF = () => {
    // Shared utility function handles visible sections correctly by iterating structure
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
          // Check indentation level based on spaces
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
