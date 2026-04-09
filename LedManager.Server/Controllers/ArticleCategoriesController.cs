using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticleCategoriesController : ControllerBase
    {
        private readonly IArticleCategoryService _service;

        public ArticleCategoriesController(IArticleCategoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<ArticleCategoryViewModel>>> Get([FromQuery] ArticleCategoryListRequest request)
        {
            var result = await _service.GetListAsync(request);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ArticleCategoryViewModel>> Get(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] ArticleCategoryViewModel model)
        {
            await _service.AddAsync(model);
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Put(int id, [FromBody] ArticleCategoryViewModel model)
        {
            if (id != model.Id) return BadRequest();
            await _service.UpdateAsync(model);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return Ok();
        }
    }
}
