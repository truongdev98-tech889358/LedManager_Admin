using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LedManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomConfigToCartItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomConfig",
                table: "CartItems",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomConfig",
                table: "CartItems");
        }
    }
}
