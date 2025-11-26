import FallTable from '@/components/fall/fallTable';
import { CreateFallButton } from "@/components/fall/createFallButton";

export default function FallPage() {
  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Fälle</h1>
        <CreateFallButton />
      </div>

      <FallTable query="" currentPage={1} />
    </div>
  );
}