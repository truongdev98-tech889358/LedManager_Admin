using System.Collections.Generic;
using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Content
{
    public class ArticleCategory : BaseEntity
    {
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string? Description { get; set; }
        public virtual ICollection<Article>? Articles { get; set; }
    }
}
