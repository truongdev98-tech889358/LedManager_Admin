using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/banners")] // Using different style for variety or preference
    [ApiController]
    [Microsoft.AspNetCore.Authorization.Authorize(Roles = "Content,Admin")]
    public class BannersController : ControllerBase
    {
        private readonly IBannerService _service;
        private readonly IFileService _fileService;

        public BannersController(IBannerService service, IFileService fileService)
        {
            _service = service;
            _fileService = fileService;
        }

        [HttpGet]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public async Task<ActionResult<PagedResult<BannerViewModel>>> Get([FromQuery] BannerListRequest request)
        {
            var result = await _service.GetListAsync(request);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        public async Task<ActionResult<BannerViewModel>> Get(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        [DisableRequestSizeLimit]
        [RequestFormLimits(MultipartBodyLengthLimit = 524288000)] // 500 MB
        public async Task<IActionResult> Post([FromForm] BannerCreateRequest request)
        {
            string imageUrl = "";
            string mobileImageUrl = "";
            
            if (request.ImageFile != null)
            {
                 imageUrl = await _fileService.SaveFileAsync(request.ImageFile.OpenReadStream(), request.ImageFile.FileName, "banners");
            }
            
            if (request.MobileImageFile != null)
            {
                 mobileImageUrl = await _fileService.SaveFileAsync(request.MobileImageFile.OpenReadStream(), request.MobileImageFile.FileName, "banners");
            }
            
            string videoUrl = "";
            string mobileVideoUrl = "";

            if (request.VideoFile != null)
            {
                 videoUrl = await _fileService.SaveFileAsync(request.VideoFile.OpenReadStream(), request.VideoFile.FileName, "banners-video");
            }

            if (request.MobileVideoFile != null)
            {
                 mobileVideoUrl = await _fileService.SaveFileAsync(request.MobileVideoFile.OpenReadStream(), request.MobileVideoFile.FileName, "banners-video");
            }
            
            var model = new BannerViewModel
            {
                Title = request.Title,
                Subtitle = request.Subtitle,
                Description = request.Description,
                Link = request.Link,
                ImageUrl = imageUrl,
                MobileImageUrl = mobileImageUrl,
                VideoUrl = videoUrl,
                MobileVideoUrl = mobileVideoUrl,
                MediaType = request.MediaType,
                ButtonText = request.ButtonText,
                ButtonLink = request.ButtonLink,
                ButtonText2 = request.ButtonText2,
                ButtonLink2 = request.ButtonLink2,
                TextPosition = request.TextPosition,
                ShowOverlay = request.ShowOverlay,
                BannerType = request.BannerType,
                IsActive = request.IsActive,
                SortOrder = request.SortOrder,
                Position = request.Position ?? string.Empty
            };

            await _service.AddAsync(model);
            return StatusCode(201);
        }

        [HttpPut("{id}")]
        [DisableRequestSizeLimit]
        [RequestFormLimits(MultipartBodyLengthLimit = 524288000)] // 500 MB
        public async Task<IActionResult> Put(int id, [FromForm] BannerUpdateRequest request)
        {
             var model = new BannerViewModel
            {
                Id = id,
                Title = request.Title,
                Subtitle = request.Subtitle,
                Description = request.Description,
                Link = request.Link,
                ButtonText = request.ButtonText,
                ButtonLink = request.ButtonLink,
                ButtonText2 = request.ButtonText2,
                ButtonLink2 = request.ButtonLink2,
                TextPosition = request.TextPosition,
                ShowOverlay = request.ShowOverlay,
                BannerType = request.BannerType,
                IsActive = request.IsActive,
                SortOrder = request.SortOrder,
                Position = request.Position ?? string.Empty,
                ImageUrl = request.ImageUrl ?? string.Empty, // Keep old desktop url by default
                MobileImageUrl = request.MobileImageUrl ?? string.Empty, // Keep old mobile url by default
                VideoUrl = request.VideoUrl ?? string.Empty,
                MobileVideoUrl = request.MobileVideoUrl ?? string.Empty,
                MediaType = request.MediaType ?? "Image"
            };

            // Handle new desktop image
            if (request.ImageFile != null)
            {
                 var newUrl = await _fileService.SaveFileAsync(request.ImageFile.OpenReadStream(), request.ImageFile.FileName, "banners");
                 model.ImageUrl = newUrl;
                 // Optional: Delete old file here using _fileService.DeleteFileAsync(request.ImageUrl)
            }
            
            // Handle new mobile image
            if (request.MobileImageFile != null)
            {
                 var newMobileUrl = await _fileService.SaveFileAsync(request.MobileImageFile.OpenReadStream(), request.MobileImageFile.FileName, "banners");
                 model.MobileImageUrl = newMobileUrl;
                 // Optional: Delete old mobile file here
            }

            // Handle new video
            if (request.VideoFile != null)
            {
                 var newVideoUrl = await _fileService.SaveFileAsync(request.VideoFile.OpenReadStream(), request.VideoFile.FileName, "banners-video");
                 model.VideoUrl = newVideoUrl;
            }

            // Handle new mobile video
            if (request.MobileVideoFile != null)
            {
                 var newMobileVideoUrl = await _fileService.SaveFileAsync(request.MobileVideoFile.OpenReadStream(), request.MobileVideoFile.FileName, "banners-video");
                 model.MobileVideoUrl = newMobileVideoUrl;
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

    public class BannerCreateRequest
    {
        public string Title { get; set; } = default!;
        public string? Subtitle { get; set; }
        public string? Description { get; set; }
        public IFormFile? ImageFile { get; set; }
        public IFormFile? MobileImageFile { get; set; }
        public IFormFile? VideoFile { get; set; }
        public IFormFile? MobileVideoFile { get; set; }
        public string? MediaType { get; set; } = "Image";
        public string? Link { get; set; }
        
        // CTA Buttons
        public string? ButtonText { get; set; }
        public string? ButtonLink { get; set; }
        public string? ButtonText2 { get; set; }
        public string? ButtonLink2 { get; set; }
        
        // Display Settings
        public string TextPosition { get; set; } = "Left";
        public bool ShowOverlay { get; set; } = true;
        public string BannerType { get; set; } = "Hero";
        
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public string? Position { get; set; }
    }

    public class BannerUpdateRequest : BannerCreateRequest
    {
         public string? ImageUrl { get; set; } // Current desktop URL
         public string? MobileImageUrl { get; set; } // Current mobile URL
         public string? VideoUrl { get; set; }
         public string? MobileVideoUrl { get; set; }
    }
}
