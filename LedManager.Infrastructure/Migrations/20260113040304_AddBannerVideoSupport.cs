using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LedManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBannerVideoSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MediaType",
                table: "Banners",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MobileVideoUrl",
                table: "Banners",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VideoUrl",
                table: "Banners",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MediaType",
                table: "Banners");

            migrationBuilder.DropColumn(
                name: "MobileVideoUrl",
                table: "Banners");

            migrationBuilder.DropColumn(
                name: "VideoUrl",
                table: "Banners");
        }
    }
}
