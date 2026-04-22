import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useEffect } from "react";
import useFavoriteStore from "./stores/useFavoriteStore";
import useAuthStore from "./stores/useAuthStore";
import Header from "./components/Header";
import Footer from './components/Footer';
import HomePage from "./pages/HomePage";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import AdminRoute from "./components/AdminRoute";
import OrderManager from "./pages/admin/OrderManager";
import ProductManager from "./pages/admin/ProductManager";
import ProductCreate from "./pages/admin/ProductCreate";
import ProductEdit from "./pages/admin/ProductEdit";
import UserManager from "./pages/admin/UserManager";
import BrandManager from "./pages/admin/BrandManager";
import InvoicePage from "./pages/admin/InvoicePage";
import FavoritesPage from "./pages/FavoritesPage";
import UserInfoPage from "./pages/UserInfoPage";
import ShopPage from './pages/ShopPage';
import PaymentResultPage from './pages/PaymentResultPage';
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NewsManager from './pages/admin/NewsManager';
import NewsCreate from './pages/admin/NewsCreate';
import NewsEdit from './pages/admin/NewsEdit';
import NewsPage from './pages/NewsPage';
import NewsDetail from './pages/NewsDetail';
import NewsCategoryManager from "./pages/admin/NewsCategoryManager";
import ConfirmEmail from "./pages/ConfirmEmail";
import ChatBox from "./components/ChatBox";
import InventoryManager from "./pages/admin/InventoryManager";

function App() {
  const { user } = useAuthStore();
  const fetchFavorites = useFavoriteStore((state) => state.fetchFavorites);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>

        {/* User */}
        <Route
          element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main>
                <Outlet />
              </main>
              <Footer />
              <ChatBox />
            </div>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/history" element={<OrderHistoryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route
            path="/profile"
            element={
              <div className="pt-16">
                <UserInfoPage />
              </div>
            }
          />

          <Route
            path="/my-orders"
            element={
              <div className="pt-16">
                <OrderHistoryPage />
              </div>
            }
          />
        </Route>

        <Route path="/my-orders/:id/invoice" element={<InvoicePage />} />

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />{" "}
            <Route path="orders" element={<OrderManager />} />
            <Route path="products" element={<ProductManager />} />
            <Route path="products/create" element={<ProductCreate />} />
            <Route path="products/edit/:id" element={<ProductEdit />} />
            <Route path="users" element={<UserManager />} />
            <Route path="brands" element={<BrandManager />} />
            <Route path="orders/:id/invoice" element={<InvoicePage />} />
            <Route path="news" element={<NewsManager />} />
            <Route path="news/create" element={<NewsCreate />} />
            <Route path="news/edit/:id" element={<NewsEdit />} />
            <Route path="news/categories" element={<NewsCategoryManager />} />
            <Route path="inventory" element={<InventoryManager />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
