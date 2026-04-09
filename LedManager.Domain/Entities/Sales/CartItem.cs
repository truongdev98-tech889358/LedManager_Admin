using LedManager.Domain.Entities.Base;
using LedManager.Domain.Entities.Catalog;
using LedManager.Domain.Entities.System;

namespace LedManager.Domain.Entities.Sales
{
    public class CartItem : BaseEntity
    {
        public string SessionId { get; set; } = default!;
        public int? UserId { get; set; }
        
        // Product Reference
        public int ProductId { get; set; }
        public int? ProductVariantId { get; set; } // Nullable in case we want to support product-only (though unlikely if price is on variant)
        
        // Common Fields
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? CustomConfig { get; set; } // JSON for selected options (Color, Usage, or full custom config)
        
        // Navigation Properties
        public virtual User? User { get; set; }
        public virtual Product Product { get; set; } = default!;
        public virtual ProductVariant? ProductVariant { get; set; }
    }
}
