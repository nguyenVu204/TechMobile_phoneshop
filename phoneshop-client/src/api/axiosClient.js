import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'https://localhost:7069/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use((config) => {
    // Lấy token từ LocalStorage
    const authData = localStorage.getItem('phone-shop-auth');
    
    if (authData) {
        const parsedData = JSON.parse(authData);
        const token = parsedData.state.token;
        
        // Nếu có token thì gán vào Header: Authorization: Bearer <token>
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {

            // Nếu đang ở trang login thì KHÔNG redirect nữa
            if (window.location.pathname !== '/login') {
                localStorage.removeItem('phone-shop-auth');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;