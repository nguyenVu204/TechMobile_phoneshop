import {
  ShoppingCart,
  Smartphone,
  User,
  LogOut,
  Search,
  Package,
  ChevronDown,
  UserCircle,
  Heart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../stores/useCartStore";
import useAuthStore from "../stores/useAuthStore";
import { useState } from "react";

export default function Header() {
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Điều hướng sang trang Shop với tham số search
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        {/* LOGO & SEARCH */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-blue-600 hover:opacity-80 transition"
        >
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Smartphone size={24} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            PhoneShop
          </span>
        </Link>

        {/* Form Search ở Header */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-lg mx-8 relative"
        >
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="absolute left-3 top-2.5 text-gray-400"
          >
            <Search size={18} />
          </button>
        </form>

        {/* ICONS AREA */}
        <div className="flex items-center space-x-6">
          <Link
            to="/cart"
            className="relative group p-2 hover:bg-slate-100 rounded-full transition"
          >
            <ShoppingCart
              size={24}
              className="text-slate-600 group-hover:text-blue-600"
            />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Link to="/news" className="text-gray-600 hover:text-blue-600 font-medium">Tin tức</Link>

          {user ? (
            // --- DROPDOWN MENU USER ---
            <div className="relative group py-4">
              {/* Trigger: Tên người dùng */}
              <Link
                to="/profile"
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {user.fullName?.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs text-gray-500">Xin chào,</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold text-slate-800 max-w-[100px] truncate">
                      {user.fullName}
                    </p>
                    <ChevronDown
                      size={14}
                      className="text-gray-400 group-hover:rotate-180 transition-transform duration-300"
                    />
                  </div>
                </div>
              </Link>

              {/* Dropdown Body */}
              <div className="absolute right-0 top-[90%] w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                {/* Mũi tên nhọn chỉ lên */}
                <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>

                <div className="relative bg-white rounded-xl overflow-hidden">
                  {/* Header Dropdown */}
                  <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/my-orders"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                    >
                      <Package size={18} />
                      Lịch sử đơn hàng
                    </Link>

                    <Link
                      to="/profile" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                    >
                      <UserCircle size={18} />
                      Thông tin tài khoản
                    </Link>

                    <Link
                      to="/favorites"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                    >
                      <Heart size={18} />
                      Sản phẩm yêu thích
                    </Link>

                    {/* Link Admin*/}
                    {user.role && user.role.includes("Admin") && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50 transition font-bold"
                      >
                        <Smartphone size={18} />
                        Trang quản trị
                      </Link>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition font-medium"
                    >
                      <LogOut size={18} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
            >
              <User size={18} />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
