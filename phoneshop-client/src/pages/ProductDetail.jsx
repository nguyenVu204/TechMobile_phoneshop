import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Check, Home, ChevronRight, Star, ShieldCheck, Truck, RefreshCw, Newspaper } from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "../api/axiosClient";
import useCartStore from "../stores/useCartStore";
import ReviewSection from "../components/ReviewSection";
import NewsCard from "../components/NewsCard"; // Gọi component NewsCard

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); 
  const [newsList, setNewsList] = useState([]); // State chứa Tin tức
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleAddToCart = () => {
    if (!selectedVariant) return toast.error("Vui lòng chọn phiên bản!");
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedVariant);
    }
    toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ!`);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/products/${id}`);
        const data = res.data;
        setProduct(data);

        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }

        // Gọi API song song: Sản phẩm liên quan + Tin tức
        const [relatedRes, newsRes] = await Promise.all([
            data.brandId ? axiosClient.get(`/products?page=1&limit=5&brandId=${data.brandId}`) : Promise.resolve({data: {items: []}}),
            axiosClient.get('/news?page=1&limit=4') // Lấy 4 bài tin tức mới nhất
        ]);

        if (data.brandId) {
          const filtered = relatedRes.data.items.filter((p) => p.id !== data.id).slice(0, 4);
          setRelatedProducts(filtered);
        }
        
        setNewsList(newsRes.data.items);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
    setQuantity(1);
    window.scrollTo(0, 0); 
  }, [id]);

  if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!product) return <div className="p-10 text-center text-red-500 font-bold">Không tìm thấy sản phẩm!</div>;

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-12">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6">
        
        {/* 1. BREADCRUMB */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
          <Link to="/" className="hover:text-blue-600 flex items-center gap-1"><Home size={14} /> Trang chủ</Link>
          <ChevronRight size={14} />
          <Link to={`/shop?search=${product.brandName}`} className="hover:text-blue-600 uppercase">{product.brandName}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>

        {/* 2. MAIN PRODUCT SECTION */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          
          {/* CỘT TRÁI: ẢNH (Đã thu nhỏ & Căn đối) */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 relative group p-8">
              <img
                src={selectedVariant?.imageUrl || product.thumbnail}
                alt={product.name}
                className="w-2/3 object-contain group-hover:scale-105 transition duration-500 drop-shadow-md"
              />
            </div>
            {/* List ảnh nhỏ */}
            <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`w-16 h-16 rounded-xl border-2 flex-shrink-0 p-1.5 transition-all ${selectedVariant?.id === v.id ? "border-blue-600 bg-blue-50/50 shadow-sm" : "border-gray-100 hover:border-blue-300"}`}
                >
                  <img src={v.imageUrl || product.thumbnail} className="w-full h-full object-contain" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-white font-bold tracking-wider text-[10px] bg-blue-600 px-2.5 py-1 rounded-sm uppercase shadow-sm">
                {product.brandName}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" /> <Star size={14} fill="currentColor" />
                <span className="text-gray-400 text-xs ml-1 font-medium">(12 Đánh giá)</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-5 leading-tight">
              {product.name}
            </h1>

            {/* Giá & Kho */}
            <div className="bg-gray-50/80 border border-gray-100 p-5 rounded-2xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-3xl font-black text-red-600 block mb-1">
                  {selectedVariant?.price.toLocaleString("vi-VN")} ₫
                </span>
                <span className="text-sm text-gray-400 line-through font-medium">
                  {(selectedVariant?.price * 1.15).toLocaleString("vi-VN")} ₫
                </span>
              </div>
              {selectedVariant && (
                <div className={`text-sm px-4 py-2 rounded-xl font-bold flex items-center gap-2 border ${selectedVariant.stockQuantity > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                  {selectedVariant.stockQuantity > 0 ? <Check size={16} /> : null}
                  {selectedVariant.stockQuantity > 0 ? `Sẵn hàng (${selectedVariant.stockQuantity})` : "Tạm hết hàng"}
                </div>
              )}
            </div>

            {/* Chọn Biến thể */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">
                  Chọn phiên bản:
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`relative px-4 py-3 rounded-xl border text-sm font-bold transition-all flex flex-col items-center min-w-[100px] ${
                          isSelected ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600 shadow-sm" : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <span>{v.color}</span>
                        <span className="text-xs font-medium text-gray-500 mt-0.5">{v.rom}</span>
                        {isSelected && <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-0.5 shadow-sm"><Check size={12} /></div>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Số lượng */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-3">Số lượng:</label>
                <div className="flex items-center border border-gray-200 rounded-xl bg-white w-fit shadow-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-11 flex items-center justify-center hover:bg-gray-50 rounded-l-xl transition text-lg font-bold text-gray-500">-</button>
                  <span className="w-12 text-center font-bold text-gray-900 border-x border-gray-100">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-11 flex items-center justify-center hover:bg-gray-50 rounded-r-xl transition text-lg font-bold text-gray-500">+</button>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 hover:scale-[1.02] transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
              >
                <ShoppingCart size={22} /> Mua ngay
              </button>
            </div>

            {/* Service Badges */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-xs font-medium text-gray-600 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-blue-600" /> Bảo hành 12 tháng</div>
              <div className="flex items-center gap-2"><RefreshCw size={16} className="text-blue-600" /> Đổi trả 30 ngày</div>
              <div className="flex items-center gap-2"><Truck size={16} className="text-blue-600" /> Giao hàng toàn quốc</div>
              <div className="flex items-center gap-2"><Check size={16} className="text-blue-600" /> Trả góp 0%</div>
            </div>
          </div>
        </div>

        {/* 3. MÔ TẢ & ĐÁNH GIÁ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Cột trái (Mô tả + Review) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                 Đặc điểm nổi bật
              </h2>
              {/* ĐÃ FIX CSS: Khóa chiều rộng ảnh và video để không bị khổng lồ */}
              <div 
                className="
                    prose prose-blue max-w-none text-gray-700 leading-relaxed
                    [&_.ql-video]:w-full [&_.ql-video]:max-w-2xl [&_.ql-video]:aspect-video [&_.ql-video]:mx-auto [&_.ql-video]:rounded-xl [&_.ql-video]:shadow-md [&_.ql-video]:my-6
                    [&_img]:w-auto [&_img]:max-w-2xl [&_img]:max-h-[400px] [&_img]:mx-auto [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:my-6
                "
                dangerouslySetInnerHTML={{ __html: product.description || "<p>Đang cập nhật thông tin chi tiết...</p>" }}
              />
            </div>
            <ReviewSection productId={id} />
          </div>

          {/* Cột phải: Thông số kỹ thuật */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-6">
              <h3 className="text-xl font-black text-gray-900 mb-6">Thông số kỹ thuật</h3>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="font-medium">Màn hình:</span>
                  <span className="font-bold text-gray-900 text-right w-1/2">{product.screen || "-"}</span>
                </li>
                <li className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="font-medium">Chip xử lý:</span>
                  <span className="font-bold text-gray-900 text-right w-1/2">{product.chip || "-"}</span>
                </li>
                <li className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="font-medium">RAM/ROM:</span>
                  <span className="font-bold text-gray-900">{selectedVariant?.ram} / {selectedVariant?.rom}</span>
                </li>
                <li className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="font-medium">Pin & Sạc:</span>
                  <span className="font-bold text-gray-900 text-right w-1/2">{product.battery || "-"}</span>
                </li>
                <li className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="font-medium">Camera sau:</span>
                  <span className="font-bold text-gray-900 text-right w-1/2">{product.rearCamera || "-"}</span>
                </li>
                <li className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="font-medium">Camera trước:</span>
                  <span className="font-bold text-gray-900 text-right w-1/2">{product.frontCamera || "-"}</span>
                </li>
                <li className="flex justify-between pb-1">
                  <span className="font-medium">Hệ điều hành:</span>
                  <span className="font-bold text-gray-900 text-right w-1/2">{product.operatingSystem || "-"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4. SẢN PHẨM LIÊN QUAN */}
        {relatedProducts.length > 0 && (
          <div className="mb-14">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Sản phẩm cùng hãng</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="group bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col hover:-translate-y-1">
                  <div className="bg-white rounded-xl h-44 flex items-center justify-center mb-4 p-4 overflow-hidden relative">
                    <img src={p.thumbnail} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition duration-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1.5">{p.brandName}</p>
                    <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 group-hover:text-blue-600 transition leading-snug">{p.name}</h3>
                  </div>
                  <div className="mt-auto flex items-end justify-between">
                    <span className="text-red-600 font-black text-lg">{p.minPrice.toLocaleString("vi-VN")} ₫</span>
                    <span className="w-9 h-9 rounded-full bg-gray-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition shadow-sm"><ShoppingCart size={16} /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 5. TIN TỨC LIÊN QUAN (MỚI BỔ SUNG) */}
        {newsList.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <Newspaper className="text-blue-600" size={24}/> Tin tức công nghệ
                </h2>
                <Link to="/news" className="text-sm font-bold text-blue-600 hover:underline">
                    Xem tất cả tin tức
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {newsList.map(item => (
                <div key={item.id} className="h-full">
                    <NewsCard item={item} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}