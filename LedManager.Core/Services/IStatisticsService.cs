using System;
using System.Threading.Tasks;
using LedManager.Core.Models;

namespace LedManager.Core.Services
{
    public interface IStatisticsService
    {
        Task<RevenueOverviewViewModel> GetRevenueOverviewAsync(DateTimeOffset? startDate = null, DateTimeOffset? endDate = null);
        Task<RevenueChartViewModel> GetRevenueChartAsync(DateTimeOffset? startDate = null, DateTimeOffset? endDate = null);
        Task<List<TopSellingProductViewModel>> GetTopSellingProductsAsync(int count = 5, DateTimeOffset? startDate = null, DateTimeOffset? endDate = null);
        Task<OrderStatusStatisticsViewModel> GetOrderStatusStatisticsAsync(DateTimeOffset? startDate = null, DateTimeOffset? endDate = null);
        Task<OrderStatusReportViewModel> GetOrderStatusReportAsync(DateTimeOffset? startDate, DateTimeOffset? endDate);
    }
}
