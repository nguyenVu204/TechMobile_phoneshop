import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock,
  Eye,
  ArrowLeft,
  ShoppingCart,
  MessageSquare,
  Send,
  UserCircle,
  Newspaper,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import useAuthStore from "../stores/useAuthStore";
import toast from "react-hot-toast";

export default function NewsDetail() {
  const { slug } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  // State chứa danh sách tin tức ở Sidebar
  const [recentNews, setRecentNews] = useState([]);

  // --- STATE CHO BÌNH LUẬN ---
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        // 1. Lấy chi tiết bài viết hiện tại
        const res = await axiosClient.get(`/news/details/${slug}`);
        setNews(res.data);

        // 2. Lấy danh sách bình luận
        fetchComments(res.data.id);

        // 3. Lấy tin tức mới nhất cho Sidebar bên phải
        const recentRes = await axiosClient.get(`/news?page=1&limit=6`);
        // Lọc bỏ bài viết đang xem hiện tại để không bị trùng
        const filteredRecent = recentRes.data.items
          .filter((item) => item.id !== res.data.id)
          .slice(0, 5);
        setRecentNews(filteredRecent);
      } catch (error) {
        console.error("Lỗi lấy bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
    // Cuộn lên đầu trang mỗi khi chuyển sang bài viết khác
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchComments = async (newsId) => {
    try {
      const res = await axiosClient.get(`/news/${newsId}/comments`);
      setComments(res.data);
    } catch (error) {
      console.error("Lỗi tải bình luận:", error);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return toast.error("Vui lòng nhập nội dung!");
    if (!user) return toast.error("Bạn cần đăng nhập để bình luận!");

    setSubmittingComment(true);
    try {
      await axiosClient.post(`/news/${news.id}/comments`, {
        content: newComment,
      });
      toast.success("Đã gửi bình luận!");
      setNewComment("");
      fetchComments(news.id);
    } catch (error) {
      toast.error("Lỗi gửi bình luận!");
    } finally {
      setSubmittingComment(false);
    }
  };

  const convertYoutubeLinks = (html) => {
    if (!html) return "";

    // link dạng watch
    html = html.replace(
      /https?:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g,
      (match, id) =>
        `<iframe class="ql-video" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`,
    );

    // link dạng embed
    html = html.replace(
      /https?:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)/g,
      (match, id) =>
        `<iframe class="ql-video" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`,
    );

    // link dạng rút gọn youtu.be
    html = html.replace(
      /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/g,
      (match, id) =>
        `<iframe class="ql-video" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`,
    );

    return html;
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  if (!news)
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Không tìm thấy bài viết!
        </h1>
        <Link to="/news" className="text-blue-600 hover:underline font-bold">
          Quay lại danh sách
        </Link>
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen py-8 md:py-12">
      {/* Nới rộng container ra max-w-6xl (khoảng 1152px) để đủ chỗ cho 2 cột */}
      <div className="container mx-auto px-4 max-w-6xl">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 transition font-bold text-sm"
        >
          <ArrowLeft size={18} /> Quay lại Tin tức
        </Link>

        {/* CHIA LƯỚI 2 CỘT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ======================================================== */}
          {/* CỘT TRÁI: NỘI DUNG CHÍNH (Chiếm 2/3 không gian màn hình) */}
          {/* ======================================================== */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. KHUNG BÀI VIẾT */}
            <article className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
              <header className="mb-8">
                {/* Tags / Chuyên mục nếu có */}
                {news.categories && news.categories.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {news.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
                  {news.title}
                </h1>
                <div className="flex items-center gap-6 text-sm text-gray-500 font-medium border-b border-gray-100 pb-6">
                  <span className="flex items-center gap-2">
                    <Clock size={16} />{" "}
                    {new Date(news.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye size={16} /> {news.viewCount} lượt xem
                  </span>
                </div>
              </header>

              {news.thumbnail && (
                <div className="w-full aspect-video rounded-2xl overflow-hidden mb-10 border border-gray-100">
                  <img
                    src={news.thumbnail}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Tóm tắt bài viết (In đậm) */}
              {news.summary && (
                <p className="text-lg font-bold text-gray-800 mb-8 leading-relaxed">
                  {news.summary}
                </p>
              )}

              {/* Nội dung HTML (Có CSS chống tràn Video & Ảnh) */}
              <div
                className="
                            prose prose-lg md:prose-xl prose-blue max-w-none text-gray-700 leading-relaxed 
                            break-words overflow-hidden
                            [&_.ql-video]:w-full [&_.ql-video]:aspect-video [&_.ql-video]:rounded-2xl [&_.ql-video]:my-6
                            [&_img]:w-full [&_img]:rounded-2xl [&_img]:object-contain [&_img]:my-6
                        "
                dangerouslySetInnerHTML={{
                  __html: convertYoutubeLinks(news.content),
                }}
              />
            </article>

            {/* 2. SẢN PHẨM LIÊN QUAN TRONG BÀI */}
            {news.relatedProduct && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-blue-600/20">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white rounded-2xl p-2 shrink-0 shadow-sm">
                    <img
                      src={news.relatedProduct.thumbnail}
                      alt={news.relatedProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-white">
                    <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">
                      Sản phẩm nhắc đến trong bài
                    </p>
                    <h4 className="text-2xl font-bold">
                      {news.relatedProduct.name}
                    </h4>
                  </div>
                </div>
                <Link
                  to={`/product/${news.relatedProduct.id}`}
                  className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition flex items-center gap-2 whitespace-nowrap shadow-md"
                >
                  <ShoppingCart size={20} /> Mua ngay
                </Link>
              </div>
            )}

            {/* 3. KHU VỰC BÌNH LUẬN */}
            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <MessageSquare className="text-blue-600" />
                Bình luận ({comments.length})
              </h3>

              <div className="mb-10">
                {user ? (
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                      {user.fullName
                        ? user.fullName.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Chia sẻ ý kiến của bạn về bài viết này..."
                        className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition"
                        rows="3"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handlePostComment}
                          disabled={submittingComment || !newComment.trim()}
                          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                          {submittingComment ? (
                            "Đang gửi..."
                          ) : (
                            <>
                              <Send size={18} /> Gửi bình luận
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                    <UserCircle
                      size={48}
                      className="mx-auto text-gray-400 mb-4"
                    />
                    <h4 className="text-lg font-bold text-gray-700 mb-2">
                      Bạn cần đăng nhập để bình luận
                    </h4>
                    <Link
                      to="/login"
                      className="inline-block bg-blue-600 text-white px-8 py-3 mt-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
                    >
                      Đăng nhập ngay
                    </Link>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500 py-6 italic border-t border-dashed border-gray-200 mt-6 pt-10">
                    Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ ý kiến!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold shrink-0">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-gray-800 text-sm">
                            {comment.userName}
                          </h5>
                          <span className="text-xs text-gray-400 font-medium">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CỘT PHẢI: SIDEBAR (Tin tức liên quan / Mới nhất)         */}
          {/* ======================================================== */}
          <div className="lg:col-span-1">
            {/* Dùng sticky để Sidebar trượt theo khi người dùng cuộn bài viết */}
            <div className="sticky top-6 space-y-6">
              {/* Widget Tin mới nhất */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <Newspaper className="text-blue-600" size={20} />
                  Bài viết mới nhất
                </h3>

                <div className="space-y-5">
                  {recentNews.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      Đang cập nhật thêm...
                    </p>
                  ) : (
                    recentNews.map((item) => (
                      <Link
                        key={item.id}
                        to={`/news/${item.slug}`}
                        className="flex gap-4 group"
                      >
                        {/* Ảnh nhỏ */}
                        <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                              alt={item.title}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Newspaper size={20} />
                            </div>
                          )}
                        </div>
                        {/* Tiêu đề */}
                        <div className="flex-1 flex flex-col justify-center">
                          <h4 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1 font-medium">
                            <Clock size={12} />{" "}
                            {new Date(item.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Widget Quảng cáo (Tùy chọn cho đẹp) */}
              <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl p-6 text-white text-center shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition duration-700"></div>
                <h4 className="font-black text-xl mb-2 relative z-10">
                  ĐĂNG KÝ NHẬN TIN
                </h4>
                <p className="text-sm text-gray-300 mb-6 relative z-10">
                  Nhận ngay các thông tin công nghệ nóng hổi nhất mỗi tuần.
                </p>
                <div className="relative z-10 flex flex-col gap-2">
                  <input
                    type="email"
                    placeholder="Email của bạn..."
                    className="w-full px-4 py-3 rounded-xl text-sm text-gray-800 focus:outline-none"
                  />
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md">
                    Đăng ký
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
