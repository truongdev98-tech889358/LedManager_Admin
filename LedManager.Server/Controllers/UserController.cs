using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<ActionResult<PagedResult<UserViewModel>>> Get([FromQuery] UserListRequest request)
        {
            var result = await _userService.GetListAsync(request);
            return Ok(result);
        }

        [HttpGet("userProfile")]
        public async Task<ActionResult<UserViewModel>> GetUserProfile()
        {
            var userName = User.Identity?.Name;
            if (string.IsNullOrEmpty(userName)) return Unauthorized();

            var user = await _userService.GetByUserNameAsync(userName);
            if (user == null) return NotFound();

            return Ok(user);
        }

        [HttpGet("{id}")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserViewModel>> Get(int id)
        {
            var result = await _userService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<IActionResult> Post([FromBody] UserViewModel model)
        {
            await _userService.AddAsync(model);
            return StatusCode(201);
        }

        [HttpPut("{id}")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<IActionResult> Put(int id, [FromBody] UserViewModel model)
        {
            try
            {
                await _userService.UpdateAsync(id, model);
                return NoContent();
            }
            catch
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _userService.DeleteAsync(id);
            return NoContent();
        }
    }
}
