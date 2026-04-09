using System.Collections.Generic;
using System.Threading.Tasks;
using LedManager.Core.Models;

namespace LedManager.Core.Services
{
    public interface IOrderService
    {
        Task<PagedResult<OrderViewModel>> GetListAsync(OrderListRequest request);
        Task<OrderViewModel?> GetByIdAsync(int id);
        Task AddAsync(OrderViewModel model);
        Task CreateOrderAsync(OrderCreateRequest request);
        Task UpdateAsync(OrderViewModel model);
        Task DeleteAsync(int id);
    }

    public interface IOrderItemService
    {
        Task<PagedResult<OrderItemViewModel>> GetListAsync(OrderItemListRequest request);
        Task<OrderItemViewModel?> GetByIdAsync(int id);
        Task AddAsync(OrderItemViewModel model);
        Task UpdateAsync(OrderItemViewModel model);
        Task DeleteAsync(int id);
    }
}
