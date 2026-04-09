using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Product,Admin")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _service;
        private readonly IFileService _fileService;
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString
        };

        public ProductsController(IProductService service, IFileService fileService)
        {
            _service = service;
            _fileService = fileService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<PagedResult<ProductViewModel>>> Get([FromQuery] ProductListRequest request)
        {
            var result = await _service.GetListAsync(request);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductViewModel>> Get(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromForm] ProductCreateRequest request)
        {
            var model = new ProductViewModel
            {
                Name = request.Name,
                Slug = request.Slug,
                Description = request.Description,
                Content = request.Content,
                // StockQuantity will be auto-calculated from variants
                UsageSupport = request.UsageSupport,
                OutdoorPriceUpgrade = request.OutdoorPriceUpgrade,
                IsFeatured = request.IsFeatured,
                Images = new List<ProductImageViewModel>(),
                CategoryIds = string.IsNullOrEmpty(request.CategoryIdsJson) ? new List<int>() : JsonSerializer.Deserialize<List<int>>(request.CategoryIdsJson, _jsonOptions),
                Specifications = string.IsNullOrEmpty(request.SpecificationsJson) ? new List<ProductSpecificationViewModel>() : JsonSerializer.Deserialize<List<ProductSpecificationViewModel>>(request.SpecificationsJson, _jsonOptions),
                Variants = string.IsNullOrEmpty(request.VariantsJson) ? new List<ProductVariantViewModel>() : JsonSerializer.Deserialize<List<ProductVariantViewModel>>(request.VariantsJson, _jsonOptions),
                PackageIncludes = string.IsNullOrEmpty(request.PackageIncludesJson) ? new List<ProductPackageItemViewModel>() : JsonSerializer.Deserialize<List<ProductPackageItemViewModel>>(request.PackageIncludesJson, _jsonOptions),
                ContentBlocks = string.IsNullOrEmpty(request.ContentBlocksJson) ? new List<ProductContentBlockViewModel>() : JsonSerializer.Deserialize<List<ProductContentBlockViewModel>>(request.ContentBlocksJson, _jsonOptions),
                Accordions = string.IsNullOrEmpty(request.AccordionsJson) ? new List<ProductAccordionViewModel>() : JsonSerializer.Deserialize<List<ProductAccordionViewModel>>(request.AccordionsJson, _jsonOptions)
            };

            if (request.ImageFiles != null)
            {
                foreach (var file in request.ImageFiles)
                {
                    if (file.Length > 0)
                    {
                        var url = await _fileService.SaveFileAsync(file.OpenReadStream(), file.FileName);
                        // Check if this file is the primary one
                        bool isPrimary = !string.IsNullOrEmpty(request.PrimaryImageIdentifier) && request.PrimaryImageIdentifier == file.FileName;
                        model.Images.Add(new ProductImageViewModel { Url = url, IsPrimary = isPrimary });
                    }
                }
                
                // If no specific primary was set but we have images, default first to primary
                if (model.Images.Count > 0 && !model.Images.Any(i => i.IsPrimary))
                {
                     model.Images.First().IsPrimary = true;
                }
            }

            // Handle Variant Images
            if (model.Variants != null)
            {

                for (int i = 0; i < model.Variants.Count; i++)
                {
                    var variant = model.Variants[i];
                    var file = Request.Form.Files.GetFile($"variantImage_{i}");
                    

                    
                    if (file != null && file.Length > 0)
                    {
                        var url = await _fileService.SaveFileAsync(file.OpenReadStream(), file.FileName);
                        variant.ImageUrl = url;

                    }

                }
            }

            // Handle Content Block Images
            if (model.ContentBlocks != null)
            {

                for (int i = 0; i < model.ContentBlocks.Count; i++)
                {
                    var contentBlock = model.ContentBlocks[i];
                    var file = Request.Form.Files.GetFile($"contentBlockImage_{i}");
                    

                    
                    if (file != null && file.Length > 0)
                    {
                        var url = await _fileService.SaveFileAsync(file.OpenReadStream(), file.FileName);
                        contentBlock.ImageUrl = url;

                    }

                }
            }

            await _service.AddAsync(model);
            return StatusCode(201);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromForm] ProductUpdateRequest request)
        {
             var model = new ProductViewModel
            {
                Id = id,
                Name = request.Name,
                Slug = request.Slug,
                Description = request.Description,
                Content = request.Content,
                // StockQuantity will be auto-calculated from variants
                UsageSupport = request.UsageSupport,
                OutdoorPriceUpgrade = request.OutdoorPriceUpgrade,
                IsFeatured = request.IsFeatured,
                Images = new List<ProductImageViewModel>(),
                CategoryIds = string.IsNullOrEmpty(request.CategoryIdsJson) ? new List<int>() : JsonSerializer.Deserialize<List<int>>(request.CategoryIdsJson, _jsonOptions),
                Specifications = string.IsNullOrEmpty(request.SpecificationsJson) ? new List<ProductSpecificationViewModel>() : JsonSerializer.Deserialize<List<ProductSpecificationViewModel>>(request.SpecificationsJson, _jsonOptions),
                Variants = string.IsNullOrEmpty(request.VariantsJson) ? new List<ProductVariantViewModel>() : JsonSerializer.Deserialize<List<ProductVariantViewModel>>(request.VariantsJson, _jsonOptions),
                PackageIncludes = string.IsNullOrEmpty(request.PackageIncludesJson) ? new List<ProductPackageItemViewModel>() : JsonSerializer.Deserialize<List<ProductPackageItemViewModel>>(request.PackageIncludesJson, _jsonOptions),
                ContentBlocks = string.IsNullOrEmpty(request.ContentBlocksJson) ? new List<ProductContentBlockViewModel>() : JsonSerializer.Deserialize<List<ProductContentBlockViewModel>>(request.ContentBlocksJson, _jsonOptions),
                Accordions = string.IsNullOrEmpty(request.AccordionsJson) ? new List<ProductAccordionViewModel>() : JsonSerializer.Deserialize<List<ProductAccordionViewModel>>(request.AccordionsJson, _jsonOptions)
            };
            
            // 1. Keep existing images
            if (request.ExistingImages != null)
            {
                foreach(var url in request.ExistingImages)
                {
                     // Check if this existing URL is the primary one
                     bool isPrimary = !string.IsNullOrEmpty(request.PrimaryImageIdentifier) && request.PrimaryImageIdentifier == url;
                     model.Images.Add(new ProductImageViewModel { Url = url, IsPrimary = isPrimary });
                }
            }

            // 2. Add new uploaded images
            if (request.NewImageFiles != null)
            {
                foreach (var file in request.NewImageFiles)
                {
                    if (file.Length > 0)
                    {
                        var url = await _fileService.SaveFileAsync(file.OpenReadStream(), file.FileName);
                        // Check if this new file is the primary one
                        bool isPrimary = !string.IsNullOrEmpty(request.PrimaryImageIdentifier) && request.PrimaryImageIdentifier == file.FileName;
                        model.Images.Add(new ProductImageViewModel { Url = url, IsPrimary = isPrimary });
                    }
                }
            }

            // Fallback: Ensure at least one primary if we have images
            if (model.Images.Any() && !model.Images.Any(i => i.IsPrimary))
            {
                model.Images.First().IsPrimary = true;
            }

            // Handle Variant Images
            if (model.Variants != null)
            {

                for (int i = 0; i < model.Variants.Count; i++)
                {
                    var variant = model.Variants[i];
                    var file = Request.Form.Files.GetFile($"variantImage_{i}");
                    

                    
                    if (file != null && file.Length > 0)
                    {
                        var url = await _fileService.SaveFileAsync(file.OpenReadStream(), file.FileName);
                        variant.ImageUrl = url;

                    }

                }
            }

            // Handle Content Block Images
            if (model.ContentBlocks != null)
            {

                for (int i = 0; i < model.ContentBlocks.Count; i++)
                {
                    var contentBlock = model.ContentBlocks[i];
                    var file = Request.Form.Files.GetFile($"contentBlockImage_{i}");
                    

                    
                    if (file != null && file.Length > 0)
                    {
                        var url = await _fileService.SaveFileAsync(file.OpenReadStream(), file.FileName);
                        contentBlock.ImageUrl = url;

                    }

                }
            }
             
            if (id != model.Id) return BadRequest();
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

    // Helper DTOs for File Upload (could be in Core.Models but usually Controller specific)
    public class ProductCreateRequest
    {
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Description { get; set; }
        public string? Content { get; set; }
        // Note: StockQuantity is auto-calculated from variants, not sent from frontend
        public string? UsageSupport { get; set; }
        public decimal OutdoorPriceUpgrade { get; set; }
        public bool IsFeatured { get; set; }
        public List<IFormFile>? ImageFiles { get; set; }

        public string? PrimaryImageIdentifier { get; set; } // Filename for new, URL for existing

        // JSON strings for complex lists in multipart/form-data
        public string? CategoryIdsJson { get; set; } // Multiple categories
        public string? SpecificationsJson { get; set; }
        public string? VariantsJson { get; set; } // Now includes price per variant
        public string? PackageIncludesJson { get; set; }
        public string? ContentBlocksJson { get; set; } // New
        public string? AccordionsJson { get; set; } // New
    }

    public class ProductUpdateRequest : ProductCreateRequest 
    {
        public List<string>? ExistingImages { get; set; } 
        public List<IFormFile>? NewImageFiles { get; set; }
    }
}
