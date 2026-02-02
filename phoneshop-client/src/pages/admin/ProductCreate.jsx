import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save, UploadCloud, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'; // Thêm icon LinkIcon
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

export default function ProductCreate() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [uploading, setUploading] = useState(false);

  // State 1: Thông tin chung
  const [productData, setProductData] = useState({
    name: '', brandId: '', description: '', thumbnail: '',screen: '',
    chip: '',
    battery: '',
    rearCamera: '',
    frontCamera: '',
    operatingSystem: ''
  });

  // State 2: Biến thể
  const [variants, setVariants] = useState([
    { color: '', ram: '', rom: '', price: 0, stockQuantity: 0, imageUrl: '' }
  ]);

  useEffect(() => {
    axiosClient.get('/brands').then(res => setBrands(res.data));
  }, []);

  // --- HÀM UPLOAD (GIỮ NGUYÊN) ---
  const uploadImage = async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
          const res = await axiosClient.post("/upload", formData, {
              headers: { "Content-Type": "multipart/form-data" },
          });
          return res.data.url;
      } catch (error) {
          toast.error("Lỗi upload ảnh!");
          return null;
      }
  };

  const handleThumbnailUpload = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      setUploading(true);
      const url = await uploadImage(file);
      if(url) {
          setProductData({ ...productData, thumbnail: url }); // Tự điền link vào state
          toast.success("Upload xong!");
      }
      setUploading(false);
      e.target.value = null;
  };

  const handleVariantImageUpload = async (index, e) => {
      const file = e.target.files[0];
      if(!file) return;
      setUploading(true);
      const url = await uploadImage(file);
      if(url) {
          const newVariants = [...variants];
          newVariants[index].imageUrl = url; // Tự điền link vào state
          setVariants(newVariants);
          toast.success("Upload xong!");
      }
      setUploading(false);
      e.target.value = null;
  };

  // --- CÁC HÀM XỬ LÝ KHÁC (GIỮ NGUYÊN) ---
  const handleProductChange = (e) => setProductData({ ...productData, [e.target.name]: e.target.value });
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };
  const addVariant = () => setVariants([...variants, { color: '', ram: '', rom: '', price: 0, stockQuantity: 0, imageUrl: '' }]);
  const removeVariant = (index) => {
    if (variants.length === 1) return toast.error("Phải có ít nhất 1 dòng!");
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productData.name || !productData.brandId) return toast.error("Thiếu thông tin!");
    try {
      const payload = {
        ...productData,
        brandId: parseInt(productData.brandId),
        variants: variants.map(v => ({ ...v, price: parseFloat(v.price), stockQuantity: parseInt(v.stockQuantity) }))
      };
      await axiosClient.post('/products', payload);
      toast.success("Thêm thành công!");
      navigate('/admin/products');
    } catch (error) {
      toast.error("Lỗi thêm sản phẩm");
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
            <Link to="/admin/products" className="text-gray-500 hover:text-gray-800"><ArrowLeft size={24} /></Link>
            <h1 className="text-2xl font-bold text-gray-800">Thêm điện thoại mới</h1>
        </div>
        <button onClick={handleSubmit} disabled={uploading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-blue-700 shadow disabled:opacity-50">
            <Save size={20} /> <span>{uploading ? "Đang tải ảnh..." : "Lưu sản phẩm"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Thông tin chung</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
                        <input name="name" type="text" className="w-full border p-2 rounded focus:outline-blue-500" onChange={handleProductChange} placeholder="Ví dụ: iPhone 16" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Hãng</label>
                        <select name="brandId" className="w-full border p-2 rounded focus:outline-blue-500" onChange={handleProductChange} defaultValue="">
                            <option value="" disabled>-- Chọn hãng --</option>
                            {brands.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
                        </select>
                    </div>

                    {/* --- UPLOAD THUMBNAIL (HYBRID) --- */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Ảnh đại diện</label>
                        
                        {/* Khu vực Preview */}
                        <div className="mb-2 w-full h-40 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                            {productData.thumbnail ? (
                                <img src={productData.thumbnail} alt="Preview" className="w-full h-full object-contain" onError={(e) => e.target.src = "https://placehold.co/400x400?text=Error"}/>
                            ) : (
                                <div className="text-center text-gray-400">
                                    <ImageIcon size={32} className="mx-auto mb-1 opacity-50"/>
                                    <span className="text-xs">Chưa có ảnh</span>
                                </div>
                            )}
                        </div>

                        {/* Khu vực Input (Upload + Paste Link) */}
                        <div className="flex gap-2">
                            {/* Nút Upload */}
                            <label className={`flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded border border-blue-200 cursor-pointer hover:bg-blue-100 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {uploading ? <Loader2 size={18} className="animate-spin"/> : <UploadCloud size={18}/>}
                                <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailUpload} disabled={uploading}/>
                            </label>

                            {/* Ô nhập Link */}
                            <div className="relative flex-1">
                                <LinkIcon size={16} className="absolute left-3 top-3 text-gray-400"/>
                                <input 
                                    name="thumbnail" 
                                    type="text" 
                                    className="w-full pl-9 pr-3 py-2 border rounded focus:outline-blue-500 text-sm" 
                                    placeholder="Dán link ảnh hoặc Upload..." 
                                    value={productData.thumbnail}
                                    onChange={handleProductChange} // Cho phép gõ tay
                                />
                            </div>
                        </div>
                    </div>
                    {/* ----------------------------------- */}

                    {/* --- THÊM KHU VỰC THÔNG SỐ KỸ THUẬT --- */}
                    <div className="pt-4 border-t">
                        <h4 className="font-bold text-sm text-gray-700 mb-3">Thông số kỹ thuật</h4>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500">Màn hình</label>
                                <input name="screen" className="w-full border p-2 rounded text-sm" placeholder="6.7 inch OLED 120Hz" onChange={handleProductChange}/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Chip xử lý</label>
                                <input name="chip" className="w-full border p-2 rounded text-sm" placeholder="Snapdragon 8 Gen 3" onChange={handleProductChange}/>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Pin</label>
                                    <input name="battery" className="w-full border p-2 rounded text-sm" placeholder="5000 mAh" onChange={handleProductChange}/>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500">Hệ điều hành</label>
                                    <input name="operatingSystem" className="w-full border p-2 rounded text-sm" placeholder="iOS 17 / Android 14" onChange={handleProductChange}/>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Camera sau</label>
                                <input name="rearCamera" className="w-full border p-2 rounded text-sm" placeholder="200MP + 12MP + 10MP" onChange={handleProductChange}/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500">Camera trước</label>
                                <input name="frontCamera" className="w-full border p-2 rounded text-sm" placeholder="12MP" onChange={handleProductChange}/>
                            </div>
                        </div>
                    </div>
                    {/* -------------------------------------- */}

                    <div>
                        <label className="block text-sm font-medium mb-1">Mô tả</label>
                        <textarea name="description" rows="4" className="w-full border p-2 rounded focus:outline-blue-500" onChange={handleProductChange}></textarea>
                    </div>
                </div>
            </div>
        </div>

        {/* CỘT PHẢI: BIẾN THỂ */}
        <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-gray-700">Các phiên bản</h3>
                    <button onClick={addVariant} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded font-bold hover:bg-green-200 flex items-center">
                        <Plus size={16} className="mr-1"/> Thêm dòng
                    </button>
                </div>

                <div className="space-y-6">
                    {variants.map((variant, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded border relative group">
                            <button onClick={() => removeVariant(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"><Trash2 size={18} /></button>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div><label className="text-xs font-bold text-gray-500">Màu sắc</label><input type="text" className="w-full border p-1 rounded text-sm" value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)}/></div>
                                <div><label className="text-xs font-bold text-gray-500">RAM</label><input type="text" className="w-full border p-1 rounded text-sm" value={variant.ram} onChange={e => handleVariantChange(index, 'ram', e.target.value)}/></div>
                                <div><label className="text-xs font-bold text-gray-500">ROM</label><input type="text" className="w-full border p-1 rounded text-sm" value={variant.rom} onChange={e => handleVariantChange(index, 'rom', e.target.value)}/></div>
                                <div><label className="text-xs font-bold text-gray-500">Giá bán</label><input type="number" className="w-full border p-1 rounded text-sm" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)}/></div>
                                <div><label className="text-xs font-bold text-gray-500">Kho</label><input type="number" className="w-full border p-1 rounded text-sm" value={variant.stockQuantity} onChange={e => handleVariantChange(index, 'stockQuantity', e.target.value)}/></div>

                                {/* --- UPLOAD ẢNH BIẾN THỂ (HYBRID) --- */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Ảnh màu này</label>
                                    <div className="flex gap-1">
                                        {/* Preview nhỏ */}
                                        <div className="w-9 h-9 border rounded bg-white flex items-center justify-center overflow-hidden shrink-0">
                                            {variant.imageUrl ? (
                                                <img src={variant.imageUrl} className="w-full h-full object-contain" alt=""/>
                                            ) : <ImageIcon size={14} className="text-gray-300"/>}
                                        </div>

                                        {/* Nút Upload */}
                                        <label className={`w-9 h-9 flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-200 rounded cursor-pointer hover:bg-blue-100 ${uploading ? 'opacity-50' : ''}`}>
                                            {uploading ? <Loader2 size={14} className="animate-spin"/> : <UploadCloud size={14}/>}
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleVariantImageUpload(index, e)} disabled={uploading}/>
                                        </label>

                                        {/* Ô nhập Link */}
                                        <input 
                                            type="text" 
                                            className="flex-1 border p-1 rounded text-xs focus:outline-blue-500" 
                                            placeholder="Dán link hoặc Up..."
                                            value={variant.imageUrl}
                                            onChange={e => handleVariantChange(index, 'imageUrl', e.target.value)} // Cho phép gõ tay
                                        />
                                    </div>
                                </div>
                                {/* --------------------------------------- */}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}