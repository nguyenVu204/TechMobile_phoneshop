# PhoneShop

Một hệ thống thương mại điện tử đầy đủ chức năng cho lĩnh vực bán điện thoại, được xây dựng theo kiến trúc Full-Stack với frontend React và backend ASP.NET Core. Dự án này tập trung vào trải nghiệm người dùng, quản trị sản phẩm và tối ưu quy trình mua hàng, đồng thời thể hiện khả năng thiết kế hệ thống, phân tách tầng nghiệp vụ, quản lý quyền truy cập và tích hợp thanh toán trực tuyến.

## Tổng quan dự án
PhoneShop là một ứng dụng e-commerce hiện đại cho phép:
- Khách hàng duyệt, tìm kiếm, lọc và xem chi tiết sản phẩm điện thoại.
- Quản lý giỏ hàng, đặt hàng và thanh toán trực tuyến.
- Theo dõi lịch sử đơn hàng và quản lý thông tin tài khoản.
- Truy cập các tính năng quản trị dành cho Admin như quản lý sản phẩm, đơn hàng, người dùng và thống kê doanh thu.

Dự án mô phỏng một hệ thống bán hàng thực tế, phù hợp để trình bày với nhà tuyển dụng như một sản phẩm portfolio hoặc kỹ năng thực tế trong phát triển web ứng dụng doanh nghiệp.

## Tính năng chính

### 1. Giao diện khách hàng
- Trang chủ, danh mục sản phẩm, trang chi tiết sản phẩm
- Tìm kiếm theo tên sản phẩm, thương hiệu và khoảng giá
- Lọc/sắp xếp sản phẩm theo tiêu chí phù hợp
- Xem thông tin biến thể, dung lượng bộ nhớ, màu sắc, giá và tồn kho
- Đánh giá và bình luận sản phẩm
- Yêu thích sản phẩm và lưu vào danh sách mong muốn
- Giỏ hàng và quy trình thanh toán
- Theo dõi trạng thái đơn hàng của chính mình

### 2. Quản lý tài khoản và xác thực
- Đăng ký / đăng nhập tài khoản người dùng
- Xác thực email
- Phân quyền theo role: Admin và Customer
- Xác thực JWT để bảo vệ API
- Hỗ trợ đăng nhập bằng Google

### 3. Thanh toán và đặt hàng
- Tạo đơn hàng cho khách hàng
- Hỗ trợ phương thức thanh toán COD và VnPay Sandbox
- Cập nhật trạng thái đơn hàng theo tiến độ
- Lịch sử đơn hàng theo từng người dùng
- Xuất hóa đơn / báo cáo đơn hàng

### 4. Quản trị Admin
- Dashboard thống kê doanh thu, đơn hàng và sản phẩm
- Quản lý sản phẩm: thêm, sửa, xóa, tìm kiếm, lọc
- Quản lý thương hiệu, danh mục tin tức
- Quản lý tồn kho và IMEI/serial number
- Quản lý đơn hàng và trạng thái vận chuyển
- Quản lý người dùng và phân quyền
- Quản lý bài viết tin tức / blog
- Xuất dữ liệu sản phẩm và đơn hàng

### 5. Tính năng mở rộng
- Tích hợp chatbot hỗ trợ sản phẩm
- Upload hình ảnh cho sản phẩm và bài viết
- Seed dữ liệu ban đầu cho admin và sản phẩm mẫu
- Swagger UI để test API

## Công nghệ sử dụng

| Lớp | Công nghệ |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, React Router, Zustand, Recharts, Lucide React |
| Backend | ASP.NET Core 8 Web API |
| Kiến trúc | Clean Architecture / Layered Architecture |
| Authentication | JWT, ASP.NET Core Identity |
| Database | SQL Server |
| ORM | Entity Framework Core |
| API Docs | Swagger / OpenAPI |
| Payment | VnPay Sandbox |
| UI utilities | React Hot Toast, React Quill, html2canvas, jsPDF |

## Kiến trúc hệ thống

Dự án được chia theo các tầng rõ ràng:

