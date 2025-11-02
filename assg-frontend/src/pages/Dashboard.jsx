import React, { useEffect, useState } from 'react'
import { dashboardapi } from '../services/api'

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    staff: 0,
    equipment: 0,
    students: 0
  });
  const [loading, setLoading] = useState(true);

  function getDashboardDataHandler() {
    setLoading(true);
    dashboardapi().then(res => {
      if (res.status === "success") {
        setDashboardData({
          staff: res.data.staff,
          equipment: res.data.equipment,
          students: res.data.students
        });
      }
      setLoading(false);
    }).catch(err => {
      setLoading(false);
    });
  }

  useEffect(() => {
    getDashboardDataHandler();
  }, []);

  const statCards = [
    {
      title: 'Staff Registered',
      value: dashboardData.staff,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgGradient: 'from-primary-500 to-primary-600',
      textColor: 'text-primary-600'
    },
    {
      title: 'Equipment Available',
      value: dashboardData.equipment,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      bgGradient: 'from-warning-500 to-warning-600',
      textColor: 'text-warning-600'
    },
    {
      title: 'Students Registered',
      value: dashboardData.students,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      bgGradient: 'from-highlight-400 to-highlight-500',
      textColor: 'text-highlight-600'
    }
  ];

  return (
    <div className='bg-accent-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Header Section */}
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>Dashboard Overview</h1>
          <p className='text-gray-600'>Welcome to the School Equipment Management System</p>
        </div>

        {/* Stats Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
          {statCards.map((card, index) => (
            <div
              key={index}
              className='bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'
            >
              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${card.bgGradient} bg-opacity-10`}>
                    <div className={card.textColor}>
                      {card.icon}
                    </div>
                  </div>
                  <div className='text-right'>
                    {loading ? (
                      <div className='animate-pulse'>
                        <div className='h-8 w-16 bg-gray-200 rounded'></div>
                      </div>
                    ) : (
                      <p className={`text-4xl font-bold ${card.textColor}`}>
                        {card.value}
                      </p>
                    )}
                  </div>
                </div>
                <h3 className='text-lg font-semibold text-gray-700'>{card.title}</h3>
                <div className='mt-4 pt-4 border-t border-gray-100'>
                  <p className='text-sm text-gray-500'>Total registered</p>
                </div>
              </div>
              <div className={`h-1 bg-gradient-to-r ${card.bgGradient}`}></div>
            </div>
          ))}
        </div>

        {/* Quick Stats Summary */}
      {/*<div className='bg-white rounded-xl shadow-lg p-6'>
          <h2 className='text-2xl font-bold text-gray-900 mb-4'>Summary</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='text-center p-4 rounded-lg bg-blue-50'>
              <p className='text-2xl font-bold text-blue-600'>{dashboardData.staff}</p>
              <p className='text-sm text-gray-600 mt-1'>Active Staff Members</p>
            </div>
            <div className='text-center p-4 rounded-lg bg-green-50'>
              <p className='text-2xl font-bold text-green-600'>{dashboardData.equipment}</p>
              <p className='text-sm text-gray-600 mt-1'>Available Equipment</p>
            </div>
            <div className='text-center p-4 rounded-lg bg-purple-50'>
              <p className='text-2xl font-bold text-purple-600'>{dashboardData.students}</p>
              <p className='text-sm text-gray-600 mt-1'>Registered Students</p>
            </div>
          </div>
        </div>*/}
      </div>
    </div>
  );
}

export default Dashboard
