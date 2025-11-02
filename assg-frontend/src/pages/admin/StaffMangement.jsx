import React, { useEffect, useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import Modal from 'react-modal'
import { toast } from 'react-hot-toast'
import { staffapi, stafflistapi } from '../../services/api'
import useDebounce from '../../lib/useDebounce'
import { Pagination } from '../../components/Pagination'


Modal.setAppElement('#root')

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters')
    .required('Password is required'),
  class: Yup.string()
    .min(1, 'Class must be at least 1 character')
    .max(20, 'Class must be less than 20 characters')
    .required('Class is required')
})

// Initial form values
const initialValues = {
  name: '',
  email: '',
  password: '',
  class: ''
}

function StaffMangement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [allregStaff, setAllRegStaff] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 1000)
  const [selectedClass, setSelectedClass] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [loading, setLoading] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, selectedClass])

  useEffect(() => {
    getAllStaffListHandler(debouncedSearchQuery, currentPage, selectedClass)
  }, [debouncedSearchQuery, currentPage, selectedClass])

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  }

  const handleSubmit = (values, { setSubmitting, resetForm }) => {
    console.log('Form submitted:', values)
    staffapi(values.name, values.email, values.password, values.class, 'STAFF').then(response => {
      console.log('Response:', response)
      setSubmitting(false)
      resetForm()
      toast.success('Staff member added successfully!')
      closeModal()
      getAllStaffListHandler(debouncedSearchQuery, currentPage, selectedClass)
    }).catch(error => { 
      setSubmitting(false)
      console.log('Error:', error)
      toast.error(error.response.data.message)
    })
  }

  const getAllStaffListHandler = (searchQuery, page = 1, classFilter = '') => {
    setLoading(true)
    const searchParam = searchQuery && searchQuery.trim() ? searchQuery.trim() : null
    stafflistapi(searchParam, page, 10, classFilter || null).then(res => {
      if (res.status === "success") {
        setAllRegStaff(res.data)
        if (res.pagination) {
          setPagination(res.pagination)
        }
      }
    }).catch(err => {
      console.log(err)
      toast.error('Failed to load staff list')
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
    setSelectedClass('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || selectedClass

  // Get unique classes from staff list
  const classes = allregStaff.length > 0 
    ? [...new Set(allregStaff.map(staff => staff.sclass).filter(Boolean))].sort()
    : []

  return (
    <div className='py-4 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto'>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className='text-2xl sm:text-3xl font-semibold'>Staff Management</h1>
        <button
          onClick={openModal}
          className='w-full sm:w-auto hover:bg-[#0f4c5c] bg-[#335c67] transition-all duration-300 text-white px-4 py-2 rounded-md whitespace-nowrap'
        >
          Add Staff
        </button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Staff Member Modal"
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0"
      >
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Add Staff Member</h2>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.name && touched.name ? 'border-error' : 'border-gray-300'
                      }`}
                    placeholder="Enter full name"
                  />
                  <ErrorMessage name="name" component="div" className="text-error text-sm mt-1" />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter email address"
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <Field
                    type="password"
                    id="password"
                    name="password"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter password"
                  />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Class Field */}
                <div>
                  <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-1">
                    Class *
                  </label>
                  <Field
                    type="text"
                    id="class"
                    name="class"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.class && touched.class ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter class (e.g., Grade 10, Class A)"
                  />
                  <ErrorMessage name="class" component="div" className="text-red-500 text-sm mt-1" />
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
                    {isSubmitting ? 'Adding...' : 'Add Staff Member'}
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
        
        {/* Filter Dropdown */}
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Class Filter */}
          <div className='flex-1 sm:flex-initial sm:w-64'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm appearance-none bg-white'
            >
              <option value=''>All Classes</option>
              {classes.map(classOption => (
                <option key={classOption} value={classOption}>{classOption}</option>
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
          Showing {allregStaff.length} of {pagination.totalCount} staff member{pagination.totalCount !== 1 ? 's' : ''} 
          {pagination.totalPages > 1 && ` (Page ${currentPage} of ${pagination.totalPages})`}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className='text-center py-12'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          <p className='mt-2 text-gray-600'>Loading staff...</p>
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
                <th className="py-3 px-3 sm:px-4 font-medium text-black whitespace-nowrap">Joined</th>
                {/* <th className="py-3 px-4 font-medium text-gray-600"></th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {allregStaff && allregStaff.length !== 0 ? allregStaff.map(data => (
                <tr key={data._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{data.name}</td>
                  <td className="py-4 px-3 sm:px-4 text-gray-900 break-all">{data.email}</td>
                  <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{data.sclass}</td>
                  <td className="py-4 px-3 sm:px-4 text-gray-900 whitespace-nowrap">{formatDate(data.createdAt)}</td>
                  {/* <td className="py-4 px-4 text-right">
                    <a href="#" className="font-medium text-primary hover:text-primary-700">
                      Edit
                    </a>
                  </td> */}
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="text-center py-12 px-4">
                    <div className='flex flex-col items-center justify-center'>
                      <svg className='w-16 h-16 text-gray-300 mb-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                      </svg>
                      <p className='text-base sm:text-lg font-medium text-gray-900 mb-1'>
                        {hasActiveFilters ? 'No staff members match your filters' : 'No staff found'}
                      </p>
                      <p className='text-xs sm:text-sm text-gray-500 px-4'>
                        {hasActiveFilters ? 'Try adjusting your search or filters' : 'Get started by adding your first staff member'}
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

export default StaffMangement
