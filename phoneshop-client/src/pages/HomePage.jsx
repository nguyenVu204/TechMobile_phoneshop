import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, Heart, ArrowRight, Truck, ShieldCheck, 
  Headphones, RefreshCw, Zap, Star, ChevronRight, ChevronLeft,
  Store, Info, Phone, LayoutGrid, Tag, TrendingUp, Award,
  Clock, Gift, Percent, Eye, Search, Bell, Sparkles, Newspaper
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import useFavoriteStore from '../stores/useFavoriteStore';
import NewsCard from "../components/NewsCard";

/* ─── COUNTDOWN TIMER ─── */
function CountdownTimer({ targetHours = 8 }) {
  const [time, setTime] = useState({ h: targetHours, m: 0, s: 0 });
  useEffect(() => {
    const tick = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev;
        if (s > 0) return { h, m, s: s - 1 };
        if (m > 0) return { h, m: m - 1, s: 59 };
        if (h > 0) return { h: h - 1, m: 59, s: 59 };
        return { h: 0, m: 0, s: 0 };
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);
  const pad = n => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="bg-gray-900 text-white font-mono font-black text-sm px-2 py-1 rounded-md min-w-[32px] text-center tabular-nums">{v}</span>
          {i < 2 && <span className="text-gray-900 font-black text-sm">:</span>}
        </span>
      ))}
    </div>
  );
}

