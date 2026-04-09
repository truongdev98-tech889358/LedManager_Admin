using LedManager.Domain.Entities.Base;
using LedManager.Domain.Entities.Catalog;

namespace LedManager.Domain.Entities.Sales
{
    public class OrderItem : BaseEntity
    {
        public int OrderId { get; set; }
        public virtual Order? Order { get; set; }
        
        public int ProductId { get; set; }
        public virtual Product? Product { get; set; }
        
        public string? ProductName { get; set; } // Snapshot in case product name changes
        public int Quantity { get; set; }
        public decimal Price { get; set; } // Snapshot price
    }
}
