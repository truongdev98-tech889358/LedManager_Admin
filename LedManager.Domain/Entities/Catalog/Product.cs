using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Catalog
{
    public class Product : BaseEntity
    {
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Description { get; set; }
        public string? Content { get; set; } // Detailed description
        public int StockQuantity { get; set; }
        public int TotalSold { get; set; } // Total quantity sold for best selling tracking
        public string? UsageSupport { get; set; } // Indoor, Outdoor, Both
        public decimal OutdoorPriceUpgrade { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsCustom { get; set; } // True for custom neon designs
        public string? CustomConfig { get; set; } // JSON configuration for custom neon
        
        public virtual ICollection<ProductCategory>? ProductCategories { get; set; }
        public virtual ICollection<ProductImage>? Images { get; set; }
        public virtual ICollection<ProductSpecification>? Specifications { get; set; }
        public virtual ICollection<ProductVariant>? Variants { get; set; }
        public virtual ICollection<ProductPackageItem>? PackageIncludes { get; set; }
        public virtual ICollection<ProductContentBlock>? ContentBlocks { get; set; }
        public virtual ICollection<ProductAccordion>? Accordions { get; set; }
        public virtual ICollection<Review>? Reviews { get; set; }
    }
}
