using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublicArticlesController : ControllerBase
    {
        private readonly IArticleService _service;
        private readonly IArticleCategoryService _categoryService;

        public PublicArticlesController(IArticleService service, IArticleCategoryService categoryService)
        {
            _service = service;
            _categoryService = categoryService;
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

        [HttpGet("categories")]
        public async Task<ActionResult<PagedResult<ArticleCategoryViewModel>>> GetCategories()
        {
             // For simplicity, we just fetch all categories as list
             // Assuming ArticleCategoryService has GetListAsync
             var result = await _categoryService.GetListAsync(new ArticleCategoryListRequest { PageIndex = 1, PageSize = 100 });
             return Ok(result);
        }
    }
}
