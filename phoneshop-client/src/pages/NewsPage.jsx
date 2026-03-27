import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Newspaper, ChevronLeft, ChevronRight } from "lucide-react";
import axiosClient from "../api/axiosClient";
import NewsCard from "../components/NewsCard";

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get(`/news?page=${page}&limit=6`);
        setNews(res.data.items);
        setTotalPages(res.data.totalPages);
      } catch (error) {
        console.error("Lỗi lấy danh sách tin tức", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Tiêu đề trang */}
        <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 flex items-center gap-3">
                <Newspaper className="text-blue-600" size={36}/> Tin tức công nghệ
            </h1>
            <p className="text-gray-500 mt-2">Cập nhật những thông tin mới nhất về thị trường điện thoại di động.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-200 h-80 rounded-2xl"></div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 text-gray-500">Chưa có bài viết nào.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sử dụng Component NewsCard ở đây */}
            {news.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
            <div className="flex justify-center mt-12 space-x-2">
                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 border rounded-xl hover:bg-white disabled:opacity-50 transition"><ChevronLeft size={20}/></button>
                {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-xl font-bold transition ${page === i + 1 ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:bg-white border border-transparent hover:border-gray-200"}`}>
                    {i + 1}
                </button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-2 border rounded-xl hover:bg-white disabled:opacity-50 transition"><ChevronRight size={20}/></button>
            </div>
        )}
      </div>
    </div>
  );
}