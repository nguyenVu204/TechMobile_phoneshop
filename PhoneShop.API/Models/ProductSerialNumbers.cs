namespace PhoneShop.API.Models
{
    public class ProductSerialNumber
    {
        public int Id { get; set; }

        // IMEI hoặc Serial Number (Duy nhất)
        public string SerialNumber { get; set; } = string.Empty;

        // Thuộc về biến thể nào? (VD: Thuộc nhóm Vàng/256GB)
        public int ProductVariantId { get; set; }
        public ProductVariant? ProductVariant { get; set; }

        // Trạng thái: Chưa bán (Available), Đã bán (Sold), Lỗi (Defective)
        public string Status { get; set; } = "Available";

        // Nếu đã bán, thì bán trong đơn hàng nào?
        public int? OrderId { get; set; }
        public Order? Order { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}