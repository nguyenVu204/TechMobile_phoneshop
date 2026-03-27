using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.API.Services;
using PhoneShop.API.Services.VnPay;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Bỏ qua lỗi vòng lặp
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ---DB CONTEXT ---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
// --------------------------

// --- CẤU HÌNH IDENTITY ---
builder.Services.AddIdentity<AppUser, IdentityRole>(options => {
    options.Password.RequireDigit = false; // Không bắt buộc số
    options.Password.RequireLowercase = false; // Không bắt buộc chữ thường
    options.Password.RequireUppercase = false; // Không bắt buộc chữ hoa
    options.Password.RequireNonAlphanumeric = false; // Không bắt buộc ký tự đặc biệt (@#!)
    options.Password.RequiredLength = 6; // Chỉ cần dài tối thiểu 6 ký tự
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// --- CẤU HÌNH CORS ĐỂ CHO PHÉP REACT APP GỌI API ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // Cổng mặc định của Vite React
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// --- THÊM CẤU HÌNH JWT ---
builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options => {
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});
// -------------------------

// --- VN PAY SERVICE ---
builder.Services.AddScoped<IVnPayService, VnPayService>();
builder.Services.AddScoped<IEmailService, EmailService>();

var app = builder.Build();

// --- ĐOẠN CODE SEED DATA ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<AppDbContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

    // Tự động chạy migration nếu chưa chạy (tiện lợi khi deploy)
    // context.Database.Migrate(); 

    // Gọi hàm Seed
    await DbSeeder.Seed(context, userManager, roleManager);
}
// ------------------------------------------

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseCors("AllowReactApp");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
