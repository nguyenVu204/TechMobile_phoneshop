namespace PhoneShop.API.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // iPhone 15 Pro Max
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }
        public int? BrandId { get; set; }
        public Brand? Brand { get; set; } // Khóa ngoại

        public string? Screen { get; set; }        // Màn hình (VD: 6.7 inch OLED)
        public string? Chip { get; set; }          // Chip (VD: Snapdragon 8 Gen 3)
        public string? RamSpec { get; set; }       // Thông số RAM chung (VD: 8GB/12GB) - Optional nếu muốn tách
        public string? RomSpec { get; set; }       // Thông số ROM chung
        public string? Battery { get; set; }       // Pin (VD: 5000mAh)
        public string? RearCamera { get; set; }    // Camera sau
        public string? FrontCamera { get; set; }   // Camera trước
        public string? OperatingSystem { get; set; }// Hệ điều hành

        // Quan hệ 1-n: 1 Sản phẩm có nhiều biến thể (Màu, RAM)
        public List<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    }
}