/* ─── PRODUCT CARD ─── */
function ProductCard({ product, label, labelColor, badge }) {
  const { favoriteIds, toggleFavorite } = useFavoriteStore();
  const [viewed, setViewed] = useState(false);
  const isFav = favoriteIds.includes(product.id);

  return (
    <Link to={`/product/${product.id}`} className="group h-full block" onMouseEnter={() => setViewed(true)}>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-blue-100/60 transition-all duration-500 border border-gray-100 h-full flex flex-col relative overflow-hidden hover:-translate-y-2">
        
        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
          style={{ background: "linear-gradient(135deg, transparent 40%, rgba(59,130,246,0.04) 100%)" }} />

        {/* Heart Button */}
        <button
          onClick={e => { e.preventDefault(); toggleFavorite(product.id); }}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow-md border transition-all duration-300 ${isFav ? 'bg-red-500 border-red-500' : 'bg-white/90 border-gray-100 hover:border-red-200'}`}
        >
          <Heart size={16} className={isFav ? "fill-white text-white" : "text-gray-400 group-hover:text-red-400"} />
        </button>

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 z-20">
            <span className={`text-white text-[9px] font-black px-2 py-1 rounded-full tracking-wider shadow-md ${labelColor || 'bg-blue-500'}`}>
              {label}
            </span>
          </div>
        )}

        {/* Image */}
        <div className="relative h-52 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden rounded-t-2xl">
          {product.thumbnail
            ? <img src={product.thumbnail} alt={product.name}
                className="h-40 object-contain group-hover:scale-115 transition-transform duration-700 drop-shadow-lg" />
            : <span className="text-gray-300 text-xs">No image</span>}
          
          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300 flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100">
            <span className="bg-white/90 backdrop-blur-sm text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Eye size={10}/> Xem nhanh
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col p-4">
          <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">{product.brandName}</p>
          <h3 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 mb-2">
            {product.name}
          </h3>
          
          {/* Stars */}
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={11} className="fill-amber-400 text-amber-400"/>
            ))}
            <span className="text-[10px] text-gray-400 ml-1">(120)</span>
          </div>

          {/* Price row */}
          <div className="mt-auto flex items-center justify-between">
            <div>
              <div className="text-red-500 font-black text-xl leading-tight">
                {product.minPrice?.toLocaleString("vi-VN")}₫
              </div>
              <div className="text-gray-400 text-[10px] line-through">
                {Math.round(product.minPrice * 1.15).toLocaleString("vi-VN")}₫
              </div>
            </div>
            <button
              onClick={e => e.preventDefault()}
              className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-200 group-hover:shadow-md"
            >
              <ShoppingCart size={17} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── HORIZONTAL SCROLL SECTION ─── */
function ScrollSection({ title, icon: Icon, iconColor, link, linkText, children, badge }) {
  const ref = useRef(null);
  const scroll = dir => {
    if (ref.current) ref.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };
  return (
    <div className="mb-14">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {Icon && <div className={`w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center`}><Icon size={18} className="text-white"/></div>}
          <h2 className="text-xl font-black text-gray-900">{title}</h2>
          {badge && <span className="text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-red-600 animate-pulse">{badge}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll(-1)} className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition shadow-sm">
            <ChevronLeft size={16}/>
          </button>
          <button onClick={() => scroll(1)} className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition shadow-sm">
            <ChevronRight size={16}/>
          </button>
          {link && <Link to={link} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5 ml-1">{linkText} <ChevronRight size={13}/></Link>}
        </div>
      </div>
      <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {children}
      </div>
    </div>
  );
}

/* ─── HERO BANNER SLIDES ─── */
const heroSlides = [
  {
    tag: "FLAGSHIP 2024", tagColor: "bg-yellow-400 text-black",
    title: "iPhone 16 Pro Max", sub: "Titanium Edition",
    desc: "Chip A18 Pro • Camera 48MP ProRes • Action Button",
    cta: "Mua ngay", ctaLink: "/shop?search=iphone",
    from: "#0f172a", to: "#1e3a8a",
    img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=2070&auto=format&fit=crop",
    accent: "#3b82f6"
  },
  {
    tag: "GALAXY AI", tagColor: "bg-purple-400 text-white",
    title: "Samsung S25 Ultra", sub: "Galaxy Intelligence",
    desc: "Snapdragon 8 Elite • S Pen tích hợp • AI Camera 200MP",
    cta: "Khám phá", ctaLink: "/shop?search=samsung",
    from: "#1a0533", to: "#4c1d95",
    img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2070&auto=format&fit=crop",
    accent: "#a855f7"
  },
  {
    tag: "HOT DEAL -30%", tagColor: "bg-red-500 text-white",
    title: "Xiaomi 15 Pro", sub: "Leica Optics",
    desc: "Snapdragon 8 Elite • Sạc 90W HyperCharge • Leica Summilux",
    cta: "Săn deal", ctaLink: "/shop?search=xiaomi",
    from: "#1c0505", to: "#7f1d1d",
    img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2070&auto=format&fit=crop",
    accent: "#ef4444"
  }
];

function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timeoutRef = useRef(null);

  const goTo = useCallback(idx => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, 400);
  }, [animating]);

  useEffect(() => {
    timeoutRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timeoutRef.current);
  }, []);

  const slide = heroSlides[current];

  return (
    <div className="relative rounded-3xl overflow-hidden mb-4 h-[420px] md:h-[480px] shadow-2xl" style={{ background: `linear-gradient(135deg, ${slide.from}, ${slide.to})` }}>
      {/* Background image */}
      <div className="absolute inset-0 transition-opacity duration-700"
        style={{ backgroundImage: `url(${slide.img})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25 }} />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${slide.from}ee 50%, transparent 100%)` }} />
      
      {/* Decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full opacity-10" style={{ background: slide.accent, filter: 'blur(60px)' }} />
      <div className="absolute bottom-[-60px] right-[20%] w-64 h-64 rounded-full opacity-10" style={{ background: slide.accent, filter: 'blur(40px)' }} />

      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col justify-center px-8 md:px-14 transition-all duration-500 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black tracking-widest mb-4 w-fit ${slide.tagColor}`}>
          {slide.tag}
        </span>
        <h1 className="text-white font-black text-4xl md:text-6xl leading-none mb-1">{slide.title}</h1>
        <p className="font-medium text-xl md:text-2xl mb-3" style={{ color: slide.accent }}>{slide.sub}</p>
        <p className="text-white/70 text-sm mb-7 max-w-xs">{slide.desc}</p>
        <Link to={slide.ctaLink}
          className="inline-flex items-center gap-2 text-gray-900 font-black px-7 py-3.5 rounded-full w-fit shadow-xl hover:scale-105 transition-transform duration-200"
          style={{ background: 'white' }}>
          {slide.cta} <ArrowRight size={17}/>
        </Link>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-5 left-8 flex gap-2">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === current ? 28 : 8, background: i === current ? 'white' : 'rgba(255,255,255,0.35)' }} />
        ))}
      </div>

      {/* Arrows */}
      <button onClick={() => goTo((current - 1 + heroSlides.length) % heroSlides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/15 backdrop-blur-sm rounded-full text-white flex items-center justify-center hover:bg-white/30 transition">
        <ChevronLeft size={18}/>
      </button>
      <button onClick={() => goTo((current + 1) % heroSlides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/15 backdrop-blur-sm rounded-full text-white flex items-center justify-center hover:bg-white/30 transition">
        <ChevronRight size={18}/>
      </button>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const navigate = useNavigate();
  const [newProducts, setNewProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBrand, setActiveBrand] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [brandsRes, newRes, hotRes, newsRes] = await Promise.all([
          axiosClient.get('/brands'),
          axiosClient.get('/products?page=1&limit=8&sort=newest'),
          axiosClient.get('/products?page=1&limit=8&sort=price_asc'),
          axiosClient.get('/news?page=1&limit=3'),
        ]);
        setBrands(brandsRes.data);
        setNewProducts(newRes.data.items);
        setHotProducts(hotRes.data.items);
        setLatestNews(newsRes.data.items);
      } catch (e) {
        console.error("Lỗi tải trang chủ", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const LoadingCards = ({ count = 4 }) => (
    <div className="flex gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-w-[220px] h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse flex-shrink-0" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white text-xs font-semibold text-center py-2.5 tracking-wide flex items-center justify-center gap-2">
        <Gift size={13}/> Miễn phí vận chuyển cho đơn từ 5 triệu — Bảo hành 12 tháng chính hãng
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-black ml-1">MỚI</span>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6">

        {/* ── SEARCH BAR QUICK ACCESS ── */}
        <div className="relative mb-6 md:hidden">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-400 shadow-sm"
            placeholder="Tìm kiếm điện thoại, thương hiệu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(`/shop?search=${searchQuery}`)}
          />
        </div>

        {/* ── HERO BANNER + SIDE BANNERS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2">
            <HeroBanner />
          </div>

          <div className="flex flex-col gap-4">
            {/* Side banner 1 */}
            <div className="flex-1 rounded-2xl overflow-hidden relative group cursor-pointer min-h-[140px]" style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
              onClick={() => navigate('/shop?search=oppo')}>
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition bg-[url('https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?q=80&w=800')] bg-cover bg-center"/>
              <div className="relative z-10 p-5 h-full flex flex-col justify-center">
                <span className="text-purple-200 text-[10px] font-black tracking-widest mb-1">OPPO SERIES</span>
                <h3 className="text-white font-black text-lg leading-tight mb-1">Find X8 Pro</h3>
                <p className="text-purple-200 text-xs mb-3">Hasselblad Camera</p>
                <span className="text-white text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">Xem ngay <ArrowRight size={12}/></span>
              </div>
              <div className="absolute bottom-[-20px] right-[-20px] w-28 h-28 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700"/>
            </div>

            {/* Side banner 2 */}
            <div className="flex-1 rounded-2xl overflow-hidden relative group cursor-pointer min-h-[140px]" style={{ background: 'linear-gradient(135deg, #dc2626, #ea580c)' }}
              onClick={() => navigate('/shop?search=realme')}>
              <div className="relative z-10 p-5 h-full flex flex-col justify-center">
                <span className="bg-white text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full w-fit mb-2">SALE UP TO 40%</span>
                <h3 className="text-white font-black text-lg leading-tight mb-1">Realme GT 6</h3>
                <p className="text-red-100 text-xs mb-3">Sạc siêu nhanh 120W</p>
                <span className="text-white text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all">Mua ngay <ArrowRight size={12}/></span>
              </div>
              <div className="absolute top-[-30px] right-[-30px] w-32 h-32 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700"/>
            </div>
          </div>
        </div>

        {/* ── SERVICE BADGES ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { icon: Truck, label: "Miễn phí vận chuyển", sub: "Đơn từ 5 triệu", color: "bg-blue-500", light: "bg-blue-50 text-blue-700" },
            { icon: ShieldCheck, label: "Bảo hành chính hãng", sub: "12 tháng", color: "bg-green-500", light: "bg-green-50 text-green-700" },
            { icon: RefreshCw, label: "Đổi trả 30 ngày", sub: "Lỗi nhà sản xuất", color: "bg-orange-500", light: "bg-orange-50 text-orange-700" },
            { icon: Headphones, label: "Hỗ trợ 24/7", sub: "Hotline: 1900 xxxx", color: "bg-purple-500", light: "bg-purple-50 text-purple-700" },
          ].map(({ icon: Icon, label, sub, color, light }, i) => (
            <div key={i} className={`flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group cursor-default`}>
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon size={18} className="text-white"/>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-xs">{label}</p>
                <p className="text-gray-400 text-[10px]">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── BRAND FILTER ── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Award size={20} className="text-amber-500"/> Thương hiệu
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveBrand("all")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${activeBrand === "all" ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
              Tất cả
            </button>
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => setActiveBrand(brand.id)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border ${activeBrand === brand.id ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── FLASH SALE ── */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                <Zap size={18} className="text-white fill-white"/>
              </div>
              <h2 className="text-xl font-black text-gray-900">Flash Sale</h2>
              <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-600 animate-pulse">ĐANG DIỄN RA</span>
              <CountdownTimer targetHours={5}/>
            </div>
            <Link to="/shop?sort=price_asc" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5">
              Xem tất cả <ChevronRight size={13}/>
            </Link>
          </div>

          {loading ? <LoadingCards count={4}/> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {hotProducts.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} label="FLASH SALE" labelColor="bg-red-500" badge />
              ))}
            </div>
          )}
        </div>

        {/* ── PROMO BANNER STRIP ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Percent, label: "Trả góp 0%", sub: "12 tháng, không lãi suất", color: "from-blue-500 to-cyan-500" },
            { icon: Gift, label: "Tặng quà hấp dẫn", sub: "Kèm tai nghe & ốp lưng", color: "from-purple-500 to-pink-500" },
            { icon: Bell, label: "Thông báo giảm giá", sub: "Đăng ký nhận ưu đãi", color: "from-amber-500 to-orange-500" },
          ].map(({ icon: Icon, label, sub, color }, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${color} text-white shadow-md cursor-pointer hover:scale-[1.02] transition-transform duration-200`}>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-white"/>
              </div>
              <div>
                <p className="font-black text-sm">{label}</p>
                <p className="text-white/80 text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── QUICK NAV CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { to: "/shop", icon: Store, label: "Cửa hàng", desc: "Xem tất cả sản phẩm", accent: "blue" },
            { to: "/about", icon: Info, label: "Về chúng tôi", desc: "Câu chuyện thương hiệu", accent: "green" },
            { to: "/contact", icon: Phone, label: "Liên hệ", desc: "Hỗ trợ 24/7", accent: "purple" },
          ].map(({ to, icon: Icon, label, desc, accent }, i) => (
            <Link key={i} to={to}
              className={`flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-${accent}-200 transition group`}>
              <div className={`w-11 h-11 rounded-xl bg-${accent}-50 text-${accent}-600 flex items-center justify-center group-hover:bg-${accent}-600 group-hover:text-white transition-all duration-300`}>
                <Icon size={22}/>
              </div>
              <div>
                <h3 className={`font-black text-gray-800 group-hover:text-${accent}-600 transition text-sm`}>{label}</h3>
                <p className="text-gray-400 text-xs">{desc}</p>
              </div>
              <ChevronRight size={15} className={`ml-auto text-gray-300 group-hover:text-${accent}-500 transition`}/>
            </Link>
          ))}
        </div>

        {/* ── NEW ARRIVALS ── */}
        <ScrollSection title="Sản phẩm mới về" icon={Sparkles} iconColor="bg-blue-500" link="/shop?sort=newest" linkText="Xem tất cả" badge="NEW">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="min-w-[220px] h-80 bg-gray-100 rounded-2xl animate-pulse flex-shrink-0"/>)
            : newProducts.map(p => (
              <div key={p.id} className="min-w-[220px] max-w-[220px] flex-shrink-0">
                <ProductCard product={p} label="NEW" labelColor="bg-blue-500" badge/>
              </div>
            ))}
        </ScrollSection>

        {/* ── HOT DEALS ── */}
        <ScrollSection title="Giá Tốt Hôm Nay" icon={TrendingUp} iconColor="bg-red-500" link="/shop?sort=price_asc" linkText="Xem tất cả" badge="HOT">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="min-w-[220px] h-80 bg-gray-100 rounded-2xl animate-pulse flex-shrink-0"/>)
            : hotProducts.map(p => (
              <div key={p.id} className="min-w-[220px] max-w-[220px] flex-shrink-0">
                <ProductCard product={p} label="GIÁ TỐT" labelColor="bg-red-500" badge/>
              </div>
            ))}
        </ScrollSection>

        {/* ── BIG PROMO BANNER ── */}
        <div className="relative rounded-3xl overflow-hidden mb-10 h-64 md:h-72 group cursor-pointer" onClick={() => navigate('/shop')}
          style={{ background: 'linear-gradient(120deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)' }}>
          <div className="absolute inset-0 bg-[url('https://plus.unsplash.com/premium_photo-1680985551009-05107cd2752c?q=80&w=1632&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:scale-105 transition-transform duration-1000"/>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(15,23,42,0.95) 50%, transparent)' }}/>
          
          {/* Glow effects */}
          <div className="absolute top-[-50px] right-[30%] w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: '#3b82f6' }}/>
          
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-14">
            <span className="text-blue-400 font-black tracking-[0.2em] text-xs mb-3 block">LIMITED TIME OFFER</span>
            <h2 className="text-white font-black text-3xl md:text-5xl leading-tight mb-3">
              Nâng cấp dế yêu<br/>
              <span className="text-yellow-400">Tiết kiệm đến 50%</span>
            </h2>
            <p className="text-white/60 text-sm mb-6 max-w-sm">Hàng nghìn sản phẩm giảm giá sốc — Chỉ trong thời gian có hạn</p>
            <button className="inline-flex items-center gap-2 bg-white text-gray-900 font-black px-8 py-3 rounded-full w-fit hover:bg-yellow-400 transition-colors duration-300 shadow-xl">
              Săn Deal Ngay <ArrowRight size={16}/>
            </button>
          </div>
        </div>

        {/* ── LATEST NEWS (TIN TỨC CÔNG NGHỆ) ── */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Newspaper size={24} className="text-blue-600"/> Tin tức công nghệ
            </h2>
            <Link to="/news" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={16}/>
            </Link>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-2xl"></div>)}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNews.map(item => (
                <div key={item.id} className="h-full">
                  <NewsCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── FOOTER TRUST BADGES ── */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {[
            { icon: ShieldCheck, label: "Hàng chính hãng" },
            { icon: Truck, label: "Giao nhanh 2h" },
            { icon: RefreshCw, label: "Đổi trả dễ dàng" },
            { icon: Award, label: "Uy tín #1" },
            { icon: Tag, label: "Giá cạnh tranh" },
            { icon: Headphones, label: "CSKH 24/7" },
          ].map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition text-center cursor-default">
              <Icon size={20} className="text-blue-600"/>
              <p className="text-[10px] font-bold text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
