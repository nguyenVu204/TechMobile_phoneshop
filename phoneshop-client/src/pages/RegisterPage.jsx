import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import useAuthStore from '../stores/useAuthStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      };

      const res = await axiosClient.post('/account/register', payload);

      if (res.status === 200) {
        // CẬP NHẬT THÔNG BÁO TẠI ĐÂY
        toast.success("Đăng ký thành công! Vui lòng kiểm tra Email để kích hoạt tài khoản.", { duration: 5000 });
        navigate('/login');
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (Array.isArray(data)) {
            data.forEach(err => toast.error(err.description));
        } 
        else if (typeof data === 'string') {
            toast.error(data);
        }
        else {
             toast.error("Đăng ký thất bại. Vui lòng kiểm tra lại!");
        }
      } else {
        toast.error("Lỗi kết nối đến Server!");
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Login cho trang đăng ký luôn
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
        const res = await axiosClient.post('/account/google-login', {
            idToken: credentialResponse.credential
        });
        
        const token = res.data.token;
        const decodedUser = jwtDecode(token);
        const role = decodedUser['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedUser.role;
        
        login({
            email: decodedUser.email || decodedUser['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
            fullName: decodedUser.fullName || decodedUser.name, 
            id: decodedUser['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decodedUser.sub,
            role: role
        }, token);
        
        toast.success("Đăng ký & Đăng nhập Google thành công!");
        navigate('/');
    } catch (error) {
        toast.error(error.response?.data || "Đăng nhập Google thất bại!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md">
        <h2 className="text-3xl font-black text-center mb-8 text-gray-800">Đăng Ký</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Họ và tên</label>
            <input 
              name="fullName" type="text" required
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              placeholder="Nguyễn Văn A"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              name="email" type="email" required
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              placeholder="email@example.com"
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu</label>
            <input 
              name="password" type="password" required
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              placeholder="Ít nhất 6 ký tự (Hoa, thường, số)"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nhập lại mật khẩu</label>
            <input 
              name="confirmPassword" type="password" required
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              placeholder="Nhập lại mật khẩu trên"
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold transition shadow-md mt-6 disabled:opacity-70">
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="relative flex justify-center mb-6">
                <span className="bg-white px-4 text-xs font-bold text-gray-400 absolute -top-3">HOẶC</span>
            </div>
            <div className="flex justify-center">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Lỗi kết nối tới Google')} text="signup_with" />
            </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 font-medium">
          Đã có tài khoản? <Link to="/login" className="text-blue-600 font-bold hover:underline">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}