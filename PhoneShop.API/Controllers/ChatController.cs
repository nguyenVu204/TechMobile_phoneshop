using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using System.Text;
using System.Text.Json;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;

        public ChatController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
            _httpClient = new HttpClient();
        }

        public class ChatRequest
        {
            public string Message { get; set; } = string.Empty;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> AskAi([FromBody] ChatRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Message))
                    return BadRequest("Vui lòng nhập câu hỏi.");

                var apiKey = _config["OpenRouter:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                    return StatusCode(500, "Thiếu OpenRouter API Key");

                // 🔹 1. Lấy sản phẩm
                var products = await _context.Products
                    .Include(p => p.Variants)
                    .Take(5)
                    .Select(p => new
                    {
                        TenMay = p.Name,
                        GiaThapNhat = p.Variants.Any() ? p.Variants.Min(v => v.Price) : 0,
                        CauHinh = $"{p.Chip}, {p.Screen}, {p.Battery}"
                    })
                    .ToListAsync();

                string productContext = string.Join("\n", products.Select(p =>
                    $"- {p.TenMay}: Giá từ {p.GiaThapNhat:N0} VNĐ (Cấu hình: {p.CauHinh})"
                ));

                // 🔹 2. Prompt
                string systemPrompt = $@"
Bạn là nhân viên tư vấn bán điện thoại của PhoneShop.

Danh sách sản phẩm:
{productContext}

Quy tắc:
- Xưng hô thân thiện (dạ, mình, bạn...)
- Trả lời ngắn gọn, có emoji
- BẮT BUỘC báo giá chính xác
- Nếu không có sản phẩm → gợi ý tương tự

Khách hỏi: {request.Message}
";

                // 🔹 3. Gọi OpenRouter FREE
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
                _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", "http://localhost:5173"); // optional
                _httpClient.DefaultRequestHeaders.Add("X-Title", "PhoneShop AI"); // optional

                var requestBody = new
                {
                    model = "deepseek/deepseek-chat",
                    messages = new[]
                    {
                        new { role = "system", content = systemPrompt }
                    }
                };

                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await _httpClient.PostAsync(
                    "https://openrouter.ai/api/v1/chat/completions",
                    jsonContent
                );

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return StatusCode(500, "OpenRouter error: " + error);
                }

                var responseString = await response.Content.ReadAsStringAsync();

                using var doc = JsonDocument.Parse(responseString);
                var root = doc.RootElement;

                var reply = root
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString();

                return Ok(new { reply });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }
    }
}