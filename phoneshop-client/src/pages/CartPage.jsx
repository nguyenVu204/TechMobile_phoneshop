import { useEffect, useState } from "react";
import { Trash2, ArrowLeft, MapPin, Phone, User, CreditCard, Banknote, Plus, Minus, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../stores/useCartStore";
import useAuthStore from "../stores/useAuthStore";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

export default function CartPage() {

  const { items, removeFromCart, clearCart, updateQuantity } = useCartStore();
  
  const { user } = useAuthStore();
  
  const navigate = useNavigate();

  // State form thông tin
  const [info, setInfo] = useState({
    customerName: "",
    customerPhone: "",
    shippingAddress: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  // Tự động điền thông tin khi vào trang 
  useEffect(() => {
    if (user) {
        setInfo((prev) => ({
            ...prev,
            customerName: user.fullName || user.name || "", 
            customerPhone: user.phoneNumber || user.phone || "", 
            shippingAddress: "" 
        }));
    }
  }, [user]);

  // Tính tổng tiền
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Xử lý ĐẶT HÀNG
  const handlePlaceOrder = async () => {
    if (items.length === 0) return toast.error("Giỏ hàng trống!");
    
    if (!info.customerName || !info.customerPhone || !info.shippingAddress) {
      return toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
    }

    setLoading(true);
    try {
      // Payload gửi lên server
      const orderPayload = {
        customerName: info.customerName,
        customerPhone: info.customerPhone,
        shippingAddress: info.shippingAddress,
        paymentMethod: paymentMethod,
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      };

      // Gọi API tạo đơn
      const res = await axiosClient.post("/orders", orderPayload);
      const newOrder = res.data;

      // Xóa giỏ hàng
      clearCart();

      // Điều hướng
      if (paymentMethod === "COD") {
        toast.success("Đặt hàng thành công!");
        navigate("/my-orders");
      } else {
        // Xử lý VNPay
        try {
            const vnpayRes = await axiosClient.post('/payment/create-payment-url', {
                orderId: newOrder.orderId || newOrder.OrderId 
            });
            if(vnpayRes.data.url) {
                window.location.href = vnpayRes.data.url;
            }
        } catch (vnpayError) {
            toast.error("Lỗi tạo cổng thanh toán. Vui lòng thanh toán lại trong Lịch sử đơn.");
            navigate("/my-orders");
        }
      }

    } catch (error) {
      console.error(error);
      toast.error("Đặt hàng thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (variantId) => {
    removeFromCart(variantId);
    toast.error("Đã xóa sản phẩm!");
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <CreditCard size={48} className="text-gray-400"/>
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Giỏ hàng của bạn đang trống</h2>
        <Link to="/" className="text-blue-600 hover:underline flex items-center font-bold">
          <ArrowLeft size={20} className="mr-2" /> Quay lại mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Giỏ hàng ({items.length} sản phẩm)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: SẢN PHẨM */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={`${item.id}-${item.variantId}`} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                 {item.image ? (
                     <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply"/>
                 ) : <span className="text-xs text-gray-400">No Img</span>}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.color} - {item.rom}</p>
                <p className="text-blue-600 font-bold mt-1">
                  {item.price.toLocaleString("vi-VN")} ₫
                </p>
              </div>

              <div className="flex items-center gap-2">
                 <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-1 rounded-md bg-gray-100 hover:bg-gray-200">
                    <Minus size={16}/>
                 </button>
                 <span className="font-bold w-8 text-center">{item.quantity}</span>
                 <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-1 rounded-md bg-gray-100 hover:bg-gray-200">
                    <Plus size={16}/>
                 </button>
              </div>

              <button onClick={() => handleRemove(item.variantId)} className="text-gray-400 hover:text-red-500 p-2 transition">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          
          <button onClick={() => { if(confirm("Xóa hết?")) clearCart(); }} className="text-sm text-red-500 hover:text-red-700 font-medium mt-4 inline-flex items-center gap-1">
             <Trash2 size={14}/> Xóa tất cả giỏ hàng
          </button>
        </div>

        {/* CỘT PHẢI: FORM & THANH TOÁN */}
        <div className="space-y-6">
            
            {/* Form thông tin (Đã tự điền từ store) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                    <MapPin size={20} className="text-blue-600"/> Thông tin nhận hàng
                </h3>
                <div className="space-y-3">
                    <div className="relative">
                        <User size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <input type="text" placeholder="Họ tên người nhận" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            value={info.customerName} onChange={e => setInfo({...info, customerName: e.target.value})} />
                    </div>
                    <div className="relative">
                        <Phone size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <input type="text" placeholder="Số điện thoại" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            value={info.customerPhone} onChange={e => setInfo({...info, customerPhone: e.target.value})} />
                    </div>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3 text-gray-400"/>
                        <textarea placeholder="Địa chỉ giao hàng chi tiết..." className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm h-20 resize-none"
                            value={info.shippingAddress} onChange={e => setInfo({...info, shippingAddress: e.target.value})} />
                    </div>
                </div>
            </div>

            {/* Chọn phương thức thanh toán */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                    <CreditCard size={20} className="text-blue-600"/> Thanh toán
                </h3>
                <div className="space-y-3">
                    <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <input type="radio" name="payment" className="w-4 h-4 text-blue-600" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                        <Banknote size={24} className="text-green-600"/>
                        <div>
                            <p className="font-bold text-sm text-gray-800">Thanh toán khi nhận hàng</p>
                            <p className="text-xs text-gray-500">COD - Kiểm tra hàng trước</p>
                        </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'VNPay' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <input type="radio" name="payment" className="w-4 h-4 text-blue-600" checked={paymentMethod === 'VNPay'} onChange={() => setPaymentMethod('VNPay')} />
                        <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-VNPAY-QR.png" alt="VNPay" className="w-8 h-8 object-contain rounded"/>
                        <div>
                            <p className="font-bold text-sm text-gray-800">Thanh toán VNPay</p>
                            <p className="text-xs text-gray-500">Quét mã QR / Thẻ ATM</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Tổng tiền & Nút Đặt hàng */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
                <div className="flex justify-between mb-2 text-gray-500 text-sm">
                    <span>Tạm tính:</span>
                    <span>{totalAmount.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="flex justify-between mb-4 text-gray-500 text-sm">
                    <span>Vận chuyển:</span>
                    <span className="text-green-600 font-bold">Miễn phí</span>
                </div>
                <div className="flex justify-between mb-6 text-xl font-bold text-gray-800 border-t pt-4">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">{totalAmount.toLocaleString("vi-VN")} ₫</span>
                </div>

                <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {loading ? "Đang xử lý..." : (
                        <>
                            {paymentMethod === 'VNPay' ? 'Thanh toán ngay' : 'Đặt hàng'} 
                            <ArrowRight size={20}/>
                        </>
                    )}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}