import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import useAuthStore from '../stores/useAuthStore';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const processTokenAndLogin = (token) => {
      const decodedUser = jwtDecode(token);
      const role = decodedUser['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decodedUser.role;
      
      const userData = {
        email: decodedUser.email || decodedUser['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        fullName: decodedUser.fullName || decodedUser.name, 
        id: decodedUser['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decodedUser.sub,
        role: role
      };

      login(userData, token);
      
      if (role === 'Admin') {
          toast.success("Xin chào Admin! Đang vào trang quản trị...");
          navigate('/admin');
      } else {
          toast.success(`Chào mừng quay lại, ${userData.fullName}!`);
          navigate('/');
      }
  };

  // --- ĐĂNG NHẬP TRUYỀN THỐNG ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosClient.post('/account/login', formData);
      processTokenAndLogin(res.data.token);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data || "Đăng nhập thất bại! Sai email hoặc mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  // --- ĐĂNG NHẬP BẰNG GOOGLE ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
        const res = await axiosClient.post('/account/google-login', {
            idToken: credentialResponse.credential
        });
        processTokenAndLogin(res.data.token);
    } catch (error) {
        console.error(error);
        toast.error(error.response?.data || "Đăng nhập Google thất bại!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md">
        <h2 className="text-3xl font-black text-center mb-8 text-gray-800">Đăng Nhập</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <input 
              type="email" required
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu</label>
            <input 
              type="password" required
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-bold transition shadow-md shadow-blue-600/20 disabled:opacity-70">
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        {/* Khu vực Đăng nhập Google */}
        <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="relative flex justify-center mb-6">
                <span className="bg-white px-4 text-xs font-bold text-gray-400 absolute -top-3">HOẶC ĐĂNG NHẬP BẰNG</span>
            </div>
            <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Lỗi kết nối tới Google')}
                  useOneTap
                  theme="outline"
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                />
            </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 font-medium">
          Chưa có tài khoản? <Link to="/register" className="text-blue-600 font-bold hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}