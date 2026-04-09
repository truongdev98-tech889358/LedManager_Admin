using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Catalog
{
    public class ProductAccordion : BaseEntity
    {
        public int ProductId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsExpanded { get; set; } = false; // Default collapsed
        
        // Navigation property
        public virtual Product? Product { get; set; }
    }
}
