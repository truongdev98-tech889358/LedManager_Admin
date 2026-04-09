using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Catalog
{
    public class ProductImage : BaseEntity
    {
        public string Url { get; set; } = default!;
        public bool IsPrimary { get; set; }
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }
    }
}
