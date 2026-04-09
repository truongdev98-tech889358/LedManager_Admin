using LedManager.Domain.Entities.Base;
using LedManager.Domain.Entities.System;

namespace LedManager.Domain.Entities.Content
{
    public class Article : BaseEntity
    {
        public string Title { get; set; } = default!;
        public string? Slug { get; set; }
        public string? Summary { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        
        public int CategoryId { get; set; }
        public virtual ArticleCategory? Category { get; set; }
        
        public int? AuthorId { get; set; } 
        public virtual User? Author { get; set; }

        public virtual ICollection<ArticleSection> Sections { get; set; } = new List<ArticleSection>();
    }
}
