using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.API.Dtos;
using PhoneShop.API.Models;
using System.Security.Claims;
using ClosedXML.Excel;
using System.Security.Claims;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = new Order
                {
                    CustomerName = dto.CustomerName,
                    CustomerPhone = dto.CustomerPhone,
                    ShippingAddress = dto.ShippingAddress,
                    OrderDate = DateTime.Now,
                    Status = "Pending",
                    UserId = userId,
                    PaymentMethod = dto.PaymentMethod ?? "COD",
                    PaymentStatus = "Unpaid"
                };

                decimal totalAmount = 0;

                foreach (var item in dto.Items)
                {
                    var variant = await _context.ProductVariants.FindAsync(item.VariantId);
                    if (variant == null) return BadRequest($"Sản phẩm ID {item.VariantId} không tồn tại.");

                    // --- 1. LOGIC TỰ ĐỘNG LẤY IMEI (QUAN TRỌNG) ---
                    // Lấy ra n serial numbers đang Available, ưu tiên nhập trước (Id nhỏ)
                    var availableSerials = await _context.ProductSerialNumbers
                        .Where(s => s.ProductVariantId == item.VariantId && s.Status == "Available")
                        .OrderBy(s => s.Id) // FIFO: Xuất cái cũ trước
                        .Take(item.Quantity)
                        .ToListAsync();

                    // Kiểm tra xem có đủ IMEI để bán không?
                    if (availableSerials.Count < item.Quantity)
                    {
                        return BadRequest($"Sản phẩm {variant.Color} chỉ còn {availableSerials.Count} máy (IMEI) khả dụng, không đủ số lượng {item.Quantity} yêu cầu.");
                    }

                    // Cập nhật trạng thái các IMEI này thành SOLD
                    foreach (var serial in availableSerials)
                    {
                        serial.Status = "Sold";
                        serial.Order = order; // Link với Order này (EF Core tự hiểu OrderId sau khi save)
                    }

                    // Tạo chuỗi IMEI để lưu vào OrderDetail (VD: "IMEI123, IMEI456")
                    string serialString = string.Join(", ", availableSerials.Select(s => s.SerialNumber));
                    // ---------------------------------------------------

                    // Cập nhật tồn kho (Trừ đi số lượng)
                    // variant.StockQuantity -= item.Quantity; // Nếu bạn quản lý kho bằng số đếm
                    // Hoặc chuẩn hơn: StockQuantity sẽ tự tính bằng số lượng Available còn lại (nếu bạn muốn)
                    variant.StockQuantity -= item.Quantity;

                    var orderDetail = new OrderDetail
                    {
                        ProductVariantId = item.VariantId,
                        Quantity = item.Quantity,
                        UnitPrice = variant.Price,
                        Order = order,
                        SerialNumber = serialString // <--- LƯU LUÔN TẠI ĐÂY
                    };

                    totalAmount += variant.Price * item.Quantity;
                    _context.OrderDetails.Add(orderDetail);
                }

                order.TotalAmount = totalAmount;
                _context.Orders.Add(order);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync(); // Xác nhận giao dịch thành công

                return Ok(new { Message = "Đặt hàng thành công", OrderId = order.Id, Total = totalAmount });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(); // Nếu lỗi thì hoàn tác tất cả
                return StatusCode(500, "Lỗi server: " + ex.Message);
            }
        }

        // GET: api/orders/my-orders
        [HttpGet("my-orders")]
        [Authorize]
        public async Task<ActionResult<object>> GetMyOrders(
            [FromQuery] int page = 1,
            [FromQuery] int limit = 5 // Mặc định lấy 5 đơn mỗi trang
        )
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            // Tạo Query
            var query = _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.ProductVariant)
                .ThenInclude(v => v.Product)
                .OrderByDescending(o => o.OrderDate); // Đơn mới nhất lên đầu

            // Tính toán phân trang
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)limit);

            // Lấy dữ liệu
            var orders = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            // Trả về format chuẩn (Items + TotalPages)
            return Ok(new
            {
                Items = orders,
                TotalPages = totalPages,
                CurrentPage = page,
                TotalItems = totalItems
            });
        }

        // GET: api/orders (Dành cho Admin)
        [HttpGet]
        [Authorize(Roles = "Admin")] // Chỉ Admin
        public async Task<ActionResult<object>> GetOrders(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 10 
        )
        {
            var query = _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.ProductVariant)
                .ThenInclude(v => v.Product)
                .AsQueryable();

            // Tìm kiếm (Mã đơn, Tên khách, SĐT)
            if (!string.IsNullOrEmpty(search))
            {
                
                // search theo Tên hoặc SĐT
                query = query.Where(o =>
                    o.CustomerName.Contains(search) ||
                    o.CustomerPhone.Contains(search) ||
                    o.Id.ToString().Contains(search)
                );
            }

            // Sắp xếp: Mới nhất lên đầu
            query = query.OrderByDescending(o => o.OrderDate);

            // Phân trang
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalItems / (double)limit);

            var orders = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return Ok(new
            {
                Items = orders,
                TotalPages = totalPages,
                CurrentPage = page,
                TotalItems = totalItems
            });
        }

        // GET: api/orders/5 (Lấy chi tiết 1 đơn hàng)
        [HttpGet("{id}")]
        [Authorize] // Bắt buộc đăng nhập
        public async Task<ActionResult<Order>> GetOrderById(int id)
        {
            // Lấy thông tin người đang đăng nhập
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            // Tìm đơn hàng và Include đầy đủ thông tin sản phẩm
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ProductVariant)
                        .ThenInclude(v => v.Product) // Để lấy tên sản phẩm, ảnh
                .FirstOrDefaultAsync(o => o.Id == id);

            // Nếu không tìm thấy
            if (order == null)
            {
                return NotFound(new { Message = "Không tìm thấy đơn hàng này." });
            }

            // Nếu không phải Admin VÀ cũng không phải chủ đơn hàng
            if (userRole != "Admin" && order.UserId != userId)
            {
                return Forbid(); // Trả về lỗi 403 Forbidden
            }

            return Ok(order);
        }

        // --- API ADMIN: Cập nhật trạng thái đơn ---
        // PUT: api/orders/5/status
        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string newStatus)
        {
            var order = await _context.Orders.FindAsync(id);

            if (order == null)
            {
                return NotFound("Không tìm thấy đơn hàng");
            }

            order.Status = newStatus; // Ví dụ: "Shipping", "Completed", "Cancelled"
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Cập nhật trạng thái thành công" });
        }

        // POST: api/orders/assign-imei
        [HttpPost("assign-imei")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignImeiToOrder([FromBody] AssignImeiDto dto)
        {
            // 1. Tìm và kiểm tra IMEI
            var serial = await _context.ProductSerialNumbers.FindAsync(dto.SerialNumberId);
            if (serial == null || serial.Status != "Available")
                return BadRequest("IMEI không tồn tại hoặc đã được bán.");

            // 2. Tìm chi tiết đơn hàng (OrderDetail) tương ứng
            // Tìm dòng sản phẩm đúng loại (VariantId) trong đơn hàng (OrderId)
            var orderDetail = await _context.OrderDetails
                .FirstOrDefaultAsync(od => od.OrderId == dto.OrderId && od.ProductVariantId == dto.ProductVariantId);

            if (orderDetail == null) return NotFound("Không tìm thấy dòng sản phẩm này trong đơn hàng.");

            // 3. Logic Gán IMEI vào OrderDetail
            // Nếu chưa có thì gán mới, nếu có rồi (trường hợp mua sl > 1) thì nối thêm dấu phẩy
            if (string.IsNullOrEmpty(orderDetail.SerialNumber))
            {
                orderDetail.SerialNumber = serial.SerialNumber;
            }
            else
            {
                // Kiểm tra xem đã gán đủ số lượng chưa
                var currentImeis = orderDetail.SerialNumber.Split(", ");
                if (currentImeis.Length >= orderDetail.Quantity)
                {
                    return BadRequest($"Đã gán đủ {orderDetail.Quantity} IMEI cho sản phẩm này rồi.");
                }

                // Kiểm tra xem IMEI này đã có trong list chưa (tránh gán trùng)
                if (!orderDetail.SerialNumber.Contains(serial.SerialNumber))
                {
                    orderDetail.SerialNumber += ", " + serial.SerialNumber;
                }
            }

            // 4. Cập nhật trạng thái IMEI trong kho (Table ProductSerialNumbers)
            serial.Status = "Sold";
            serial.OrderId = dto.OrderId;

            // 5. Trừ tồn kho (Logic cũ - giữ nguyên hoặc bỏ nếu bạn dùng count IMEI làm tồn kho)
            var variant = await _context.ProductVariants.FindAsync(serial.ProductVariantId);
            if (variant != null)
            {
                // Tính lại tồn kho thực tế cho chắc chắn
                var realStock = await _context.ProductSerialNumbers
                    .CountAsync(x => x.ProductVariantId == variant.Id && x.Status == "Available");

                // Lưu ý: Lúc này 'serial' đang set Sold nhưng chưa SaveChanges nên count có thể vẫn tính nó.
                // Tốt nhất cứ trừ tay 1 đơn vị hoặc dùng count - 1
                variant.StockQuantity -= 1;
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã gán IMEI thành công", SerialNumber = orderDetail.SerialNumber });
        }

        // PUT: api/orders/{id}/payment-status
        [HttpPut("{id}/payment-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePaymentStatus(int id, [FromBody] string newStatus)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            // newStatus: "Paid" hoặc "Unpaid"
            order.PaymentStatus = newStatus;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật trạng thái thanh toán thành công" });
        }

        // GET: api/orders/export
        [HttpGet("export")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderDetails).ThenInclude(od => od.ProductVariant).ThenInclude(v => v.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("DonHang");

                // Header
                worksheet.Cell(1, 1).Value = "Mã Đơn";
                worksheet.Cell(1, 2).Value = "Ngày Đặt";
                worksheet.Cell(1, 3).Value = "Khách Hàng";
                worksheet.Cell(1, 4).Value = "SĐT";
                worksheet.Cell(1, 5).Value = "Địa Chỉ";
                worksheet.Cell(1, 6).Value = "Tổng Tiền";
                worksheet.Cell(1, 7).Value = "Trạng Thái";
                worksheet.Cell(1, 8).Value = "Chi Tiết Sản Phẩm (Gộp)";

                worksheet.Range("A1:H1").Style.Font.Bold = true;

                int row = 2;
                foreach (var o in orders)
                {
                    worksheet.Cell(row, 1).Value = o.Id;
                    worksheet.Cell(row, 2).Value = o.OrderDate;
                    worksheet.Cell(row, 3).Value = o.CustomerName;
                    worksheet.Cell(row, 4).Value = $"'{o.CustomerPhone}"; // Thêm dấu ' để excel hiểu là text, ko mất số 0 đầu
                    worksheet.Cell(row, 5).Value = o.ShippingAddress;
                    worksheet.Cell(row, 6).Value = o.TotalAmount;
                    worksheet.Cell(row, 7).Value = o.Status;

                    // Gộp tên các sản phẩm vào 1 ô cho gọn
                    var details = string.Join("; ", o.OrderDetails.Select(od =>
                        $"{od.ProductVariant?.Product?.Name} ({od.ProductVariant?.Color}) x{od.Quantity}"));
                    worksheet.Cell(row, 8).Value = details;

                    row++;
                }
                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return File(stream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Orders.xlsx");
                }
            }
        }
    }
}