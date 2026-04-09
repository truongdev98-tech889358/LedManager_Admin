using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublicProductsController : ControllerBase
    {
        private readonly IProductService _service;

        public PublicProductsController(IProductService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<ProductViewModel>>> Get([FromQuery] ProductListRequest request)
        {
            var result = await _service.GetListAsync(request);
            return Ok(result);
        }

        [HttpGet("{slug}")]
        public async Task<ActionResult<ProductViewModel>> Get(string slug)
        {
            var result = await _service.GetBySlugAsync(slug);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("{slug}/related")]
        public async Task<ActionResult<List<ProductViewModel>>> GetRelated(string slug, [FromQuery] int count = 4)
        {
            var result = await _service.GetRelatedAsync(slug, count);
            return Ok(result);
        }

        [HttpGet("category/{slug}")]
        public async Task<ActionResult<PagedResult<ProductViewModel>>> GetByCategorySlug(string slug, [FromQuery] ProductListRequest request)
        {
            request.CategorySlug = slug;
            var result = await _service.GetListAsync(request);
            return Ok(result);
        }

    }
}
