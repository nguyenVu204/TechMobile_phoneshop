import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import useAuthStore from '../../stores/useAuthStore'; // Import store để kiểm tra user

export default function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore(); // Lấy thông tin user
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);

  // Kiểm tra xem có phải admin không để đổi link Quay Lại
  const isAdmin = user?.role === 'Admin' || user?.roles?.includes('Admin');
  const backLink = isAdmin ? '/admin/orders' : '/my-orders';

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await axiosClient.get(`/orders/${id}`);
        if (res.data) {
            setOrder(res.data);
        } else {
            toast.error("Không tìm thấy dữ liệu đơn hàng!");
        }
      } catch (error) {
        console.error("Lỗi fetch invoice:", error);
        toast.error("Không thể tải thông tin hóa đơn!");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrderDetail();
  }, [id]);

  const handlePrint = async () => {
    setIsPrinting(true);
    const invoiceElement = document.getElementById('invoice-content');
    try {
      const canvas = await html2canvas(invoiceElement, { scale: 3, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Hoa-don-${order.id}.pdf`);
      toast.success("Đã tải xuống hóa đơn!");
    } catch (error) {
      toast.error("Không thể tạo file PDF");
    } finally {
      setIsPrinting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-100"><div className="text-gray-500 font-medium animate-pulse">Đang tạo hóa đơn...</div></div>;
  if (!order) return <div className="h-screen flex flex-col items-center justify-center bg-gray-100 gap-4"><div className="text-red-500 font-bold text-lg">Đơn hàng không tồn tại hoặc đã bị xóa.</div><button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">Quay lại</button></div>;

  return (
    <div className="bg-gray-100 min-h-screen p-8 flex flex-col items-center font-sans">
      {/* Toolbar */}
      <div className="w-full max-w-[210mm] mb-6 flex justify-between items-center md:flex-row flex-col gap-4 no-print">
        {/* Nút quay lại thông minh */}
        <Link to={backLink} className="flex items-center text-gray-600 hover:text-blue-600 transition font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <ArrowLeft size={20} className="mr-2"/> Quay lại 
        </Link>
        <button onClick={handlePrint} disabled={isPrinting} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg disabled:opacity-50">
          <Printer size={20}/> {isPrinting ? "Đang xử lý..." : "Tải PDF / In Hóa đơn"}
        </button>
      </div>

      {/* --- KHUNG HÓA ĐƠN A4 --- */}
      <div id="invoice-content" className="bg-white w-[210mm] min-h-[297mm] p-12 shadow-2xl text-slate-800 relative">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
            <div>
                <div className="flex items-center gap-3 mb-4">
                     <div className="bg-blue-600 text-white p-2.5 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                     </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-wider text-blue-600 leading-none">PhoneShop</h1>
                        <span className="text-xs text-gray-400 font-bold tracking-widest">PREMIUM STORE</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Địa chỉ: 123 Đường Cầu Giấy, Hà Nội</p>
                    <p className="text-sm font-medium text-gray-600">Hotline: 1900 1234 - Email: support@phoneshop.vn</p>
                    <p className="text-sm font-medium text-gray-600">Website: www.phoneshop.vn</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-4xl font-black uppercase text-gray-200 mb-2">Hóa đơn</h2>
                <p className="text-lg font-bold text-slate-700">#{order.id}</p>
                <p className="text-sm text-gray-500 font-medium">Ngày: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                <div className="mt-4">
                    <span className={`px-3 py-1 rounded border text-xs font-bold uppercase ${order.status === 'Completed' ? 'border-green-200 bg-green-50 text-green-700' : 'border-yellow-200 bg-yellow-50 text-yellow-700'}`}>
                        {order.status === 'Completed' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                    </span>
                </div>
            </div>
        </div>

        {/* Thông tin Khách hàng & Giao hàng */}
        <div className="grid grid-cols-2 gap-12 mb-10">
            <div>
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Thông tin khách hàng</h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-lg font-bold text-slate-800">{order.customerName}</p>
                    <p className="text-gray-600 text-sm mt-1">{order.customerPhone}</p>
                </div>
            </div>
            <div>
                 <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Địa chỉ giao hàng</h3>
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 h-full">
                    <p className="text-gray-700 leading-relaxed font-medium text-sm">{order.shippingAddress}</p>
                 </div>
            </div>
        </div>

        {/* Bảng sản phẩm */}
        <table className="w-full text-left mb-8 border-collapse">
            <thead>
                <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
                    <th className="p-4 rounded-tl-lg font-bold">Sản phẩm</th>
                    <th className="p-4 text-right font-bold">Đơn giá</th>
                    <th className="p-4 text-center font-bold">SL</th>
                    <th className="p-4 text-right rounded-tr-lg font-bold">Thành tiền</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-b border-gray-200">
                {order.orderDetails && order.orderDetails.map((item) => (
                    <tr key={item.id}>
                        <td className="p-4">
                            <p className="font-bold text-slate-800 text-sm">{item.productVariant?.product?.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Phân loại: {item.productVariant?.color} - {item.productVariant?.rom}</p>
                            {/* --- IN KÈM IMEI NẾU CÓ --- */}
                            {item.serialNumber && (
                                <p className="text-[10px] text-gray-400 font-mono mt-1">IMEI: {item.serialNumber}</p>
                            )}
                        </td>
                        <td className="p-4 text-right font-medium text-sm text-slate-600">{item.unitPrice.toLocaleString('vi-VN')} ₫</td>
                        <td className="p-4 text-center font-medium text-sm text-slate-600">{item.quantity}</td>
                        <td className="p-4 text-right font-bold text-sm text-slate-800">{(item.unitPrice * item.quantity).toLocaleString('vi-VN')} ₫</td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* Phần tổng cộng */}
        <div className="flex justify-end mb-16">
            <div className="w-1/2 space-y-3">
                <div className="flex justify-between text-sm text-gray-600"><span>Tạm tính:</span><span className="font-medium">{order.totalAmount.toLocaleString('vi-VN')} ₫</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>Phí vận chuyển:</span><span className="font-medium">0 ₫</span></div>
                <div className="border-b border-gray-200 my-2"></div>
                <div className="flex justify-between items-center"><span className="text-base font-bold text-slate-800">TỔNG CỘNG:</span><span className="text-2xl font-black text-blue-600">{order.totalAmount.toLocaleString('vi-VN')} ₫</span></div>
                <p className="text-xs text-right text-gray-400 italic">(Đã bao gồm VAT)</p>
            </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-12 left-12 right-12 text-center">
            <div className="border-t-2 border-gray-100 pt-8">
                <p className="font-bold text-slate-700 mb-2">Cảm ơn quý khách đã tin tưởng PhoneShop!</p>
                <p className="text-xs text-gray-500 mb-1">Mọi thắc mắc xin vui lòng liên hệ hotline hoặc email hỗ trợ.</p>
                <p className="text-xs text-gray-400">Hóa đơn điện tử được tạo tự động ngày {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
        </div>

      </div>
    </div>
  );
}