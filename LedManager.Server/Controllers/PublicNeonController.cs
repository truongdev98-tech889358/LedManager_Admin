using Microsoft.AspNetCore.Mvc;
using LedManager.Core.Services;
using LedManager.Core.Models;

namespace LedManager.Server.Controllers
{
    [ApiController]
    [Route("api/public/neon")]
    public class PublicNeonController : ControllerBase
    {
        private readonly INeonService _neonService;
        private readonly INeonContentService _contentService;

        public PublicNeonController(INeonService neonService, INeonContentService contentService)
        {
            _neonService = neonService;
            _contentService = contentService;
        }

        [HttpGet("fonts")]
        public async Task<ActionResult<IEnumerable<NeonFontViewModel>>> GetFonts()
        {
            var result = await _neonService.GetFontsAsync();
            return Ok(result);
        }

        [HttpGet("colors")]
        public async Task<ActionResult<IEnumerable<NeonColorViewModel>>> GetColors()
        {
            var result = await _neonService.GetColorsAsync();
            return Ok(result);
        }

        [HttpGet("backgrounds")]
        public async Task<ActionResult<IEnumerable<NeonBackgroundViewModel>>> GetBackgrounds()
        {
            var result = await _neonService.GetBackgroundsAsync();
            return Ok(result);
        }

        [HttpGet("content")]
        public async Task<ActionResult<IEnumerable<NeonContentViewModel>>> GetContent([FromQuery] string type)
        {
            var result = await _contentService.GetByTypeAsync(type);
            return Ok(result);
        }
    }
}
