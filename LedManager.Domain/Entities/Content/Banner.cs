using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Content
{
    public class Banner : BaseEntity
    {
        public string Title { get; set; } = default!;
        public string? Subtitle { get; set; }
        public string? Description { get; set; }
        public string ImageUrl { get; set; } = default!;
        public string? MobileImageUrl { get; set; }
        public string? VideoUrl { get; set; }
        public string? MobileVideoUrl { get; set; }
        public string? MediaType { get; set; } = "Image"; // Image, Video
        public string? Link { get; set; }
        
        // CTA Buttons
        public string? ButtonText { get; set; }
        public string? ButtonLink { get; set; }
        public string? ButtonText2 { get; set; }
        public string? ButtonLink2 { get; set; }
        
        // Display Settings
        public string TextPosition { get; set; } = "Left"; // Left, Center, Right
        public bool ShowOverlay { get; set; } = true;
        public string BannerType { get; set; } = "Hero"; // Hero, Announcement, Promotional
        
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public string Position { get; set; } = "Home"; // e.g., Home, Sidebar
    }
}
