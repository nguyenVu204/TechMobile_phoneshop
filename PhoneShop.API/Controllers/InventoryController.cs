using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InventoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetInventory()
        {
            // Lấy tất cả các phiên bản sản phẩm
            var inventoryRaw = await _context.ProductVariants
                .Include(v => v.Product)
                .ThenInclude(p => p.Brand)
                .Select(v => new
                {
                    v.Id,
                    ProductId = v.ProductId,
                    ProductName = v.Product.Name,
                    BrandName = v.Product.Brand.Name,
                    VariantName = v.Color + " - " + v.Ram + "/" + v.Rom,
                    v.StockQuantity,
                    v.Price,
                    v.ImageUrl,
                    // Tìm ngày bán (xuất) gần nhất của phiên bản này
                    LastSoldDate = _context.OrderDetails
                        .Where(od => od.ProductVariantId == v.Id && od.Order.Status != "Cancelled")
                        .Max(od => (DateTime?)od.Order.OrderDate)
                })
                .ToListAsync();

            // Tính toán trạng thái
            var result = inventoryRaw.Select(i => new
            {
                i.Id,
                i.ProductId,
                i.ProductName,
                i.BrandName,
                i.VariantName,
                i.StockQuantity,
                i.Price,
                i.ImageUrl,
                LastSoldDate = i.LastSoldDate?.ToString("dd/MM/yyyy HH:mm") ?? "Chưa từng bán",
                // Phân loại trạng thái
                Status = GetInventoryStatus(i.StockQuantity, i.LastSoldDate)
            })
            // Ưu tiên hiển thị: Hết hàng -> Sắp hết -> Tồn lâu -> Bình thường
            .OrderBy(i => i.Status == "Out" ? 1 : i.Status == "Low" ? 2 : i.Status == "Old" ? 3 : 4)
            .ThenBy(i => i.StockQuantity)
            .ToList();

            return Ok(result);
        }

        private string GetInventoryStatus(int stock, DateTime? lastSold)
        {
            if (stock == 0) return "Out"; // Hết hàng
            if (stock > 0 && stock <= 5) return "Low"; // Cảnh báo sắp hết hàng (<= 5 cái)

            // Nếu còn nhiều hàng, nhưng đã HƠN 30 NGÀY CHƯA AI MUA (hoặc chưa từng bán được cái nào)
            if (stock > 5 && (!lastSold.HasValue || lastSold.Value < DateTime.Now.AddDays(-30)))
                return "Old"; // Tồn kho lâu -> Cần khuyến mãi

            return "Normal"; // Đang bán ổn định
        }
    }
}