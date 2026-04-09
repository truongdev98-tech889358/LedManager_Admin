using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class MenusController : ControllerBase
    {
        private readonly IMenuService _service;

        public MenusController(IMenuService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<MenuViewModel>>> Get([FromQuery] MenuListRequest request)
        {
            var result = await _service.GetListAsync(request);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MenuViewModel>> Get(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("public/{type}")]
        [AllowAnonymous]
        public async Task<ActionResult<List<MenuViewModel>>> GetPublicMenuTree(string type)
        {
            if (!Enum.TryParse<Domain.Enums.MenuType>(type, true, out var menuType))
            {
                return BadRequest("Invalid menu type");
            }
            
            var result = await _service.GetMenuTreeAsync(menuType);
            return Ok(result);
        }


        [HttpPost]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<IActionResult> Post([FromBody] MenuViewModel model)
        {
            await _service.AddAsync(model);
            return StatusCode(201);
        }

        [HttpPut("{id}")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<IActionResult> Put(int id, [FromBody] MenuViewModel model)
        {
            model.Id = id;
            await _service.UpdateAsync(model);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
