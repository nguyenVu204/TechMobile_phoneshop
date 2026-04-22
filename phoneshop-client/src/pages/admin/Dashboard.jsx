import { useEffect, useState } from 'react';
import { 
  DollarSign, ShoppingBag, Package, Calendar, Download, 
  CreditCard, TrendingUp, Filter 
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import axiosClient from '../../api/axiosClient';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS = {
  'Pending': '#EAB308',   
  'Shipping': '#3B82F6',  
  'Completed': '#22C55E', 
  'Cancelled': '#EF4444'  
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
  
  // --- STATE BỘ LỌC THỜI GIAN ---
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [filterType, setFilterType] = useState('week'); // week, this_month, specific_month, year, custom
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [dateInfo, setDateInfo] = useState("7 ngày qua");
  const [isExporting, setIsExporting] = useState(false);

  // Sinh mảng năm (Ví dụ: từ 2023 đến năm hiện tại + 1)
  const years = Array.from({length: 5}, (_, i) => currentYear - 2 + i).sort((a,b)=>b-a);

  useEffect(() => {
    fetchStats();
  }, [filterType, selectedMonth, selectedYear, startDate, endDate]);

  const fetchStats = async () => {
    try {
        let url = `/stats?timeframe=${filterType === 'this_month' ? 'month' : filterType}`;
        
        if (filterType === 'specific_month') {
            url = `/stats?timeframe=month&month=${selectedMonth}&year=${selectedYear}`;
        } else if (filterType === 'year') {
            url = `/stats?timeframe=year&year=${selectedYear}`;
        } else if (filterType === 'custom') {
            if (!startDate || !endDate) return; // Đợi nhập đủ từ ngày - đến ngày
            url = `/stats?timeframe=custom&startDate=${startDate}&endDate=${endDate}`;
        }

        const res = await axiosClient.get(url);
        setData(res.data);
        
        // Cập nhật text hiển thị thời gian
        if(res.data.timeRange) {
            setDateInfo(`Dữ liệu từ ${res.data.timeRange.from} đến ${res.data.timeRange.to}`);
        }
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
        pdf.save(`Bao-cao-doanh-thu.pdf`);
        toast.success("Xuất PDF thành công!");
    } catch (error) {
        toast.error("Lỗi xuất PDF");
    } finally {
        setIsExporting(false);
    }
  };

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
      {/* HEADER & FILTERS */}
      <div className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            {/* Hiển thị dòng text xác nhận thời gian đang lọc */}
            <p className="text-blue-600 text-sm font-semibold mt-1 flex items-center gap-1">
                <Filter size={14}/> {dateInfo}
            </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
            
            {/* 1. Chọn loại lọc */}
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex items-center shadow-sm h-10">
                <div className="px-3 text-gray-400"><Calendar size={16} /></div>
                <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer py-1 pr-8 outline-none"
                >
                    <option value="week">7 ngày qua</option>
                    <option value="this_month">Tháng này</option>
                    <option value="specific_month">Tháng cụ thể</option>
                    <option value="year">Nguyên năm</option>
                    <option value="custom">Tùy chọn khoảng ngày</option>
                </select>
            </div>

            {/* 2. Lọc tháng cụ thể */}
            {filterType === 'specific_month' && (
                <div className="flex gap-2 h-10 animate-in fade-in slide-in-from-left-2">
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-white border border-gray-200 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-3 outline-none shadow-sm cursor-pointer"
                    >
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>Tháng {m}</option>
                        ))}
                    </select>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-white border border-gray-200 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-3 outline-none shadow-sm cursor-pointer"
                    >
                        {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
                    </select>
                </div>
            )}

            {/* 3. Lọc theo năm */}
            {filterType === 'year' && (
                <div className="flex gap-2 h-10 animate-in fade-in slide-in-from-left-2">
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-white border border-gray-200 text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-3 outline-none shadow-sm cursor-pointer"
                    >
                        {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
                    </select>
                </div>
            )}

            {/* 4. Lọc tùy chọn (Từ ngày - Đến ngày) */}
            {filterType === 'custom' && (
                <div className="flex items-center gap-2 h-10 bg-white border border-gray-200 rounded-lg px-3 shadow-sm animate-in fade-in slide-in-from-left-2">
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-sm font-semibold text-gray-700 focus:outline-none bg-transparent"
                    />
                    <span className="text-gray-400 font-medium text-xs">đến</span>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-sm font-semibold text-gray-700 focus:outline-none bg-transparent"
                    />
                </div>
            )}

            <button onClick={handleExportPDF} disabled={isExporting} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition flex items-center gap-2 h-10 ml-auto">
                {isExporting ? "Đang tạo..." : <><Download size={16} /> Xuất PDF</>}
            </button>
        </div>
      </div>
      
      {/* --- KHU VỰC IN PDF --- */}
      <div id="dashboard-content" className="space-y-6 bg-gray-50 p-4 rounded-xl"> 
        
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard title="Doanh thu" value={`${data.totalRevenue.toLocaleString('vi-VN')} ₫`} icon={DollarSign} color="bg-blue-500" />
            <KpiCard title="Tổng đơn hàng" value={data.totalOrders} icon={ShoppingBag} color="bg-orange-500" />
            <KpiCard title="Giá trị TB/Đơn" value={`${data.aov.toLocaleString('vi-VN')} ₫`} icon={CreditCard} color="bg-green-500" />
            <KpiCard title="Tồn kho hiện tại" value={data.totalProducts} icon={Package} color="bg-purple-500" />
        </div>

        {/* BIỂU ĐỒ DOANH THU & TRẠNG THÁI ĐƠN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* TOP SẢN PHẨM & DOANH THU THEO HÃNG */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6">Top 5 Sản phẩm bán chạy nhất</h3>
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

        {/* ĐƠN HÀNG GẦN ĐÂY */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Các đơn hàng phát sinh trong khoảng thời gian này</h3>
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
                        {data.recentOrders.length === 0 ? (
                             <tr><td colSpan="5" className="p-8 text-center text-gray-400">Không có đơn hàng nào trong khoảng thời gian này</td></tr>
                        ) : data.recentOrders.map((order) => (
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