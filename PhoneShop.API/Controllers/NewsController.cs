using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Dtos;
using PhoneShop.API.Models;
using System.Security.Claims;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NewsController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. DÀNH CHO USER (PUBLIC)
        // ==========================================

        // GET: api/news
        // Lấy danh sách bài viết (Chỉ lấy bài Published, có phân trang)
        [HttpGet]
        public async Task<IActionResult> GetNewsPublic(int page = 1, int limit = 6, string? search = null)
        {
            var query = _context.News
                .Include(n => n.CategoryMappings).ThenInclude(m => m.Category)
                .Where(n => n.Status == "Published")
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(n => n.Title.Contains(search));
            }

            var total = await query.CountAsync();
            var news = await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(n => new {
                    n.Id,
                    n.Title,
                    n.Slug,
                    n.Summary,
                    n.Thumbnail,
                    n.CreatedAt,
                    n.ViewCount,
                    Categories = n.CategoryMappings.Select(c => c.Category.Name).ToList()
                })
                .ToListAsync();

            return Ok(new { Items = news, TotalPages = Math.Ceiling(total / (double)limit) });
        }

        // GET: api/news/details/slug-bai-viet
        // Lấy chi tiết bài viết & TĂNG VIEW
        [HttpGet("details/{slug}")]
        public async Task<IActionResult> GetNewsBySlug(string slug)
        {
            var news = await _context.News
                .Include(n => n.CategoryMappings).ThenInclude(m => m.Category)
                .Include(n => n.RelatedProduct)
                .FirstOrDefaultAsync(n => n.Slug == slug && n.Status == "Published");

            if (news == null) return NotFound();

            // Tăng View (Rất quan trọng cho web tin tức)
            news.ViewCount += 1;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                news.Id,
                news.Title,
                news.Content,
                news.Thumbnail,
                news.CreatedAt,
                news.ViewCount,
                news.AuthorId,
                Categories = news.CategoryMappings.Select(c => new { c.Category.Id, c.Category.Name }),
                RelatedProduct = news.RelatedProduct == null ? null : new { news.RelatedProduct.Id, news.RelatedProduct.Name, news.RelatedProduct.Thumbnail }
            });
        }

        // ==========================================
        // 2. DÀNH CHO ADMIN
        // ==========================================

        // POST: api/news
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateNews([FromBody] CreateNewsDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var news = new News
            {
                Title = dto.Title,
                Slug = dto.Slug,
                Summary = dto.Summary,
                Content = dto.Content,
                Thumbnail = dto.Thumbnail,
                Status = dto.Status,
                RelatedProductId = dto.RelatedProductId,
                AuthorId = userId // Lấy ID người đăng từ Token
            };

            // Thêm Mapping Danh mục
            foreach (var catId in dto.CategoryIds)
            {
                news.CategoryMappings.Add(new NewsCategoryMapping { CategoryId = catId });
            }

            _context.News.Add(news);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đăng bài thành công", Id = news.Id });
        }

        // PUT: api/news/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateNews(int id, [FromBody] CreateNewsDto dto)
        {
            var news = await _context.News
                .Include(n => n.CategoryMappings)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (news == null) return NotFound("Không tìm thấy bài viết");

            news.Title = dto.Title;
            news.Slug = dto.Slug;
            news.Summary = dto.Summary;
            news.Content = dto.Content;
            news.Thumbnail = dto.Thumbnail;
            news.Status = dto.Status;
            news.RelatedProductId = dto.RelatedProductId;
            news.UpdatedAt = DateTime.Now;

            _context.NewsCategoryMappings.RemoveRange(news.CategoryMappings);

            foreach (var catId in dto.CategoryIds)
            {
                news.CategoryMappings.Add(new NewsCategoryMapping { CategoryId = catId });
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật bài viết thành công" });
        }

        // DELETE: api/news/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteNews(int id)
        {
            var news = await _context.News.FindAsync(id);
            if (news == null) return NotFound();

            _context.News.Remove(news);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã xóa bài viết" });
        }

        // GET: api/news/{id} (Lấy chi tiết để Admin sửa - KHÔNG tăng View)
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetNewsByIdAdmin(int id)
        {
            var news = await _context.News
                .Include(n => n.CategoryMappings)
                .FirstOrDefaultAsync(n => n.Id == id);

            if (news == null) return NotFound();

            return Ok(new
            {
                news.Id,
                news.Title,
                news.Slug,
                news.Summary,
                news.Content,
                news.Thumbnail,
                news.Status,
                news.RelatedProductId,
                CategoryIds = news.CategoryMappings.Select(c => c.CategoryId).ToList()
            });
        }

        // GET: api/news/admin-list
        [HttpGet("admin-list")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetNewsListAdmin()
        {
            var news = await _context.News
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new {
                    n.Id,
                    n.Title,
                    n.Slug,
                    n.Thumbnail,
                    n.CreatedAt,
                    n.ViewCount,
                    n.Status
                })
                .ToListAsync();

            return Ok(news);
        }

        // ==========================================
        // 3. API BÌNH LUẬN (COMMENTS)
        // ==========================================

        public class CommentDto
        {
            public string Content { get; set; } = string.Empty;
        }

        // GET: api/news/{newsId}/comments
        [HttpGet("{newsId}/comments")]
        public async Task<IActionResult> GetComments(int newsId)
        {
            // Lấy danh sách comment, join với bảng User để lấy tên người bình luận
            // Lưu ý: Tùy vào cấu trúc bảng User của bạn, ở đây mình dùng LINQ cơ bản
            var comments = await _context.NewsComments
                .Where(c => c.NewsId == newsId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new {
                    c.Id,
                    c.Content,
                    c.CreatedAt,
                    UserId = c.UserId,
                    // Giả sử bạn có thể join sang User để lấy tên, nếu chưa cấu hình Navigation Property thì tạm để ID hoặc "Thành viên"
                    // Tốt nhất là thêm quan hệ AppUser vào bảng NewsComment
                    UserName = _context.Users.Where(u => u.Id == c.UserId).Select(u => u.FullName ?? u.UserName).FirstOrDefault() ?? "Thành viên ẩn danh"
                })
                .ToListAsync();

            return Ok(comments);
        }

        // POST: api/news/{newsId}/comments
        [HttpPost("{newsId}/comments")]
        [Authorize] // Bắt buộc đăng nhập
        public async Task<IActionResult> AddComment(int newsId, [FromBody] CommentDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content)) return BadRequest("Nội dung không được để trống");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var news = await _context.News.FindAsync(newsId);
            if (news == null) return NotFound("Bài viết không tồn tại");

            var comment = new NewsComment
            {
                NewsId = newsId,
                UserId = userId,
                Content = dto.Content,
                CreatedAt = DateTime.Now
            };

            _context.NewsComments.Add(comment);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã gửi bình luận thành công!" });
        }
    }
}