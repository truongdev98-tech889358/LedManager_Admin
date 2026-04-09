namespace LedManager.Core.Models
{
    public class CategoryListRequest : PagingRequest 
    { 
        public bool? IsFeatured { get; set; }
    }
    
    public class ProductListRequest : PagingRequest 
    {
        public int? CategoryId { get; set; }
        public string? CategorySlug { get; set; }
        public bool? IsFeatured { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public bool? InStock { get; set; }
    }

    public class ProductImageListRequest : PagingRequest 
    {
        public int? ProductId { get; set; }
    }
}
