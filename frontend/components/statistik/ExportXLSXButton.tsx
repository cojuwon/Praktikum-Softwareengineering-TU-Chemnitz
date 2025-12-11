
import { useStatistik } from "../../app/dashboard/statistik/StatistikContext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

type FlatRow = {
  ebene: string; // Name der Kategorie/Unterkategorie/Abschnitt/KPI
  wert?: any;
};

// Rekursive Funktion, die die Hierarchie in die ebene-Spalte schreibt
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

  // Unterkategorie nur einmal mit Einrückung
  if (!rows.some((r) => r.ebene === unterLabel)) {
    rows.push({ ebene: "  " + unterLabel });
  }

  // Abschnitte in Struktur
  if (structureNode?.abschnitte) {
    for (const abschnitt of structureNode.abschnitte) {
      const abschnittLabel = "    " + abschnitt.label;
      rows.push({ ebene: abschnittLabel });

      for (const kpi of abschnitt.kpis) {
        const value = dataNode[kpi.field];
        if (value !== undefined) {
          rows.push({
            ebene: "      " + kpi.label,
            wert: value,
          });
        }
      }
      rows.push({ ebene: "", wert: "" }); // Leerzeile nach Abschnitt
    }
    return;
  }

  // Direkte KPIs, wenn keine Abschnitte
  const kpiKeys = Object.keys(dataNode).filter((k) => typeof dataNode[k] !== "object");
  kpiKeys.forEach((kpiKey) => {
    rows.push({
      ebene: "    " + kpiKey,
      wert: dataNode[kpiKey],
    });
  });
  if (kpiKeys.length) rows.push({ ebene: "", wert: "" });

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
  const data = fullData.data; // Nur den data-Teil
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

