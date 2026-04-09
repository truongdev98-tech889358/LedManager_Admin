using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LedManager.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHomePageContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HomePageContents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MetaTitle = table.Column<string>(type: "text", nullable: true),
                    MetaDescription = table.Column<string>(type: "text", nullable: true),
                    MetaKeywords = table.Column<string>(type: "text", nullable: true),
                    OgImage = table.Column<string>(type: "text", nullable: true),
                    HeroTitle = table.Column<string>(type: "text", nullable: true),
                    HeroSubtitle = table.Column<string>(type: "text", nullable: true),
                    HeroDescription = table.Column<string>(type: "text", nullable: true),
                    AboutTitle = table.Column<string>(type: "text", nullable: true),
                    AboutDescription = table.Column<string>(type: "text", nullable: true),
                    AboutImage = table.Column<string>(type: "text", nullable: true),
                    FeaturesTitle = table.Column<string>(type: "text", nullable: true),
                    FeaturesDescription = table.Column<string>(type: "text", nullable: true),
                    FeaturesJson = table.Column<string>(type: "text", nullable: true),
                    FaqPart1Title = table.Column<string>(type: "text", nullable: true),
                    FaqPart1Description = table.Column<string>(type: "text", nullable: true),
                    FaqPart1Json = table.Column<string>(type: "text", nullable: true),
                    FaqPart2Title = table.Column<string>(type: "text", nullable: true),
                    FaqPart2Description = table.Column<string>(type: "text", nullable: true),
                    FaqPart2Json = table.Column<string>(type: "text", nullable: true),
                    TrustBrandsTitle = table.Column<string>(type: "text", nullable: true),
                    TrustBrandsDescription = table.Column<string>(type: "text", nullable: true),
                    TrustBrandsJson = table.Column<string>(type: "text", nullable: true),
                    HowItWorksTitle = table.Column<string>(type: "text", nullable: true),
                    HowItWorksDescription = table.Column<string>(type: "text", nullable: true),
                    HowItWorksVideoUrl = table.Column<string>(type: "text", nullable: true),
                    HowItWorksStepsJson = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
                    DeletedBy = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomePageContents", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HomePageContents");
        }
    }
}
