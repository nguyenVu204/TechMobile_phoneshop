using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Dtos;
using PhoneShop.API.Models;
using ClosedXML.Excel;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // API Lấy danh sách tất cả sản phẩm
        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<object>> GetProducts(
            [FromQuery] string? search,
            [FromQuery] int? brandId,       // Lọc theo hãng
            [FromQuery] decimal? minPrice,  // Giá thấp nhất
            [FromQuery] decimal? maxPrice,  // Giá cao nhất
            [FromQuery] string? sort,       // Sắp xếp: price_asc, price_desc, name_asc...
            [FromQuery] int page = 1,
            [FromQuery] int limit = 8
        )
        {
            var query = _context.Products
                .Include(p => p.Brand)
                .Include(p => p.Variants)
                .AsQueryable();

            // 1. Tìm kiếm theo tên
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.Contains(search));
            }

            // 2. Lọc theo Hãng
            if (brandId.HasValue)
            {
                query = query.Where(p => p.BrandId == brandId);
            }

            // 3. Lọc theo Giá (Dựa trên giá thấp nhất của các phiên bản)
            if (minPrice.HasValue)
            {
                query = query.Where(p => p.Variants.Any(v => v.Price >= minPrice));
            }
            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.Variants.Any(v => v.Price <= maxPrice));
            }

            // 4. Sắp xếp
            switch (sort)
            {
                case "price_asc": // Giá tăng dần
                    query = query.OrderBy(p => p.Variants.Min(v => v.Price));
                    break;
                case "price_desc": // Giá giảm dần
                    query = query.OrderByDescending(p => p.Variants.Min(v => v.Price));
                    break;
                case "name_asc": // Tên A-Z
                    query = query.OrderBy(p => p.Name);
                    break;
                case "newest": // Mới nhất
                default:
                    query = query.OrderByDescending(p => p.Id); // Hoặc CreatedAt nếu có
                    break;
            }

            // 5. Phân trang
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)limit);

            var products = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Thumbnail,
                    BrandName = p.Brand.Name,
                    // Lấy giá thấp nhất để hiển thị
                    MinPrice = p.Variants.Any() ? p.Variants.Min(v => v.Price) : 0
                })
                .ToListAsync();

            return Ok(new
            {
                Items = products,
                TotalPages = totalPages,
                CurrentPage = page
            });
        }

        // API Lấy chi tiết 1 sản phẩm
        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDetailDto>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Brand)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(); // Trả về lỗi 404 nếu không thấy
            }

            // Map sang DTO chi tiết
            var productDetail = new ProductDetailDto
            {
                Id = product.Id,
                Name = product.Name,
                BrandName = product.Brand?.Name ?? "N/A",
                BrandId = product.BrandId ?? 0,
                Description = product.Description,
                Thumbnail = product.Thumbnail,
                Screen = product.Screen,
                Chip = product.Chip,
                Battery = product.Battery,
                RearCamera = product.RearCamera,
                FrontCamera = product.FrontCamera,
                OperatingSystem = product.OperatingSystem,
                Variants = product.Variants.Select(v => new ProductVariantDto
                {
                    Id = v.Id,
                    Color = v.Color,
                    Ram = v.Ram,
                    Rom = v.Rom,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    ImageUrl = v.ImageUrl,
                }).ToList()
            };

            return Ok(productDetail);
        }
        // --- API ADMIN: Thêm sản phẩm mới ---
        // POST: api/products
        [HttpPost]
        [Authorize(Roles = "Admin")] // Chỉ Admin mới được thêm
        public async Task<ActionResult<Product>> CreateProduct(CreateProductDto dto)
        {
            // 1. Tạo Product (Cha)
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Thumbnail = dto.Thumbnail,
                BrandId = dto.BrandId,
                Screen = dto.Screen,
                Chip = dto.Chip,
                Battery = dto.Battery,
                RearCamera = dto.RearCamera,
                FrontCamera = dto.FrontCamera,
                OperatingSystem = dto.OperatingSystem
            };

            // 2. Tạo Variants (Con)
            foreach (var v in dto.Variants)
            {
                product.Variants.Add(new ProductVariant
                {
                    Color = v.Color,
                    Ram = v.Ram,
                    Rom = v.Rom,
                    Price = v.Price,
                    StockQuantity = v.StockQuantity,
                    ImageUrl = v.ImageUrl
                });
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Trả về kết quả (201 Created)
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // --- API ADMIN: Xóa sản phẩm ---
        // DELETE: api/products/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa sản phẩm thành công" });
        }

        // --- API ADMIN: Cập nhật sản phẩm ---
        // PUT: api/products/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductDto dto)
        {
            // 1. Lấy sản phẩm cũ kèm theo Variants từ DB
            var product = await _context.Products
                                .Include(p => p.Variants)
                                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound("Không tìm thấy sản phẩm");

            // 2. Cập nhật thông tin cha (Product)
            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Thumbnail = dto.Thumbnail;
            product.BrandId = dto.BrandId;
            product.Screen = dto.Screen;
            product.Chip = dto.Chip;
            product.Battery = dto.Battery;
            product.RearCamera = dto.RearCamera;
            product.FrontCamera = dto.FrontCamera;
            product.OperatingSystem = dto.OperatingSystem;

            // 3. Xử lý danh sách con (Variants)
            foreach (var vDto in dto.Variants)
            {
                if (vDto.Id > 0)
                {
                    // A. Nếu có ID -> Tìm và Sửa cái cũ
                    var existingVariant = product.Variants.FirstOrDefault(v => v.Id == vDto.Id);
                    if (existingVariant != null)
                    {
                        existingVariant.Color = vDto.Color;
                        existingVariant.Ram = vDto.Ram;
                        existingVariant.Rom = vDto.Rom;
                        existingVariant.Price = vDto.Price;
                        existingVariant.StockQuantity = vDto.StockQuantity;
                        existingVariant.ImageUrl = vDto.ImageUrl;
                    }
                }
                else
                {
                    // B. Nếu ID = 0 -> Thêm phiên bản mới vào máy cũ
                    product.Variants.Add(new ProductVariant
                    {
                        Color = vDto.Color,
                        Ram = vDto.Ram,
                        Rom = vDto.Rom,
                        Price = vDto.Price,
                        StockQuantity = vDto.StockQuantity,
                        ImageUrl = vDto.ImageUrl
                    });
                }
            }

            // Lưu thay đổi
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật thành công!" });
        }

        // --- API ADMIN: Xóa 1 biến thể (Product Variant) ---
        // DELETE: api/products/variant/5
        [HttpDelete("variant/{variantId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteVariant(int variantId)
        {
            var variant = await _context.ProductVariants.FindAsync(variantId);
            if (variant == null) return NotFound("Không tìm thấy phiên bản này.");

            bool isUsedInOrder = await _context.OrderDetails.AnyAsync(od => od.ProductVariantId == variantId);
            if(isUsedInOrder)
            {
                return BadRequest("Không thể xóa vì đã có khách hàng mua phiên bản này (Liên quan lịch sử đơn hàng). Giải pháp: Hãy set Tồn kho = 0.");
            }

            var serials = await _context.ProductSerialNumbers.Where(s => s.ProductVariantId == variantId).ToListAsync();
            if (serials.Any())
            {
                _context.ProductSerialNumbers.RemoveRange(serials);
            }

            _context.ProductVariants.Remove(variant);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Xóa phiên bản thành công" });
        }

        // --- 1. XUẤT EXCEL (EXPORT) ---
        [HttpGet("export")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportProducts()
        {
            var products = await _context.Products
                .Include(p => p.Brand)
                .Include(p => p.Variants)
                .ToListAsync();

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("DanhSachSanPham");

                // Header
                worksheet.Cell(1, 1).Value = "ID Máy";
                worksheet.Cell(1, 2).Value = "Tên Sản Phẩm";
                worksheet.Cell(1, 3).Value = "Hãng";
                worksheet.Cell(1, 4).Value = "Màu Sắc";
                worksheet.Cell(1, 5).Value = "RAM";
                worksheet.Cell(1, 6).Value = "ROM";
                worksheet.Cell(1, 7).Value = "Giá Bán";
                worksheet.Cell(1, 8).Value = "Tồn Kho";

                // Style Header (Đậm, nền xám)
                var headerRange = worksheet.Range("A1:H1");
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

                // Fill Data
                int row = 2;
                foreach (var p in products)
                {
                    if (p.Variants.Any())
                    {
                        foreach (var v in p.Variants)
                        {
                            worksheet.Cell(row, 1).Value = p.Id;
                            worksheet.Cell(row, 2).Value = p.Name;
                            worksheet.Cell(row, 3).Value = p.Brand?.Name;
                            worksheet.Cell(row, 4).Value = v.Color;
                            worksheet.Cell(row, 5).Value = v.Ram;
                            worksheet.Cell(row, 6).Value = v.Rom;
                            worksheet.Cell(row, 7).Value = v.Price;
                            worksheet.Cell(row, 8).Value = v.StockQuantity;
                            row++;
                        }
                    }
                    else
                    {
                        // Trường hợp máy chưa có biến thể nào
                        worksheet.Cell(row, 1).Value = p.Id;
                        worksheet.Cell(row, 2).Value = p.Name;
                        worksheet.Cell(row, 3).Value = p.Brand?.Name;
                        worksheet.Cell(row, 4).Value = "Chưa có";
                        row++;
                    }
                }

                worksheet.Columns().AdjustToContents(); // Tự động căn chỉnh độ rộng cột

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Products.xlsx");
                }
            }
        }

        // --- 2. NHẬP EXCEL (IMPORT) ---
        [HttpPost("import")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ImportProducts(IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("Vui lòng chọn file Excel");

            int countSuccess = 0;

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);
                using (var workbook = new XLWorkbook(stream))
                {
                    var worksheet = workbook.Worksheet(1); // Lấy sheet đầu tiên
                    var rows = worksheet.RangeUsed().RowsUsed().Skip(1); // Bỏ qua dòng Header

                    foreach (var row in rows)
                    {
                        try
                        {
                            // Đọc dữ liệu từng cột (Thứ tự phải khớp với file mẫu hoặc quy định)
                            // Giả sử: Col 1: Tên, Col 2: Hãng, Col 3: Màu, 4: RAM, 5: ROM, 6: Giá, 7: Kho, 8: Ảnh
                            string pName = row.Cell(1).GetValue<string>();
                            string brandName = row.Cell(2).GetValue<string>();
                            string color = row.Cell(3).GetValue<string>();
                            string ram = row.Cell(4).GetValue<string>();
                            string rom = row.Cell(5).GetValue<string>();
                            decimal price = row.Cell(6).GetValue<decimal>();
                            int stock = row.Cell(7).GetValue<int>();
                            string img = row.Cell(8).GetValue<string>();

                            if (string.IsNullOrEmpty(pName)) continue;

                            // 1. Tìm hoặc Tạo Hãng
                            var brand = await _context.Brands.FirstOrDefaultAsync(b => b.Name == brandName);
                            if (brand == null)
                            {
                                brand = new Brand { Name = brandName };
                                _context.Brands.Add(brand);
                                await _context.SaveChangesAsync();
                            }

                            // 2. Tìm hoặc Tạo Sản Phẩm (Cha)
                            var product = await _context.Products
                                .Include(p => p.Variants)
                                .FirstOrDefaultAsync(p => p.Name == pName);

                            if (product == null)
                            {
                                product = new Product
                                {
                                    Name = pName,
                                    BrandId = brand.Id,
                                    Description = "Nhập từ Excel",
                                    Thumbnail = img // Tạm lấy ảnh biến thể làm ảnh đại diện
                                };
                                _context.Products.Add(product);
                                await _context.SaveChangesAsync();
                            }

                            // 3. Thêm Biến thể (Con) - Nếu chưa tồn tại
                            bool variantExists = product.Variants.Any(v => v.Color == color && v.Rom == rom && v.Ram == ram);
                            if (!variantExists)
                            {
                                _context.ProductVariants.Add(new ProductVariant
                                {
                                    ProductId = product.Id,
                                    Color = color,
                                    Ram = ram,
                                    Rom = rom,
                                    Price = price,
                                    StockQuantity = stock,
                                    ImageUrl = img
                                });
                                countSuccess++;
                            }
                        }
                        catch (Exception)
                        {
                            // Bỏ qua dòng lỗi, tiếp tục dòng sau
                            continue;
                        }
                    }
                    await _context.SaveChangesAsync();
                }
            }

            return Ok(new { Message = $"Đã nhập thành công {countSuccess} phiên bản sản phẩm." });
        }
    }
}