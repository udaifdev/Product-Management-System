// ProductPagination.jsx
const ProductPagination = ({
  totalProducts,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage
}) => {
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="flex flex-wrap gap-2 justify-center mb-2">
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => setCurrentPage(pageNumber)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
              ${currentPage === pageNumber
                ? 'bg-[#EDA415] text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
            `}
          >
            {pageNumber}
          </button>
        ))}
      </div>
      <div className="text-sm text-gray-500">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalProducts)} to{' '}
        {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
      </div>
    </div>
  );
};

export default ProductPagination;
