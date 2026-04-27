import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, lazy, Suspense } from 'react';
import { getSiteSettings } from './services/adminService';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoutes from './routes/AdminRoutes';

// Public pages
const HomePage = lazy(() => import('./pages/home/HomePage'));
const SignUpPage = lazy(() => import('./pages/home/SignUpPage'));
const ServicesPage = lazy(() => import('./pages/home/ServicesPage'));
const AboutPage = lazy(() => import('./pages/home/AboutPage'));
const TermsPage = lazy(() => import('./pages/home/TermsPage'));
const FaqPage = lazy(() => import('./pages/home/FaqPage'));
const ContactPage = lazy(() => import('./pages/home/ContactPage'));
const LoginPage = lazy(() => import('./pages/home/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/home/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/home/ResetPasswordPage'));

// Dashboard pages
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const NewOrder = lazy(() => import('./pages/dashboard/NewOrder'));
const Updates = lazy(() => import('./pages/dashboard/Updates'));
const GeneralNotification = lazy(() => import('./pages/dashboard/GeneralNotification'));
const AddFunds = lazy(() => import('./pages/dashboard/AddFunds'));
const OrderHistory = lazy(() => import('./pages/dashboard/OrderHistory'));
const MassOrder = lazy(() => import('./pages/dashboard/MassOrder'));
const ChildPanel = lazy(() => import('./pages/dashboard/ChildPanel'));
const Affiliate = lazy(() => import('./pages/dashboard/Affiliate'));
const Services = lazy(() => import('./pages/dashboard/Services'));
const Support = lazy(() => import('./pages/dashboard/Support'));
const API = lazy(() => import('./pages/dashboard/Api'));
const Tutorials = lazy(() => import('./pages/dashboard/Tutorials'));
const Account = lazy(() => import('./pages/dashboard/Account'));
const TransactionCallback = lazy(() => import('./pages/dashboard/TransactionCallback'));
const PaymentCallback = lazy(() => import('./pages/dashboard/PaymentCallback'));
const VirtualNumbers = lazy(() => import('./pages/dashboard/VirtualNumbers'));
const BoostFollowers = lazy(() => import('./pages/dashboard/BoostFollowers'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageApiProviders = lazy(() => import('./pages/admin/ManageApiProviders'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const AdminUserView = lazy(() => import('./pages/admin/AdminUserView'));
const AdminUserEdit = lazy(() => import('./pages/admin/AdminUserEdit'));
const AddSubtractBalance = lazy(() => import('./pages/admin/AddSubtractBalance'));
const ManageUserOrders = lazy(() => import('./pages/admin/ManageUserOrders'));
const ManageUserTransactions = lazy(() => import('./pages/admin/ManageUserTransactions'));
const ManageTransactions = lazy(() => import('./pages/admin/ManageTransactions'));
const SendMailAll = lazy(() => import('./pages/admin/SendMailAll'));
const SendEmailForm = lazy(() => import('./pages/admin/SendEmailForm'));
const AddServicesPage = lazy(() => import('./pages/admin/AddServicesPage'));
const ShowServices = lazy(() => import('./pages/admin/ShowServices'));
const AdminTickets = lazy(() => import('./pages/admin/Tickets'));
const AdminUpdates = lazy(() => import('./pages/admin/Updates'));
const ShowOrders = lazy(() => import('./pages/admin/ShowOrders'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const BulkPriceIncrease = lazy(() => import('./pages/admin/BulkPriceIncrease'));
const VirtualNumberPricing = lazy(() => import('./pages/admin/VirtualNumberPricing'));
const VirtualNumberSettings = lazy(() => import('./pages/admin/VirtualNumberSettings'));





const Layout = ({ children }) => {
  const location = useLocation();
  const showLayout = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/services", "/about", "/terms", "/faq", "/contact"].includes(location.pathname);

  useEffect(() => {
    const loader = document.getElementById('root-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  return (
    <>
      {showLayout && <Navbar />}
      <Suspense fallback={null}>
        {children}
      </Suspense>
      {showLayout && <Footer />}
    </>
  );
};


const App = () => {
  useEffect(() => {
    getSiteSettings().then(settings => {
      if (settings?.font_family && settings.font_family !== 'Fredoka') {
        // Dynamically load the custom font only when it differs from default
        const fontMap = {
          'Poppins':     'Poppins:wght@400;500;600;700',
          'Nunito Sans': 'Nunito+Sans:wght@400;600;700',
          'Roboto Slab': 'Roboto+Slab:wght@400;700',
          'Sahitya':     'Sahitya:wght@400;700',
        };
        const fontQuery = fontMap[settings.font_family];
        if (fontQuery && !document.querySelector(`link[data-font="${settings.font_family}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`;
          link.setAttribute('data-font', settings.font_family);
          document.head.appendChild(link);
        }
        document.body.style.fontFamily = `'${settings.font_family}', sans-serif`;
      }
    }).catch(() => {});
  }, []);

  return (
    <Router> 
      <Toaster position="top-right" reverseOrder={false} />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/signup" element={<SignUpPage />} />
           <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/payment/callback" element={<TransactionCallback />} />
          <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<NewOrder />} />
            <Route path="updates" element={<Updates />} />
            <Route path="add-funds" element={<AddFunds />} />
            <Route path="payment/callback" element={<PaymentCallback />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="mass-order" element={<MassOrder />} />
            <Route path="child-panel" element={<ChildPanel />} />
            <Route path="affiliate" element={<Affiliate />} />
            <Route path="services" element={<Services />} />
            <Route path="support" element={<Support />} />
            <Route path="api" element={<API />} />
            <Route path="tutorials" element={<Tutorials />} />
            <Route path="notifications" element={<GeneralNotification />} />
            <Route path="account" element={<Account />} />
            <Route path="virtual-numbers" element={<VirtualNumbers />} />
            <Route path="boost-followers" element={<BoostFollowers />} />

           
            

          </Route> 
          <Route path="/admin" element={
            <AdminRoutes>
              <AdminLayout />
            </AdminRoutes>
          }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="add-services" element={<AddServicesPage />} />
            <Route path="show-services" element={<ShowServices />} />
            <Route path="orders" element={<ShowOrders />} />
            <Route path="api-providers" element={<ManageApiProviders />} />
            <Route path="transactions" element={<ManageTransactions />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="updates" element={<AdminUpdates />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="users/:id/View" element={<AdminUserView />} />
            <Route path="users/:id/Edit" element={<AdminUserEdit />} />
            <Route path="users/:id/balance" element={<AddSubtractBalance />} />
            <Route path="users/:id/orders" element={<ManageUserOrders />} />
            <Route path="users/:id/transactions" element={<ManageUserTransactions />} />
            <Route path="users/:id/send-email" element={<SendEmailForm />} />
            <Route path="send-mail" element={<SendMailAll />} />
            <Route path="bulk-price-increase" element={<BulkPriceIncrease />} />
            <Route path="virtual-number-pricing" element={<VirtualNumberPricing />} />
            <Route path="vn-settings" element={<VirtualNumberSettings />} />
          </Route>
        
        </Routes>
      </Layout>
      <WhatsAppButton />
    </Router>
  );
};


export default App;