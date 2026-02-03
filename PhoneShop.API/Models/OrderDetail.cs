using System.ComponentModel.DataAnnotations.Schema;

namespace PhoneShop.API.Models
{
    public class OrderDetail
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public Order? Order { get; set; }

        public int ProductVariantId { get; set; } // Liên kết đến phiên bản cụ thể (VD: iPhone 15 128GB - Màu Đỏ)
        public ProductVariant? ProductVariant { get; set; }

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; } // Giá tại thời điểm mua (để sau này giá gốc đổi cũng không ảnh hưởng đơn cũ)
        public string? SerialNumber { get; set; }
    }
}