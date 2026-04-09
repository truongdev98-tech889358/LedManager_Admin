using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Catalog
{
    public class ProductSpecification : BaseEntity
    {
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }

        public string Key { get; set; } = default!;
        public string Value { get; set; } = default!;
        public int DisplayOrder { get; set; }
    }
}
