import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import LoadingFallback from "../components/LoadingFallback"
import { useSidebarStore } from '../lib/utils'
import { apime, logoutapi } from '../services/api'

function Authlayout() {
  const isOpen = useSidebarStore(state => state.isOpen)
  const toggleSidebar = useSidebarStore(state => state.toggleSidebar)
  const setSidebarOpen = useSidebarStore(state => state.setSidebarOpen)
  const [userRole, setUserRole] = useState(null)
  const [userEmail, setUserEmail] = useState(null)
  const [userName, setUserName] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()
  const location = useLocation()

  // SIDEBAR NAVIGATION with icons for each role
  const adminRoutes = [
    { to: "/dashboard", name: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { to: "/staffmangement", name: "Staff Management", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { to: "/equipmentmanagement", name: "Equipment Management", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
    { to: "/studentlist", name: "Student List", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" }
  ];
  const studentRoutes = [
    { to: "/requestequipment", name: "Request Equipment", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
    { to: "/currentreservations", name: "Current Reservations", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  ];
  const staffRoutes = [
    { to: "/acceptequipment", name: "Accept Equipment", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { to: "/studentslist", name: "Students List", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" }
  ];

  // MAP routes to allowed roles for protection
  const protectedRoutes = {
    '/dashboard': ['ADMIN'],
    '/staffmangement': ['ADMIN'],
    '/equipmentmanagement': ['ADMIN'],
    '/studentlist': ['ADMIN'],
    '/requestequipment': ['STUDENT'],
    '/currentreservations': ['STUDENT'],
    '/acceptequipment': ['STAFF'],
    '/studentslist': ['STAFF']
  };

  function getUserDetails() {
    apime()
      .then(res => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          const userData = res.data[0];
          setUserRole(userData.role);
          setUserEmail(userData.email);
          setUserName(userData.name);
          setLoading(false);
        } else {
          setLoading(false);
          navigate('/');
        }
      })
      .catch((error) => {
        setLoading(false);
        navigate('/');
      });
  }

  useEffect(() => {
    getUserDetails();

    // Initialize sidebar state based on screen size on mount
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop) {
      setSidebarOpen(true);
    }
  }, [setSidebarOpen]);

  // Handle window resize separately to avoid dependency issues
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        // On desktop, always keep sidebar open
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  const curPath = location.pathname.toLowerCase();
  const allowedRoles = protectedRoutes[curPath];

  function handleLogout() {
    logoutapi().then(() => {
      navigate('/');
    }).catch(() => {
      toast.error("Error logging out");
    });
  }

  const getRoutesByRole = () => {
    switch (userRole) {
      case 'ADMIN':
        return adminRoutes
      case 'STUDENT':
        return studentRoutes
      case 'STAFF':
        return staffRoutes
      default:
        return []
    }
  }

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'ADMIN':
        return 'bg-primary text-white'
      case 'STAFF':
        return 'bg-warning text-white'
      case 'STUDENT':
        return 'bg-highlight text-primary'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  }

  // Close sidebar when clicking on nav link (mobile)
  const handleNavClick = () => {
    if (window.innerWidth < 1024) { // lg breakpoint
      toggleSidebar();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><LoadingFallback /></div>;
  if (!userRole) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;

  return (
    <div className="flex h-screen bg-accent-50">
      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 flex flex-col bg-white border-r border-gray-200 shadow-lg
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">SEML</h1>
              <p className="text-xs text-gray-500">Portal</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold shadow-md">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{userName || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail || ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${getRoleBadgeColor()}`}>
              {userRole || 'USER'}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {getRoutesByRole().map(data => (
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                                    ${isActive
                    ? "bg-primary text-white shadow-md transform scale-[1.02]"
                    : "text-gray-700 hover:bg-secondary/10 hover:text-secondary"
                  }`
                }
                key={data.to}
                to={data.to}
                onClick={handleNavClick}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={data.icon} />
                </svg>
                <span className="font-medium">{data.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-error/10 hover:text-error rounded-lg transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className='px-2 py-1'>
        <button
          onClick={toggleSidebar}
          className="lg:hidden w-fit bg-white text-gray-700 hover:text-gray-900 p-2.5 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        </div>

        <main className="flex-1 overflow-y-auto bg-accent-50">
          <div className="px-2 lg:px-6 py-2 lg:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Authlayout