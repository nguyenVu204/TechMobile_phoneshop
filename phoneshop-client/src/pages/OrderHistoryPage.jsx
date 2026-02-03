import { useEffect, useState } from "react";
import {
  Package,
  Eye,
  X,
  User,
  MapPin,
  Ban,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import toast from "react-hot-toast";

export default function OrderHistoryPage() {
  const navigate = useNavigate();
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- STATE PHÂN TRANG ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMyOrders();
  }, [page]);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(
        `/orders/my-orders?page=${page}&limit=5`,
      );
      setMyOrders(res.data.items);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      toast.error("Lỗi tải lịch sử đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;
    try {
      await axiosClient.put(
        `/orders/${orderId}/status`,
        JSON.stringify("Cancelled"),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      toast.success("Đã hủy đơn hàng thành công");
      const updatedOrders = myOrders.map((o) =>
        o.id === orderId ? { ...o, status: "Cancelled" } : o,
      );
      setMyOrders(updatedOrders);
      if (selectedOrder)
        setSelectedOrder({ ...selectedOrder, status: "Cancelled" });
    } catch (error) {
      toast.error("Hủy đơn thất bại!");
    }
  };

  const handlePayment = async (orderId) => {
    try {
      const res = await axiosClient.post("/payment/create-payment-url", {
        orderId: orderId,
      });

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      toast.error("Lỗi tạo link thanh toán");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Shipping":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "Cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const translateStatus = (status) => {
    const map = {
      Pending: "Chờ xử lý",
      Shipping: "Đang giao",
      Completed: "Giao thành công",
      Cancelled: "Đã hủy",
    };
    return map[status] || status;
  };

  return (
    <div className="container mx-auto px-4 py-10 bg-gray-50 min-h-[80vh]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package className="text-blue-600" /> Lịch sử đơn hàng
          </h1>
          <Link
            to="/"
            className="text-sm font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1 transition"
          >
            <ArrowLeft size={16} /> Tiếp tục mua sắm
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              Đang tải đơn hàng...
            </div>
          ) : myOrders.length === 0 ? (
            <div className="text-center py-20">
              <Package size={64} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 mb-6 text-lg">
                Bạn chưa có đơn hàng nào.
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                Mua sắm ngay
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {myOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white"
                  >
                    {/* Header Card */}
                    <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-gray-100 gap-4">
                      <div className="flex gap-4 text-sm items-center">
                        <span className="font-mono font-bold text-gray-800 text-lg">
                          #{order.id}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-600 font-medium">
                          {new Date(order.orderDate).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {order.paymentStatus === "Paid" ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold border bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
                            ✓ Đã thanh toán
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold border bg-gray-100 text-gray-500 border-gray-200">
                            Chưa thanh toán
                          </span>
                        )}

                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {translateStatus(order.status)}
                        </span>
                      </div>
                    </div>

                    {/* Body Card */}
                    <div className="p-6">
                      {order.orderDetails.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-6 mb-6 last:mb-0"
                        >
                          <div className="w-20 h-20 border rounded-xl bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {item.productVariant?.imageUrl ? (
                              <img
                                src={item.productVariant.imageUrl}
                                className="w-full h-full object-contain p-1"
                                alt=""
                              />
                            ) : (
                              <Package size={32} className="text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-gray-800 mb-1 truncate">
                              {item.productVariant?.product?.name}
                            </p>
                            <p className="text-sm text-gray-500 mb-1">
                              Phân loại: {item.productVariant?.color} -{" "}
                              {item.productVariant?.rom}
                            </p>
                            <p className="text-sm text-gray-500">
                              x {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-bold text-gray-700">
                              {item.unitPrice.toLocaleString()} ₫
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.orderDetails.length > 2 && (
                        <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-dashed border-gray-200 text-center">
                          Và {order.orderDetails.length - 2} sản phẩm khác...
                        </p>
                      )}
                    </div>

                    {/* Footer Card */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                      <div>
                        <span className="text-sm text-gray-500 mr-2">
                          Tổng thành tiền:
                        </span>
                        <span className="text-xl font-bold text-red-600">
                          {order.totalAmount.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                      <div className="flex gap-3">
                        {order.status === "Pending" &&
                          order.paymentStatus !== "Paid" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handlePayment(order.id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm shadow-blue-200"
                              >
                                Thanh toán VNPay
                              </button>

                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition flex items-center gap-2"
                              >
                                <Ban size={16} /> Hủy đơn
                              </button>
                            </div>
                          )}
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition flex items-center gap-2"
                        >
                          <Eye size={16} /> Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Thanh phân trang */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-10 space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-bold text-sm transition ${
                        page === i + 1
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : "hover:bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL CHI TIẾT */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-50/80 px-6 py-4 flex justify-between items-center border-b border-gray-100 shrink-0">
              <div>
                <h2 className="font-bold text-lg">
                  Đơn hàng #{selectedOrder.id}
                </h2>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(
                    selectedOrder.status,
                  )}`}
                >
                  {translateStatus(selectedOrder.status)}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Thông tin người nhận & Địa chỉ */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                    <User size={12} /> Người nhận
                  </p>
                  <p className="font-bold text-sm text-gray-800">
                    {selectedOrder.customerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.customerPhone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                    <MapPin size={12} /> Địa chỉ
                  </p>
                  <p className="text-sm text-gray-700">
                    {selectedOrder.shippingAddress}
                  </p>
                </div>
              </div>
              {/* Bảng sản phẩm */}
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="p-2">SP</th>
                    <th className="p-2 text-right">Giá</th>
                    <th className="p-2 text-right">SL</th>
                    <th className="p-2 text-right">Tổng</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedOrder.orderDetails.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">
                        <p className="font-bold text-gray-800">
                          {item.productVariant?.product?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.productVariant?.color}{" "}
                          {item.productVariant?.rom}
                        </p>
                        {item.serialNumber && (
                          <div className="mt-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                              Serial Number / IMEI:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {item.serialNumber.split(",").map((imei, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-mono bg-gray-100 border border-gray-300 px-1.5 rounded text-gray-600"
                                >
                                  {imei.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-2 text-right">
                        {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">x{item.quantity}</td>
                      <td className="p-2 text-right font-bold">
                        {(item.unitPrice * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t text-center flex justify-end gap-2 bg-gray-50">
              {/* --- SỬA ĐIỀU KIỆN TRONG MODAL --- */}
              {selectedOrder.status === "Pending" &&
                selectedOrder.paymentStatus !== "Paid" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePayment(selectedOrder.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm shadow-blue-200"
                    >
                      Thanh toán VNPay
                    </button>

                    <button
                      onClick={() => handleCancelOrder(selectedOrder.id)}
                      className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <Ban size={16} /> Hủy đơn
                    </button>
                  </div>
                )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium text-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
