import { Outlet, useLocation } from "react-router";

function Layout() {
    return (
        <div className="min-h-screen flex">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary-200 to-secondary p-8 md:p-12 flex-col justify-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-highlight opacity-10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-warning opacity-10 rounded-full blur-3xl"></div>
                <div className="mb-8 z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold">SEML Portal</h1>
                    </div>
                    <p className="text-lg opacity-90">School Equipment Management & Lending</p>
                </div>

                {/* Feature Cards */}
                <div className="space-y-6 z-10">
                    <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <div className="w-10 h-10 bg-highlight/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">For Students</h3>
                            <p className="text-sm opacity-80">Request lab equipment, sports kits, and more with ease</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <div className="w-10 h-10 bg-warning rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">For Staff</h3>
                            <p className="text-sm opacity-80">Manage requests and track equipment efficiently</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Track & Manage</h3>
                            <p className="text-sm opacity-80">Real-time tracking of all equipment and reservations</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Page Content */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-accent-50 p-4 sm:p-6 lg:p-8">
                <Outlet />
            </div>
        </div>
    );
}

export default Layout;