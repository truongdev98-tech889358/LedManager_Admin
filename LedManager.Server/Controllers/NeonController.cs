using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using LedManager.Core.Services;
using LedManager.Core.Models;

namespace LedManager.Server.Controllers
{
    [ApiController]
    [Route("api/admin/neon")]
    [Authorize(Roles = "Admin")]
    public class NeonController : ControllerBase
    {
        private readonly INeonService _neonService;

        public NeonController(INeonService neonService)
        {
            _neonService = neonService;
        }

        // Fonts
        [HttpGet("fonts")]
        public async Task<ActionResult<IEnumerable<NeonFontViewModel>>> GetAllFonts()
        {
            var result = await _neonService.GetAllFontsAsync();
            return Ok(result);
        }

        [HttpPost("fonts")]
        public async Task<ActionResult<NeonFontViewModel>> CreateFont([FromBody] NeonFontRequest request)
        {
            var result = await _neonService.CreateFontAsync(request);
            return Ok(result);
        }

        [HttpPut("fonts/{id}")]
        public async Task<ActionResult<NeonFontViewModel>> UpdateFont(int id, [FromBody] NeonFontRequest request)
        {
            try
            {
                var result = await _neonService.UpdateFontAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("fonts/{id}")]
        public async Task<IActionResult> DeleteFont(int id)
        {
            await _neonService.DeleteFontAsync(id);
            return NoContent();
        }

        // Colors
        [HttpGet("colors")]
        public async Task<ActionResult<IEnumerable<NeonColorViewModel>>> GetAllColors()
        {
            var result = await _neonService.GetAllColorsAsync();
            return Ok(result);
        }

        [HttpPost("colors")]
        public async Task<ActionResult<NeonColorViewModel>> CreateColor([FromBody] NeonColorRequest request)
        {
            var result = await _neonService.CreateColorAsync(request);
            return Ok(result);
        }

        [HttpPut("colors/{id}")]
        public async Task<ActionResult<NeonColorViewModel>> UpdateColor(int id, [FromBody] NeonColorRequest request)
        {
            try
            {
                var result = await _neonService.UpdateColorAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("colors/{id}")]
        public async Task<IActionResult> DeleteColor(int id)
        {
            await _neonService.DeleteColorAsync(id);
            return NoContent();
        }

        // Backgrounds
        [HttpGet("backgrounds")]
        public async Task<ActionResult<IEnumerable<NeonBackgroundViewModel>>> GetAllBackgrounds()
        {
            var result = await _neonService.GetAllBackgroundsAsync();
            return Ok(result);
        }

        [HttpPost("backgrounds")]
        public async Task<ActionResult<NeonBackgroundViewModel>> CreateBackground([FromBody] NeonBackgroundRequest request)
        {
            var result = await _neonService.CreateBackgroundAsync(request);
            return Ok(result);
        }

        [HttpPut("backgrounds/{id}")]
        public async Task<ActionResult<NeonBackgroundViewModel>> UpdateBackground(int id, [FromBody] NeonBackgroundRequest request)
        {
            try
            {
                var result = await _neonService.UpdateBackgroundAsync(id, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("backgrounds/{id}")]
        public async Task<IActionResult> DeleteBackground(int id)
        {
            await _neonService.DeleteBackgroundAsync(id);
            return NoContent();
        }
    }
}
