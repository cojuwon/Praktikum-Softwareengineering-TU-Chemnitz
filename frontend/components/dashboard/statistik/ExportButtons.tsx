"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import ExportCSVButton from "./ExportCSVButton";
import ExportPDFButton from "./ExportPDFButton";
import ExportXLSXButton from "./ExportXLSXButton";

export default function ExportButtons() {
    const { data } = useStatistik();

    if (!data) return null;

    return (
        <div className="flex gap-2">
            <ExportCSVButton structure={data.structure} />
            <ExportPDFButton structure={data.structure} />
            <ExportXLSXButton structure={data.structure} />
        </div>
    );
}
