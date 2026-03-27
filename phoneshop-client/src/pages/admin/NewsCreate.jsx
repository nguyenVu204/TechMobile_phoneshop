import { useEffect, useState } from "react";
import { ArrowLeft, Save, UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";

// Dùng react-quill-new chuẩn React 19
import ReactQuill from 'react-quill-new'; 
import 'react-quill-new/dist/quill.snow.css'; 

export default function NewsCreate() {
  const navigate = useNavigate();
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [newsData, setNewsData] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    thumbnail: "",
    status: "Published", // Mặc định Published cho nhanh
    categoryIds: [],
    relatedProductId: ""
  });

  // Fetch danh mục tin tức khi vào trang
  useEffect(() => {
    axiosClient.get("/newscategories")
      .then(res => setCategories(res.data))
      .catch(err => console.error("Lỗi lấy danh mục", err));
  }, []);

  const generateSlug = (text) => {
    return text.toString().toLowerCase()
      .replace(/á|à|ả|ạ|ã|ă|â|ấ|ầ|ẩ|ẫ|ậ|ă|ắ|ằ|ẳ|ẵ|ặ/gi, 'a')
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
      .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
      .replace(/đ/gi, 'd')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleTitleChange = (e) => {
      const newTitle = e.target.value;
      setNewsData({ 
          ...newsData, 
          title: newTitle, 
          slug: generateSlug(newTitle)
      });
  };

  const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
          const res = await axiosClient.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
          setNewsData({ ...newsData, thumbnail: res.data.url });
          toast.success("Đã tải ảnh lên!");
      } catch (error) {
          toast.error("Lỗi upload ảnh!");
      } finally {
          setUploading(false);
          e.target.value = null;
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newsData.title || !newsData.content) {
        return toast.error("Vui lòng nhập Tiêu đề và Nội dung bài viết!");
    }

    setSubmitting(true);
    try {
      const payload = {
          ...newsData,
          relatedProductId: newsData.relatedProductId ? parseInt(newsData.relatedProductId) : null
      };
      
      await axiosClient.post(`/news`, payload);
      toast.success("Đăng bài viết thành công!");
      navigate("/admin/news");
    } catch (error) {
      toast.error("Đăng bài thất bại! Vui lòng kiểm tra lại.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet',
  'link', 'image', 'video'
];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link to="/admin/news" className="text-gray-500 hover:text-gray-800 transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Viết bài mới</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center space-x-2 hover:bg-blue-700 shadow transition disabled:opacity-50"
        >
          {submitting ? <Loader2 size={20} className="animate-spin"/> : <Save size={20} />} 
          <span>{submitting ? "Đang lưu..." : "Đăng bài"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-5">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tiêu đề bài viết <span className="text-red-500">*</span></label>
                    <input 
                        type="text" value={newsData.title} onChange={handleTitleChange} 
                        className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition"
                        placeholder="VD: Đánh giá chi tiết iPhone 15 Pro Max..."
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Đường dẫn (Slug)</label>
                    <input 
                        type="text" value={newsData.slug} onChange={(e) => setNewsData({...newsData, slug: e.target.value})} 
                        className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none text-gray-500 bg-gray-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tóm tắt (Trích dẫn)</label>
                    <textarea 
                        rows="3" value={newsData.summary} onChange={(e) => setNewsData({...newsData, summary: e.target.value})} 
                        className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                    />
                </div>

                <div className="pb-12">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung chi tiết <span className="text-red-500">*</span></label>
                    <ReactQuill 
                        theme="snow" value={newsData.content} onChange={(content) => setNewsData({...newsData, content})} 
                        modules={quillModules} formats={quillFormats} className="h-96 bg-white rounded-lg"
                    />
                </div>
            </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Trạng thái xuất bản</label>
                    <select 
                        value={newsData.status} onChange={(e) => setNewsData({...newsData, status: e.target.value})}
                        className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none font-bold text-gray-700 cursor-pointer"
                    >
                        <option value="Published">🟢 Xuất bản ngay</option>
                        <option value="Draft">🟡 Lưu nháp</option>
                    </select>
                </div>
            </div>

            {/* CHỌN DANH MỤC */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-3">Danh mục tin tức</label>
                <div className="space-y-2 border border-gray-200 p-4 rounded-lg max-h-48 overflow-y-auto bg-gray-50/50">
                    {categories.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Chưa có danh mục nào.</p>
                    ) : (
                        categories.map(cat => (
                            <label key={cat.id} className="flex items-center gap-3 cursor-pointer p-1 hover:bg-white rounded transition">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    checked={newsData.categoryIds.includes(cat.id)}
                                    onChange={(e) => {
                                        if(e.target.checked) {
                                            setNewsData({...newsData, categoryIds: [...newsData.categoryIds, cat.id]});
                                        } else {
                                            setNewsData({...newsData, categoryIds: newsData.categoryIds.filter(id => id !== cat.id)});
                                        }
                                    }}
                                />
                                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                            </label>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-3">Ảnh đại diện (Thumbnail)</label>
                <div className="mb-4 w-full h-48 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden relative group">
                    {newsData.thumbnail ? (
                        <>
                            <img src={newsData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <button onClick={() => setNewsData({...newsData, thumbnail: ""})} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold">Xóa ảnh</button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-400 flex flex-col items-center">
                            <ImageIcon size={36} className="mb-2 opacity-50" />
                            <span className="text-xs font-medium">Tỷ lệ chuẩn 16:9</span>
                        </div>
                    )}
                </div>
                
                <label className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 cursor-pointer font-bold text-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                    {uploading ? "Đang tải lên..." : "Chọn ảnh từ máy"}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading}/>
                </label>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-1">Gắn sản phẩm liên quan</label>
                <input 
                    type="number" value={newsData.relatedProductId} onChange={(e) => setNewsData({...newsData, relatedProductId: e.target.value})} 
                    className="w-full border border-gray-200 p-3 rounded-lg focus:outline-blue-500" placeholder="VD: 1, 2..."
                />
            </div>
        </div>
      </div>
    </div>
  );
}