import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import axiosClient from "../api/axiosClient";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const [message, setMessage] = useState("Đang xác thực tài khoản của bạn...");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !token) {
      setStatus("error");
      setMessage("Đường dẫn xác thực không hợp lệ hoặc bị thiếu thông tin.");
      return;
    }

    const confirmAccount = async () => {
      try {
        const res = await axiosClient.get(`/account/confirm-email?userId=${userId}&token=${encodeURIComponent(token)}`);
        setStatus("success");
        setMessage(res.data.message || "Xác thực email thành công!");
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data || "Xác thực thất bại! Link có thể đã hết hạn hoặc đã được sử dụng.");
      }
    };

    confirmAccount();
  }, [userId, token]);

  return (
    <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 w-full max-w-lg text-center">
        
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 size={64} className="text-blue-600 animate-spin mb-6" />
            <h2 className="text-2xl font-black text-gray-800 mb-2">Đang xử lý</h2>
            <p className="text-gray-500 font-medium">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <CheckCircle size={80} className="text-green-500 mb-6" />
            <h2 className="text-3xl font-black text-gray-800 mb-3">Thành công!</h2>
            <p className="text-gray-600 font-medium mb-8">{message}</p>
            <button 
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <XCircle size={80} className="text-red-500 mb-6" />
            <h2 className="text-3xl font-black text-gray-800 mb-3">Xác thực thất bại</h2>
            <p className="text-gray-600 font-medium mb-8">{message}</p>
            <div className="flex gap-3 w-full">
                <Link to="/" className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">
                    Trang chủ
                </Link>
                <Link to="/login" className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg">
                    Đăng nhập
                </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}