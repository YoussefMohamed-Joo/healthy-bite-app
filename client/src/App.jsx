import { Routes, Route } from 'react-router-dom'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import AdminRoute from '@/components/AdminRoute'
import AdminLayout from '@/components/AdminLayout'
import Home from '@/pages/Home'
import Menu from '@/pages/Menu'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import FAQ from '@/pages/FAQ'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Plans from '@/pages/Plans'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import Terms from '@/pages/Terms'
import Privacy from '@/pages/Privacy'
import RefundPolicy from '@/pages/RefundPolicy'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminProducts from '@/pages/admin/Products'
import AdminOrders from '@/pages/admin/Orders'
import AdminCurrentOrders from '@/pages/admin/CurrentOrders'
import AdminCustomers from '@/pages/admin/Customers'
import AdminCustomerDetail from '@/pages/admin/CustomerDetail'
import AdminAppDownloads from '@/pages/admin/AppDownloads'
import AdminFaq from '@/pages/admin/Faq'
import AdminSiteSettings from '@/pages/admin/SiteSettings'
import AdminPaymentVerification from '@/pages/admin/PaymentVerification'
import AdminPlans from '@/pages/admin/Plans'
import AdminTestimonials from '@/pages/admin/Testimonials'
import AdminCoupons from '@/pages/admin/Coupons'
import AdminChats from '@/pages/admin/Chats'
import AdminAiAssistant from '@/pages/admin/AiAssistant'
import MyOrders from '@/pages/MyOrders'
import Profile from '@/pages/Profile'
import OrderNotification from '@/components/OrderNotification'
import ChatWidget from '@/components/ChatWidget'
import AppManager from '@/components/AppPromotionBanner'
import UpdateOverlay from '@/components/UpdateOverlay'


export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <ChatWidget />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin — protected by AdminRoute */}
          <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
          <Route path="/admin/current-orders" element={<AdminRoute><AdminLayout><AdminCurrentOrders /></AdminLayout></AdminRoute>} />
          <Route path="/admin/customers" element={<AdminRoute><AdminLayout><AdminCustomers /></AdminLayout></AdminRoute>} />
          <Route path="/admin/customers/:id" element={<AdminRoute><AdminLayout><AdminCustomerDetail /></AdminLayout></AdminRoute>} />
          <Route path="/admin/downloads" element={<AdminRoute><AdminLayout><AdminAppDownloads /></AdminLayout></AdminRoute>} />
          <Route path="/admin/faq" element={<AdminRoute><AdminLayout><AdminFaq /></AdminLayout></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSiteSettings /></AdminLayout></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminLayout><AdminPaymentVerification /></AdminLayout></AdminRoute>} />
          <Route path="/admin/plans" element={<AdminRoute><AdminLayout><AdminPlans /></AdminLayout></AdminRoute>} />
          <Route path="/admin/testimonials" element={<AdminRoute><AdminLayout><AdminTestimonials /></AdminLayout></AdminRoute>} />
          <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><AdminCoupons /></AdminLayout></AdminRoute>} />
          <Route path="/admin/chats" element={<AdminRoute><AdminLayout><AdminChats /></AdminLayout></AdminRoute>} />
          <Route path="/admin/ai" element={<AdminRoute><AdminLayout><AdminAiAssistant /></AdminLayout></AdminRoute>} />
        </Routes>
        <OrderNotification />
        <AppManager />
        <UpdateOverlay />
      </CartProvider>
    </AuthProvider>
  )
}
