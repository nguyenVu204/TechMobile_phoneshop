using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDashboardStats([FromQuery] string timeframe = "week")
        {
            // 1. KPI TỔNG QUAN
            var totalRevenue = await _context.Orders
                .Where(o => o.Status != "Cancelled")
                .SumAsync(o => o.TotalAmount);

            var totalOrders = await _context.Orders.CountAsync();
            var totalProducts = await _context.ProductVariants.SumAsync(v => v.StockQuantity); // Tổng tồn kho

            // Giá trị đơn hàng trung bình (AOV)
            var aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // 2. BIỂU ĐỒ DOANH THU & ĐƠN HÀNG (Line Chart)
            var today = DateTime.Today;
            DateTime fromDate;
            int daysCount;

            if (timeframe == "month")
            {
                fromDate = new DateTime(today.Year, today.Month, 1);
                daysCount = DateTime.DaysInMonth(today.Year, today.Month);
            }
            else if (timeframe == "year")
            {
                fromDate = new DateTime(today.Year, 1, 1);
                daysCount = 12; // Dùng logic riêng cho năm
            }
            else // "week"
            {
                fromDate = today.AddDays(-6);
                daysCount = 7;
            }

            var revenueData = new List<object>();

            if (timeframe == "year")
            {
                var rawData = await _context.Orders
                    .Where(o => o.OrderDate.Year == today.Year && o.Status != "Cancelled")
                    .GroupBy(o => o.OrderDate.Month)
                    .Select(g => new { Month = g.Key, Revenue = g.Sum(o => o.TotalAmount), Orders = g.Count() })
                    .ToListAsync();

                for (int i = 1; i <= 12; i++)
                {
                    var data = rawData.FirstOrDefault(r => r.Month == i);
                    revenueData.Add(new
                    {
                        Date = $"T{i}",
                        Revenue = data?.Revenue ?? 0,
                        Orders = data?.Orders ?? 0
                    });
                }
            }
            else
            {
                var rawData = await _context.Orders
                    .Where(o => o.OrderDate >= fromDate && o.OrderDate <= today.AddDays(1) && o.Status != "Cancelled")
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.TotalAmount), Orders = g.Count() })
                    .ToListAsync();

                int loopLimit = (timeframe == "month") ? daysCount : 7;
                for (int i = 0; i < loopLimit; i++)
                {
                    DateTime date;
                    if (timeframe == "month") date = new DateTime(today.Year, today.Month, 1).AddDays(i);
                    else date = fromDate.AddDays(i);

                    if (date > today && timeframe == "month") break;

                    var data = rawData.FirstOrDefault(r => r.Date == date);
                    revenueData.Add(new
                    {
                        Date = date.ToString("dd/MM"),
                        Revenue = data?.Revenue ?? 0,
                        Orders = data?.Orders ?? 0
                    });
                }
            }

            // 3. TOP SẢN PHẨM BÁN CHẠY (Bar Chart)
            var topProducts = await _context.OrderDetails
                .Include(od => od.ProductVariant).ThenInclude(v => v.Product)
                .Where(od => od.Order.Status != "Cancelled")
                .GroupBy(od => od.ProductVariant.Product.Name)
                .Select(g => new { Name = g.Key, Value = g.Sum(x => x.Quantity) })
                .OrderByDescending(x => x.Value)
                .Take(5)
                .ToListAsync();

            // 4. DOANH THU THEO HÃNG (Pie Chart)
            var brandStats = await _context.OrderDetails
                .Include(od => od.ProductVariant).ThenInclude(v => v.Product).ThenInclude(p => p.Brand)
                .Where(od => od.Order.Status != "Cancelled")
                .GroupBy(od => od.ProductVariant.Product.Brand.Name)
                .Select(g => new { Name = g.Key, Value = g.Sum(x => x.Quantity * x.UnitPrice) })
                .OrderByDescending(x => x.Value)
                .ToListAsync();

            // 5. TRẠNG THÁI ĐƠN HÀNG (Donut Chart)
            var orderStatus = await _context.Orders
                .GroupBy(o => o.Status)
                .Select(g => new { Name = g.Key, Value = g.Count() })
                .ToListAsync();

            // 6. ĐƠN HÀNG GẦN ĐÂY (Table)
            var recentOrders = await _context.Orders
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .Select(o => new {
                    o.Id,
                    o.CustomerName,
                    o.TotalAmount,
                    o.Status,
                    Date = o.OrderDate.ToString("dd/MM/yyyy")
                })
                .ToListAsync();

            return Ok(new
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                TotalProducts = totalProducts, // Tổng tồn kho
                AOV = aov, // Giá trị đơn trung bình
                RevenueData = revenueData, // Line Chart
                TopProducts = topProducts, // Bar Chart
                BrandStats = brandStats, // Pie Chart
                OrderStatus = orderStatus, // Donut Chart
                RecentOrders = recentOrders // Table
            });
        }
    }
}