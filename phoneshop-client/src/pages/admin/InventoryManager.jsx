import { useEffect, useState } from 'react';
import { Search, AlertTriangle, PackageX, Clock, CheckCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { Link } from 'react-router-dom';

export default function InventoryManager() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // All, Out, Low, Old, Normal

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axiosClient.get('/inventory');
      setInventory(res.data);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu tồn kho!");
    } finally {
      setLoading(false);
    }
  };

  // Tính toán số lượng cho các thẻ KPI
  const stats = {
      total: inventory.length,
      out: inventory.filter(i => i.status === 'Out').length,
      low: inventory.filter(i => i.status === 'Low').length,
      old: inventory.filter(i => i.status === 'Old').length,
  };

  // Xử lý Lọc dữ liệu
  const filteredData = inventory.filter(item => {
      const matchSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.brandName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'All' ? true : item.status === filterStatus;
      return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
      switch(status) {
          case 'Out': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><PackageX size={14}/> Hết hàng</span>;
          case 'Low': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><AlertTriangle size={14}/> Sắp hết</span>;
          case 'Old': return <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={14}/> Tồn lâu (Quá 30 ngày)</span>;
          case 'Normal': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={14}/> Bình thường</span>;
          default: return null;
      }
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Đang tải dữ liệu tồn kho...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Tồn kho</h1>
        <p className="text-slate-500 text-sm">Theo dõi số lượng, cảnh báo hết hàng và hàng tồn đọng lâu ngày.</p>
      </div>

      {/* --- KPI CARDS (Bấm vào để lọc) --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div onClick={() => setFilterStatus('All')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'All' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 border-blue-600' : 'bg-white hover:border-blue-300'}`}>
              <p className={`text-sm font-bold mb-1 ${filterStatus === 'All' ? 'text-blue-100' : 'text-gray-500'}`}>Tất cả phân loại</p>
              <p className="text-3xl font-black">{stats.total}</p>
          </div>
          <div onClick={() => setFilterStatus('Out')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'Out' ? 'bg-red-500 text-white shadow-lg shadow-red-200 border-red-500' : 'bg-white hover:border-red-300'}`}>
              <p className={`text-sm font-bold mb-1 ${filterStatus === 'Out' ? 'text-red-100' : 'text-red-500'}`}>Hết hàng (0)</p>
              <p className="text-3xl font-black">{stats.out}</p>
          </div>
          <div onClick={() => setFilterStatus('Low')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'Low' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 border-orange-500' : 'bg-white hover:border-orange-300'}`}>
              <p className={`text-sm font-bold mb-1 ${filterStatus === 'Low' ? 'text-orange-100' : 'text-orange-500'}`}>Sắp hết (≤ 5)</p>
              <p className="text-3xl font-black">{stats.low}</p>
          </div>
          <div onClick={() => setFilterStatus('Old')} className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterStatus === 'Old' ? 'bg-purple-500 text-white shadow-lg shadow-purple-200 border-purple-500' : 'bg-white hover:border-purple-300'}`}>
              <p className={`text-sm font-bold mb-1 ${filterStatus === 'Old' ? 'text-purple-100' : 'text-purple-500'}`}>Tồn lâu</p>
              <p className="text-3xl font-black">{stats.old}</p>
          </div>
      </div>

      {/* --- TABLE & SEARCH --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="relative w-full md:w-72">
                <input 
                    type="text" placeholder="Tìm tên máy, hãng..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
            </div>
            {/* Gợi ý hành động */}
            {filterStatus === 'Old' && (
                <Link to="/admin/products" className="text-sm font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100">
                    Sửa giá / Tạo khuyến mãi ngay
                </Link>
            )}
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-50 text-gray-500">
                        <th className="p-4 font-semibold uppercase tracking-wider w-16">Ảnh</th>
                        <th className="p-4 font-semibold uppercase tracking-wider">Sản phẩm / Phân loại</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-right">Giá bán</th>
                        <th className="p-4 font-semibold uppercase tracking-wider text-center">Tồn kho</th>
                        <th className="p-4 font-semibold uppercase tracking-wider">Ngày bán gần nhất</th>
                        <th className="p-4 font-semibold uppercase tracking-wider">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredData.length === 0 ? (
                        <tr><td colSpan="6" className="p-8 text-center text-gray-400">Không tìm thấy dữ liệu.</td></tr>
                    ) : filteredData.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-4">
                                <div className="w-12 h-12 rounded-lg border bg-white flex items-center justify-center overflow-hidden">
                                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-contain"/> : <Package size={20} className="text-gray-300"/>}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="font-bold text-gray-800">{item.productName}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Hãng: <span className="font-semibold text-gray-600">{item.brandName}</span> | Phân loại: {item.variantName}
                                </div>
                            </td>
                            <td className="p-4 text-right font-bold text-blue-600">
                                {item.price.toLocaleString('vi-VN')} ₫
                            </td>
                            <td className="p-4 text-center">
                                <span className={`text-lg font-black ${item.stockQuantity === 0 ? 'text-red-500' : item.stockQuantity <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                                    {item.stockQuantity}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="font-medium text-gray-700">{item.lastSoldDate}</div>
                                {item.status === 'Old' && (
                                    <div className="text-[10px] text-purple-500 mt-1 font-bold">Quá lâu không bán được!</div>
                                )}
                            </td>
                            <td className="p-4">
                                {getStatusBadge(item.status)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}