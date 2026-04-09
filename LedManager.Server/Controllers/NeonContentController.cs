using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/admin/neon/content")]
    [ApiController]
    [Authorize(Roles = "Content,Admin")]
    public class NeonContentController : ControllerBase
    {
        private readonly INeonContentService _service;

        public NeonContentController(INeonContentService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<NeonContentViewModel>>> GetList([FromQuery] int? type = null)
        {
            var result = await _service.GetListAsync(type);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NeonContentViewModel>> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<NeonContentViewModel>> Create([FromBody] NeonContentRequest request)
        {
            var result = await _service.CreateAsync(request);
            return StatusCode(201, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<NeonContentViewModel>> Update(int id, [FromBody] NeonContentRequest request)
        {
            try
            {
                var result = await _service.UpdateAsync(id, request);
                return Ok(result);
            }
            catch
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
