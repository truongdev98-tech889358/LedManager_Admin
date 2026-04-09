using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PublicCategoriesController : ControllerBase
    {
        private readonly ICategoryService _service;

        public PublicCategoriesController(ICategoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<CategoryViewModel>>> Get()
        {
            var result = await _service.GetAll();
            return Ok(result);
        }

        [HttpGet("feature")]
        [AllowAnonymous]
        public async Task<ActionResult<PagedResult<CategoryViewModel>>> GetFeature()
        {
            var result = await _service.GetFeatures();
            return Ok(result);
        } 
    }
}
