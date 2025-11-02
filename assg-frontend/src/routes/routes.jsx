import { createBrowserRouter } from "react-router";
import { Suspense, lazy } from "react";
import Layout from "../layout/Layout";
import Authlayout from "../layout/Authlayout";
import LoadingFallback from "../components/LoadingFallback";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const StaffMangement = lazy(() => import("../pages/admin/StaffMangement"));
const EquipManagement = lazy(() => import("../pages/admin/EquipManagement"));
const StaffDashboard = lazy(() => import("../pages/staff/StaffDashboard"));
const StudentDashboard = lazy(() => import("../pages/student/StudnetDashboard"));
const CurrReservations = lazy(() => import("../pages/student/CurrReservations"));
const StudentsList = lazy(() => import("../pages/staff/StudentsList"));
const StudentList = lazy(() => import("../pages/admin/StudentList"));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

const routes = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <SuspenseWrapper><Login /></SuspenseWrapper>,
            },
            {
                path: "/register",
                element: <SuspenseWrapper><Register /></SuspenseWrapper>
            }
        ],
    }, {
        element: <Authlayout />,
        children: [
            {
                path: "/dashboard",
                element: <SuspenseWrapper><Dashboard /></SuspenseWrapper>
            }, {
                path: "/staffmangement",
                element: <SuspenseWrapper><StaffMangement /></SuspenseWrapper>
            },{
                path: "/equipmentmanagement",
                element: <SuspenseWrapper><EquipManagement /></SuspenseWrapper>
            },
            {
                path: "/studentlist",
                element: <SuspenseWrapper><StudentList /></SuspenseWrapper>
            },
            {
                path:"/acceptequipment",
                element: <SuspenseWrapper><StaffDashboard /></SuspenseWrapper>
            },{
                path:"/requestequipment",
                element: <SuspenseWrapper><StudentDashboard /></SuspenseWrapper>
            },{
                path:"/currentreservations",
                element: <SuspenseWrapper><CurrReservations /></SuspenseWrapper>
            },{
                path:"/studentslist",
                element: <SuspenseWrapper><StudentsList /></SuspenseWrapper>
            }
        ]
    }
]);

export default routes;
