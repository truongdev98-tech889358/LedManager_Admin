using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Content
{
    public class HomePageContent : BaseEntity
    {
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
        public string? FeaturesJson { get; set; } // JSON array of features

        // FAQ Section - Part 1
        public string? FaqPart1Title { get; set; }
        public string? FaqPart1Description { get; set; }
        public string? FaqPart1Json { get; set; } // JSON array of FAQs

        // FAQ Section - Part 2
        public string? FaqPart2Title { get; set; }
        public string? FaqPart2Description { get; set; }
        public string? FaqPart2Json { get; set; } // JSON array of FAQs

        // Trust Brands Section
        public string? TrustBrandsTitle { get; set; }
        public string? TrustBrandsDescription { get; set; }
        public string? TrustBrandsJson { get; set; } // JSON array of brand logos



        public bool IsActive { get; set; } = true;
    }
}
