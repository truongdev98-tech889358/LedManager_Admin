using System;
using System.Collections.Generic;

namespace LedManager.Core.Models
{
    public class RevenueOverviewViewModel
    {
        public decimal TodayRevenue { get; set; }
        public decimal YesterdayRevenue { get; set; }
        public decimal ThisWeekRevenue { get; set; }
        public decimal ThisMonthRevenue { get; set; }
        public decimal TotalRevenue { get; set; }
        
        public int TodayOrderCount { get; set; }
        public int ThisMonthOrderCount { get; set; }
        
        // Period-based statistics (for filtered date range)
        public decimal PeriodRevenue { get; set; }
        public int PeriodOrderCount { get; set; }
    }

    public class RevenueChartViewModel
    {
        public List<RevenueDataPoint> DataPoints { get; set; } = new List<RevenueDataPoint>();
    }

    public class RevenueDataPoint
    {
        public string Date { get; set; } = string.Empty;
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }

    public class TopSellingProductViewModel
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public int TotalQuantitySold { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class OrderStatusCount
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class OrderStatusStatisticsViewModel
    {
        public List<OrderStatusCount> StatusCounts { get; set; } = new List<OrderStatusCount>();
    }

    public class OrderStatusDetail
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Revenue { get; set; }
    }

    public class OrderStatusReportViewModel
    {
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
        public List<OrderStatusDetail> StatusDetails { get; set; } = new List<OrderStatusDetail>();
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
    }
}
