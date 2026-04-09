namespace LedManager.Core.Models
{
    public class PagingRequest
    {
        public string? Keyword { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 100;
        public string? SortLabel { get; set; }
        public bool IsAscending { get; set; } = true;
    }
}
