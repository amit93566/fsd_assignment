import React, { useEffect, useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import Modal from 'react-modal'
import { createSingleEquipment, deleteEquipments, getEquipmentList, updateEquipments } from '../../services/api'
import toast from 'react-hot-toast'
import EditIcon from '../../components/icons/EditIcon.jsx'
import DeleteIcon from '../../components/icons/DeleteIcon.jsx'
import useDebounce from '../../lib/useDebounce'
import { Pagination } from '../../components/Pagination'


Modal.setAppElement('#root')

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  category: Yup.string()
    .oneOf(['Electronics', 'Furniture', 'Sports Equipment', 'Laboratory Equipment'], 'Please select a valid category')
    .required('Category is required'),
  condition: Yup.string()
    .oneOf(['Excellent', 'Good', 'Fair', 'Poor'], 'Please select a valid condition')
    .required('Condition is required'),
  quantity: Yup.number()
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity must be less than 1000')
    .required('Quantity is required')
})

// Initial form values
const initialValues = {
  name: '',
  category: '',
  condition: '',
  quantity: ''
}

function EquipManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [allEquipmentList, setAllEquipmentList] = useState([])
  const [isUpdating, setIsUpdating] = useState({ active: false, activeId: "" })
  const [singleEquipment, setSingleEquipment] = useState(initialValues)
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 1000)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('')
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
  const categoryOptions = ['Electronics', 'Furniture', 'Sports Equipment', 'Laboratory Equipment']
  const conditionOptions = ['Excellent', 'Good', 'Fair', 'Poor']

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false);
    setIsUpdating({ active: false, activeId: "" });
    setSingleEquipment(initialValues)
  }

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, selectedCategory, selectedCondition])

  useEffect(() => {
    getAllEquipmentListHandler(debouncedSearchQuery, currentPage, selectedCategory, selectedCondition)
  }, [debouncedSearchQuery, currentPage, selectedCategory, selectedCondition])

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    console.log('Form submitted:', values)
    if (!isUpdating.active) {
      createSingleEquipment(values.name, values.category, values.condition, values.quantity).then(res => {
        console.log(res)
        if (res.status === "success") {
          toast.success('Equipment added successfully!')
          getAllEquipmentListHandler(debouncedSearchQuery, currentPage, selectedCategory, selectedCondition)
        } else {
          toast.error(res.message)
        }
      }).catch(err => {
        console.log(err)
        toast.error(err.response.data.message)
      })
    } else {
      updateEquipments(isUpdating.activeId,values.name, values.category, values.condition, values.quantity).then(res=>{
        console.log(res)
        if(res.status=== "success"){
          toast.success(res.message)
          getAllEquipmentListHandler(debouncedSearchQuery, currentPage, selectedCategory, selectedCondition)
        }
      }).catch(err=>{
        console.log(err)
      })
    }
    setSubmitting(false)
    resetForm()
    closeModal()
  }

  function getAllEquipmentListHandler(searchQuery, page = 1, category = '', condition = '') {
    setLoading(true)
    const searchParam = searchQuery && searchQuery.trim() ? searchQuery.trim() : null
    getEquipmentList(searchParam, page, 10, category || null, condition || null).then(res => {
      console.log(res)
      if (res.status === "success") {
        setAllEquipmentList(res.data)
        if (res.pagination) {
          setPagination(res.pagination)
        }
      }
    }).catch(err => {
      console.log(err)
      toast.error('Failed to load equipment')
    }).finally(() => {
      setLoading(false)
    })
  }

  const handleEdit = (id) => {
    console.log(id)
    setIsModalOpen(true)
    setSingleEquipment(allEquipmentList.find(equipment => equipment._id === id))
    setIsUpdating({ active: true, activeId: id })
  }

  const handleDelete = (id) => {
    console.log(id)
    deleteEquipments(id).then(res => {
      console.log(res);
      if (res.status === "success") {
        toast.success(res.message)
        getAllEquipmentListHandler(debouncedSearchQuery, currentPage, selectedCategory, selectedCondition)
      }
    }).catch(err => {
      console.log(err)
    })
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedCondition('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || selectedCategory || selectedCondition

  // Get unique categories from equipment list (fallback to predefined if no data)
  const categories = allEquipmentList.length > 0 
    ? [...new Set(allEquipmentList.map(equip => equip.category).filter(Boolean))].sort()
    : categoryOptions

  return (
    <div className='py-4 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto'>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className='text-2xl sm:text-3xl font-semibold'>Equipment Management</h1>
        <button
          onClick={openModal}
          className='w-full sm:w-auto hover:bg-[#0f4c5c] bg-[#335c67] transition-all duration-300 text-white px-4 py-2 rounded-md whitespace-nowrap'
        >
          Add Equipment
        </button>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Staff/Equipment Modal"
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0"
      >
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{`${isUpdating.active ? "Edit" : "Add"} Equipment`}</h2>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <Formik
            initialValues={singleEquipment}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.name && touched.name ? 'border-error' : 'border-gray-300'
                      }`}
                    placeholder="Enter name"
                  />
                  <ErrorMessage name="name" component="div" className="text-error text-sm mt-1" />
                </div>

                {/* Category Field */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <Field
                    as="select"
                    id="category"
                    name="category"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.category && touched.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select a category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Sports Equipment">Sports Equipment</option>
                    <option value="Laboratory Equipment">Laboratory Equipment</option>
                  </Field>
                  <ErrorMessage name="category" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Condition Field */}
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                    Condition *
                  </label>
                  <Field
                    as="select"
                    id="condition"
                    name="condition"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.condition && touched.condition ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select condition</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </Field>
                  <ErrorMessage name="condition" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Quantity Field */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <Field
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max="1000"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.quantity && touched.quantity ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter quantity"
                  />
                  <ErrorMessage name="quantity" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#335c67] text-white rounded-md hover:bg-[#0f4c5c] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating.active ? "Update" : isSubmitting ? 'Adding...' : 'Add Equipment'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Modal>

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
              {categoryOptions.map(category => (
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

      {/* Results Info */}
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
                  <td className="py-4 px-3 sm:px-4 text-center space-x-2 whitespace-nowrap">
                    <button onClick={() => handleEdit(data._id)} className='text-primary hover:text-primary-700 inline-flex items-center justify-center' aria-label="Edit equipment">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(data._id)} className='text-red-600 hover:text-red-800 inline-flex items-center justify-center' aria-label="Delete equipment">
                      Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 px-4">
                    <div className='flex flex-col items-center justify-center'>
                      <svg className='w-16 h-16 text-gray-300 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' />
                      </svg>
                      <p className='text-base sm:text-lg font-medium text-gray-900 mb-1'>
                        {hasActiveFilters ? 'No equipment matches your filters' : 'No equipment found'}
                      </p>
                      <p className='text-xs sm:text-sm text-gray-500 px-4'>
                        {hasActiveFilters ? 'Try adjusting your search or filters' : 'Get started by adding your first equipment'}
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

export default EquipManagement
