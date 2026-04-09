namespace LedManager.Core.Models
{
    public class ArticleListRequest : PagingRequest 
    {
        public int? CategoryId { get; set; }
        public int? AuthorId { get; set; }
    }

    public class ArticleCategoryListRequest : PagingRequest { }

    public class BannerListRequest : PagingRequest 
    {
        public bool? IsActive { get; set; }
        public string? Position { get; set; }
    }
}
