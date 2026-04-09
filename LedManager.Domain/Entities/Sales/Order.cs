using System.Collections.Generic;
using LedManager.Domain.Entities.Base;
using LedManager.Domain.Enums;

namespace LedManager.Domain.Entities.Sales
{
    public class Order : BaseEntity
    {
        public string? OrderCode { get; set; } 
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerAddress { get; set; }
        public string? CustomerEmail { get; set; }
        public string? Note { get; set; }
        
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; }
        
        public virtual ICollection<OrderItem>? OrderItems { get; set; }
    }
}
