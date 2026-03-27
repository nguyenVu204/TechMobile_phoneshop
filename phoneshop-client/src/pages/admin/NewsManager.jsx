import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, Eye, List } from "lucide-react"; // Thêm icon List
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";

export default function NewsManager() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Gọi API lấy danh sách tin tức
      const res = await axiosClient.get("/news/admin-list"); 
      setNewsList(res.data);
    } catch (error) {
      toast.error("Lỗi tải danh sách tin tức!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Bạn có chắc muốn xóa bài viết: "${title}"?`)) return;
    try {
      await axiosClient.delete(`/news/${id}`);
      toast.success("Xóa bài viết thành công!");
      setNewsList(newsList.filter(news => news.id !== id));
    } catch (error) {
      toast.error("Xóa bài viết thất bại!");
    }
  };

  // Lọc bài viết theo tìm kiếm local
  const filteredNews = newsList.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Tin tức</h1>
          <p className="text-slate-500 text-sm">Tìm thấy {filteredNews.length} bài viết</p>
        </div>

        <div className="flex gap-3 items-center w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Tìm tên bài viết..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          {/* NÚT QUẢN LÝ DANH MỤC */}
          <Link
            to="/admin/news/categories"
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition whitespace-nowrap"
          >
            <List size={18} />
            <span className="hidden md:inline">Danh mục</span>
          </Link>

          {/* NÚT VIẾT BÀI MỚI */}
          <Link
            to="/admin/news/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition whitespace-nowrap"
          >
            <Plus size={18} />
            <span className="hidden md:inline">Viết bài mới</span>
          </Link>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-16">ID</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-24">Ảnh</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Tiêu đề</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-32">Ngày đăng</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-24 text-center">Lượt xem</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-32 text-center">Trạng thái</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase w-28 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-400">Đang tải...</td></tr>
              ) : filteredNews.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-gray-400">Chưa có bài viết nào.</td></tr>
              ) : (
                filteredNews.map((news) => (
                  <tr key={news.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-700">#{news.id}</td>
                    <td className="p-4">
                      <div className="w-16 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center border">
                        {news.thumbnail ? (
                          <img src={news.thumbnail} alt="thumb" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-400">No Img</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-800 text-sm line-clamp-2" title={news.title}>{news.title}</p>
                      <Link to={`/news/${news.slug}`} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                         <Eye size={12}/> Xem thử
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(news.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-4 text-center font-bold text-gray-700">{news.viewCount}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        news.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {news.status === 'Published' ? 'Xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/admin/news/edit/${news.id}`} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => handleDelete(news.id, news.title)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}