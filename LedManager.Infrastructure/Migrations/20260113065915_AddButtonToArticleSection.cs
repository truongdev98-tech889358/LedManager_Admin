using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LedManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddButtonToArticleSection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ButtonLink",
                table: "ArticleSections",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ButtonText",
                table: "ArticleSections",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ButtonLink",
                table: "ArticleSections");

            migrationBuilder.DropColumn(
                name: "ButtonText",
                table: "ArticleSections");
        }
    }
}
