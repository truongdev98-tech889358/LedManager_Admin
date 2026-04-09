using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LedManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixMenuSchema2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Menus",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GridType",
                table: "Menus",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Menus",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsMegaMenu",
                table: "Menus",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "GridType",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Menus");

            migrationBuilder.DropColumn(
                name: "IsMegaMenu",
                table: "Menus");
        }
    }
}
