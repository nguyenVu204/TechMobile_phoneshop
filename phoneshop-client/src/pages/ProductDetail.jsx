import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Check, Home, ChevronRight, Star } from "lucide-react"; // Thêm icon
import toast from "react-hot-toast";
import axiosClient from "../api/axiosClient";
import useCartStore from "../stores/useCartStore";
import ReviewSection from "../components/ReviewSection";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToCart = useCartStore((state) => state.addToCart);

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); // State sản phẩm liên quan
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // --- HÀM ADD CART ---
  const handleAddToCart = () => {
    if (!selectedVariant) return toast.error("Vui lòng chọn phiên bản!");
    // Logic thêm quantity nếu cần (store hiện tại đang mặc định +1, bạn có thể update store sau để nhận quantity)
    // Ở đây mình loop gọi hàm addToCart tương ứng số lượng (hoặc sửa store nhận tham số quantity)
    // Để đơn giản theo store hiện tại:
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedVariant);
    }
    toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ!`);
  };

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Lấy chi tiết sản phẩm
        const res = await axiosClient.get(`/products/${id}`);
        const data = res.data;
        setProduct(data);

        // Chọn mặc định biến thể đầu tiên
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }

        // 2. Lấy sản phẩm cùng hãng (Related Products)
        // Lấy 5 sản phẩm, phòng trường hợp trùng với sản phẩm hiện tại thì lọc bỏ
        if (data.brandId) {
          const relatedRes = await axiosClient.get(
            `/products?page=1&limit=5&brandId=${data.brandId}`,
          );
          // Lọc bỏ sản phẩm đang xem
          const filtered = relatedRes.data.items
            .filter((p) => p.id !== data.id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
    // Reset số lượng khi đổi sản phẩm
    setQuantity(1);
    window.scrollTo(0, 0); // Cuộn lên đầu trang
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!product)
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Không tìm thấy sản phẩm!
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="container mx-auto px-4 py-6">
        {/* 1. BREADCRUMB (Đường dẫn) */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600 flex items-center gap-1">
            <Home size={14} /> Trang chủ
          </Link>
          <ChevronRight size={14} />
          <Link
            to={`/shop?search=${product.brandName}`}
            className="hover:text-blue-600 uppercase"
          >
            {product.brandName}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium truncate">
            {product.name}
          </span>
        </nav>

        {/* 2. MAIN PRODUCT SECTION */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* CỘT TRÁI: ẢNH */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 relative group">
              <img
                src={selectedVariant?.imageUrl || product.thumbnail}
                alt={product.name}
                className="w-3/4 object-contain group-hover:scale-110 transition duration-500 mix-blend-multiply"
              />
              {/* Tag giảm giá giả lập nếu muốn */}
              {/* <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">-15%</span> */}
            </div>
            {/* List ảnh nhỏ (Thumbnail variants) */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`w-16 h-16 rounded-lg border-2 flex-shrink-0 p-1 ${selectedVariant?.id === v.id ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                >
                  <img
                    src={v.imageUrl || product.thumbnail}
                    className="w-full h-full object-contain mix-blend-multiply"
                    alt=""
                  />
                </button>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600 font-bold tracking-wide text-xs bg-blue-50 px-2 py-1 rounded uppercase">
                {product.brandName}
              </span>
              <div className="flex items-center gap-1 text-yellow-400 text-xs">
                <Star size={12} fill="currentColor" /> <span>(Review)</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Giá & Kho */}
            <div className="bg-gray-50 p-4 rounded-xl mb-6 flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-red-600 block">
                  {selectedVariant?.price.toLocaleString("vi-VN")} ₫
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {(selectedVariant?.price * 1.2).toLocaleString("vi-VN")} ₫
                </span>
              </div>
              {selectedVariant && (
                <div
                  className={`text-sm px-3 py-1 rounded-full font-bold flex items-center gap-1 ${selectedVariant.stockQuantity > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {selectedVariant.stockQuantity > 0 ? (
                    <Check size={14} />
                  ) : null}
                  {selectedVariant.stockQuantity > 0
                    ? `Còn hàng (${selectedVariant.stockQuantity})`
                    : "Hết hàng"}
                </div>
              )}
            </div>

            {/* Chọn Biến thể */}
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Phiên bản màu sắc & bộ nhớ:
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`relative px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center min-w-[100px] ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
                            : "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <span>{v.color}</span>
                        <span className="text-xs font-normal opacity-70">
                          {v.rom}
                        </span>
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-0.5">
                            <Check size={10} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Số lượng */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Số lượng:
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-xl bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-l-xl transition text-lg font-bold text-gray-500"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-r-xl transition text-lg font-bold text-gray-500"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={
                  !selectedVariant || selectedVariant.stockQuantity === 0
                }
                className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={22} />
                Thêm vào giỏ
              </button>
              {/* Nút yêu thích */}
              <button className="w-14 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition bg-white">
                <div className="text-2xl">♥</div>
              </button>
            </div>

            {/* Policy nhỏ */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-green-500" /> Bảo hành chính
                hãng 12 tháng
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-green-500" /> Đổi trả trong 30
                ngày
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-green-500" /> Miễn phí vận
                chuyển toàn quốc
              </div>
              <div className="flex items-center gap-2">
                <Check size={14} className="text-green-500" /> Hỗ trợ trả góp 0%
              </div>
            </div>
          </div>
        </div>

        {/* 3. MÔ TẢ & ĐÁNH GIÁ (Layout Tab hoặc chia cột) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Mô tả sản phẩm (Chiếm 2 phần) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">
                Đặc điểm nổi bật
              </h2>
              <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                {/* Render mô tả, nếu có HTML thì dùng dangerouslySetInnerHTML */}
                <p className="whitespace-pre-line">
                  {product.description || "Đang cập nhật thông tin chi tiết..."}
                </p>
              </div>
            </div>

            {/* Phần Reviews */}
            <ReviewSection productId={id} />
          </div>

          {/* Cột phải: Thông số kỹ thuật */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-4">
              <h3 className="font-bold text-gray-800 mb-4">
                Thông số kỹ thuật
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex justify-between border-b border-dashed pb-2">
                  <span>Màn hình:</span>
                  <span className="font-medium text-gray-900">
                    {product.screen || "Đang cập nhật"}
                  </span>
                </li>
                <li className="flex justify-between border-b border-dashed pb-2">
                  <span>Chip:</span>
                  <span className="font-medium text-gray-900">
                    {product.chip || "Đang cập nhật"}
                  </span>
                </li>
                <li className="flex justify-between border-b border-dashed pb-2">
                  <span>RAM:</span>
                  {/* Lấy từ biến thể đang chọn */}
                  <span className="font-medium text-gray-900">
                    {selectedVariant?.ram}
                  </span>
                </li>
                <li className="flex justify-between border-b border-dashed pb-2">
                  <span>Bộ nhớ:</span>
                  <span className="font-medium text-gray-900">
                    {selectedVariant?.rom}
                  </span>
                </li>
                <li className="flex justify-between border-b border-dashed pb-2">
                  <span>Pin:</span>
                  <span className="font-medium text-gray-900">
                    {product.battery || "Đang cập nhật"}
                  </span>
                </li>
                <li className="flex justify-between border-b border-dashed pb-2">
                  <span>Camera sau:</span>
                  <span className="font-medium text-gray-900 text-right w-1/2">
                    {product.rearCamera || "-"}
                  </span>
                </li>
                <li className="flex justify-between border-b border-dashed pb-2">
                  <span>Camera trước:</span>
                  <span className="font-medium text-gray-900">
                    {product.frontCamera || "-"}
                  </span>
                </li>
                <li className="flex justify-between border-b border-dashed pb-2">
                  <span>HĐH:</span>
                  <span className="font-medium text-gray-900">
                    {product.operatingSystem || "-"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4. SẢN PHẨM LIÊN QUAN (RELATED PRODUCTS) - PHẦN MỚI */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Sản phẩm cùng hãng
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-xl transition flex flex-col"
                >
                  <div className="bg-gray-50 rounded-xl h-40 flex items-center justify-center mb-4 overflow-hidden relative">
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="h-28 object-contain mix-blend-multiply group-hover:scale-110 transition duration-500"
                    />
                    {/* Tag New/Hot nếu có thể thêm logic */}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-blue-500 font-bold uppercase mb-1">
                      {p.brandName}
                    </p>
                    <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition">
                      {p.name}
                    </h3>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <span className="text-red-600 font-bold">
                      {p.minPrice.toLocaleString("vi-VN")} ₫
                    </span>
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                      <ShoppingCart size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
