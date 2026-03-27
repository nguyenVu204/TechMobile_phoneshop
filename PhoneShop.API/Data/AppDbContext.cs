using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Models;

namespace PhoneShop.API.Data
{
    public class AppDbContext : IdentityDbContext<AppUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Brand> Brands { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }

        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Review> Reviews { get; set; }

        public DbSet<ProductSerialNumber> ProductSerialNumbers { get; set; }
        public DbSet<News> News { get; set; }
        public DbSet<NewsCategory> NewsCategories { get; set; }
        public DbSet<NewsCategoryMapping> NewsCategoryMappings { get; set; }
        public DbSet<NewsComment> NewsComments { get; set; }

        // Cấu hình thêm mối quan hệ (Fluent API)
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder); // Bắt buộc phải có dòng này để Identity hoạt động

            // Config: Xóa Hãng thì không xóa Sản phẩm (tránh mất dữ liệu)
            builder.Entity<Product>()
                .HasOne(p => p.Brand)
                .WithMany(b => b.Products)
                .HasForeignKey(p => p.BrandId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Favorite>()
                .HasKey(f => new { f.UserId, f.ProductId });

            builder.Entity<ProductSerialNumber>()
                .ToTable("ProductSerialNumbers");

            builder.Entity<NewsCategoryMapping>()
                .HasKey(ncm => new { ncm.NewsId, ncm.CategoryId });

            builder.Entity<NewsCategoryMapping>()
                .HasOne(ncm => ncm.News)
                .WithMany(n => n.CategoryMappings)
                .HasForeignKey(ncm => ncm.NewsId);

            builder.Entity<NewsCategoryMapping>()
                .HasOne(ncm => ncm.Category)
                .WithMany(c => c.NewsMappings)
                .HasForeignKey(ncm => ncm.CategoryId);

        }
    }
}