using LedManager.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly IFileService _fileService;

        public FilesController(IFileService fileService)
        {
            _fileService = fileService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string folder = "uploads")
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var url = await _fileService.SaveFileAsync(file.OpenReadStream(), file.FileName, folder);
            return Ok(new { url });
        }
    }
}
