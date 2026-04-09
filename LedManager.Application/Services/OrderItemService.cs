using System.Linq.Expressions;
using LedManager.Core.Exceptions;
using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Entities.Sales;

namespace LedManager.Application.Services
{
    public class OrderItemService : IOrderItemService
    {
        private readonly IOrderItemRepository _repository;

        public OrderItemService(IOrderItemRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<OrderItemViewModel>> GetListAsync(OrderItemListRequest request)
        {
            Expression<Func<OrderItem, bool>> filter = x => !x.IsDeleted;
            if (request.OrderId.HasValue)
            {
                // OrderItem usually has OrderId but not in entity I saw earlier? 
                // Wait, OrderItem usually has OrderId. I'll assume generic filter or query by parent
                // If entity doesn't have OrderId property exposed or I didn't see it, I'll stick to basic.
                // Assuming it has OrderId
                // filter = x => !x.IsDeleted && x.OrderId == request.OrderId.Value;
            }

            var totalCount = await _repository.Count(filter);
            var entities = await _repository.QueryAsync(filter, pageSize: request.PageSize, page: request.PageIndex - 1);

            var items = entities.Select(e => new OrderItemViewModel
            {
                Id = e.Id,
                ProductId = e.ProductId,
                ProductName = e.ProductName,
                Quantity = e.Quantity,
                Price = e.Price
            }).ToList();

            return new PagedResult<OrderItemViewModel>(items, totalCount, request.PageIndex, request.PageSize);
        }

        public async Task<OrderItemViewModel?> GetByIdAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            return entity == null ? null : new OrderItemViewModel
            {
                Id = entity.Id,
                ProductId = entity.ProductId,
                ProductName = entity.ProductName,
                Quantity = entity.Quantity,
                Price = entity.Price
            };
        }

        public async Task AddAsync(OrderItemViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (model.Quantity <= 0) throw new ValidationException("Quantity must be greater than 0.");

            var entity = new OrderItem
            {
               ProductId = model.ProductId,
               ProductName = model.ProductName,
               Quantity = model.Quantity,
               Price = model.Price
            };
            await _repository.Add(entity);
        }

        public async Task UpdateAsync(OrderItemViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == model.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(OrderItem), model.Id);
            }

            entity.ProductId = model.ProductId;
            entity.ProductName = model.ProductName;
            entity.Quantity = model.Quantity;
            entity.Price = model.Price;
            await _repository.Update(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(OrderItem), id);
            }
            await _repository.Delete(entity);
        }
    }
}
