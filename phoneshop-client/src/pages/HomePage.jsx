import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ShoppingCart, Heart, ArrowRight, Truck, ShieldCheck, 
  Headphones, RefreshCw, Zap, Star, ChevronRight, ChevronLeft,
  Tag, TrendingUp, Award, Clock, Gift, Eye, Search, Smartphone, Shield, CreditCard, Newspaper
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
    <div className="flex items-center gap-1.5">
      {[pad(time.h), pad(time.m), pad(time.s)].map((v, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="bg-red-600 text-white font-mono font-black text-sm px-2.5 py-1 rounded-md min-w-[36px] text-center shadow-inner tabular-nums">{v}</span>
          {i < 2 && <span className="text-red-600 font-black text-lg">:</span>}
        </span>
      ))}
    </div>
  );
}

/* ─── PRODUCT CARD ─── */
function ProductCard({ product, label, labelColor, badge }) {
  const { favoriteIds, toggleFavorite } = useFavoriteStore();
  const isFav = favoriteIds.includes(product.id);

  return (
    <Link to={`/product/${product.id}`} className="group h-full block">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-blue-100/60 transition-all duration-500 border border-gray-100 h-full flex flex-col relative overflow-hidden hover:-translate-y-1.5">
        
        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
          style={{ background: "linear-gradient(135deg, transparent 40%, rgba(59,130,246,0.03) 100%)" }} />

        {/* Heart Button */}
        <button
          onClick={e => { e.preventDefault(); toggleFavorite(product.id); }}
          className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow-sm border transition-all duration-300 ${isFav ? 'bg-red-50 text-red-500 border-red-100' : 'bg-white/90 border-gray-100 hover:border-red-200 hover:text-red-400 text-gray-300'}`}
        >
          <Heart size={16} className={isFav ? "fill-current" : ""} />
        </button>

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 z-20">
            <span className={`text-white text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider shadow-sm ${labelColor || 'bg-blue-500'}`}>
              {label}
            </span>
          </div>
        )}

        {/* Image Area */}
        <div className="relative h-56 bg-white flex items-center justify-center p-6 overflow-hidden rounded-t-2xl group-hover:bg-gray-50/50 transition-colors">
          {product.thumbnail
            ? <img src={product.thumbnail} alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
            : <span className="text-gray-300 text-xs">No image</span>}
          
          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white/95 backdrop-blur-sm text-blue-600 text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              <Eye size={14}/> Xem chi tiết
            </span>
          </div>
        </div>

        {/* Info Area */}
        <div className="flex-1 flex flex-col p-5 pt-2">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5">{product.brandName}</p>
          <h3 className="font-bold text-gray-800 text-sm leading-snug group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 mb-2">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1 mb-4">
            {[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-amber-400 text-amber-400"/>)}
            <span className="text-xs text-gray-400 ml-1 font-medium">(12 đánh giá)</span>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div>
              <div className="text-red-600 font-black text-lg leading-tight">
                {product.minPrice?.toLocaleString("vi-VN")} ₫
              </div>
              <div className="text-gray-400 text-xs line-through mt-0.5">
                {Math.round(product.minPrice * 1.15).toLocaleString("vi-VN")} ₫
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 text-blue-600 border border-gray-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <ShoppingCart size={18} />
            </div>
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
      <div className="flex items-end justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && <div className={`w-10 h-10 rounded-xl ${iconColor} flex items-center justify-center shadow-sm`}><Icon size={20} className="text-white"/></div>}
          <div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                {title} {badge && <span className="text-xs font-black tracking-wider px-2 py-0.5 rounded border border-red-200 bg-red-50 text-red-600 animate-pulse">{badge}</span>}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {link && <Link to={link} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-0.5 mr-3 hidden md:flex">{linkText} <ChevronRight size={16}/></Link>}
          <button onClick={() => scroll(-1)} className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:text-blue-600 transition shadow-sm"><ChevronLeft size={18}/></button>
          <button onClick={() => scroll(1)} className="w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 hover:text-blue-600 transition shadow-sm"><ChevronRight size={18}/></button>
        </div>
      </div>
      <div ref={ref} className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {children}
      </div>
    </div>
  );
}

/* ─── NEW FULL-WIDTH HERO SLIDER ─── */
const heroSlides = [
  {
    tag: "ĐẶT TRƯỚC NGAY", tagColor: "bg-white text-black",
    title: "iPhone 16 Pro Max", sub: "Apple Intelligence. Sức mạnh Titan.",
    desc: "Sở hữu siêu phẩm mới nhất từ Apple với ưu đãi trợ giá thu cũ đổi mới lên đến 5 triệu đồng. Trả góp 0% qua thẻ tín dụng.",
    cta: "Mua ngay", ctaLink: "/shop?search=iphone",
    from: "#0f172a", to: "#1e293b",
    img: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=2070&auto=format&fit=crop",
    accent: "#3b82f6"
  },
  {
    tag: "MỚI RA MẮT", tagColor: "bg-purple-500 text-white",
    title: "Galaxy S24 Ultra", sub: "Quyền năng AI đỉnh cao",
    desc: "Mở ra kỷ nguyên di động mới. Khung viền Titanium bền bỉ, camera 200MP zoom không giới hạn.",
    cta: "Khám phá", ctaLink: "/shop?search=samsung",
    from: "#2e1065", to: "#4c1d95",
    img: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2070&auto=format&fit=crop",
    accent: "#c084fc"
  }
];

function FullWidthHero() {
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
    <div className="relative rounded-3xl overflow-hidden mb-8 h-[400px] md:h-[500px] lg:h-[550px] shadow-2xl w-full" style={{ background: `linear-gradient(135deg, ${slide.from}, ${slide.to})` }}>
      {/* Background image */}
      <div className="absolute inset-0 transition-opacity duration-1000"
        style={{ backgroundImage: `url(${slide.img})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }} />
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${slide.from} 10%, ${slide.from}cc 50%, transparent 100%)` }} />
      
      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 w-full md:w-2/3 transition-all duration-500 ${animating ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}`}>
        <span className={`inline-block px-3 py-1 rounded-sm text-xs font-black tracking-widest mb-6 w-fit ${slide.tagColor}`}>
          {slide.tag}
        </span>
        <h1 className="text-white font-black text-4xl md:text-5xl lg:text-6xl leading-tight mb-2">{slide.title}</h1>
        <p className="font-bold text-xl md:text-3xl mb-4" style={{ color: slide.accent }}>{slide.sub}</p>
        <p className="text-gray-300 text-sm md:text-base mb-8 max-w-md leading-relaxed">{slide.desc}</p>
        <Link to={slide.ctaLink}
          className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-black px-8 py-4 rounded-full w-fit shadow-xl hover:scale-105 hover:bg-gray-50 transition-all duration-300">
          {slide.cta} <ArrowRight size={18}/>
        </Link>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 md:bottom-10 left-8 md:left-16 lg:left-24 flex gap-2 z-20">
        {heroSlides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: i === current ? 32 : 10, background: i === current ? 'white' : 'rgba(255,255,255,0.4)' }} />
        ))}
      </div>
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
    <div className="flex gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-w-[240px] h-[380px] bg-white rounded-2xl border border-gray-100 animate-pulse flex-shrink-0 p-4 flex flex-col">
            <div className="w-full h-48 bg-gray-100 rounded-xl mb-4"></div>
            <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-1/2 h-4 bg-gray-200 rounded mb-auto"></div>
            <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa]">

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-8">

        {/* ── MOBILE SEARCH ── */}
        <div className="relative mb-6 md:hidden">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            placeholder="Bạn cần tìm điện thoại gì?"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && navigate(`/shop?search=${searchQuery}`)}
          />
        </div>

        {/* ── FULL WIDTH HERO ── */}
        <FullWidthHero />

        {/* ── SERVICE TRUST BADGES ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-12">
          {[
            { icon: ShieldCheck, title: "Hàng Chính Hãng", sub: "Cam kết 100%" },
            { icon: Truck, title: "Giao Nhanh 2H", sub: "Trong nội thành" },
            { icon: RefreshCw, title: "1 Đổi 1 30 Ngày", sub: "Lỗi nhà sản xuất" },
            { icon: Headphones, title: "Hỗ Trợ 24/7", sub: "Hotline 1900 xxxx" },
          ].map(({ icon: Icon, title, sub }, i) => (
            <div key={i} className="flex items-center gap-3 md:gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Icon size={24} strokeWidth={1.5}/>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{title}</p>
                <p className="text-gray-500 text-xs hidden md:block mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── BRAND QUICK LINKS ── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900">Thương hiệu nổi bật</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {brands.map(brand => (
              <button
                key={brand.id}
                onClick={() => navigate(`/shop?brand=${brand.id}`)}
                className="px-6 py-3 rounded-xl text-sm font-bold bg-white border border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600 hover:shadow-md transition-all">
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── FLASH SALE ── */}
        <div className="mb-14 bg-gradient-to-br from-red-600 to-orange-500 rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Zap size={24} className="text-white fill-white"/>
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                  GIỜ VÀNG GIÁ SỐC
                </h2>
                <div className="mt-2"><CountdownTimer targetHours={12}/></div>
              </div>
            </div>
            <Link to="/shop?sort=price_asc" className="text-sm font-bold text-white bg-white/20 px-6 py-2.5 rounded-full hover:bg-white hover:text-red-600 transition flex items-center gap-1">
              Xem tất cả <ChevronRight size={16}/>
            </Link>
          </div>

          {loading ? <LoadingCards count={4}/> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {hotProducts.slice(0, 4).map(p => (
                <div key={p.id}>
                    <ProductCard product={p} label="GIẢM SỐC" labelColor="bg-red-500" badge />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── PROMO ACTION CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {[
            { icon: Smartphone, title: "Thu cũ đổi mới", sub: "Trợ giá lên đời đến 5 triệu", bg: "bg-blue-600" },
            { icon: CreditCard, title: "Trả góp 0%", sub: "Duyệt hồ sơ nhanh trong 5 phút", bg: "bg-indigo-600" },
            { icon: Shield, title: "Bảo hành VIP", sub: "Rơi vỡ, vào nước vẫn đổi mới", bg: "bg-slate-800" },
          ].map(({ icon: Icon, title, sub, bg }, i) => (
            <div key={i} className={`flex items-center gap-5 p-6 rounded-2xl ${bg} text-white shadow-lg hover:-translate-y-1 transition-transform cursor-pointer`}>
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <Icon size={28} className="text-white"/>
              </div>
              <div>
                <p className="font-black text-lg mb-1">{title}</p>
                <p className="text-white/80 text-sm font-medium">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── NEW ARRIVALS ── */}
        <ScrollSection title="Điện thoại Mới Nhất" icon={Tag} iconColor="bg-emerald-500" link="/shop?sort=newest" linkText="Xem tất cả">
          {loading ? <LoadingCards count={5}/> : newProducts.map(p => (
              <div key={p.id} className="min-w-[240px] max-w-[240px] flex-shrink-0">
                <ProductCard product={p} label="MỚI" labelColor="bg-emerald-500" badge/>
              </div>
            ))}
        </ScrollSection>

        {/* ── BEST SELLERS ── */}
        <ScrollSection title="Bán chạy trong tuần" icon={TrendingUp} iconColor="bg-orange-500" link="/shop?sort=price_asc" linkText="Xem tất cả">
          {loading ? <LoadingCards count={5}/> : hotProducts.map(p => (
              <div key={p.id} className="min-w-[240px] max-w-[240px] flex-shrink-0">
                <ProductCard product={p} label="HOT" labelColor="bg-orange-500" badge/>
              </div>
            ))}
        </ScrollSection>

        {/* ── MID-PAGE BANNER (Ecosystem) ── */}
        <div className="relative rounded-3xl overflow-hidden mb-14 h-48 md:h-64 shadow-xl cursor-pointer" onClick={() => navigate('/shop')}>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603898037225-83130b91d293?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-90 transition-transform duration-1000 hover:scale-105"/>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"/>
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16">
            <span className="text-blue-400 font-black tracking-widest text-xs mb-2">HỆ SINH THÁI ĐỈNH CAO</span>
            <h2 className="text-white font-black text-3xl md:text-4xl mb-4">
              Apple Ecosystem
            </h2>
            <button className="inline-flex items-center gap-2 bg-white text-gray-900 font-black px-6 py-2.5 rounded-full w-fit hover:bg-gray-100 transition-colors">
              Khám phá ngay <ArrowRight size={16}/>
            </button>
          </div>
        </div>

        {/* ── TECH NEWS ── */}
        <div className="mb-10">
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-sm">
                <Newspaper size={20} className="text-white"/>
              </div>
              <h2 className="text-2xl font-black text-gray-900">Tin tức công nghệ 24h</h2>
            </div>
            <Link to="/news" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 hidden md:flex">
              Tất cả bài viết <ChevronRight size={16}/>
            </Link>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <div key={i} className="h-[380px] bg-white rounded-2xl border border-gray-100 animate-pulse"></div>)}
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
          <div className="mt-6 text-center md:hidden">
            <Link to="/news" className="inline-flex items-center justify-center w-full px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700">
               Xem thêm tin tức
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}