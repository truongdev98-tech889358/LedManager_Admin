namespace LedManager.Core.Models
{
    public class AddToCartRequest
    {
        public bool IsCustomNeon { get; set; }
        public bool IsImageBased { get; set; }
        public string? CustomConfig { get; set; } // JSON string of NeonConfig
        public string? PreviewImageBase64 { get; set; } // Base64 image for preview
        public int? ProductId { get; set; } // For catalog products (if not custom)
        public int Quantity { get; set; } = 1;
        public int? ProductVariantId { get; set; } // Specific variant selection
        public string? ColorName { get; set; }
        public string? ColorCode { get; set; }
        public decimal? Price { get; set; }
    }

    public class UpdateCartItemRequest
    {
        public int Quantity { get; set; }
    }

    public class CartItemViewModel
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductSlug { get; set; } // For linking
        public string? ProductSku { get; set; }
        public bool IsCustomNeon { get; set; }
        public bool IsImageBased { get; set; }
        public string? CustomConfig { get; set; }
        public string? PreviewImageUrl { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class CartViewModel
    {
        public List<CartItemViewModel> Items { get; set; } = new();
        public decimal Subtotal { get; set; }
        public int TotalItems { get; set; }
    }

    public class CreateCustomProductRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Sku { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty; // Formatted specs
        public string CustomConfig { get; set; } = string.Empty; // JSON config
        public decimal Price { get; set; }
        public bool IsImageBased { get; set; }
        public string? PreviewImageBase64 { get; set; }
    }
}
