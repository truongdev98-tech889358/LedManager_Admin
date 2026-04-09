using System;

namespace LedManager.Core.Models
{
    public class ArticleViewModel
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public string? Slug { get; set; }
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int? AuthorId { get; set; }
        public string? AuthorName { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<ArticleSectionViewModel> Sections { get; set; } = new();
    }

    public class ArticleSectionViewModel
    {
        public int Id { get; set; }
        public int ArticleId { get; set; }
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        public string SectionType { get; set; } = "Text";
        public int DisplayOrder { get; set; }
        public string? ButtonText { get; set; }
        public string? ButtonLink { get; set; }
    }

    public class ArticleCategoryViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Slug { get; set; }
        public string? Description { get; set; }
    }

    public class BannerViewModel
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Subtitle { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? MobileImageUrl { get; set; }
        public string? VideoUrl { get; set; }
        public string? MobileVideoUrl { get; set; }
        public string? MediaType { get; set; }
        public string? Link { get; set; }
        
        // CTA Buttons
        public string? ButtonText { get; set; }
        public string? ButtonLink { get; set; }
        public string? ButtonText2 { get; set; }
        public string? ButtonLink2 { get; set; }
        
        // Display Settings
        public string? TextPosition { get; set; }
        public bool ShowOverlay { get; set; }
        public string? BannerType { get; set; }
        
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public string? Position { get; set; }
    }

    public class ProductFeatureViewModel
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string? IconUrl { get; set; }
        public string BlockType { get; set; } = "ProductFeature";
        public string Position { get; set; } = "ProductDetail";
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; }
    }

    public class HomePageContentViewModel
    {
        public int Id { get; set; }
        
        // SEO Metadata
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? MetaKeywords { get; set; }
        public string? OgImage { get; set; }

        // Hero Section
        public string? HeroTitle { get; set; }
        public string? HeroSubtitle { get; set; }
        public string? HeroDescription { get; set; }

        // About Section
        public string? AboutTitle { get; set; }
        public string? AboutDescription { get; set; }
        public string? AboutImage { get; set; }

        // Features Section
        public string? FeaturesTitle { get; set; }
        public string? FeaturesDescription { get; set; }
        public string? FeaturesJson { get; set; }

        // FAQ Section - Part 1
        public string? FaqPart1Title { get; set; }
        public string? FaqPart1Description { get; set; }
        public string? FaqPart1Json { get; set; }

        // FAQ Section - Part 2
        public string? FaqPart2Title { get; set; }
        public string? FaqPart2Description { get; set; }
        public string? FaqPart2Json { get; set; }

        // Trust Brands Section
        public string? TrustBrandsTitle { get; set; }
        public string? TrustBrandsDescription { get; set; }
        public string? TrustBrandsJson { get; set; }



        public bool IsActive { get; set; }
    }
}
