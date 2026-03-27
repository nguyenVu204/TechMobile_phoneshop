import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Save, X, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "../../api/axiosClient";
import { Link } from "react-router-dom";

export default function NewsCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // State form
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    slug: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get("/newscategories");
      setCategories(res.data);
    } catch (error) {
      toast.error("Lỗi tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/á|à|ả|ạ|ã|ă|â|ấ|ầ|ẩ|ẫ|ậ|ă|ắ|ằ|ẳ|ẵ|ặ/gi, "a")
      .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, "e")
      .replace(/i|í|ì|ỉ|ĩ|ị/gi, "i")
      .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, "o")
      .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, "u")
      .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, "y")
      .replace(/đ/gi, "d")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleNameChange = (e) => {
    setFormData({
      ...formData,
      name: e.target.value,
      slug: generateSlug(e.target.value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Tên danh mục không được để trống!");

    try {
      if (isEditing) {
        await axiosClient.put(`/newscategories/${formData.id}`, formData);
        toast.success("Cập nhật thành công!");
      } else {
        await axiosClient.post("/newscategories", formData);
        toast.success("Thêm mới thành công!");
      }
      setFormData({ id: 0, name: "", slug: "", description: "" });
      setIsEditing(false);
      fetchCategories();
    } catch (error) {
      toast.error("Thao tác thất bại!");
    }
  };

  const handleEdit = (cat) => {
    setFormData(cat);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      await axiosClient.delete(`/newscategories/${id}`);
      toast.success("Xóa thành công!");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data || "Lỗi khi xóa!");
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-4">
        <Link
          to="/admin/news"
          className="text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Chuyên mục tin tức</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
          <h3 className="font-bold text-lg mb-4 text-gray-700">
            {isEditing ? "Sửa danh mục" : "Thêm danh mục mới"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full border p-2.5 rounded-lg focus:outline-blue-500"
                placeholder="VD: Khuyến mãi"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Đường dẫn (Slug)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="w-full border p-2.5 rounded-lg bg-gray-50 focus:outline-blue-500"
                placeholder="khuyen-mai"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Mô tả (Tùy chọn)
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full border p-2.5 rounded-lg focus:outline-blue-500 resize-none"
                rows="3"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-blue-700 transition"
              >
                {isEditing ? <Save size={18} /> : <Plus size={18} />}
                {isEditing ? "Lưu thay đổi" : "Thêm mới"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ id: 0, name: "", slug: "", description: "" });
                  }}
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* DANH SÁCH (2/3) */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-4 font-medium uppercase tracking-wider">
                  Tên danh mục
                </th>
                <th className="p-4 font-medium uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="p-4 font-medium uppercase tracking-wider text-right">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-400">
                    Chưa có danh mục nào
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{cat.name}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        /{cat.slug}
                      </p>
                    </td>
                    <td className="p-4 text-gray-600">
                      {cat.description || (
                        <span className="italic text-gray-300">Không có</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                        >
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
