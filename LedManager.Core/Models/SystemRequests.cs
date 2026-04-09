using LedManager.Domain.Enums;

namespace LedManager.Core.Models
{
    public class MenuListRequest : PagingRequest 
    {
        public int? ParentId { get; set; }
        public MenuType? Type { get; set; }
    }

    public class SystemConfigListRequest : PagingRequest { }
}
