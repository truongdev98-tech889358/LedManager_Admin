using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Content,Admin")]
    public class ArticlesController : ControllerBase
    {
        private readonly IArticleService _service;
        private readonly IFileService _fileService;

        public ArticlesController(IArticleService service, IFileService fileService)
        {
            _service = service;
            _fileService = fileService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<ArticleViewModel>>> Get([FromQuery] ArticleListRequest request)
        {
            var result = await _service.GetListAsync(request);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ArticleViewModel>> Get(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromForm] ArticleCreateRequest request)
        {
            string imageUrl = "";
            if (request.ImageFile != null)
            {
                 imageUrl = await _fileService.SaveFileAsync(request.ImageFile.OpenReadStream(), request.ImageFile.FileName, "thumbnails");
            }
            
            var model = new ArticleViewModel
            {
                Title = request.Title,
                Slug = request.Slug,
                Summary = request.Summary,
                Content = request.Content,
                ImageUrl = imageUrl,
                CategoryId = request.CategoryId,
                AuthorId = request.AuthorId,
                Sections = string.IsNullOrEmpty(request.SectionsJson) 
                    ? new List<ArticleSectionViewModel>() 
                    : System.Text.Json.JsonSerializer.Deserialize<List<ArticleSectionViewModel>>(request.SectionsJson, 
                        new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<ArticleSectionViewModel>()
            };

            // Handle Section Images
            if (model.Sections != null && model.Sections.Count > 0)
            {
                for (int i = 0; i < model.Sections.Count; i++)
                {
                    var section = model.Sections[i];
                    var file = Request.Form.Files.GetFile($"sectionImage_{i}");
                    if (file != null && file.Length > 0)
                    {
                         var sectionUrl = await _fileService.SaveFileAsync(file.OpenReadStream(), file.FileName);
                         section.ImageUrl = sectionUrl;
                    }
                }
            }

            await _service.AddAsync(model);
            return StatusCode(201);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromForm] ArticleUpdateRequest request)
        {
              var model = new ArticleViewModel
            {
                Id = id,
                Title = request.Title,
                Slug = request.Slug,
                Summary = request.Summary,
                Content = request.Content,
                ImageUrl = request.ImageUrl, // Keep old url by default
                CategoryId = request.CategoryId,
                AuthorId = request.AuthorId,
                Sections = string.IsNullOrEmpty(request.SectionsJson)
                    ? new List<ArticleSectionViewModel>()
                    : System.Text.Json.JsonSerializer.Deserialize<List<ArticleSectionViewModel>>(request.SectionsJson,
                        new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<ArticleSectionViewModel>()
            };

            if (request.ImageFile != null)
            {
                 var newUrl = await _fileService.SaveFileAsync(request.ImageFile.OpenReadStream(), request.ImageFile.FileName, "thumbnails");
                 model.ImageUrl = newUrl;
            }

            // Handle Section Images
            if (model.Sections != null && model.Sections.Count > 0)
            {
                for (int i = 0; i < model.Sections.Count; i++)
                {
                    var section = model.Sections[i];
                    
                    // Note: If reusing existing image, the URL is likely already in the JSON from frontend. 
                    // We only need to handle NEW uploads here.
                    // Frontend should send existing ImageUrl in JSON if not changed.
                    
                    var file = Request.Form.Files.GetFile($"sectionImage_{i}");
                    if (file != null && file.Length > 0)
                    {
                        var sectionUrl = await _fileService.SaveFileAsync(file.OpenReadStream(), file.FileName);
                        section.ImageUrl = sectionUrl;
                    }
                }
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

    public class ArticleCreateRequest
    {
        public string Title { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public IFormFile? ImageFile { get; set; }
        public int CategoryId { get; set; }
        public int? AuthorId { get; set; }
        public string? SectionsJson { get; set; }
    }
    
    public class ArticleUpdateRequest : ArticleCreateRequest 
    { 
         public string? ImageUrl { get; set; }
    }
}
