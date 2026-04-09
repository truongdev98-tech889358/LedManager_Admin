using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Catalog
{
    public class ProductContentBlock : BaseEntity
    {
        public int ProductId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? ButtonText { get; set; }
        public string? ButtonLink { get; set; }
        public int DisplayOrder { get; set; }
        public string TextPosition { get; set; } = "Left"; // "Left" or "Right"
        
        // Navigation property
        public virtual Product? Product { get; set; }
    }
}
