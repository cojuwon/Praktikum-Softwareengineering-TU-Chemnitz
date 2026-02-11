import { AnfrageSearchForm } from "@/components/form/AnfrageSearchForm";

interface AnfrageSearchSectionProps {
  onSubmit: (filters: any) => void;
}

export default function AnfrageSearchSection({ onSubmit }: AnfrageSearchSectionProps) {
  return (
    <div className="bg-white px-10 py-8 mx-5">
      <AnfrageSearchForm onSubmit={onSubmit} />
    </div>
  );
}
