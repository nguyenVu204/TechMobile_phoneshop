import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";

export default function AssignImeiModal({ orderId, variant, onClose, onSuccess }) {
  const [availableImeis, setAvailableImeis] = useState([]);
  const [selectedImeiId, setSelectedImeiId] = useState("");

  useEffect(() => {
    // Lấy danh sách IMEI còn tồn của biến thể này
    axiosClient.get(`/serialnumbers/available/${variant.productVariantId}`)
        .then(res => setAvailableImeis(res.data))
        .catch(err => console.error(err));
  }, [variant]);

  const handleSubmit = async () => {
      if(!selectedImeiId) return toast.error("Vui lòng chọn IMEI");
      try {
          await axiosClient.post('/orders/assign-imei', {
              orderId: orderId,
              productVariantId: variant.productVariantId,
              serialNumberId: parseInt(selectedImeiId)
          });
          toast.success("Đã gán IMEI thành công");
          onSuccess(); // Callback để reload order
          onClose();
      } catch (error) {
          toast.error("Lỗi gán IMEI");
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="font-bold text-lg mb-4">Xuất kho: {variant.productVariant?.product?.name}</h3>
            <p className="text-sm text-gray-500 mb-4">
                Phân loại: {variant.productVariant?.color} - {variant.productVariant?.rom}
            </p>

            <label className="block text-sm font-bold mb-2">Chọn mã máy (IMEI) để giao:</label>
            <select 
                className="w-full border p-2 rounded mb-6"
                value={selectedImeiId}
                onChange={e => setSelectedImeiId(e.target.value)}
            >
                <option value="">-- Chọn IMEI --</option>
                {availableImeis.map(imei => (
                    <option key={imei.id} value={imei.id}>{imei.serialNumber}</option>
                ))}
            </select>

            <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Hủy</button>
                <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Xác nhận</button>
            </div>
        </div>
    </div>
  );
}