export const Pagination = ({ currentPage, totalPages, onPageChange, maxVisiblePages = 5 }) => {

    const getPageNumbers = () => {
        const pages = [];

        if (totalPages <= maxVisiblePages + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {

            pages.push(1);
     
            let start = Math.max(2, currentPage - Math.floor((maxVisiblePages - 2) / 2));
            let end = Math.min(totalPages - 1, start + maxVisiblePages - 3);

            if (end === totalPages - 1) {
                start = Math.max(2, totalPages - maxVisiblePages + 2);
            }

            if (start > 2) {
                pages.push('...');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push('...');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();


    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page) => {
        if (typeof page === 'number') {
            onPageChange(page);
        }
    };

    const baseButtonClasses =
        'flex items-center justify-center h-10 w-10 rounded-lg text-sm font-medium transition-colors duration-150 ease-in-out';

    const defaultButtonClasses =
        'text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50';

    const activeButtonClasses =
        'text-white bg-primary hover:bg-primary-600 shadow-md';

    const disabledButtonClasses =
        'text-gray-400 bg-gray-100 cursor-not-allowed';

    return (
        <nav aria-label="Pagination">
            <ul className="flex items-center justify-center space-x-2">
                <li>
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className={`${baseButtonClasses} ${currentPage === 1 ? disabledButtonClasses : defaultButtonClasses
                            }`}
                        aria-label="Go to previous page"
                    >
                        <svg
                            className="w-5 h-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                </li>

                {pageNumbers.map((page, index) => (
                    <li key={index}>
                        {page === '...' ? (
                            <span
                                className={`${baseButtonClasses} text-gray-500 cursor-default`}
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                onClick={() => handlePageClick(page)}
                                className={`${baseButtonClasses} ${currentPage === page
                                        ? activeButtonClasses
                                        : defaultButtonClasses
                                    }`}
                                aria-current={currentPage === page ? 'page' : undefined}
                                aria-label={`Go to page ${page}`}
                            >
                                {page}
                            </button>
                        )}
                    </li>
                ))}

                <li>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className={`${baseButtonClasses} ${currentPage === totalPages
                                ? disabledButtonClasses
                                : defaultButtonClasses
                            }`}
                        aria-label="Go to next page"
                    >
                        <svg
                            className="w-5 h-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </li>
            </ul>
        </nav>
    );
};