- Frontend: ứng dụng khách hàng và admin trên React
- Backend API: xử lý nghiệp vụ, xác thực, quyền truy cập, đặt hàng, thống kê
- Application Layer: service, DTO, interface, business logic
- Domain Layer: entity và model nghiệp vụ
- Infrastructure Layer: EF Core, Identity, repository, payment, email, seeding data

## Cấu trúc thư mục

```text
PhoneShop/
├── README.md
├── Backend/
│   ├── PhoneShop.sln
│   ├── PhoneShop.API/
│   │   ├── Controllers/
│   │   ├── Properties/
│   │   ├── wwwroot/
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── PhoneShop.API.csproj
│   ├── PhoneShop.Application/
│   │   ├── DTOs/
│   │   ├── Interfaces/
│   │   ├── Services/
│   │   └── PhoneShop.Application.csproj
│   ├── PhoneShop.Domain/
│   │   └── Entities/
│   └── PhoneShop.Infrastructure/
│       ├── Persistence/
│       ├── Identity/
│       ├── Payments/
│       ├── DatabaseInitializer.cs
│       └── PhoneShop.Infrastructure.csproj
└── phoneshop-client/
    ├── public/
    ├── src/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── index.html
```

## Luồng nghiệp vụ chính

1. Khách hàng truy cập trang chủ và xem sản phẩm.
2. Người dùng tìm kiếm, lọc và chọn điện thoại phù hợp.
3. Thêm vào giỏ hàng và đi đến thanh toán.
4. Hệ thống kiểm tra tồn kho và lưu đơn hàng.
5. Người dùng thanh toán COD hoặc VnPay.
6. Admin kiểm tra đơn hàng, cập nhật trạng thái và theo dõi doanh thu.
7. Hệ thống lưu trữ dữ liệu và báo cáo thống kê cho quản trị.

## Yêu cầu cài đặt

- .NET SDK 8.0
- Node.js 18+
- SQL Server
- Visual Studio 2022 hoặc VS Code

## Hướng dẫn chạy dự án

### 1. Clone repository

```bash
git clone <repository-url>
cd PhoneShop
```

### 2. Cấu hình Backend
Mở file:

```text
Backend/PhoneShop.API/appsettings.json
```

Cập nhật thông tin kết nối database, JWT và cấu hình thanh toán:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=PhoneShop;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "Jwt": {
    "Key": "YOUR_SECRET_KEY",
    "Issuer": "https://localhost:7069",
    "Audience": "https://localhost:7069"
  },
  "VnPay": {
    "TmnCode": "",
    "HashSecret": "",
    "BaseUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
  }
}
```

### 3. Chạy Backend

```bash
cd Backend

dotnet restore
dotnet build
dotnet run --project PhoneShop.API/PhoneShop.API.csproj
```

API sẽ chạy tại:
- Swagger UI: `https://localhost:7069/swagger`
- API: `https://localhost:7069`

### 4. Chạy Frontend

```bash
cd phoneshop-client
npm install
npm run dev
```

Frontend sẽ chạy mặc định tại:
- `http://localhost:5173`

## Seed dữ liệu mặc định
Khi khởi động ứng dụng, hệ thống tự động seed dữ liệu ban đầu, bao gồm:
- Role: Admin, Customer
- Tài khoản admin mặc định:
  - Email: `admin@gmail.com`
  - Password: `123456`
- Một số sản phẩm mẫu và thương hiệu mẫu

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | admin@gmail.com | 123456 |

## Đóng góp và mở rộng
Dự án có thể được mở rộng với các tính năng như:
- thanh toán online nâng cao
- phân tích dữ liệu và dashboard BI
- tích hợp API giao hàng
- hệ thống khuyến mãi và voucher
- mô hình microservices trong tương lai

## Kết luận
PhoneShop là một dự án Full-Stack thực tế, phản ánh khả năng xây dựng ứng dụng thương mại điện tử hiện đại từ frontend đến backend, đồng thời thể hiện kỹ năng tổ chức code theo tầng, bảo mật API, quản lý dữ liệu và triển khai mô hình quản trị doanh nghiệp. Đây là một sản phẩm phù hợp để giới thiệu với nhà tuyển dụng, đối tác hoặc khách hàng muốn thấy khả năng xây dựng sản phẩm web doanh nghiệp thực tế.
