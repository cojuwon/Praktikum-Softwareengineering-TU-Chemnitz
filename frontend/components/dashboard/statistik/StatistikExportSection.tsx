import ExportCSVButton from "@/components/dashboard/statistik/ExportCSVButton";
import ExportXLSXButton from "@/components/dashboard/statistik/ExportXLSXButton";
import ExportPDFButton from "@/components/dashboard/statistik/ExportPDFButton";

interface StatistikExportSectionProps {
  structure: any;
}

export default function StatistikExportSection({ structure }: StatistikExportSectionProps) {
  return (
    <section className="bg-white px-10 mx-5 mb-5">
      <h2 className="text-xl font-semibold text-[#42446F] mb-4">
        Export:
      </h2>
      <div className="flex gap-2.5 flex-wrap">
        <ExportCSVButton structure={structure} />
        <ExportXLSXButton structure={structure} />
        <ExportPDFButton structure={structure} />
      </div>
    </section>
  );
}