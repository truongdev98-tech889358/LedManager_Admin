using System.Collections.Generic;
using LedManager.Domain.Entities.Base;
using LedManager.Domain.Enums;

namespace LedManager.Domain.Entities.System
{
    public class Menu : BaseEntity
    {
        public string Name { get; set; } = default!;
        public string? Link { get; set; }
        public string? Icon { get; set; }
        public int SortOrder { get; set; }
        public MenuType Type { get; set; }
        
        public int? ParentId { get; set; }
        public virtual Menu? Parent { get; set; }
        public virtual ICollection<Menu>? Children { get; set; }
        
        // Additional info for Footer/Contact items
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }

        // Rich Menu Enhancements
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public string? GridType { get; set; } // e.g., "grid-4", "grid-2" for children layout
        public bool IsMegaMenu { get; set; }
    }
}
