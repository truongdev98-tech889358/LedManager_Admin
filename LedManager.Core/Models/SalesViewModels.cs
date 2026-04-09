using System;
using System.Collections.Generic;
using LedManager.Domain.Enums;

namespace LedManager.Core.Models
{
    public class OrderViewModel
    {
        public int Id { get; set; }
        public string? OrderCode { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerAddress { get; set; }
        public string? CustomerEmail { get; set; }
        public string? Note { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime CreatedDate { get; set; }
        public List<OrderItemViewModel>? OrderItems { get; set; }
    }

    public class OrderItemViewModel
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
