using Google.Apis.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PhoneShop.API.Dtos;
using PhoneShop.API.Models;
using PhoneShop.API.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService; // Thêm EmailService

        public AccountController(UserManager<AppUser> userManager, IConfiguration configuration, IEmailService emailService)
        {
            _userManager = userManager;
            _configuration = configuration;
            _emailService = emailService;
        }

        // POST: api/account/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var userExists = await _userManager.FindByEmailAsync(dto.Email);
            if (userExists != null) return BadRequest("Email này đã được sử dụng!");

            var newUser = new AppUser
            {
                FullName = dto.FullName,
                Email = dto.Email,
                UserName = dto.Email
            };

            var result = await _userManager.CreateAsync(newUser, dto.Password);

            if (!result.Succeeded) return BadRequest(result.Errors);

            // Set quyền mặc định là Customer
            await _userManager.AddToRoleAsync(newUser, "Customer");

            // --- TẠO TOKEN XÁC NHẬN VÀ GỬI EMAIL ---
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(newUser);

            // Link gọi về Frontend để xác nhận (Frontend sẽ gọi lại API confirm-email)
            var confirmationLink = $"{_configuration["FrontendUrl"] ?? "http://localhost:5173"}/confirm-email?userId={newUser.Id}&token={Uri.EscapeDataString(token)}";

            var emailBody = $@"
                <h3>Chào mừng đến với PhoneShop</h3>
                <p>Vui lòng click vào nút bên dưới để xác thực tài khoản của bạn:</p>
                <a href='{confirmationLink}' style='display:inline-block; padding:10px 20px; background-color:#2563eb; color:#fff; text-decoration:none; border-radius:5px;'>Xác thực Email</a>
            ";

            await _emailService.SendEmailAsync(newUser.Email, "Xác thực tài khoản PhoneShop", emailBody);

            return Ok(new { Message = "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản." });
        }

        // GET: api/account/confirm-email
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
                return BadRequest("Lỗi xác thực.");

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("Không tìm thấy người dùng.");

            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (!result.Succeeded) return BadRequest("Xác thực email thất bại hoặc token đã hết hạn.");

            return Ok(new { Message = "Xác thực email thành công! Bạn có thể đăng nhập." });
        }

        // POST: api/account/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
                return Unauthorized("Email hoặc mật khẩu không đúng.");

            // CHẶN: Nếu chưa xác thực email
            if (!await _userManager.IsEmailConfirmedAsync(user))
                return BadRequest("Vui lòng xác thực email trước khi đăng nhập.");

            // CHẶN: Nếu bị khóa tài khoản
            if (await _userManager.IsLockedOutAsync(user))
                return BadRequest("Tài khoản của bạn đã bị khóa.");

            var tokenString = await GenerateJwtToken(user);

            return Ok(new { Token = tokenString, Expiration = DateTime.Now.AddHours(3) });
        }

        // POST: api/account/google-login
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto dto)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new List<string> { _configuration["Google:ClientId"] }
                };

                // Xác thực Token của Google
                var payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, settings);

                // Tìm user theo Email
                var user = await _userManager.FindByEmailAsync(payload.Email);
                if (user == null)
                {
                    // Nếu chưa có, tự động tạo mới
                    user = new AppUser
                    {
                        Email = payload.Email,
                        UserName = payload.Email,
                        FullName = payload.Name,
                        EmailConfirmed = true // Đăng nhập Google thì auto confirmed
                    };

                    var result = await _userManager.CreateAsync(user);
                    if (!result.Succeeded) return BadRequest("Lỗi tạo tài khoản từ Google");

                    await _userManager.AddToRoleAsync(user, "Customer");
                }

                // CHẶN: Nếu bị khóa tài khoản
                if (await _userManager.IsLockedOutAsync(user))
                    return BadRequest("Tài khoản của bạn đã bị khóa.");

                // Cấp phát Token hệ thống
                var tokenString = await GenerateJwtToken(user);
                return Ok(new { Token = tokenString, Expiration = DateTime.Now.AddHours(3) });
            }
            catch (InvalidJwtException)
            {
                return BadRequest("Token Google không hợp lệ hoặc đã hết hạn.");
            }
        }

        // PUT: api/account/profile (Giữ nguyên)
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            user.FullName = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest("Lỗi cập nhật thông tin.");

            return Ok(new
            {
                Message = "Cập nhật thành công",
                User = new { user.Id, user.FullName, user.Email, user.PhoneNumber, Roles = await _userManager.GetRolesAsync(user) }
            });
        }

        // Hàm hỗ trợ cấp Token
        private async Task<string> GenerateJwtToken(AppUser user)
        {
            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim("fullName", user.FullName ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var userRoles = await _userManager.GetRolesAsync(user);
            foreach (var role in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
            }

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}