import { getEquipmentList } from "../../services/api"
import { useState, useEffect } from "react"
import Modal from "react-modal"
import * as Yup from "yup"
import { Formik, Form, Field, ErrorMessage } from "formik"
import { toast } from "react-hot-toast"
import { requestEquipments } from "../../services/api"
import useDebounce from "../../lib/useDebounce"
import { Pagination } from "../../components/Pagination"

Modal.setAppElement('#root')

function StudentDashboard() {
    const [allEquipmentList, setAllEquipmentList] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const debouncedSearchQuery = useDebounce(searchQuery, 1000)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedCondition, setSelectedCondition] = useState('')
    const [selectedEquipment, setSelectedEquipment] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({
        totalPages: 1,
        totalCount: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false
    })
    const [loading, setLoading] = useState(false)
    
    // Predefined filter options
    const conditionOptions = ['Excellent', 'Good', 'Fair', 'Poor']
    
    const openModal = () => setIsModalOpen(true)
    const closeModal = () => {setIsModalOpen(false); setSelectedEquipment(null)}

    const initialValues = {
        quantity: 0,
        startDate: "",
        endDate: "",
    }
    const validationSchema = Yup.object({
        quantity: Yup.number().required("Quantity is required"),
        startDate: Yup.date().required("Start date is required"),
        endDate: Yup.date().required("End date is required"),
    })

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearchQuery, selectedCategory, selectedCondition])

    useEffect(() => {
        getAllEquipmentListHandler(debouncedSearchQuery, currentPage, selectedCategory, selectedCondition)
    }, [debouncedSearchQuery, currentPage, selectedCategory, selectedCondition])
    
    // Fetch unique categories from equipment list (fallback to empty array if no data)
    const categories = allEquipmentList.length > 0 
        ? [...new Set(allEquipmentList.map(equip => equip.category).filter(Boolean))].sort()
        : []

    function getAllEquipmentListHandler(searchQuery, page = 1, category = '', condition = '') {
        setLoading(true)
        getEquipmentList(searchQuery, page, 10, category || null, condition || null).then(res => {
            console.log(res)
            if (res.status === "success") {
                setAllEquipmentList(res.data)
                if (res.pagination) {
                    setPagination(res.pagination)
                }
            }
        }).catch(err => {
            console.log(err)
            toast.error("Failed to load equipment")
        }).finally(() => {
            setLoading(false)
        })
    }
    
    const handleClearFilters = () => {
        setSearchQuery('')
        setSelectedCategory('')
        setSelectedCondition('')
        setCurrentPage(1)
    }
    
    const hasActiveFilters = searchQuery || selectedCategory || selectedCondition

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage)
        // Scroll to top of table when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function handleSubmit(values, { setSubmitting, resetForm }) {
        console.log(values)
        setSubmitting(false)
        requestEquipments(selectedEquipment, values.quantity, values.startDate, values.endDate).then(res => {
            console.log(res)
            if (res.status === "success") {
                toast.success(res.message)
                getAllEquipmentListHandler(debouncedSearchQuery, currentPage, selectedCategory, selectedCondition)
                closeModal()
                resetForm()
            } else {
                toast.error(res.message)
                getAllEquipmentListHandler(debouncedSearchQuery, currentPage, selectedCategory, selectedCondition)
                closeModal()
                resetForm()
            }
        }).catch(err => {
            console.log(err)
            toast.error(err.response.data.message)
        })
    }

    return (
        <div className='py-4 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto'>
            <h1 className='text-2xl sm:text-3xl font-semibold mb-6'>Available Equipments</h1>
            
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
                        placeholder="Search by equipment name..." 
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
                
                {/* Filter Dropdowns */}
                <div className='flex flex-col sm:flex-row gap-4'>
                    {/* Category Filter */}
                    <div className='flex-1 sm:flex-initial sm:w-64'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm appearance-none bg-white'
                        >
                            <option value=''>All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Condition Filter */}
                    <div className='flex-1 sm:flex-initial sm:w-48'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Condition</label>
                        <select
                            value={selectedCondition}
                            onChange={(e) => setSelectedCondition(e.target.value)}
                            className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm appearance-none bg-white'
                        >
                            <option value=''>All Conditions</option>
                            {conditionOptions.map(condition => (
                                <option key={condition} value={condition}>{condition}</option>
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

            {!loading && (
                <div className='mb-4 text-sm text-gray-600'>
                    Showing {allEquipmentList.length} of {pagination.totalCount} equipment{pagination.totalCount !== 1 ? 's' : ''} 
                    {pagination.totalPages > 1 && ` (Page ${currentPage} of ${pagination.totalPages})`}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className='text-center py-12'>
                    <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                    <p className='mt-2 text-gray-600'>Loading equipment...</p>
                </div>
            ) : (
            <div className='rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-2'>
                {/* Responsive table wrapper with horizontal scroll */}
                <div className='overflow-x-auto'>
                    <table className='w-full text-sm min-w-[640px]'>
                        <thead className="bg-secondary border-b border-gray-200">
                            <tr className="text-left">
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">Name</th>
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">Category</th>
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">Condition</th>
                                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">Quantity</th>
                                <th className="py-3 px-3 sm:px-4 font-medium text-gray-600 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {allEquipmentList && allEquipmentList.length !== 0 ? allEquipmentList.map(data => (
                                <tr key={data._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{data.name}</td>
                                    <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{data.category}</td>
                                    <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{data.condition}</td>
                                    <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{data.quantity}</td>
                                    <td className="py-4 px-3 sm:px-4 text-center whitespace-nowrap">
                                        <button 
                                            onClick={() => {
                                                openModal()
                                                setSelectedEquipment(data._id)
                                            }}
                                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors text-sm font-medium"
                                            aria-label="Request equipment"
                                        >
                                            Request
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 px-4">
                                        <div className='flex flex-col items-center justify-center'>
                                            <svg className='w-16 h-16 text-gray-300 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' />
                                            </svg>
                                            <p className='text-base sm:text-lg font-medium text-gray-900 mb-1'>
                                                {hasActiveFilters ? 'No equipment matches your filters' : 'No equipment available'}
                                            </p>
                                            <p className='text-xs sm:text-sm text-gray-500 px-4'>
                                                {hasActiveFilters ? 'Try adjusting your search or filters' : 'Check back later for new equipment'}
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
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Request Equipment Modal"
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                overlayClassName="fixed inset-0"
            >
                <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Request Equipment</h2>
                    <button
                        onClick={closeModal}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                    {({ isSubmitting, errors, touched }) => (
                        <Form className="space-y-4">
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <Field type="number" id="quantity" name="quantity" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.quantity && touched.quantity ? 'border-error' : 'border-gray-300'
                                    }`} placeholder="Enter quantity" />
                                <ErrorMessage name="quantity" component="div" className="text-error text-sm mt-1" />
                            </div>
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <Field type="date" id="startDate" name="startDate" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.startDate && touched.startDate ? 'border-error' : 'border-gray-300'
                                    }`} placeholder="Enter start date" />
                                <ErrorMessage name="startDate" component="div" className="text-error text-sm mt-1" />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <Field type="date" id="endDate" name="endDate" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.endDate && touched.endDate ? 'border-error' : 'border-gray-300'
                                    }`} placeholder="Enter end date" />
                                <ErrorMessage name="endDate" component="div" className="text-error text-sm mt-1" />
                            </div>
                            <button type="submit" disabled={isSubmitting} className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors">
                                {isSubmitting ? "Submitting..." : "Submit"}
                            </button>
                        </Form>
                    )}
                </Formik>
                </div>
            </Modal>
        </div>
    )
}

export default StudentDashboard