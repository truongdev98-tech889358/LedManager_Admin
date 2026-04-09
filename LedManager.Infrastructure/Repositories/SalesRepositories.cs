using LedManager.Core.Repositories;
using LedManager.Domain.Entities.Sales;
using LedManager.Infrastructure.Data;

namespace LedManager.Infrastructure.Repositories
{
    public class OrderRepository : RepositoryBase<Order>, IOrderRepository
    {
        public OrderRepository(ApplicationDbContext context) : base(context) { }
    }

    public class OrderItemRepository : RepositoryBase<OrderItem>, IOrderItemRepository
    {
        public OrderItemRepository(ApplicationDbContext context) : base(context) { }
    }

    public class CartItemRepository : RepositoryBase<CartItem>, ICartItemRepository
    {
        public CartItemRepository(ApplicationDbContext context) : base(context) { }
    }
}
