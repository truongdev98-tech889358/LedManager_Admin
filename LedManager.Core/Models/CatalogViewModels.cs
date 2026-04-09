using System;
using System.Collections.Generic;

namespace LedManager.Core.Models
{
    public class CategoryViewModel
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsFeatured { get; set; }
        public int? ParentId { get; set; }
        public List<CategoryViewModel>? Children { get; set; }
        public List<ProductViewModel>? Products { get; set; }
    }

    public class ProductViewModel
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public int StockQuantity { get; set; }
        public string? UsageSupport { get; set; }
        public decimal OutdoorPriceUpgrade { get; set; }
        public bool IsFeatured { get; set; }
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public List<int>? CategoryIds { get; set; }
        public List<CategoryViewModel>? Categories { get; set; }
        public List<ProductImageViewModel>? Images { get; set; }
        public List<ProductSpecificationViewModel>? Specifications { get; set; }
        public List<ProductVariantViewModel>? Variants { get; set; }
        public List<ProductPackageItemViewModel>? PackageIncludes { get; set; }
        public List<ProductContentBlockViewModel>? ContentBlocks { get; set; }
        public List<ProductAccordionViewModel>? Accordions { get; set; }
        
        // Computed properties from variants
        public decimal? MinPrice => Variants?.Any() == true ? Variants.Min(v => v.Price) : null;
        public decimal? MaxPrice => Variants?.Any() == true ? Variants.Max(v => v.Price) : null;
        public bool IsOnSale => Variants?.Any(v => v.IsOnSale) == true;
        public int DiscountPercentage => Variants?.Any() == true ? Variants.Max(v => v.DiscountPercentage) : 0;
    }

    public class ProductSpecificationViewModel
    {
        public int Id { get; set; }
        public string? Key { get; set; }
        public string? Value { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class ProductVariantViewModel
    {
        public int Id { get; set; }
        public string? Type { get; set; }
        public string? Label { get; set; }
        public string? Value { get; set; }
        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int StockQuantity { get; set; }
        
        // Computed properties
        public bool IsOnSale => OriginalPrice.HasValue && OriginalPrice.Value > Price;
        public int DiscountPercentage => IsOnSale ? (int)((OriginalPrice!.Value - Price) / OriginalPrice.Value * 100) : 0;
    }

    public class ProductPackageItemViewModel
    {
        public int Id { get; set; }
        public string? ItemName { get; set; }
        public int Quantity { get; set; }
    }

    public class ProductImageViewModel
    {
        public int Id { get; set; }
        public string? Url { get; set; }
        public bool IsPrimary { get; set; }
        public int ProductId { get; set; }
    }

    public class ProductContentBlockViewModel
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? ButtonText { get; set; }
        public string? ButtonLink { get; set; }
        public int DisplayOrder { get; set; }
        public string TextPosition { get; set; } = "Left";
    }

    public class ProductAccordionViewModel
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsExpanded { get; set; }
    }
}
