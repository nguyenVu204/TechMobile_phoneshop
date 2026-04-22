using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BrandsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BrandsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/brands
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Brand>>> GetBrands()
        {
            return await _context.Brands.ToListAsync();
        }

        // ========================================================
        // TÍNH NĂNG MỚI: LẤY CHI TIẾT SẢN PHẨM & LỊCH SỬ XUẤT CỦA HÃNG
        // GET: api/brands/{id}/products
        // ========================================================
        [HttpGet("{id}/products")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetBrandProducts(int id)
        {
            var brand = await _context.Brands.FindAsync(id);
            if (brand == null) return NotFound();

            var products = await _context.Products
                .Where(p => p.BrandId == id)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Thumbnail,
                    TotalStock = p.Variants.Sum(v => v.StockQuantity),
                    TotalSold = _context.OrderDetails
                                    .Where(od => od.ProductVariant.ProductId == p.Id && od.Order.Status != "Cancelled")
                                    .Sum(od => (int?)od.Quantity) ?? 0,

                    // 1. THÊM MỚI: Lấy danh sách các biến thể (Màu sắc, RAM, ROM, Giá...)
                    Variants = p.Variants.Select(v => new {
                        v.Id,
                        v.Color,
                        v.Ram,
                        v.Rom,
                        v.Price,
                        v.StockQuantity,
                        v.ImageUrl
                    }).ToList(),

                    // 2. Lịch sử xuất bán (Kèm theo thông tin màu/rom đã bán)
                    ExportHistory = _context.OrderDetails
                        .Where(od => od.ProductVariant.ProductId == p.Id && od.Order.Status != "Cancelled")
                        .OrderByDescending(od => od.Order.OrderDate)
                        .Select(od => new {
                            Date = od.Order.OrderDate.ToString("dd/MM/yyyy HH:mm"),
                            Quantity = od.Quantity,
                            CustomerName = od.Order.CustomerName,
                            VariantInfo = od.ProductVariant.Color + " - " + od.ProductVariant.Rom, // Hiện rõ khách mua màu gì
                            SerialNumbers = od.SerialNumber
                        })
                        .Take(15)
                        .ToList()
                })
                .ToListAsync();

            return Ok(new { BrandName = brand.Name, Products = products });
        }

        // POST: api/brands (Thêm mới)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Brand>> CreateBrand(Brand brand)
        {
            _context.Brands.Add(brand);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetBrands), new { id = brand.Id }, brand);
        }

        // PUT: api/brands/5 (Sửa tên)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBrand(int id, Brand brand)
        {
            if (id != brand.Id) return BadRequest();

            var existingBrand = await _context.Brands.FindAsync(id);
            if (existingBrand == null) return NotFound();

            existingBrand.Name = brand.Name; // Cập nhật tên

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thành công" });
        }

        // DELETE: api/brands/5 (Xóa)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBrand(int id)
        {
            var brand = await _context.Brands.FindAsync(id);
            if (brand == null) return NotFound();

            // Kiểm tra: Nếu hãng này đang có sản phẩm thì không cho xóa (để tránh lỗi database)
            var hasProducts = await _context.Products.AnyAsync(p => p.BrandId == id);
            if (hasProducts)
            {
                return BadRequest(new { Message = "Không thể xóa hãng này vì đang có sản phẩm liên kết!" });
            }

            _context.Brands.Remove(brand);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa thành công" });
        }
    }
}