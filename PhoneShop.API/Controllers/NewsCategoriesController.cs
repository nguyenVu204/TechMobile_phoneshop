using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Models;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsCategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NewsCategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // 1. Lấy danh sách danh mục (Public để dùng ở cả Admin và trang chủ)
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.NewsCategories
                .Select(c => new { c.Id, c.Name, c.Slug, c.Description })
                .ToListAsync();
            return Ok(categories);
        }

        // 2. Thêm danh mục mới (Admin)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromBody] NewsCategory dto)
        {
            if (string.IsNullOrEmpty(dto.Name)) return BadRequest("Tên danh mục không được để trống");

            if (string.IsNullOrEmpty(dto.Slug)) dto.Slug = dto.Name.ToLower().Replace(" ", "-");

            _context.NewsCategories.Add(dto);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Thêm danh mục thành công", Category = dto });
        }

        // 3. Sửa danh mục (Admin)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] NewsCategory dto)
        {
            var cat = await _context.NewsCategories.FindAsync(id);
            if (cat == null) return NotFound();

            cat.Name = dto.Name;
            cat.Slug = dto.Slug;
            cat.Description = dto.Description;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thành công" });
        }

        // 4. Xóa danh mục (Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var cat = await _context.NewsCategories.FindAsync(id);
            if (cat == null) return NotFound();

            // Ràng buộc: Có bài viết nào đang dùng danh mục này không?
            var isUsed = await _context.NewsCategoryMappings.AnyAsync(m => m.CategoryId == id);
            if (isUsed) return BadRequest("Không thể xóa danh mục đang có bài viết!");

            _context.NewsCategories.Remove(cat);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Xóa thành công" });
        }
    }
}