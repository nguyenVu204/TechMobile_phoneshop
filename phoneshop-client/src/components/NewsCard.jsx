import { Link } from "react-router-dom";
import { Clock, Eye, Newspaper } from "lucide-react";

export default function NewsCard({ item }) {
  return (
    <Link 
      to={`/news/${item.slug}`} 
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
    >
      {/* Thumbnail */}
      <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
        {item.thumbnail ? (
            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400"><Newspaper size={40}/></div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            <span className="flex items-center gap-1"><Clock size={14}/> {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
            <span className="flex items-center gap-1"><Eye size={14}/> {item.viewCount} lượt xem</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3 leading-snug group-hover:text-blue-600 transition line-clamp-2">
          {item.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1">
          {item.summary || "Đang cập nhật nội dung..."}
        </p>
        <span className="text-blue-600 font-bold text-sm inline-flex items-center gap-1">Đọc tiếp →</span>
      </div>
    </Link>
  );
}