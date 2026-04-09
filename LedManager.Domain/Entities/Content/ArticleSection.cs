using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Content
{
    public class ArticleSection : BaseEntity
    {
        public int ArticleId { get; set; }
        public virtual Article Article { get; set; } = default!;

        public string? Title { get; set; } // Optional sub-header
        public string? Content { get; set; } // HTML or Text
        public string? ImageUrl { get; set; }
        public string SectionType { get; set; } = "Text"; // Text, ImageLeft, ImageRight, FullWidthImage, Gallery, CTA
        public int DisplayOrder { get; set; }
        public string? ButtonText { get; set; }
        public string? ButtonLink { get; set; }
        
        // For Gallery type, we might need a separate table or a JSON blob for multiple images. 
        // For simplicity now, let's assume Gallery uses Content for JSON or we add a separate collection later.
        // Or we can add a specific property for JSON data if needed.
        public string? ExtraDataJson { get; set; } 
    }
}
