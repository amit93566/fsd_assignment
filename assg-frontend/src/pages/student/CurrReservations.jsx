import { useState, useEffect } from "react"
import { getMyReservations, returnEquipment } from "../../services/api"
import ReturnIcon from "../../components/icons/ReturnIcon"
import { Tooltip } from "../../components/Tooltip"
import { toast } from "react-hot-toast"
import useDebounce from "../../lib/useDebounce"
import { Pagination } from "../../components/Pagination"

const CurrReservations = () => {
    const [allMyReservations, setAllMyReservations] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearchQuery = useDebounce(searchQuery, 1000)
    const [selectedStatus, setSelectedStatus] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    })
    const [loading, setLoading] = useState(false)

    // Predefined status options
    const statusOptions = ['PENDING', 'ACTIVE', 'RETURNED', 'REJECTED']

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearchQuery, selectedStatus])

    useEffect(() => {
        getAllMyReservationsHandler(debouncedSearchQuery, currentPage, selectedStatus)
    }, [debouncedSearchQuery, currentPage, selectedStatus])

    function getAllMyReservationsHandler(searchQuery, page = 1, status = '') {
        setLoading(true)
        const searchParam = searchQuery && searchQuery.trim() ? searchQuery.trim() : null
        getMyReservations(searchParam, page, 10, status || null).then(res => {
            if (res.status === "success") {
                setAllMyReservations(res.data)
                if (res.pagination) {
                    setPagination(res.pagination)
                }
            } else {
                toast.error(res.message)
            }
        }).catch(err => {
            console.log(err)
            toast.error(err.response?.data?.message || "Failed to load reservations")
        }).finally(() => {
            setLoading(false)
        })
    }

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleClearFilters = () => {
        setSearchQuery('')
        setSelectedStatus('')
        setCurrentPage(1)
    }

    const hasActiveFilters = searchQuery || selectedStatus

    function returnEquipmentHandler(reservationID) {
        returnEquipment(reservationID).then(res => {
            if (res.status === "success") {
                toast.success(res.message)
                getAllMyReservationsHandler(debouncedSearchQuery, currentPage, selectedStatus)
            } else {
                toast.error(res.message)
                getAllMyReservationsHandler(debouncedSearchQuery, currentPage, selectedStatus)
            }
        }).catch(err => {
            console.log(err)
            toast.error(err.response.data.message)
            getAllMyReservationsHandler(debouncedSearchQuery, currentPage, selectedStatus)
        })
    }

    return (
        <div className='py-4 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto'>
            <h1 className='text-2xl sm:text-3xl font-semibold mb-6'>Current Reservations</h1>
            
            {/* Search and Filter Section */}
            <div className='mb-4 space-y-4'>
                {/* Search Input */}
                <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
                        </svg>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search by equipment name or category..." 
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
                
                {/* Filter Dropdown */}
                <div className='flex flex-col sm:flex-row gap-4'>
                    {/* Status Filter */}
                    <div className='flex-1 sm:flex-initial sm:w-48'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm appearance-none bg-white'
                        >
                            <option value=''>All Statuses</option>
                            {statusOptions.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <div className='flex items-end'>
                            <button
                                onClick={handleClearFilters}
                                className='w-full sm:w-auto px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap'
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Info */}
            {!loading && (
                <div className='mb-4 text-sm text-gray-600'>
                    Showing {allMyReservations.length} of {pagination.totalCount} reservation{pagination.totalCount !== 1 ? 's' : ''} 
                    {pagination.totalPages > 1 && ` (Page ${currentPage} of ${pagination.totalPages})`}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className='text-center py-12'>
                    <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                    <p className='mt-2 text-gray-600'>Loading reservations...</p>
                </div>
            ) : (
            <div className='rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-2'>
                {/* Responsive table wrapper with horizontal scroll */}
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm min-w-[700px]'>
                        <thead className="bg-secondary border-b border-gray-200">
                            <tr className="text-left">
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">Name</th>
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">From Date</th>
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">To Date</th>
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">Quantity</th>
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">Status</th>
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {allMyReservations && allMyReservations.length !== 0 ? allMyReservations.map(data => {
                                let fromDate = new Date(data.fromDate).toLocaleDateString()
                                let toDate = new Date(data.toDate).toLocaleDateString()
                                return (
                                    <tr key={data._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{data.equipment.name}</td>
                                        <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{fromDate}</td>
                                        <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{toDate}</td>
                                        <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{data.quantity}</td>
                                        <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{data.status}</td>
                                        <td className="py-4 px-3 sm:px-4 text-gray-900">
                                            {data.status === 'ACTIVE' ? (
                                                <button 
                                                    className="p-2 rounded-md hover:bg-gray-100 transition-colors" 
                                                    onClick={() => returnEquipmentHandler(data._id)}
                                                    aria-label="Return equipment"
                                                >
                                                    Return
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-xs">No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 px-4">
                                        <div className='flex flex-col items-center justify-center'>
                                            <svg className='w-16 h-16 text-gray-300 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' />
                                            </svg>
                                            <p className='text-base sm:text-lg font-medium text-gray-900 mb-1'>
                                                {hasActiveFilters ? 'No reservations match your filters' : 'No reservations found'}
                                            </p>
                                            <p className='text-xs sm:text-sm text-gray-500 px-4'>
                                                {hasActiveFilters ? 'Try adjusting your search or filters' : 'You have no reservations yet'}
                                            </p>
                                            {hasActiveFilters && (
                                                <button
                                                    onClick={handleClearFilters}
                                                    className='mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium'
                                                >
                                                    Clear All Filters
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

export default CurrReservations