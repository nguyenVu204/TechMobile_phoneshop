using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.API.Dtos;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class SerialNumbersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SerialNumbersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("add-range")]
        public async Task<IActionResult> AddSerialNumbers([FromBody] AddSerialDto dto)
        {
            var variant = await _context.ProductVariants.FindAsync(dto.VariantId);
            if (variant == null) return NotFound();

            int countAdded = 0;
            foreach (var imei in dto.Imeis)
            {
                // Chỉ thêm nếu chưa tồn tại
                if (!_context.ProductSerialNumbers.Any(x => x.SerialNumber == imei))
                {
                    _context.ProductSerialNumbers.Add(new ProductSerialNumber
                    {
                        SerialNumber = imei,
                        ProductVariantId = dto.VariantId,
                        Status = "Available",
                        CreatedAt = DateTime.Now
                    });
                    countAdded++;
                }
            }

            // Lưu IMEI trước
            await _context.SaveChangesAsync();

            // TÍNH LẠI TỒN KHO TỰ ĐỘNG
            // Đếm tổng số IMEI đang Available của biến thể này
            var realStock = await _context.ProductSerialNumbers
                .CountAsync(x => x.ProductVariantId == dto.VariantId && x.Status == "Available");

            variant.StockQuantity = realStock;
            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Đã thêm {countAdded} IMEI. Tồn kho hiện tại: {realStock}" });
        }

        // 2. Lấy danh sách IMEI chưa bán của 1 biến thể (Để Admin chọn khi giao hàng)
        [HttpGet("available/{variantId}")]
        public async Task<IActionResult> GetAvailableSerials(int variantId)
        {
            var serials = await _context.ProductSerialNumbers
                .Where(x => x.ProductVariantId == variantId && x.Status == "Available")
                .Select(x => new { x.Id, x.SerialNumber })
                .ToListAsync();
            return Ok(serials);
        }
    }
}
