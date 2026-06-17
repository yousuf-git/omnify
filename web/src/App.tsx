import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppLayout } from './components/applayout/Index.tsx'
import RouteError from './components/common/RouteError.tsx'
import ItemPage from './pages/Item.tsx'
// import { ErrorPage } from "./pages/ErrorPage.tsx";
// import { ErrorPages } from "./pages/LodingPage.tsx";
import PartyPage from './pages/Party.tsx'
// import StockInPage from "./pages/StockIn.tsx";
import ItemForm from './components/form/ItemForm.tsx'
import ItemGroupForm from './components/form/ItemGroupForm.tsx'
import PartyForm from './components/form/PartyForm.tsx'
import ResellerForm from './components/form/ResellerForm.tsx'
import StockInCategoryForm from './components/form/StockInCategoryForm.tsx'
import StockOutCategoryForm from './components/form/StockOutCategoryForm.tsx'
import WarehouseForm from './components/form/Warehouse.tsx'
import ItemGroupPage from './pages/ItemGroup.tsx'
import ResellerPage from './pages/Reseller.tsx'
import StockInPage from './pages/StockIn.tsx'
import StockInCategoryPage from './pages/StockInCategory.tsx'
import StockOutPage from './pages/StockOut.tsx'
import StockOutCategoryPage from './pages/StockOutCategory.tsx'
import WarehousePage from './pages/Warehouse.tsx'
// import StockInForm from "./components/form/StockInManagementForm.tsx";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { enGB } from 'date-fns/locale/en-GB'
import ProtectedRoute from './components/common/ProtectedRoute.tsx'
import AgencyForm from './components/form/AgencyForm.tsx'
import CityForm from './components/form/CityForm.tsx'
import DeliveryStatusForm from './components/form/DeliveryStatusForm.tsx'
import InstallationStatusForm from './components/form/InstallationStatusForm.tsx'
import IssueTypeForm from './components/form/IssueTypeForm.tsx'
import ItemStockRecordForm from './components/form/ItemStockRecordForm.tsx'
import LogisticsProviderCategoryForm from './components/form/LogisticsProviderCategoryForm.tsx'
import ResolutionStatusForm from './components/form/ResolutionStatusForm.tsx'
import StateForm from './components/form/StateForm.tsx'
import { StockInForm } from './components/form/StockInManagementForm.tsx'
import StockOutForm from './components/form/StockOutForm.tsx'
import StoreForm from './components/form/StoreForm.tsx'
import SupportPersonForm from './components/form/SupportPersonForm.tsx'
import AssignedToForm from './components/form/AssignedToForm.tsx'
import { TicketForm } from './components/form/TicketForm.tsx'
import TicketStatusForm from './components/form/TicketStatusForm.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import AgencyPage from './pages/Agency.tsx'
import CheckTicketStatus from './pages/CheckTicketStatus.tsx'
import CityPage from './pages/City.tsx'
import DeliveryStatusPage from './pages/DeliveryStatus.tsx'
import InstallationStatusPage from './pages/InstallationStatus.tsx'
import IssueTypePage from './pages/IssueType.tsx'
import ItemStockRecordPage from './pages/ItemStockRecord.tsx'
import Login from './pages/Login.tsx'
import LogisticsProviderCategoryPage from './pages/LogisticsProviderCategory.tsx'
import ResolutionStatusPage from './pages/ResolutionStatus.tsx'
import StatePage from './pages/StatePage.tsx'
import StockInDetails from './pages/StockInDetails.tsx'
import StockItemPage from './pages/StockItem.tsx'
import StockOutDetails from './pages/StockOutDetails.tsx'
import StorePage from './pages/Store.tsx'
import SupportPersonPage from './pages/SupportPerson.tsx'
import AssignedToPage from './pages/AssignedTo.tsx'
import TicketDetails from './pages/TicketDetails.tsx'
import TicketPage from './pages/TicketPage.tsx'
import TicketStatusPage from './pages/TicketStatus.tsx'

import UserForm from './components/form/UserForm.tsx'
import { Unauthorized } from './pages/Unauthorized.tsx'
import UserManagementPage from './pages/UserManagementPage.tsx'
import { NestedEntityProvider } from './contexts/NestedEntityContext.tsx'

// Public marketing site
import PublicLayout from './components/public/PublicLayout.tsx'
import LandingPage from './pages/public/LandingPage.tsx'
import AboutPage from './pages/public/AboutPage.tsx'
import FeaturesPage from './pages/public/FeaturesPage.tsx'
import ContactPage from './pages/public/ContactPage.tsx'
import SandboxGate from './pages/public/SandboxGate.tsx'
import PrivacyPolicy from './pages/public/PrivacyPolicy.tsx'
import TermsOfService from './pages/public/TermsOfService.tsx'

// App: settings, dashboards, super-admin console
import SettingsPage from './pages/SettingsPage.tsx'
import Dashboard from './pages/Dashboard.tsx'
import SuperAdminConsole from './pages/admin/SuperAdminConsole.tsx'
import { TenantSettingsProvider } from './contexts/TenantSettingsContext.tsx'

