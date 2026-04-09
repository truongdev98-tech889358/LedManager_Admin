using LedManager.Domain.Entities.Sales;

namespace LedManager.Core.Repositories
{
    public interface IOrderRepository : IRepository<Order> { }
    public interface IOrderItemRepository : IRepository<OrderItem> { }
    public interface ICartItemRepository : IRepository<CartItem> { }
}
