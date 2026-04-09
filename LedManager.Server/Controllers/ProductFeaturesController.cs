using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/product-features")]
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Content,Admin")]
    public class ProductFeaturesController : ControllerBase
    {
        private readonly IProductFeatureService _service;
        private readonly IFileService _fileService;

        public ProductFeaturesController(IProductFeatureService service, IFileService fileService)
        {
            _service = service;
            _fileService = fileService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<ProductFeatureViewModel>>> Get([FromQuery] PagingRequest request)
        {
            var result = await _service.GetListAsync(request);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductFeatureViewModel>> Get(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromForm] ProductFeatureCreateRequest request)
        {
            string iconUrl = "";
            
            if (request.IconFile != null)
            {
                iconUrl = await _fileService.SaveFileAsync(request.IconFile.OpenReadStream(), request.IconFile.FileName, "product-features");
            }
            
            var model = new ProductFeatureViewModel
            {
                Title = request.Title,
                Description = request.Description,
                IconUrl = iconUrl,
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive
            };

            await _service.AddAsync(model);
            return StatusCode(201);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromForm] ProductFeatureUpdateRequest request)
        {
            var model = new ProductFeatureViewModel
            {
                Id = id,
                Title = request.Title,
                Description = request.Description,
                IconUrl = request.IconUrl ?? string.Empty,
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive
            };

            // Handle new icon upload
            if (request.IconFile != null)
            {
                var newUrl = await _fileService.SaveFileAsync(request.IconFile.OpenReadStream(), request.IconFile.FileName, "product-features");
                model.IconUrl = newUrl;
            }
            
            await _service.UpdateAsync(model);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }

    // Public endpoint
    [Route("api/public/product-features")]
    [ApiController]
    public class PublicProductFeaturesController : ControllerBase
    {
        private readonly IProductFeatureService _service;

        public PublicProductFeaturesController(IProductFeatureService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<ProductFeatureViewModel>>> Get()
        {
            var result = await _service.GetActiveListAsync();
            return Ok(result);
        }
    }

    public class ProductFeatureCreateRequest
    {
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public IFormFile? IconFile { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class ProductFeatureUpdateRequest : ProductFeatureCreateRequest
    {
        public string? IconUrl { get; set; }
    }
}
