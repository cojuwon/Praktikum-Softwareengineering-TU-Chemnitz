"use client";

import { useStatistik } from "../../app/dashboard/statistik/StatistikContext";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type FlatRow = {
  hauptkategorie: string;
  unterkategorie: string;
  abschnitt: string;
  kpi: string;
  wert: any;
};

const flattenDataRecursive = (
  structureNode: any,
  dataNode: any,
  hauptLabel: string,
  unterLabel: string
): FlatRow[] => {
  const rows: FlatRow[] = [];

  // Wenn dataNode direkt KPIs enthält
  if (typeof dataNode !== "object" || dataNode === null) return rows;

  // Prüfen, ob dataNode KPIs enthält (primitive Werte)
  const kpiKeys = Object.keys(dataNode).filter(
    (key) => typeof dataNode[key] !== "object"
  );
  if (kpiKeys.length > 0) {
    kpiKeys.forEach((kpiKey) => {
      // Label aus structure suchen
      let kpiLabel = kpiKey;
      if (structureNode?.abschnitte) {
        for (const abschnitt of structureNode.abschnitte) {
          const kpiDef = abschnitt.kpis?.find((k: any) => k.field === kpiKey);
          if (kpiDef) kpiLabel = kpiDef.label;
        }
      }

      // Abschnitt-Label
      let abschnittLabel = "";
      if (structureNode?.abschnitte) {
        for (const abschnitt of structureNode.abschnitte) {
          if (abschnitt.kpis?.some((k: any) => k.field === kpiKey)) {
            abschnittLabel = abschnitt.label;
          }
        }
      }

      rows.push({
        hauptkategorie: hauptLabel,
        unterkategorie: unterLabel,
        abschnitt: abschnittLabel,
        kpi: kpiLabel,
        wert: dataNode[kpiKey],
      });
    });
    return rows;
  }

  // Rekursion für Unterkategorien
  for (const key in dataNode) {
    const childStructure = structureNode?.unterkategorien?.[key] || {};
    const childLabel = childStructure?.label || key;
    rows.push(
      ...flattenDataRecursive(childStructure, dataNode[key], hauptLabel, childLabel)
    );
  }

  return rows;
};

const flattenDataForExport = (structure: any, data: any): FlatRow[] => {
  const rows: FlatRow[] = [];
  for (const hauptKey in data) {
    const hauptLabel = structure[hauptKey]?.label || hauptKey;
    const dataNode = data[hauptKey];
    const structureNode = structure[hauptKey];
    for (const unterKey in dataNode) {
      const unterLabel = structureNode?.unterkategorien?.[unterKey]?.label || unterKey;
      rows.push(
        ...flattenDataRecursive(
          structureNode?.unterkategorien?.[unterKey] || {},
          dataNode[unterKey],
          hauptLabel,
          unterLabel
        )
      );
    }
  }
  return rows;
};

export default function ExportButtons({ structure }: { structure: any }) {
  const { data } = useStatistik();
  if (!data) return null;

  /** CSV Export */
  const exportCSV = () => {
    const flatData = flattenDataForExport(structure, data);
    const csv = Papa.unparse(flatData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "statistik.csv");
  };

  /** XLSX Export */
  const exportXLSX = () => {
    const flatData = flattenDataForExport(structure, data);
    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistik");
    XLSX.writeFile(workbook, "statistik.xlsx");
  };

  /** PDF Export */
  const exportPDF = () => {
    const flatData = flattenDataForExport(structure, data);
    if (flatData.length === 0) return;

    const doc = new jsPDF();
    const columns = ["hauptkategorie", "unterkategorie", "kpi", "wert"];
    const rows = flatData.map((r) => columns.map((c) => r[c as keyof typeof r] ?? ""));

    autoTable(doc, {
      head: [["Hauptkategorie", "Unterkategorie", "KPI", "Wert"]],
      body: rows,
      startY: 10,
      styles: { fontSize: 8 },
      didParseCell: (dataCell) => {
        const rowIndex = dataCell.row.index;
        const colIndex = dataCell.column.index;
        const rowData = flatData[rowIndex];

        if (colIndex === 0) {
          dataCell.cell.styles.fontStyle = "bold"; // Hauptkategorie fett
        }
        if (colIndex === 1) {
          dataCell.cell.styles.fontStyle = "bold"; // Unterkategorie fett
        }
      },
    });

    doc.save("statistik.pdf");
  };

  return (
    <div className="flex gap-3 mt-4">
      <button onClick={exportCSV} className="btn">
        CSV
      </button>
      <button onClick={exportXLSX} className="btn">
        XLSX
      </button>
      <button onClick={exportPDF} className="btn">
        PDF
      </button>
    </div>
  );
}

