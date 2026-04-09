using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Product,Admin")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _service;
        private readonly IFileService _fileService;

        public CategoriesController(ICategoryService service, IFileService fileService)
        {
            _service = service;
            _fileService = fileService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<CategoryViewModel>>> Get([FromQuery] CategoryListRequest request)
        {
            var result = await _service.GetListAsync(request);
            return Ok(result);
        }

        [HttpGet("feature")]
        [AllowAnonymous]
        public async Task<ActionResult<PagedResult<CategoryViewModel>>> GetFeature()
        {
            var result = await _service.GetFeatures();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryViewModel>> Get(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromForm] CategoryCreateRequest request)
        {
            var model = new CategoryViewModel
            {
                Name = request.Name ?? string.Empty,
                Slug = request.Slug ?? string.Empty,
                Description = request.Description,
                IsFeatured = request.IsFeatured,
                ParentId = request.ParentId
            };

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                model.ImageUrl = await _fileService.SaveFileAsync(request.ImageFile.OpenReadStream(), request.ImageFile.FileName);
            }

            await _service.AddAsync(model);
            return StatusCode(201);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromForm] CategoryUpdateRequest request)
        {
            try
            {
                var model = new CategoryViewModel
                {
                    Id = id,
                    Name = request.Name ?? string.Empty,
                    Slug = request.Slug ?? string.Empty,
                    Description = request.Description,
                    IsFeatured = request.IsFeatured,
                    ParentId = request.ParentId,
                    ImageUrl = request.ExistingImageUrl
                };

                if (request.NewImageFile != null && request.NewImageFile.Length > 0)
                {
                    model.ImageUrl = await _fileService.SaveFileAsync(request.NewImageFile.OpenReadStream(), request.NewImageFile.FileName);
                }

                await _service.UpdateAsync(model);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }

    public class CategoryCreateRequest
    {
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public bool IsFeatured { get; set; }
        public int? ParentId { get; set; }
        public IFormFile? ImageFile { get; set; }
    }

    public class CategoryUpdateRequest : CategoryCreateRequest
    {
        public string? ExistingImageUrl { get; set; }
        // IsFeatured is inherited
        public IFormFile? NewImageFile { get; set; }
    }
}
