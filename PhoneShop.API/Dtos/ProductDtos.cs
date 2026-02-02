namespace PhoneShop.API.Dtos
{
    // DTO dùng cho danh sách (Hiện ở trang chủ)
    public class ProductListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty; // Chỉ cần tên hãng, không cần cả object Brand
        public decimal MinPrice { get; set; } // Giá thấp nhất (Ví dụ: Từ 20tr)
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }
    }

    // DTO dùng cho trang chi tiết (Hiện đầy đủ màu sắc, cấu hình)
    public class ProductDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string BrandName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }

        public int BrandId { get; set; }

        public string? Screen { get; set; }
        public string? Chip { get; set; }
        public string? Battery { get; set; }
        public string? RearCamera { get; set; }
        public string? FrontCamera { get; set; }
        public string? OperatingSystem { get; set; }

        // Danh sách các phiên bản (Màu, Ram, Rom)
        public List<ProductVariantDto> Variants { get; set; } = new List<ProductVariantDto>();
    }

    public class ProductVariantDto
    {
        public int Id { get; set; }
        public string Color { get; set; } = string.Empty;
        public string Ram { get; set; } = string.Empty;
        public string Rom { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
    }

    // DTO dùng để Thêm mới hoặc Cập nhật
    public class CreateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Thumbnail { get; set; } // Link ảnh đại diện
        public int BrandId { get; set; } // ID của hãng (Apple, Samsung...)

        public string? Screen { get; set; }
        public string? Chip { get; set; }
        public string? Battery { get; set; }
        public string? RearCamera { get; set; }
        public string? FrontCamera { get; set; }
        public string? OperatingSystem { get; set; }

        // Danh sách các biến thể đi kèm
        public List<CreateProductVariantDto> Variants { get; set; } = new List<CreateProductVariantDto>();
    }

    public class CreateProductVariantDto
    {
        public string Color { get; set; } = string.Empty;
        public string Ram { get; set; } = string.Empty;
        public string Rom { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
    }

    // DTO cho Update (cần ID của biến thể để biết sửa dòng nào)
    public class UpdateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Thumbnail { get; set; }
        public int BrandId { get; set; }

        public string? Screen { get; set; }
        public string? Chip { get; set; }
        public string? Battery { get; set; }
        public string? RearCamera { get; set; }
        public string? FrontCamera { get; set; }
        public string? OperatingSystem { get; set; }

        public List<UpdateProductVariantDto> Variants { get; set; } = new List<UpdateProductVariantDto>();
    }

    public class UpdateProductVariantDto
    {
        public int Id { get; set; } // Nếu Id = 0 nghĩa là thêm mới, Id > 0 là sửa cũ
        public string Color { get; set; } = string.Empty;
        public string Ram { get; set; } = string.Empty;
        public string Rom { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
    }
}