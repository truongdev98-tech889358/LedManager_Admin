using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(new { Message = "User created successfully!" });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // In a stateless JWT environment, the server doesn't strictly need to do anything 
            // unless implementing a Token Blacklist/Revocation list.
            // Returning OK serves as a confirmation for the client to proceed with clearing local state.
            return Ok(new { Message = "Logout successful" });
        }
    }
}
