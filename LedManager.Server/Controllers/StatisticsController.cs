using System;
using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsService _statisticsService;

        public StatisticsController(IStatisticsService statisticsService)
        {
            _statisticsService = statisticsService;
        }

        [HttpGet("revenue/overview")]
        public async Task<ActionResult<RevenueOverviewViewModel>> GetRevenueOverview(
            [FromQuery] DateTimeOffset? startDate,
            [FromQuery] DateTimeOffset? endDate)
        {
            var result = await _statisticsService.GetRevenueOverviewAsync(startDate, endDate);
            return Ok(result);
        }

        [HttpGet("revenue/chart")]
        public async Task<ActionResult<RevenueChartViewModel>> GetRevenueChart(
            [FromQuery] DateTimeOffset? startDate,
            [FromQuery] DateTimeOffset? endDate)
        {
            var result = await _statisticsService.GetRevenueChartAsync(startDate, endDate);
            return Ok(result);
        }

        [HttpGet("top-selling")]
        public async Task<ActionResult<List<TopSellingProductViewModel>>> GetTopSellingProducts(
            [FromQuery] int count = 5,
            [FromQuery] DateTimeOffset? startDate = null,
            [FromQuery] DateTimeOffset? endDate = null)
        {
            var result = await _statisticsService.GetTopSellingProductsAsync(count, startDate, endDate);
            return Ok(result);
        }

        [HttpGet("orders/status")]
        public async Task<ActionResult<OrderStatusStatisticsViewModel>> GetOrderStatusStatistics(
            [FromQuery] DateTimeOffset? startDate,
            [FromQuery] DateTimeOffset? endDate)
        {
            var result = await _statisticsService.GetOrderStatusStatisticsAsync(startDate, endDate);
            return Ok(result);
        }

        [HttpGet("orders/status-report")]
        public async Task<ActionResult<OrderStatusReportViewModel>> GetOrderStatusReport(
            [FromQuery] DateTimeOffset? startDate,
            [FromQuery] DateTimeOffset? endDate)
        {
            var result = await _statisticsService.GetOrderStatusReportAsync(startDate, endDate);
            return Ok(result);
        }
    }
}
