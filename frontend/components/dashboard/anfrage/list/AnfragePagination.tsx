interface AnfragePaginationProps {
  page: number;
  totalPages: number;
  count: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export default function AnfragePagination({
  page,
  totalPages,
  count,
  pageSize,
  onPageChange,
}: AnfragePaginationProps) {
  const isFirstPage = page === 1;
  const isLastPage = page >= totalPages;

  return (
    <div className="flex justify-between items-center mt-5 pt-5 border-t border-gray-200 text-gray-500 text-sm">
      <div>
        Seite <span className="font-semibold text-gray-700">{page}</span> von{" "}
        <span className="font-semibold text-gray-700">{totalPages}</span>
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={isFirstPage}
          className={`px-4 py-2 rounded text-sm ${
            isFirstPage
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer"
          }`}
        >
          Vorherige
        </button>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={isLastPage}
          className={`px-4 py-2 rounded text-sm ${
            isLastPage
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer"
          }`}
        >
          Nächste
        </button>
      </div>
    </div>
  );
}
