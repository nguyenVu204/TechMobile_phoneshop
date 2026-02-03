using System.ComponentModel.DataAnnotations.Schema;

namespace PhoneShop.API.Models
{
    public class ProductVariant
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public Product? Product { get; set; }

        public string Color { get; set; } = string.Empty; // Titan Xanh, Titan Tự nhiên
        public string Ram { get; set; } = string.Empty;   // 8GB
        public string Rom { get; set; } = string.Empty;   // 256GB, 512GB

        public string? ImageUrl { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } // Giá bán biến động theo RAM/ROM

        public int StockQuantity { get; set; } // Số lượng tồn kho

        public List<ProductSerialNumber> SerialNumbers { get; set; } = new List<ProductSerialNumber>();
    }
}