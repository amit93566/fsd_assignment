import { useState, useEffect } from "react";
import { allStudentsList } from "../../services/api";
import useDebounce from "../../lib/useDebounce";
import { Pagination } from "../../components/Pagination";

function StudentsList() {
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 1000);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    });

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery]);

    useEffect(() => {
        allStudentsListHandler(debouncedSearchQuery, currentPage);
    }, [debouncedSearchQuery, currentPage]);

    function allStudentsListHandler(searchQuery, page = 1) {
        setLoading(true);
        const searchParam = searchQuery && searchQuery.trim() ? searchQuery.trim() : null;
        allStudentsList(searchParam, page, 10).then(res => {
            if (res.status === "success") {
                setStudents(res.data);
                if (res.pagination) {
                    setPagination(res.pagination);
                }
            }
        }).catch(err => {
            console.log(err);
        }).finally(() => {
            setLoading(false);
        });
    }

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    return (
        <div className='py-4 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto'>
            <h1 className='text-2xl sm:text-3xl font-semibold mb-6'>Students List</h1>
            
            {/* Search Input */}
            <div className='mb-4'>
                <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search by email..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm sm:text-base" 
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className='absolute inset-y-0 right-0 pr-3 flex items-center'
                            aria-label="Clear search"
                        >
                            <svg className='h-5 w-5 text-gray-400 hover:text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Results Info */}
            {!loading && (
                <div className='mb-4 text-sm text-gray-600'>
                    Showing {students.length} of {pagination.totalCount} student{pagination.totalCount !== 1 ? 's' : ''} 
                    {pagination.totalPages > 1 && ` (Page ${currentPage} of ${pagination.totalPages})`}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className='text-center py-12'>
                    <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                    <p className='mt-2 text-gray-600'>Loading students...</p>
                </div>
            ) : (
            <div className='rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-2'>
                {/* Responsive table wrapper with horizontal scroll */}
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm min-w-[640px]'>
                        <thead className="bg-secondary border-b border-gray-200">
                            <tr className="text-left">
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">Name</th>
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">Email</th>
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">Class</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {students && students.length !== 0 ? students.map(data => (
                                <tr key={data._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{data.name}</td>
                                    <td className="py-4 px-3 sm:px-4 text-gray-900 break-all">{data.email}</td>
                                    <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{data.sclass}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-12 px-4">
                                        <div className='flex flex-col items-center justify-center'>
                                            <svg className='w-16 h-16 text-gray-300 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' />
                                            </svg>
                                            <p className='text-base sm:text-lg font-medium text-gray-900 mb-1'>
                                                {searchQuery ? 'No students found matching this email' : 'No students found'}
                                            </p>
                                            <p className='text-xs sm:text-sm text-gray-500 px-4'>
                                                {searchQuery ? 'Try a different email address' : 'There are no students in your class yet'}
                                            </p>
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className='mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium'
                                                >
                                                    Clear Search
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>    
                    </table>
                </div>
            </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <div className='mt-6 flex justify-center overflow-x-auto'>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    )
}

export default StudentsList;