/*"use client";

import { useStatistik } from "../../app/dashboard/statistik/StatistikContext";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type FlatRow = {
  hauptkategorie: string;
  unterkategorie: string;
  abschnitt: string;
  kpi: string;
  wert: any;
};

const flattenData = (data: any): FlatRow[] => {
  const rows: FlatRow[] = [];

  for (const hauptkategorie in data) {
    const unterkategorien = data[hauptkategorie];
    for (const unterkategorie in unterkategorien) {
      const abschnitte = unterkategorien[unterkategorie];
      for (const abschnittLabel in abschnitte) {
        const kpis = abschnitte[abschnittLabel];
        for (const kpi in kpis) {
          rows.push({
            hauptkategorie,
            unterkategorie,
            abschnitt: abschnittLabel,
            kpi,
            wert: kpis[kpi],
          });
        }
      }
    }
  }

  return rows;
};

export default function ExportButtons() {
  const { data } = useStatistik();

  if (!data) return null;

  const exportCSV = () => {
    const flatData = flattenData(data);
    const csv = Papa.unparse(flatData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "statistik.csv");
  };

  
  const exportXLSX = () => {
    const flatData = flattenData(data);
    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistik");
    XLSX.writeFile(workbook, "statistik.xlsx");
  };

  const exportPDF = () => {
    const flatData = flattenData(data);
    if (flatData.length === 0) return;

    const doc = new jsPDF();
    const columns = Object.keys(flatData[0]);
    const rows = flatData.map((row) => columns.map((col) => (row as any)[col]));

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save("statistik.pdf");
  };

  return (
    <div className="flex gap-3 mt-4">
      <button onClick={exportCSV} className="btn">
        CSV
      </button>
      <button onClick={exportXLSX} className="btn">
        XLSX
      </button>
      <button onClick={exportPDF} className="btn">
        PDF
      </button>
    </div>
  );
}*/

/*"use client";

import { useStatistik } from "../../app/dashboard/statistik/StatistikContext";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Funktion zum Flatten der Daten
const flattenDataForCSV = (data: any) => {
  const result: any[] = [];
  for (const hauptkategorieKey in data) {
    const hauptkategorie = data[hauptkategorieKey];
    for (const unterkategorieKey in hauptkategorie) {
      const unterkategorie = hauptkategorie[unterkategorieKey];
      result.push({
        hauptkategorie: hauptkategorieKey,
        unterkategorie: unterkategorieKey,
        ...unterkategorie,
      });
    }
  }
  return result;
};

export default function ExportButtons() {
  const { data } = useStatistik();

  if (!data) return null;


  const exportCSV = () => {
    const flatData = flattenDataForCSV(data);
    const csv = Papa.unparse(flatData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "statistik.csv");
  };


  const exportXLSX = () => {
    const flatData = flattenDataForCSV(data);
    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistik");
    XLSX.writeFile(workbook, "statistik.xlsx");
  };


  const exportPDF = () => {
    const doc = new jsPDF();
    const flatData = flattenDataForCSV(data);
    const columns = Object.keys(flatData[0] || {});
    const rows = flatData.map((row: any) => columns.map(col => row[col]));

    autoTable(doc, {
      head: [columns],
      body: rows,
    });

    doc.save("statistik.pdf");
  };

  return (
    <div className="flex gap-3 mt-4">
      <button onClick={exportCSV} className="btn">
        CSV
      </button>
      <button onClick={exportXLSX} className="btn">
        XLSX
      </button>
      <button onClick={exportPDF} className="btn">
        PDF
      </button>
    </div>
  );
}*/


/*"use client";

import { useStatistik } from "../../app/dashboard/statistik/StatistikContext";

import { saveAs } from "file-saver";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";


export default function ExportButtons() {
  const { data } = useStatistik();

  if (!data) return null;

  const exportCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "statistik.csv");
  };

  const exportXLSX = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistik");
    XLSX.writeFile(workbook, "statistik.xlsx");
  };

    const exportPDF = () => {
    const doc = new jsPDF();
    const columns = Object.keys(data[0] || {});
    const rows = data.map((row: any) => columns.map(col => row[col]));

    autoTable(doc, {
        head: [columns],
        body: rows,
    });

    doc.save("statistik.pdf");
    };


  return (
    <div className="flex gap-3 mt-4">
      <button onClick={exportCSV} className="btn">CSV</button>
      <button onClick={exportXLSX} className="btn">XLSX</button>
      <button onClick={exportPDF} className="btn">PDF</button>
    </div>
  );
}
*/