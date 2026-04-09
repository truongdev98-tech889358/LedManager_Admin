using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LedManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBlockTypeAndPositionToProductFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BlockType",
                table: "ProductFeatures",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Position",
                table: "ProductFeatures",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BlockType",
                table: "ProductFeatures");

            migrationBuilder.DropColumn(
                name: "Position",
                table: "ProductFeatures");
        }
    }
}
