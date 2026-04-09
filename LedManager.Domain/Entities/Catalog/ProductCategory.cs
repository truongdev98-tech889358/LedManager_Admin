using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Catalog
{
    public class ProductCategory : BaseEntity
    {
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }
        
        public int CategoryId { get; set; }
        public virtual Category? Category { get; set; }
    }
}
