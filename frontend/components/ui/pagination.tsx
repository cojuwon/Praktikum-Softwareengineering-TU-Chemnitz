interface PaginationProps {
  page: number;
  totalPages: number;
  count: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  count,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const isFirstPage = page === 1;
  const isLastPage = page >= totalPages;

  if (count <= pageSize) return null;

  return (
    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 text-gray-500 text-sm px-6">
      <div>
        Seite <span className="font-semibold text-gray-900">{page}</span> von{" "}
        <span className="font-semibold text-gray-900">{totalPages}</span>
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={isFirstPage}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors border ${isFirstPage
              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 cursor-pointer shadow-sm"
            }`}
        >
          Vorherige
        </button>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={isLastPage}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors border ${isLastPage
              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 cursor-pointer shadow-sm"
            }`}
        >
          Nächste
        </button>
      </div>
    </div>
  );
}
