using System.Linq.Expressions;
using LedManager.Core.Exceptions;
using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Entities.Sales;
using LedManager.Application.ViewModels;
using LedManager.Domain.Entities.System;
using LedManager.Application.Interfaces;
using LedManager.Domain.Enums;

namespace LedManager.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _repository;
        private readonly IProductRepository _productRepository;
        private readonly IHistoryService _historyService;

        public OrderService(IOrderRepository repository, IProductRepository productRepository, IHistoryService historyService)
        {
            _repository = repository;
            _productRepository = productRepository;
            _historyService = historyService;
        }

        public async Task CreateOrderAsync(OrderCreateRequest request)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));

            using var scope = new System.Transactions.TransactionScope(System.Transactions.TransactionScopeAsyncFlowOption.Enabled);

            var order = new Order
            {
                OrderCode = $"ORD-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}", 
                CustomerName = $"{request.ShippingAddress.FirstName} {request.ShippingAddress.LastName}".Trim(),
                CustomerPhone = request.ShippingAddress.Phone,
                CustomerAddress = $"{request.ShippingAddress.Address}, {request.ShippingAddress.City}, {request.ShippingAddress.State}, {request.ShippingAddress.Country}, {request.ShippingAddress.Postcode}",
                CustomerEmail = request.Contact.Email,
                Note = request.DiscountCode != null ? $"Discount Code: {request.DiscountCode}" : null,
                TotalAmount = request.Totals.Total,
                Status = OrderStatus.Pending,
                CreatedAt = request.CreatedAt.DateTime != DateTime.MinValue ? request.CreatedAt : DateTimeOffset.Now,
                OrderItems = new List<OrderItem>()
            };

            foreach (var item in request.Items)
            {
                // Stock Validation and Deduction
                var product = await _productRepository.FirstOrDefaultAsync(x => x.Id == item.ProductId, includeProperties: "Variants");
                if (product == null)
                {
                     throw new ValidationException($"Product with ID {item.ProductId} not found.");
                }

                if (product.StockQuantity < item.Quantity)
                {
                    throw new ValidationException($"Insufficient stock for product '{product.Name}'. Available: {product.StockQuantity}, Requested: {item.Quantity}");
                }

                product.StockQuantity -= item.Quantity;
                product.TotalSold += item.Quantity; // Track total sold for best selling sort

                //// Deduct Variant Stock
                //if (!string.IsNullOrEmpty(item.Color))
                //{
                //    var variant = product.Variants?.FirstOrDefault(v => v.Type == "Color" && v.Label == item.Color);
                //    if (variant != null)
                //    {
                //        if (variant.StockQuantity < item.Quantity)
                //             throw new ValidationException($"Insufficient stock for variant '{item.Color}' of product '{product.Name}'. Available: {variant.StockQuantity}");
                //        variant.StockQuantity -= item.Quantity;
                //    }
                //}

                //if (!string.IsNullOrEmpty(item.Size))
                //{
                //    var variant = product.Variants?.FirstOrDefault(v => v.Type == "Size" && v.Label == item.Size);
                //    if (variant != null)
                //    {
                //        if (variant.StockQuantity < item.Quantity)
                //             throw new ValidationException($"Insufficient stock for variant '{item.Size}' of product '{product.Name}'. Available: {variant.StockQuantity}");
                //        variant.StockQuantity -= item.Quantity;
                //    }
                //}

                await _productRepository.Update(product, commit: false);

                var productNameSnapshot = item.ProductName ?? product.Name;
                var details = new List<string>();
                if (!string.IsNullOrEmpty(item.Color)) details.Add($"Color: {item.Color}");
                if (!string.IsNullOrEmpty(item.Size)) details.Add($"Size: {item.Size}");
                if (!string.IsNullOrEmpty(item.Usage)) details.Add($"Usage: {item.Usage}");
                
                if (details.Any())
                {
                    productNameSnapshot += $" ({string.Join(", ", details)})";
                }

                order.OrderItems.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    ProductName = productNameSnapshot,
                    Quantity = item.Quantity,
                    Price = item.UnitPrice 
                });
            }

            await _repository.Add(order, commit: false);
            await _repository.Commit(); 
            
            await _historyService.AddHistoryAsync(new HistoryCreateRequest
            {
                EntityType = HistoryType.Order,
                EntityId = order.Id,
                ActionType = "ORDER_CREATED",
                Description = "Order created"
            }, "System");

            scope.Complete();
        }

        public async Task<PagedResult<OrderViewModel>> GetListAsync(OrderListRequest request)
        {
             Expression<Func<Order, bool>> filter = x => !x.IsDeleted;
            if (!string.IsNullOrEmpty(request.Keyword))
            {
                filter = x => !x.IsDeleted && ((x.OrderCode != null && x.OrderCode.Contains(request.Keyword)) || (x.CustomerName != null && x.CustomerName.Contains(request.Keyword)) || (x.CustomerPhone != null && x.CustomerPhone.Contains(request.Keyword)));
            }

            var totalCount = await _repository.Count(filter);
            var entities = await _repository.QueryAsync(filter, orderBy: x => x.OrderByDescending(o => o.Id), includeProperties: "OrderItems", pageSize: request.PageSize, page: request.PageIndex - 1);

            var items = entities.Select(e => new OrderViewModel
            {
                Id = e.Id,
                OrderCode = e.OrderCode,
                CustomerName = e.CustomerName,
                CustomerPhone = e.CustomerPhone,
                CustomerAddress = e.CustomerAddress,
                CustomerEmail = e.CustomerEmail,
                Note = e.Note,
                TotalAmount = e.TotalAmount,
                Status = e.Status,
                CreatedDate = e.CreatedAt.DateTime,
                OrderItems = e.OrderItems?.Select(i => new OrderItemViewModel
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    Price = i.Price
                }).ToList()
            }).ToList();

            return new PagedResult<OrderViewModel>(items, totalCount, request.PageIndex, request.PageSize);
        }

        public async Task<OrderViewModel?> GetByIdAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id, includeProperties: "OrderItems");
            return entity == null ? null : new OrderViewModel
            {
                Id = entity.Id,
                OrderCode = entity.OrderCode,
                CustomerName = entity.CustomerName,
                CustomerPhone = entity.CustomerPhone,
                CustomerAddress = entity.CustomerAddress,
                CustomerEmail = entity.CustomerEmail,
                Note = entity.Note,
                TotalAmount = entity.TotalAmount,
                Status = entity.Status,
                CreatedDate = entity.CreatedAt.DateTime,
                OrderItems = entity.OrderItems?.Select(i => new OrderItemViewModel
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    Price = i.Price
                }).ToList()
            };
        }

        public async Task AddAsync(OrderViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrEmpty(model.CustomerName)) throw new ValidationException("Customer Name is required.");

            var entity = new Order
            {
                OrderCode = model.OrderCode,
                CustomerName = model.CustomerName,
                CustomerPhone = model.CustomerPhone,
                CustomerAddress = model.CustomerAddress,
                CustomerEmail = model.CustomerEmail,
                Note = model.Note,
                TotalAmount = model.TotalAmount,
                Status = model.Status
            };
            await _repository.Add(entity);
        }

        public async Task UpdateAsync(OrderViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == model.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Order), model.Id);
            }

            var oldStatus = entity.Status;
            var oldNote = entity.Note;

            entity.OrderCode = model.OrderCode;
            entity.CustomerName = model.CustomerName;
            entity.CustomerPhone = model.CustomerPhone;
            entity.CustomerAddress = model.CustomerAddress;
            entity.CustomerEmail = model.CustomerEmail;
            entity.Note = model.Note;
            entity.TotalAmount = model.TotalAmount;
            entity.Status = model.Status;
            
            await _repository.Update(entity);

            // Log changes
            if (oldStatus != entity.Status)
            {
                await _historyService.AddHistoryAsync(new HistoryCreateRequest
                {
                    EntityType = HistoryType.Order,
                    EntityId = entity.Id,
                    Description = $"Updated status from {oldStatus} to {entity.Status}",
                    ActionType = "STATUS_CHANGE"
                }, "Admin");
            }

            if (oldNote != entity.Note)
            {
                await _historyService.AddHistoryAsync(new HistoryCreateRequest
                {
                    EntityType = HistoryType.Order,
                    EntityId = entity.Id,
                    Description = string.IsNullOrEmpty(oldNote) ? "Added note" : "Updated note",
                    Metadata = entity.Note ?? string.Empty,
                    ActionType = "NOTE_CHANGE"
                }, "Admin");
            }
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Order), id);
            }
            await _repository.Delete(entity);
        }
    }
}
