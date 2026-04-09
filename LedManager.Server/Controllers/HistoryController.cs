using LedManager.Application.Interfaces;
using LedManager.Application.ViewModels;
using LedManager.Domain.Entities.System;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [ApiController]
    [Route("api/v1/history")]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
    public class HistoryController : ControllerBase
    {
        private readonly IHistoryService _historyService;

        public HistoryController(IHistoryService historyService)
        {
            _historyService = historyService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int id, [FromQuery] HistoryType type)
        {
            var result = await _historyService.GetHistoriesAsync(id, type);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] HistoryCreateRequest request)
        {
            // For now, setting a default "Admin" as performedBy. 
            // In a real app, this would come from the authenticated user context.
            var performedBy = "Admin"; 
            var result = await _historyService.AddHistoryAsync(request, performedBy);
            
            if (result) return Ok(true);
            return BadRequest(false);
        }
    }
}
