using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Catalog
{
    public class ProductVariant : BaseEntity
    {
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }

        public string Type { get; set; } = default!; // e.g., "Size", "Color"
        public string Label { get; set; } = default!; // e.g., "Small", "Pink"
        public string? Value { get; set; } // e.g., "29.53 in x 27.95 in", "#FFC0CB"
        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int StockQuantity { get; set; }

    }
}
