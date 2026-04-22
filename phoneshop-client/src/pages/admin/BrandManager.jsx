import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Search, X, Tag, Eye, Package, CalendarClock, ChevronDown, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

export default function BrandManager() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State cho Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null); 
  const [formData, setFormData] = useState({ name: '' });

  // State cho Modal Chi tiết Hãng
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [brandDetails, setBrandDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null); 

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    try {
      const res = await axiosClient.get('/brands');
      setBrands(res.data);
      setLoading(false);
    } catch (error) {
      toast.error("Lỗi tải danh sách hãng!");
      setLoading(false);
    }
  };

  const filteredBrands = brands.filter(b => 
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- XỬ LÝ MODAL THÊM / SỬA ---
  const openAddModal = () => {
      setEditingBrand(null);
      setFormData({ name: '' });
      setIsModalOpen(true);
  };

  const openEditModal = (brand) => {
      setEditingBrand(brand);
      setFormData({ name: brand.name });
      setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSave = async (e) => {
      e.preventDefault();
      if (!formData.name.trim()) return toast.error("Tên hãng không được để trống!");

      try {
          if (editingBrand) {
              await axiosClient.put(`/brands/${editingBrand.id}`, { id: editingBrand.id, name: formData.name });
              toast.success("Cập nhật thành công!");
              setBrands(brands.map(b => b.id === editingBrand.id ? { ...b, name: formData.name } : b));
          } else {
              const res = await axiosClient.post('/brands', { name: formData.name });
              toast.success("Thêm mới thành công!");
              setBrands([...brands, res.data]);
          }
          closeModal();
      } catch (error) {
          toast.error("Có lỗi xảy ra!");
      }
  };

  const handleDelete = async (id) => {
      if (!confirm("Bạn có chắc chắn muốn xóa hãng này?")) return;
      try {
          await axiosClient.delete(`/brands/${id}`);
          toast.success("Đã xóa!");
          setBrands(brands.filter(b => b.id !== id));
      } catch (error) {
          if(error.response && error.response.status === 400) {
              toast.error(error.response.data.Message || "Không thể xóa hãng đang có sản phẩm!");
          } else {
              toast.error("Xóa thất bại!");
          }
      }
  };

  // --- XEM CHI TIẾT SẢN PHẨM & LỊCH SỬ ---
  const handleViewDetails = async (id) => {
      setIsDetailsModalOpen(true);
      setLoadingDetails(true);
      setBrandDetails(null);
      setExpandedProduct(null);
      try {
          const res = await axiosClient.get(`/brands/${id}/products`);
          setBrandDetails(res.data);
      } catch (error) {
          toast.error("Lỗi tải thông tin chi tiết hãng!");
          setIsDetailsModalOpen(false);
      } finally {
          setLoadingDetails(false);
      }
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Đang tải dữ liệu...</div>;

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Quản lý Hãng</h1>
           <p className="text-slate-500 text-sm">Danh sách thương hiệu điện thoại</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <input 
                    type="text" placeholder="Tìm tên hãng..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
            </div>

            <button 
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 whitespace-nowrap"
            >
                <Plus size={18} /><span>Thêm Hãng</span>
            </button>
        </div>
      </div>

      {/* TABLE LỚN */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 w-20">ID</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Tên Hãng</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                    <td className="p-4 text-gray-500 font-mono text-sm">#{brand.id}</td>
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <Tag size={16}/>
                            </div>
                            <span className="font-bold text-gray-800">{brand.name}</span>
                        </div>
                    </td>
                    <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button 
                                onClick={() => handleViewDetails(brand.id)}
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Xem sản phẩm"
                            >
                                <Eye size={18} />
                            </button>
                            <button 
                                onClick={() => openEditModal(brand)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Sửa tên"
                            >
                                <Edit size={18} />
                            </button>
                            <button 
                                onClick={() => handleDelete(brand.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Xóa hãng"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            {filteredBrands.length === 0 && <div className="p-8 text-center text-gray-500">Không tìm thấy hãng nào.</div>}
        </div>
      </div>

      {/* --- MODAL THÊM / SỬA HÃNG --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-lg text-gray-800">{editingBrand ? "Sửa tên hãng" : "Thêm hãng mới"}</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition"><X size={20}/></button>
                </div>
                <form onSubmit={handleSave} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên hãng</label>
                        <input 
                            type="text" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            placeholder="Ví dụ: Xiaomi, Oppo..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Hủy bỏ</button>
                        <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition">
                            {editingBrand ? "Lưu thay đổi" : "Thêm mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODAL XEM CHI TIẾT SẢN PHẨM & BIẾN THỂ & LỊCH SỬ --- */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <div>
                        <h2 className="font-black text-xl text-gray-800 flex items-center gap-2">
                            <Tag className="text-blue-600"/> Thương hiệu: <span className="text-blue-600">{brandDetails?.brandName || "..."}</span>
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Danh sách sản phẩm, các phiên bản và lịch sử xuất bán.</p>
                    </div>
                    <button onClick={() => setIsDetailsModalOpen(false)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"><X size={24}/></button>
                </div>

                <div className="p-6 overflow-y-auto bg-gray-50/50 flex-1">
                    {loadingDetails ? (
                        <div className="text-center py-20 text-gray-400 font-medium animate-pulse">Đang tải dữ liệu...</div>
                    ) : brandDetails?.products?.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                            <Package size={48} className="mb-4 opacity-30"/>
                            <p>Hãng này chưa có sản phẩm nào.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {brandDetails.products.map((product) => (
                                <div key={product.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all">
                                    
                                    {/* --- HEADER SẢN PHẨM --- */}
                                    <div 
                                        onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center p-1">
                                                {product.thumbnail ? <img src={product.thumbnail} className="w-full h-full object-contain" alt=""/> : <Package size={24} className="text-gray-400"/>}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-base">{product.name}</h4>
                                                <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-3">
                                                    <span>Tổng tồn: <span className="text-blue-600 font-bold">{product.totalStock}</span></span>
                                                    <span>|</span>
                                                    <span>Tổng bán: <span className="text-green-600 font-bold">{product.totalSold}</span></span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                                            <span>Xem chi tiết</span>
                                            <ChevronDown size={18} className={`transition-transform duration-300 ${expandedProduct === product.id ? 'rotate-180' : ''}`}/>
                                        </div>
                                    </div>

                                    {/* --- VÙNG MỞ RỘNG (BIẾN THỂ & LỊCH SỬ) --- */}
                                    {expandedProduct === product.id && (
                                        <div className="p-5 bg-slate-50 border-t border-gray-100 animate-in slide-in-from-top-2 space-y-8">
                                            
                                            {/* 1. BẢNG CÁC PHIÊN BÀN (VARIANTS) */}
                                            <div>
                                                <h5 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <Layers size={16} className="text-blue-600"/> CÁC PHIÊN BẢN (MÀU/ROM)
                                                </h5>
                                                {product.variants && product.variants.length > 0 ? (
                                                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                                        <table className="w-full text-left text-sm bg-white">
                                                            <thead className="bg-gray-100 text-gray-600">
                                                                <tr>
                                                                    <th className="p-3 font-semibold w-16 text-center">Ảnh</th>
                                                                    <th className="p-3 font-semibold">Màu sắc</th>
                                                                    <th className="p-3 font-semibold">RAM / ROM</th>
                                                                    <th className="p-3 font-semibold text-right">Giá bán</th>
                                                                    <th className="p-3 font-semibold text-center">Tồn kho</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {product.variants.map((v) => (
                                                                    <tr key={v.id} className="hover:bg-blue-50/30">
                                                                        <td className="p-2 text-center">
                                                                            <div className="w-10 h-10 mx-auto rounded border border-gray-100 bg-white flex items-center justify-center overflow-hidden">
                                                                                {v.imageUrl ? <img src={v.imageUrl} className="w-full h-full object-contain"/> : <Package size={14} className="text-gray-300"/>}
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-3 font-bold text-gray-800">{v.color}</td>
                                                                        <td className="p-3 text-gray-600 font-medium">{v.ram} / {v.rom}</td>
                                                                        <td className="p-3 text-right font-bold text-blue-600">{v.price.toLocaleString('vi-VN')} ₫</td>
                                                                        <td className="p-3 text-center">
                                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${v.stockQuantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                                                {v.stockQuantity}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic bg-white p-4 rounded-lg border border-dashed border-gray-300">Sản phẩm này chưa có phiên bản nào.</p>
                                                )}
                                            </div>

                                            {/* 2. BẢNG LỊCH SỬ XUẤT BÁN */}
                                            <div>
                                                <h5 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <CalendarClock size={16} className="text-green-600"/> Lịch sử xuất bán gần đây
                                                </h5>
                                                
                                                {product.exportHistory.length === 0 ? (
                                                    <p className="text-sm text-gray-400 italic bg-white p-4 rounded-lg border border-dashed border-gray-300">Sản phẩm này chưa bán được máy nào.</p>
                                                ) : (
                                                    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                                                        <table className="w-full text-left text-sm bg-white">
                                                            <thead className="bg-gray-100 text-gray-600">
                                                                <tr>
                                                                    <th className="p-3 font-semibold">Ngày bán</th>
                                                                    <th className="p-3 font-semibold">Khách hàng</th>
                                                                    <th className="p-3 font-semibold">Phân loại đã bán</th>
                                                                    <th className="p-3 font-semibold text-center">SL</th>
                                                                    <th className="p-3 font-semibold">IMEI Đã gán</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {product.exportHistory.map((history, idx) => (
                                                                    <tr key={idx} className="hover:bg-gray-50">
                                                                        <td className="p-3 font-medium text-gray-700">{history.date}</td>
                                                                        <td className="p-3 font-semibold">{history.customerName}</td>
                                                                        <td className="p-3 text-gray-500 text-xs">{history.variantInfo}</td>
                                                                        <td className="p-3 text-center font-bold text-green-600">+{history.quantity}</td>
                                                                        <td className="p-3">
                                                                            {history.serialNumbers ? (
                                                                                <span className="text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded">
                                                                                    {history.serialNumbers}
                                                                                </span>
                                                                            ) : <span className="text-xs text-gray-400 italic">Chưa gán IMEI</span>}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}