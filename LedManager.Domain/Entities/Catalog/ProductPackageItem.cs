using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Catalog
{
    public class ProductPackageItem : BaseEntity
    {
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }

        public string ItemName { get; set; } = default!;
        public int Quantity { get; set; } = 1;
    }
}
