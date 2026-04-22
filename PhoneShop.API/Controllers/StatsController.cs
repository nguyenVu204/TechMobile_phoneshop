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
        public async Task<IActionResult> GetDashboardStats(
            [FromQuery] string timeframe = "week",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int? month = null,
            [FromQuery] int? year = null)
        {
            var today = DateTime.Today;
            DateTime fromDate = today.AddDays(-6);
            DateTime toDate = today;
            bool groupByMonth = false;

            // --- XỬ LÝ LOGIC NGÀY THÁNG ---
            if (timeframe == "month")
            {
                int y = year ?? today.Year;
                int m = month ?? today.Month;
                fromDate = new DateTime(y, m, 1);
                toDate = fromDate.AddMonths(1).AddDays(-1);
            }
            else if (timeframe == "year")
            {
                int y = year ?? today.Year;
                fromDate = new DateTime(y, 1, 1);
                toDate = new DateTime(y, 12, 31);
                groupByMonth = true;
            }
            else if (timeframe == "custom")
            {
                fromDate = startDate?.Date ?? today.AddDays(-6);
                toDate = endDate?.Date ?? today;

                // Nếu khoảng thời gian lớn hơn 60 ngày thì nhóm theo tháng cho biểu đồ đỡ rối
                if ((toDate - fromDate).TotalDays > 60) groupByMonth = true;
            }

            // --- TRUY VẤN CƠ BẢN THEO THỜI GIAN ---
            var orderQuery = _context.Orders
                .Where(o => o.OrderDate >= fromDate && o.OrderDate <= toDate.AddDays(1).AddTicks(-1));

            var querySuccess = orderQuery.Where(o => o.Status != "Cancelled");

            // 1. KPI TỔNG QUAN (Lọc theo khoảng thời gian)
            var totalRevenue = await querySuccess.SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
            var totalOrders = await orderQuery.CountAsync();
            var totalProducts = await _context.ProductVariants.SumAsync(v => (int?)v.StockQuantity) ?? 0; // Tồn kho giữ nguyên
            var aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // 2. BIỂU ĐỒ DOANH THU
            var revenueData = new List<object>();

            if (groupByMonth)
            {
                var rawData = await querySuccess
                    .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                    .Select(g => new { g.Key.Year, g.Key.Month, Revenue = g.Sum(o => o.TotalAmount), Orders = g.Count() })
                    .ToListAsync();

                var iterDate = new DateTime(fromDate.Year, fromDate.Month, 1);
                while (iterDate <= toDate)
                {
                    var data = rawData.FirstOrDefault(r => r.Year == iterDate.Year && r.Month == iterDate.Month);
                    revenueData.Add(new { Date = $"T{iterDate.Month}/{iterDate.Year}", Revenue = data?.Revenue ?? 0, Orders = data?.Orders ?? 0 });
                    iterDate = iterDate.AddMonths(1);
                }
            }
            else
            {
                var rawData = await querySuccess
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.TotalAmount), Orders = g.Count() })
                    .ToListAsync();

                for (var d = fromDate.Date; d <= toDate.Date; d = d.AddDays(1))
                {
                    var data = rawData.FirstOrDefault(r => r.Date == d);
                    revenueData.Add(new { Date = d.ToString("dd/MM"), Revenue = data?.Revenue ?? 0, Orders = data?.Orders ?? 0 });
                }
            }

            // 3. TOP SẢN PHẨM BÁN CHẠY
            var topProducts = await _context.OrderDetails
                .Include(od => od.ProductVariant).ThenInclude(v => v.Product)
                .Where(od => od.Order.Status != "Cancelled" && od.Order.OrderDate >= fromDate && od.Order.OrderDate <= toDate.AddDays(1).AddTicks(-1))
                .GroupBy(od => od.ProductVariant.Product.Name)
                .Select(g => new { Name = g.Key, Value = g.Sum(x => x.Quantity) })
                .OrderByDescending(x => x.Value)
                .Take(5)
                .ToListAsync();

            // 4. DOANH THU THEO HÃNG
            var brandStats = await _context.OrderDetails
                .Include(od => od.ProductVariant).ThenInclude(v => v.Product).ThenInclude(p => p.Brand)
                .Where(od => od.Order.Status != "Cancelled" && od.Order.OrderDate >= fromDate && od.Order.OrderDate <= toDate.AddDays(1).AddTicks(-1))
                .GroupBy(od => od.ProductVariant.Product.Brand.Name)
                .Select(g => new { Name = g.Key, Value = g.Sum(x => x.Quantity * x.UnitPrice) })
                .OrderByDescending(x => x.Value)
                .ToListAsync();

            // 5. TRẠNG THÁI ĐƠN HÀNG
            var orderStatus = await orderQuery
                .GroupBy(o => o.Status)
                .Select(g => new { Name = g.Key, Value = g.Count() })
                .ToListAsync();

            // 6. ĐƠN HÀNG TRONG KHOẢNG THỜI GIAN
            var recentOrders = await orderQuery
                .OrderByDescending(o => o.OrderDate)
                .Take(5)
                .Select(o => new {
                    o.Id,
                    o.CustomerName,
                    o.TotalAmount,
                    o.Status,
                    Date = o.OrderDate.ToString("dd/MM/yyyy HH:mm")
                })
                .ToListAsync();

            return Ok(new
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                TotalProducts = totalProducts,
                AOV = aov,
                RevenueData = revenueData,
                TopProducts = topProducts,
                BrandStats = brandStats,
                OrderStatus = orderStatus,
                RecentOrders = recentOrders,
                TimeRange = new { From = fromDate.ToString("dd/MM/yyyy"), To = toDate.ToString("dd/MM/yyyy") } // Trả về text thời gian hiển thị
            });
        }
    }
}