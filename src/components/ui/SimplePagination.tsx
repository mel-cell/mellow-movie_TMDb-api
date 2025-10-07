import React from "react";

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  // 🔹 Fungsi untuk menentukan angka halaman yang akan ditampilkan
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // jumlah maksimal tombol angka yang ditampilkan

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) pages.push(i);

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      {/* 🔹 Tombol Prev */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className={`px-3 py-1.5 rounded-full font-semibold border transition ${
          currentPage === 1
            ? "border-gray-600 text-gray-500 cursor-not-allowed"
            : "border-red-700 text-red-500 hover:bg-red-700 hover:text-white"
        }`}
      >
        ←
      </button>

      {/* 🔹 Tombol Angka */}
      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <span key={index} className="px-2 text-gray-400 select-none">
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(page as number)}
            className={`px-3 py-1.5 rounded-full border font-semibold transition ${
              currentPage === page
                ? "bg-red-700 border-red-700 text-white"
                : "border-red-700 text-red-500 hover:bg-red-700 hover:text-white"
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* 🔹 Tombol Next */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`px-3 py-1.5 rounded-full font-semibold border transition ${
          currentPage === totalPages
            ? "border-gray-600 text-gray-500 cursor-not-allowed"
            : "border-red-700 text-red-500 hover:bg-red-700 hover:text-white"
        }`}
      >
        →
      </button>
    </div>
  );
};

export default SimplePagination;
