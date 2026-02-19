
export type FlatRow = {
    ebene: string;
    kpi?: string;
    wert?: any;
};

// Rekursive Funktion zum Flachklopfen der Hierarchie
const flattenDataHierarchical = (
    structureNode: any,
    dataNode: any,
    hauptLabel: string,
    unterLabel: string,
    rows: FlatRow[]
) => {
    if (!dataNode || typeof dataNode !== "object") return;
    if (!structureNode) return; // Wenn keine Struktur, dann nicht exportieren (Hidden)

    // Hauptkategorie nur einmal
    if (!rows.some((r) => r.ebene === hauptLabel)) {
        rows.push({ ebene: hauptLabel });
    }

    // Unterkategorie nur einmal
    if (!rows.some((r) => r.ebene === "  " + unterLabel)) {
        rows.push({ ebene: "  " + unterLabel });
    }

    // 1. Priorität: Abschnitte aus der Struktur
    if (structureNode.abschnitte) {
        for (const abschnitt of structureNode.abschnitte) {
            const abschnittLabel = "    " + abschnitt.label;
            rows.push({ ebene: abschnittLabel });

            for (const kpi of abschnitt.kpis) {
                // Wert aus Daten holen (kpi.field ist der Key im dataNode)
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

    // 2. Fallback: Wenn keine Abschnitte definiert sind, rekursiv Unterkategorien durchgehen
    // Basierend auf STRUKTUR, nicht DATEN.
    if (structureNode.unterkategorien) {
        for (const key in structureNode.unterkategorien) {
            const childStructure = structureNode.unterkategorien[key];
            // Check if data exists for this key
            if (dataNode[key]) {
                flattenDataHierarchical(
                    childStructure,
                    dataNode[key],
                    hauptLabel,
                    childStructure.label || key,
                    rows
                );
            }
        }
    }
};

export const flattenDataForExport = (structure: any, fullData: any): FlatRow[] => {
    const rows: FlatRow[] = [];
    const data = fullData.data;
    if (!data || !structure) return rows;

    // IMPORTANT: Iterate over STRUCTURE keys, not DATA keys.
    // This ensures that hidden sections (removed from structure) are not exported.
    for (const hauptKey in structure) {
        const structureNode = structure[hauptKey];
        // Check if data has this key
        const dataNode = data[hauptKey];

        if (dataNode) {
            const hauptLabel = structureNode.label || hauptKey;

            // Iterate over sub-categories defined in STRUCTURE
            if (structureNode.unterkategorien) {
                for (const unterKey in structureNode.unterkategorien) {
                    const unterStructure = structureNode.unterkategorien[unterKey];
                    if (dataNode[unterKey]) {
                        flattenDataHierarchical(
                            unterStructure,
                            dataNode[unterKey],
                            hauptLabel,
                            unterStructure.label || unterKey,
                            rows
                        );
                    }
                }
            }
        }
    }

    return rows;
};
