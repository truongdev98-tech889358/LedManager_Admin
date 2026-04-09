namespace LedManager.Core.Models
{
    public class OrderListRequest : PagingRequest 
    {
        // Can add Status filter, Date range filter
    }

    public class OrderItemListRequest : PagingRequest 
    {
        public int? OrderId { get; set; }
    }

    public class OrderCreateRequest
    {
        public ContactInfo Contact { get; set; } = new();
        public ShippingAddressInfo ShippingAddress { get; set; } = new();
        public string? DiscountCode { get; set; }
        public List<OrderItemRequest> Items { get; set; } = new();
        public TotalsInfo Totals { get; set; } = new();
        public System.DateTimeOffset CreatedAt { get; set; }
    }

    public class ContactInfo
    {
        public string? Email { get; set; }
        public bool MarketingOptIn { get; set; }
    }

    public class ShippingAddressInfo
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Address { get; set; }
        public string? Apartment { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? Postcode { get; set; }
        public string? Country { get; set; }
        public string? Phone { get; set; }
    }

    public class OrderItemRequest
    {
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Usage { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class TotalsInfo
    {
        public decimal Subtotal { get; set; }
        public decimal Shipping { get; set; }
        public decimal Total { get; set; }
    }
}
