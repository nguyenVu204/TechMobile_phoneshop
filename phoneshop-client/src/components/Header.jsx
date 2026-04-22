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
  Menu,
  X,
  Home,
  Store,
  Gift,
  Newspaper,
  PhoneCall
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useCartStore from "../stores/useCartStore";
import useAuthStore from "../stores/useAuthStore";
import { useState, useEffect } from "react";

export default function Header() {
  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Đóng mobile menu khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 shadow-md">
      
      {/* ─── TẦNG 1: XANH PREMIUM (LOGO, TÌM KIẾM, TÀI KHOẢN) ─── */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center gap-4">
            
            {/* LFET: Mobile Menu Toggle & LOGO */}
            <div className="flex items-center gap-3">
              <button 
                className="lg:hidden p-1.5 text-white hover:bg-white/20 rounded-lg transition"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={26} />
              </button>

              <Link to="/" className="flex items-center space-x-2 group shrink-0">
                <div className="bg-white text-blue-600 p-1.5 rounded-xl shadow-md group-hover:scale-105 transition-transform">
                  <Smartphone size={26} strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-black tracking-tight hidden sm:block">
                  TechMobile
                </span>
              </Link>
            </div>

            {/* CENTER: THANH TÌM KIẾM TO Ở CHÍNH GIỮA (Desktop & Tablet) */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[500px] xl:max-w-[700px] relative mx-4">
              <input
                type="text"
                placeholder="Bạn muốn tìm điện thoại nào hôm nay?"
                className="w-full pl-5 pr-14 py-2.5 bg-white text-gray-800 border-none rounded-xl font-medium text-sm focus:outline-none focus:ring-4 focus:ring-blue-400/30 transition-shadow shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors flex items-center justify-center shadow-sm">
                <Search size={18} />
              </button>
            </form>

            {/* RIGHT: GIỎ HÀNG & TÀI KHOẢN */}
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              
              {/* Giỏ hàng */}
              <Link to="/cart" className="relative flex items-center gap-2 p-2 px-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10">
                <ShoppingCart size={22} />
                <span className="hidden lg:block text-sm font-bold">Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-blue-600 shadow-md">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Tài khoản */}
              {user ? (
                <div className="relative group py-2">
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-colors border border-white/10">
                    <div className="w-8 h-8 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-sm shadow-inner">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden xl:flex flex-col text-left">
                      <span className="text-[10px] text-blue-100 leading-none mb-1">Xin chào,</span>
                      <div className="flex items-center gap-1 leading-none">
                        <span className="text-sm font-bold truncate max-w-[100px]">{user.fullName}</span>
                        <ChevronDown size={14} className="text-white/80 group-hover:rotate-180 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>

                  {/* Dropdown Menu (Nền trắng, chữ đen) */}
                  <div className="absolute right-0 top-[100%] w-64 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-3 z-50 text-slate-800">
                    {/* Mũi tên chỉ lên */}
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-gray-100 transform rotate-45"></div>

                    <div className="relative bg-white rounded-2xl overflow-hidden">
                      <div className="p-4 border-b border-gray-50 bg-slate-50/50">
                        <p className="text-sm font-bold text-slate-800 truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="p-2 space-y-0.5">
                        <Link to="/my-orders" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition font-semibold">
                          <Package size={18} /> Lịch sử đơn hàng
                        </Link>
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition font-semibold">
                          <UserCircle size={18} /> Thông tin tài khoản
                        </Link>
                        <Link to="/favorites" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition font-semibold">
                          <Heart size={18} /> Sản phẩm yêu thích
                        </Link>
                        {user.role && user.role.includes("Admin") && (
                          <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm text-purple-600 hover:bg-purple-50 rounded-xl transition font-bold mt-1">
                            <Smartphone size={18} /> Trang quản trị
                          </Link>
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition font-bold">
                          <LogOut size={18} /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-md shrink-0">
                  <User size={18} />
                  <span className="hidden md:inline">Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>

          {/* MOBILE SEARCH BAR (Dòng 2 trên điện thoại) */}
          <form onSubmit={handleSearch} className="flex md:hidden relative mt-3 w-full">
              <input
                type="text"
                placeholder="Bạn tìm gì hôm nay?"
                className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-800 border-none rounded-xl font-medium text-sm focus:outline-none shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="absolute left-3 top-2.5 text-gray-400">
                <Search size={18} />
              </button>
          </form>

        </div>
      </div>

      {/* ─── TẦNG 2: THANH MENU TRẮNG (Chỉ hiện trên Desktop) ─── */}
      <div className="hidden lg:block bg-white border-b border-gray-100">
         <div className="container mx-auto px-4">
            <nav className="flex items-center justify-center gap-10 py-3 text-[15px] font-bold text-slate-600">
              <Link to="/" className={`flex items-center gap-2 hover:text-blue-600 transition ${isActive('/') ? 'text-blue-600' : ''}`}>
                <Home size={18}/> Trang chủ
              </Link>
              <Link to="/shop" className={`flex items-center gap-2 hover:text-blue-600 transition ${isActive('/shop') ? 'text-blue-600' : ''}`}>
                <Store size={18}/> Điện thoại
              </Link>
              <Link to="/shop?sort=price_asc" className="flex items-center gap-2 text-red-600 hover:text-red-700 transition relative">
                <Gift size={18}/> Khuyến mãi HOT
                <span className="absolute -top-2.5 -right-3 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">SALE</span>
              </Link>
              <Link to="/news" className={`flex items-center gap-2 hover:text-blue-600 transition ${isActive('/news') ? 'text-blue-600' : ''}`}>
                <Newspaper size={18}/> Tin tức công nghệ
              </Link>
              <Link to="/contact" className={`flex items-center gap-2 hover:text-blue-600 transition ${isActive('/contact') ? 'text-blue-600' : ''}`}>
                <PhoneCall size={18}/> Liên hệ hỗ trợ
              </Link>
            </nav>
         </div>
      </div>

      {/* ─── MOBILE MENU (Trượt từ trái sang) ─── */}
      <div className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={() => setIsMobileMenuOpen(false)}>
        <div 
            className={`absolute top-0 left-0 w-[280px] h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out transform flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            onClick={e => e.stopPropagation()}
        >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                        <Smartphone size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-xl font-black text-slate-800">TechMobile</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white rounded-full text-gray-500 shadow-sm border border-gray-100">
                    <X size={20}/>
                </button>
            </div>

            {/* Mobile Links */}
            <nav className="p-3 flex-1 overflow-y-auto space-y-1">
                <Link to="/" className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Home size={20}/> Trang chủ
                </Link>
                <Link to="/shop" className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${isActive('/shop') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Store size={20}/> Điện thoại
                </Link>
                <Link to="/shop?sort=price_asc" className="flex items-center gap-3 p-3 rounded-xl font-bold text-red-600 bg-red-50/50 hover:bg-red-50 transition">
                    <Gift size={20}/> Khuyến mãi HOT
                </Link>
                <Link to="/news" className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${isActive('/news') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Newspaper size={20}/> Tin công nghệ
                </Link>
                <Link to="/contact" className={`flex items-center gap-3 p-3 rounded-xl font-bold transition ${isActive('/contact') ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <PhoneCall size={20}/> Liên hệ hỗ trợ
                </Link>
            </nav>

            {/* Mobile Footer Area */}
            {!user && (
                <div className="p-5 border-t border-gray-100 bg-slate-50">
                    <Link to="/login" className="flex justify-center items-center gap-2 w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200">
                        <User size={20}/> Đăng nhập / Đăng ký
                    </Link>
                </div>
            )}
        </div>
      </div>
    </header>
  );
}