function App () {
  const router = createBrowserRouter([
    // Public marketing site
    {
      element: <PublicLayout />,
      errorElement: <RouteError />,
      children: [
        { path: '/', element: <LandingPage /> },
        { path: '/features', element: <FeaturesPage /> },
        { path: '/about', element: <AboutPage /> },
        { path: '/contact', element: <ContactPage /> },
        { path: '/privacy', element: <PrivacyPolicy /> },
        { path: '/terms', element: <TermsOfService /> }
      ]
    },
    {
      path: '/login',
      element: <Login />,
      errorElement: <RouteError />
    },
    {
      path: '/sandbox',
      element: <SandboxGate />,
      errorElement: <RouteError />
    },
    {
      path: '/admin',
      errorElement: <RouteError />,
      element: (
        <ProtectedRoute requiredRole={['superadmin']}>
          <SuperAdminConsole />
        </ProtectedRoute>
      )
    },
    // Protected app (pathless layout — keeps every existing /Page path unchanged)
    {
      errorElement: <RouteError />,
      element: (
        <ProtectedRoute>
          <TenantSettingsProvider>
            <AppLayout />
          </TenantSettingsProvider>
        </ProtectedRoute>
      ),
      children: [
        {
          path: '/dashboard',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <Dashboard />
            </ProtectedRoute>
          )
        },
        {
          path: '/SettingsPage',
          element: (
            <ProtectedRoute requiredRole={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/ItemPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <ItemPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/unauthorized',
          element: <Unauthorized />
        },
        //  {
        //   path: "/StockInPage",
        //   element: <StockInPage />,
        // },
        {
          path: '/ItemFormPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <ItemForm />
            </ProtectedRoute>
          )
        },
        // {
        //   path: "/TableDataApiPage",
        //   element: <TableDataApi  />,
        // },
        {
          path: '/ItemGroupPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <ItemGroupPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/ItemGroupFormPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <ItemGroupForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/ResellerPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <ResellerPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/ResellerForm',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <ResellerForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/PartyPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <PartyPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/PartyFormPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <PartyForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/StockInCategoryPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StockInCategoryPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/StockInCategoryFormPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StockInCategoryForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/WarehousePage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <WarehousePage />
            </ProtectedRoute>
          )
        },
        {
          path: '/WarehouseFormPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <WarehouseForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/StockInPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StockInPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/StockInFormPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StockInForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/StockItemPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StockItemPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/StorePage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StorePage />
            </ProtectedRoute>
          )
        },
        {
          path: '/StoreFormPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StoreForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/LogisticsProviderCategoryPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <LogisticsProviderCategoryPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/LogisticsProviderCategoryForm',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <LogisticsProviderCategoryForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/ItemStockRecordPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <ItemStockRecordPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/ItemStockRecordFormPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <ItemStockRecordForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/DeliveryStatusPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <DeliveryStatusPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/DeliveryStatusFormPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <DeliveryStatusForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/InstallationStatusPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <InstallationStatusPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/InstallationStatusFormPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <InstallationStatusForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/StockOutPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StockOutPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/StockOutForm',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StockOutForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/StockOutCategoryPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StockOutCategoryPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/StockOutCategoryFormPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StockOutCategoryForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/stock-in-details/:id',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StockInDetails />
            </ProtectedRoute>
          )
        },
        {
          path: '/stock-out-details/:id',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StockOutDetails />
            </ProtectedRoute>
          )
        },
        {
          path: '/AgencyPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <AgencyPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/AgencyForm',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <AgencyForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/IssueTypePage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <IssueTypePage />
            </ProtectedRoute>
          )
        },
        {
          path: '/IssueTypeForm',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <IssueTypeForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/ResolutionStatusPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <ResolutionStatusPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/ResolutionStatusForm',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <ResolutionStatusForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/SupportPersonPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <SupportPersonPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/SupportPersonForm',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <SupportPersonForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/AssignedToPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <AssignedToPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/AssignedToForm',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <AssignedToForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/TicketStatusPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <TicketStatusPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/TicketStatusForm',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <TicketStatusForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/TicketPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <TicketPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/TicketForm',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <TicketForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/ticket-details/:id',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <TicketDetails />
            </ProtectedRoute>
          )
        },
        {
          path: '/CityPage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <CityPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/CityForm',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <CityForm />
            </ProtectedRoute>
          )
        },
        {
          path: '/StatePage',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StatePage />
            </ProtectedRoute>
          )
        },
        {
          path: '/UserManagementPage',
          element: (
            <ProtectedRoute requiredRole={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          )
        },
        {
          path: '/UserForm',
          element: (
            <ProtectedRoute requiredRole={['admin']}>
              <UserForm />
            </ProtectedRoute>
          )
        },

        {
          path: '/StateForm',
          element: (
            <ProtectedRoute requiredRole={['admin', 'manager', 'staff', 'viewer']}>
              <StateForm />
            </ProtectedRoute>
          )
        }
      ]
    },
    { path: '/checkTicketStatus', element: <CheckTicketStatus /> }
  ])

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
      <AuthProvider>
        <NestedEntityProvider>
          <RouterProvider router={router} />
        </NestedEntityProvider>
      </AuthProvider>
    </LocalizationProvider>
  )
}

export default App
