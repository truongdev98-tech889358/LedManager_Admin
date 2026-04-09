using System.Collections.Generic;
using LedManager.Domain.Enums;

namespace LedManager.Core.Models
{
    public class MenuViewModel
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Link { get; set; }
        public string? Icon { get; set; }
        public int SortOrder { get; set; }
        public MenuType Type { get; set; }
        public int? ParentId { get; set; }
        public List<MenuViewModel>? Children { get; set; }
        
        // Footer extension
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }

        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public string? GridType { get; set; }
        public bool IsMegaMenu { get; set; }
    }

    public class SystemConfigViewModel
    {
        public int Id { get; set; }
        public string? ConfigKey { get; set; }
        public string? ConfigValue { get; set; }
        public string? Description { get; set; }
    }
}
