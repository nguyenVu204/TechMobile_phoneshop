import { useState, useEffect } from "react";
import { X, Save, List, Plus } from "lucide-react";
import axiosClient from "../../api/axiosClient";
import toast from "react-hot-toast";

export default function ImeiManagerModal({ variant, onClose, onRefresh }) {
  const [imeiList, setImeiList] = useState(""); // Textarea input
  const [availableImeis, setAvailableImeis] = useState([]); // List IMEI đang có
  const [loading, setLoading] = useState(false);

  // Load danh sách IMEI hiện có trong kho
  useEffect(() => {
    fetchAvailableImeis();
  }, [variant]);

  const fetchAvailableImeis = async () => {
    try {
      const res = await axiosClient.get(`/serialnumbers/available/${variant.id}`);
      setAvailableImeis(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddImeis = async () => {
    if (!imeiList.trim()) return;
    
    // Tách dòng thành mảng
    const imeis = imeiList.split(/\n/).map(s => s.trim()).filter(s => s !== "");
    
    setLoading(true);
    try {
      await axiosClient.post("/serialnumbers/add-range", {
        variantId: variant.id,
        imeis: imeis
      });
      
      toast.success("Nhập kho thành công!");
      setImeiList("");
      fetchAvailableImeis(); // Reload list
      onRefresh(); // Reload trang cha để cập nhật số tồn kho
    } catch (error) {
      toast.error("Lỗi nhập IMEI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Quản lý IMEI: {variant.color} - {variant.rom}</h3>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Cột trái: Nhập liệu */}
          <div className="p-4 w-full md:w-1/2 border-r border-gray-100 flex flex-col">
            <label className="text-sm font-bold mb-2 flex items-center gap-2">
                <Plus size={16}/> Nhập IMEI mới (Mỗi dòng 1 mã)
            </label>
            <textarea
              className="flex-1 w-full border p-3 rounded-lg focus:outline-blue-500 font-mono text-sm"
              placeholder="35468205..."
              value={imeiList}
              onChange={(e) => setImeiList(e.target.value)}
            ></textarea>
            <button
              onClick={handleAddImeis}
              disabled={loading || !imeiList}
              className="mt-4 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center gap-2"
            >
              {loading ? "Đang xử lý..." : <><Save size={18}/> Lưu vào kho</>}
            </button>
          </div>

          {/* Cột phải: Danh sách đang có */}
          <div className="p-4 w-full md:w-1/2 flex flex-col">
            <label className="text-sm font-bold mb-2 flex items-center gap-2">
                <List size={16}/> IMEI trong kho ({availableImeis.length})
            </label>
            <div className="flex-1 overflow-y-auto bg-gray-50 border rounded-lg p-2">
                {availableImeis.length === 0 ? (
                    <p className="text-gray-400 text-center text-sm mt-4">Chưa có IMEI nào</p>
                ) : (
                    <ul className="space-y-1">
                        {availableImeis.map((item) => (
                            <li key={item.id} className="bg-white px-3 py-2 rounded border text-sm font-mono flex justify-between">
                                {item.serialNumber}
                                <span className="text-green-600 text-xs font-bold">Sẵn sàng</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}