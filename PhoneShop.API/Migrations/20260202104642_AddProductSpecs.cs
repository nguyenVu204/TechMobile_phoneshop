using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhoneShop.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProductSpecs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Battery",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Chip",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FrontCamera",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OperatingSystem",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RamSpec",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RearCamera",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RomSpec",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Screen",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Battery",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Chip",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "FrontCamera",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "OperatingSystem",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "RamSpec",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "RearCamera",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "RomSpec",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Screen",
                table: "Products");
        }
    }
}