export default function ExportXLSXButton({ structure }: { structure: any }) {
  const { data } = useStatistik();
  if (!data) return null;

  const handleExportXLSX = () => {
    const flatData = flattenDataForExport(structure, data);
    if (!flatData.length) return;

    // Spalten: nur Hierarchie (Kategorie/Unterkategorie/Abschnitt/KPI) und Wert
    const worksheetData = flatData.map((r) => ({
      Hierarchie: r.ebene,
      Wert: r.wert ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Optionale Formatierung (fett/kursiv, Schriftgröße)
    Object.keys(worksheet).forEach((cellAddress) => {
      if (cellAddress.startsWith("!")) return;
      const cell = worksheet[cellAddress];
      if (!cell || !cell.v) return;

      const col = cellAddress.replace(/\d+/g, "");
      if (col === "A") {
        cell.s = { font: { bold: true, sz: 12 } }; // Hierarchie fett
      } else if (col === "B") {
        cell.s = { font: { sz: 10 } }; // Werte normal
      }
    });

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

/*import { useStatistik } from "../../app/dashboard/statistik/StatistikContext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

type FlatRow = {
  ebene: string; // Hierarchieebene
  wert?: any;
};

// Rekursive Funktion bleibt unverändert
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

  // Unterkategorie nur einmal mit Einrückung
  if (!rows.some((r) => r.ebene === unterLabel)) {
    rows.push({ ebene: "  " + unterLabel });
  }

  // Abschnitte in Struktur
  if (structureNode?.abschnitte) {
    for (const abschnitt of structureNode.abschnitte) {
      const abschnittLabel = "    " + abschnitt.label;
      rows.push({ ebene: abschnittLabel });

      for (const kpi of abschnitt.kpis) {
        const value = dataNode[kpi.field];
        if (value !== undefined) {
          rows.push({
            ebene: "      " + kpi.label,
            wert: value,
          });
        }
      }
      rows.push({ ebene: "", wert: "" }); // Leerzeile nach Abschnitt
    }
    return;
  }

  // Direkte KPIs, wenn keine Abschnitte
  const kpiKeys = Object.keys(dataNode).filter((k) => typeof dataNode[k] !== "object");
  kpiKeys.forEach((kpiKey) => {
    rows.push({
      ebene: "    " + kpiKey,
      wert: dataNode[kpiKey],
    });
  });
  if (kpiKeys.length) rows.push({ ebene: "", wert: "" });

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
      flattenDataHierarchical(unterStructure, dataNode[unterKey], hauptLabel, unterLabel, rows);
    }
  }

  return rows;
};

export default function ExportXLSXButton({ structure }: { structure: any }) {
  const { data } = useStatistik();
  if (!data) return null;

  const handleExportXLSX = () => {
    const flatData = flattenDataForExport(structure, data);
    if (!flatData.length) return;

    // Nur zwei Spalten: Hauptkategorie (mit Einrückung) und Wert
    const worksheetData = flatData.map((r) => ({
      Hauptkategorie: r.ebene,
      Wert: r.wert ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Formatierung: Fett/Kursiv/Schriftgröße
    Object.keys(worksheet).forEach((cellAddress) => {
      if (cellAddress.startsWith("!")) return;
      const cell = worksheet[cellAddress];
      if (!cell || !cell.v) return;

      const col = cellAddress.replace(/\d+/g, "");
      if (col === "A") cell.s = { font: { bold: true, sz: 12 } }; // Hauptkategorie mit Einrückung
      else if (col === "B") cell.s = { font: { sz: 10 } }; // Wert
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistik");
    XLSX.writeFile(workbook, "statistik.xlsx");
  };

  return (
    <button onClick={handleExportXLSX} className="btn">
      XLSX
    </button>
  );
}*/
/*import { useStatistik } from "../../app/dashboard/statistik/StatistikContext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

type FlatRow = {
  ebene: string; // Hierarchieebene
  wert?: any;
};

// Rekursive Funktion bleibt unverändert
const flattenDataHierarchical = (
  structureNode: any,
  dataNode: any,
  hauptLabel: string,
  unterLabel: string,
  rows: FlatRow[]
) => {
  if (!dataNode || typeof dataNode !== "object") return;

  if (!rows.some((r) => r.ebene === hauptLabel)) {
    rows.push({ ebene: hauptLabel });
  }

  if (!rows.some((r) => r.ebene === unterLabel)) {
    rows.push({ ebene: "  " + unterLabel });
  }

  if (structureNode?.abschnitte) {
    for (const abschnitt of structureNode.abschnitte) {
      const abschnittLabel = "    " + abschnitt.label;
      rows.push({ ebene: abschnittLabel });

      for (const kpi of abschnitt.kpis) {
        const value = dataNode[kpi.field];
        if (value !== undefined) {
          rows.push({
            ebene: "      " + kpi.label,
            wert: value,
          });
        }
      }
      rows.push({ ebene: "", wert: "" }); // Leerzeile nach Abschnitt
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

export default function ExportXLSXButton({ structure }: { structure: any }) {
  const { data } = useStatistik();
  if (!data) return null;

  const handleExportXLSX = () => {
    const flatData = flattenDataForExport(structure, data);
    if (!flatData.length) return;

    // Spalten: Hauptkategorie, Unterkategorie, Abschnitt, Wert
    const worksheetData = flatData.map((r) => {
      const levels = r.ebene.split("  ").filter((l) => l);
      return {
        Hauptkategorie: levels[0] || "",
        Unterkategorie: levels[1] || "",
        Abschnitt: levels[2] || "",
        Wert: r.wert ?? "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Formatierung: Fett/Kursiv/Schriftgröße
    Object.keys(worksheet).forEach((cellAddress) => {
      if (cellAddress.startsWith("!")) return;
      const cell = worksheet[cellAddress];
      if (!cell || !cell.v) return;

      const col = cellAddress.replace(/\d+/g, "");
      if (col === "A") cell.s = { font: { bold: true, sz: 14 } }; // Hauptkategorie
      else if (col === "B") cell.s = { font: { bold: true, sz: 12 } }; // Unterkategorie
      else if (col === "C") cell.s = { font: { italic: true, sz: 11 } }; // Abschnitt
      else if (col === "D") cell.s = { font: { sz: 10 } }; // Wert
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistik");
    XLSX.writeFile(workbook, "statistik.xlsx");
  };

  return (
    <button onClick={handleExportXLSX} className="btn">
      XLSX
    </button>
  );
}*/

/*import { useStatistik } from "../../app/dashboard/statistik/StatistikContext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

type FlatRow = {
  ebene: string; // Hierarchieebene
  kpi?: string;
  wert?: any;
};

// Rekursive Funktion bleibt gleich
const flattenDataHierarchical = (
  structureNode: any,
  dataNode: any,
  hauptLabel: string,
  unterLabel: string,
  rows: FlatRow[]
) => {
  if (!dataNode || typeof dataNode !== "object") return;

  if (!rows.some((r) => r.ebene === hauptLabel)) {
    rows.push({ ebene: hauptLabel });
  }

  if (!rows.some((r) => r.ebene === unterLabel)) {
    rows.push({ ebene: "  " + unterLabel });
  }

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
      rows.push({ ebene: "", wert: "" }); // Leerzeile nach Abschnitt
    }
    return;
  }

  const kpiKeys = Object.keys(dataNode).filter((k) => typeof dataNode[k] !== "object");
  kpiKeys.forEach((kpiKey) => {
    rows.push({
      ebene: "    " + kpiKey,
      kpi: kpiKey,
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

export default function ExportXLSXButton({ structure }: { structure: any }) {
  const { data } = useStatistik();
  if (!data) return null;

  const handleExportXLSX = () => {
    const flatData = flattenDataForExport(structure, data);
    if (!flatData.length) return;

    // Jede Ebene in eigene Spalte: Hauptkategorie, Unterkategorie, Abschnitt, KPI, Wert
    const worksheetData = flatData.map((r) => {
      const levels = r.ebene.split("  ").filter((l) => l); // Einrückungen entfernen
      return {
        Hauptkategorie: levels[0] || "",
        Unterkategorie: levels[1] || "",
        Abschnitt: levels[2] || "",
        KPI: r.kpi || "",
        Wert: r.wert ?? "",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Formatierung basierend auf Ebene
    Object.keys(worksheet).forEach((cellAddress) => {
      if (cellAddress.startsWith("!")) return;
      const cell = worksheet[cellAddress];
      if (!cell || !cell.v) return;

      // Prüfen, welche Spalte
      const col = cellAddress.replace(/\d+/g, "");
      if (col === "A") cell.s = { font: { bold: true, sz: 14 } }; // Hauptkategorie
      else if (col === "B") cell.s = { font: { bold: true, sz: 12 } }; // Unterkategorie
      else if (col === "C") cell.s = { font: { italic: true, sz: 11 } }; // Abschnitt
      else if (col === "D") cell.s = { font: { sz: 10 } }; // KPI
      else if (col === "E") cell.s = { font: { sz: 10 } }; // Wert
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistik");
    XLSX.writeFile(workbook, "statistik.xlsx");
  };

  return (
    <button onClick={handleExportXLSX} className="btn">
      XLSX
    </button>
  );
}*/


/*"use client";

import { useStatistik } from "../../app/dashboard/statistik/StatistikContext";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

type FlatRow = {
  ebene: string; // Hierarchieebene für Export
  kpi?: string;
  wert?: any;
};

// Die rekursive Hierarchie-Funktion bleibt unverändert
const flattenDataHierarchical = (
  structureNode: any,
  dataNode: any,
  hauptLabel: string,
  unterLabel: string,
  rows: FlatRow[]
) => {
  if (!dataNode || typeof dataNode !== "object") return;

  if (!rows.some((r) => r.ebene === hauptLabel)) {
    rows.push({ ebene: hauptLabel });
  }

  if (!rows.some((r) => r.ebene === unterLabel)) {
    rows.push({ ebene: "  " + unterLabel });
  }

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
      rows.push({ ebene: "" });
    }
    return;
  }

  const kpiKeys = Object.keys(dataNode).filter((k) => typeof dataNode[k] !== "object");
  kpiKeys.forEach((kpiKey) => {
    rows.push({
      ebene: "    " + kpiKey,
      kpi: kpiKey,
      wert: dataNode[kpiKey],
    });
  });
  if (kpiKeys.length) rows.push({ ebene: "" });

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

export default function ExportXLSXButton({ structure }: { structure: any }) {
  const { data } = useStatistik();
  if (!data) return null;

  const handleExportXLSX = () => {
    const flatData = flattenDataForExport(structure, data);
    if (!flatData.length) return;

    // XLSX: nur eine Spalte für die Hierarchie wie beim CSV
    const worksheetData = flatData.map((r) => ({
      Hierarchie: r.ebene + (r.wert !== undefined ? `: ${r.wert}` : ""),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statistik");

    XLSX.writeFile(workbook, "statistik.xlsx");
  };

  return (
    <button onClick={handleExportXLSX} className="btn">
      XLSX
    </button>
  );
}*/
