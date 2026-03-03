import { useEffect, useState } from 'react';
import { 
  DollarSign, ShoppingBag, Package, Calendar, Download, 
  CreditCard, TrendingUp, Users 
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import axiosClient from '../../api/axiosClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

// Màu sắc cho biểu đồ tròn
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS = {
  'Pending': '#EAB308',   // Yellow
  'Shipping': '#3B82F6',  // Blue
  'Completed': '#22C55E', // Green
  'Cancelled': '#EF4444'  // Red
};

export default function Dashboard() {
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    aov: 0,
    revenueData: [],
    topProducts: [],
    brandStats: [],
    orderStatus: [],
    recentOrders: []
  });
  
  const [timeframe, setTimeframe] = useState('week');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [timeframe]);

  const fetchStats = async () => {
    try {
        const res = await axiosClient.get(`/stats?timeframe=${timeframe}`);
        setData(res.data);
    } catch (error) {
        console.error("Lỗi tải thống kê:", error);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('dashboard-content');
    try {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
        pdf.save(`Bao-cao-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success("Xuất PDF thành công!");
    } catch (error) {
        toast.error("Lỗi xuất PDF");
    } finally {
        setIsExporting(false);
    }
  };

  // Component Thẻ KPI
  const KpiCard = ({ title, value, subValue, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-gray-800 mt-1">{value}</p>
        {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm">Tổng quan tình hình kinh doanh của cửa hàng.</p>
        </div>
        <div className="flex gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center shadow-sm h-10">
                <div className="px-3 text-gray-400"><Calendar size={16} /></div>
                <select 
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer py-1 pr-8 outline-none"
                >
                    <option value="week">7 ngày qua</option>
                    <option value="month">Tháng này</option>
                    <option value="year">Năm nay</option>
                </select>
            </div>
            <button onClick={handleExportPDF} disabled={isExporting} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition flex items-center gap-2 h-10">
                {isExporting ? "Đang tạo..." : <><Download size={16} /> Xuất PDF</>}
            </button>
        </div>
      </div>
      
      {/* --- KHU VỰC IN PDF --- */}
      <div id="dashboard-content" className="space-y-6 bg-gray-50 p-4 rounded-xl"> 
        
        {/* 1. KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard 
                title="Doanh thu" 
                value={`${data.totalRevenue.toLocaleString('vi-VN')} ₫`} 
                icon={DollarSign} color="bg-blue-500" 
            />
            <KpiCard 
                title="Tổng đơn hàng" 
                value={data.totalOrders} 
                icon={ShoppingBag} color="bg-orange-500" 
            />
            <KpiCard 
                title="Giá trị TB/Đơn (AOV)" 
                value={`${data.aov.toLocaleString('vi-VN')} ₫`} 
                icon={CreditCard} color="bg-green-500" 
            />
            <KpiCard 
                title="Tổng tồn kho" 
                value={data.totalProducts} 
                icon={Package} color="bg-purple-500" 
            />
        </div>

        {/* 2. HÀNG 2: BIỂU ĐỒ DOANH THU & TRẠNG THÁI ĐƠN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Doanh thu (Chiếm 2/3) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-500"/> Biểu đồ Doanh thu & Đơn hàng
                </h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.revenueData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10}/>
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} tickFormatter={(val)=> val >= 1000000 ? `${val/1000000}M` : val}/>
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} hide/>
                            <Tooltip contentStyle={{borderRadius: '8px', border:'none', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}/>
                            <Legend />
                            <Area yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            <Area yAxisId="right" type="monotone" dataKey="orders" name="Số đơn" stroke="#f97316" strokeWidth={3} fill="none" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart Trạng thái đơn (Chiếm 1/3) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6 text-center">Trạng thái đơn hàng</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.orderStatus}
                                cx="50%" cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.orderStatus.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* 3. HÀNG 3: TOP SẢN PHẨM & DOANH THU THEO HÃNG */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Sản phẩm */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6">Top 5 Sản phẩm bán chạy</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={data.topProducts} margin={{left: 20}}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0"/>
                            <XAxis type="number" hide/>
                            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}}/>
                            <Tooltip cursor={{fill: 'transparent'}}/>
                            <Bar dataKey="value" name="Số lượng bán" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                {data.topProducts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Doanh thu theo hãng */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6">Tỷ trọng doanh thu theo Hãng</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.brandStats}
                                cx="50%" cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {data.brandStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + ' ₫'}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* 4. HÀNG 4: ĐƠN HÀNG GẦN ĐÂY */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Đơn hàng vừa đặt</h3>
                <button className="text-blue-600 text-sm font-bold hover:underline">Xem tất cả</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="p-4 font-medium">Mã Đơn</th>
                            <th className="p-4 font-medium">Khách hàng</th>
                            <th className="p-4 font-medium">Ngày đặt</th>
                            <th className="p-4 font-medium">Tổng tiền</th>
                            <th className="p-4 font-medium">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition">
                                <td className="p-4 font-bold text-gray-700">#{order.id}</td>
                                <td className="p-4">{order.customerName}</td>
                                <td className="p-4 text-gray-500">{order.date}</td>
                                <td className="p-4 font-bold text-blue-600">{order.totalAmount.toLocaleString('vi-VN')} ₫</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                        order.status === 'Shipping' ? 'bg-blue-100 text-blue-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}