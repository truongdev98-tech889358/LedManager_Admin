using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Enums;

namespace LedManager.Application.Services
{
    public class StatisticsService : IStatisticsService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IOrderItemRepository _orderItemRepository;

        public StatisticsService(
            IOrderRepository orderRepository,
            IOrderItemRepository orderItemRepository)
        {
            _orderRepository = orderRepository;
            _orderItemRepository = orderItemRepository;
        }

        public async Task<RevenueOverviewViewModel> GetRevenueOverviewAsync(DateTimeOffset? startDate = null, DateTimeOffset? endDate = null)
        {
            var now = DateTimeOffset.UtcNow;
            var today = new DateTimeOffset(now.Year, now.Month, now.Day, 0, 0, 0, now.Offset);
            var yesterday = today.AddDays(-1);
            
            // Start of week (Monday)
            int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
            var startOfWeek = today.AddDays(-1 * diff);
            
            var startOfMonth = new DateTimeOffset(now.Year, now.Month, 1, 0, 0, 0, now.Offset);

            var orders = await _orderRepository.QueryAsync(x => !x.IsDeleted && x.Status != OrderStatus.Cancelled);

            // Calculate period statistics (for filtered date range)
            var periodOrders = orders.ToList();
            if (startDate.HasValue)
            {
                periodOrders = periodOrders.Where(o => o.CreatedAt >= startDate.Value).ToList();
            }

            if (endDate.HasValue)
            {
                var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
                periodOrders = periodOrders.Where(o => o.CreatedAt <= endOfDay).ToList();
            }

            return new RevenueOverviewViewModel
            {
                TodayRevenue = orders.Where(o => o.CreatedAt >= today).Sum(o => o.TotalAmount),
                YesterdayRevenue = orders.Where(o => o.CreatedAt >= yesterday && o.CreatedAt < today).Sum(o => o.TotalAmount),
                ThisWeekRevenue = orders.Where(o => o.CreatedAt >= startOfWeek).Sum(o => o.TotalAmount),
                ThisMonthRevenue = orders.Where(o => o.CreatedAt >= startOfMonth).Sum(o => o.TotalAmount),
                TotalRevenue = orders.Sum(o => o.TotalAmount),
                TodayOrderCount = orders.Count(o => o.CreatedAt >= today),
                ThisMonthOrderCount = orders.Count(o => o.CreatedAt >= startOfMonth),
                
                // Period-based statistics
                PeriodRevenue = periodOrders.Sum(o => o.TotalAmount),
                PeriodOrderCount = periodOrders.Count
            };
        }

        public async Task<RevenueChartViewModel> GetRevenueChartAsync(DateTimeOffset? startDate = null, DateTimeOffset? endDate = null)
        {
            // Default to last 14 days if no date range provided
            var chartStartDate = startDate?.Date ?? DateTimeOffset.UtcNow.Date.AddDays(-13);
            var chartEndDate = endDate?.Date ?? DateTimeOffset.UtcNow.Date;
            
            var orders = await _orderRepository.QueryAsync(x => !x.IsDeleted && x.Status != OrderStatus.Cancelled && x.CreatedAt >= chartStartDate);

            if (endDate.HasValue)
            {
                var endOfDay = chartEndDate.AddDays(1).AddTicks(-1);
                orders = orders.Where(o => o.CreatedAt <= endOfDay).ToList();
            }

            var dataPoints = new List<RevenueDataPoint>();
            var days = (chartEndDate - chartStartDate).Days + 1;

            for (int i = 0; i < days; i++)
            {
                var date = chartStartDate.AddDays(i);
                var dayOrders = orders.Where(o => o.CreatedAt.Date == date.Date).ToList();

                dataPoints.Add(new RevenueDataPoint
                {
                    Date = date.ToString("yyyy-MM-dd"),
                    Revenue = dayOrders.Sum(o => o.TotalAmount),
                    OrderCount = dayOrders.Count
                });
            }

            return new RevenueChartViewModel
            {
                DataPoints = dataPoints
            };
        }

        public async Task<List<TopSellingProductViewModel>> GetTopSellingProductsAsync(int count = 5, DateTimeOffset? startDate = null, DateTimeOffset? endDate = null)
        {
            // Query order items from non-cancelled orders
            var orderItems = await _orderItemRepository.QueryAsync(
                filter: x => !x.IsDeleted && x.Order != null && x.Order.Status != OrderStatus.Cancelled,
                includeProperties: "Order,Product,Product.Images"
            );

            // Apply date range filter if provided
            if (startDate.HasValue)
            {
                orderItems = orderItems.Where(x => x.Order != null && x.Order!.CreatedAt >= startDate.Value).ToList();
            }

            if (endDate.HasValue)
            {
                var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
                orderItems = orderItems.Where(x => x.Order != null && x.Order!.CreatedAt <= endOfDay).ToList();
            }

            var topSelling = orderItems
                .GroupBy(x => x.ProductId)
                .Select(g => new TopSellingProductViewModel
                {
                    ProductId = g.Key,
                    ProductName = g.First().ProductName ?? g.First().Product?.Name ?? "Unknown",
                    ImageUrl = g.First().Product?.Images?.FirstOrDefault()?.Url,
                    TotalQuantitySold = g.Sum(x => x.Quantity),
                    TotalRevenue = g.Sum(x => x.Quantity * x.Price)
                })
                .OrderByDescending(x => x.TotalQuantitySold)
                .Take(count)
                .ToList();

            return topSelling;
        }

        public async Task<OrderStatusStatisticsViewModel> GetOrderStatusStatisticsAsync(DateTimeOffset? startDate = null, DateTimeOffset? endDate = null)
        {
            var orders = await _orderRepository.QueryAsync(x => !x.IsDeleted);

            // Apply date range filter if provided
            if (startDate.HasValue)
            {
                orders = orders.Where(o => o.CreatedAt >= startDate.Value).ToList();
            }

            if (endDate.HasValue)
            {
                var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
                orders = orders.Where(o => o.CreatedAt <= endOfDay).ToList();
            }

            var statusCounts = orders.GroupBy(o => o.Status)
                .Select(g => new OrderStatusCount
                {
                    Status = g.Key.ToString(),
                    Count = g.Count()
                }).ToList();

            return new OrderStatusStatisticsViewModel { StatusCounts = statusCounts };
        }

        public async Task<OrderStatusReportViewModel> GetOrderStatusReportAsync(DateTimeOffset? startDate, DateTimeOffset? endDate)
        {
            // Get all non-deleted orders
            var orders = await _orderRepository.QueryAsync(x => !x.IsDeleted);

            // Apply date filtering if provided
            if (startDate.HasValue)
            {
                orders = orders.Where(o => o.CreatedAt >= startDate.Value).ToList();
            }

            if (endDate.HasValue)
            {
                // Include the entire end date (until 23:59:59)
                var endOfDay = endDate.Value.Date.AddDays(1).AddTicks(-1);
                orders = orders.Where(o => o.CreatedAt <= endOfDay).ToList();
            }

            // Group by status and calculate counts and revenue
            var statusDetails = orders.GroupBy(o => o.Status)
                .Select(g => new OrderStatusDetail
                {
                    Status = g.Key.ToString(),
                    Count = g.Count(),
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(s => s.Status)
                .ToList();

            return new OrderStatusReportViewModel
            {
                StartDate = startDate,
                EndDate = endDate,
                StatusDetails = statusDetails,
                TotalOrders = orders.Count,
                TotalRevenue = orders.Sum(o => o.TotalAmount)
            };
        }
    }
}
