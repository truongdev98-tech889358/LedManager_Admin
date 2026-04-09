using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomePageContentController : ControllerBase
    {
        private readonly IHomePageContentService _service;

        public HomePageContentController(IHomePageContentService service)
        {
            _service = service;
        }

        /// <summary>
        /// Get active home page content (public endpoint)
        /// </summary>
        [HttpGet("active")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public async Task<ActionResult<HomePageContentViewModel>> GetActive()
        {
            var result = await _service.GetActiveAsync();
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Get list of all home page contents (admin only)
        /// </summary>
        [HttpGet]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<ActionResult<PagedResult<HomePageContentViewModel>>> GetList([FromQuery] PagingRequest request)
        {
            var result = await _service.GetListAsync(request);
            return Ok(result);
        }

        /// <summary>
        /// Get home page content by ID (admin only)
        /// </summary>
        [HttpGet("{id}")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<ActionResult<HomePageContentViewModel>> Get(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Create new home page content (admin only)
        /// </summary>
        [HttpPost]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<IActionResult> Post([FromBody] HomePageContentViewModel model)
        {
            await _service.AddAsync(model);
            return StatusCode(201);
        }

        /// <summary>
        /// Update home page content (admin only)
        /// </summary>
        [HttpPut("{id}")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public async Task<IActionResult> Put(int id, [FromBody] HomePageContentViewModel model)
        {
            model.Id = id;
            await _service.UpdateAsync(model);
            return NoContent();
        }

        /// <summary>
        /// Delete home page content (admin only)
        /// </summary>
        [HttpDelete("{id}")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
