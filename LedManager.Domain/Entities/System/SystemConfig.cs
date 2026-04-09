using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.System
{
    public class SystemConfig : BaseEntity
    {
        public string? ConfigKey { get; set; } // e.g., "SiteEmail", "SitePhone"
        public string? ConfigValue { get; set; }

        public string? Description { get; set; }
    }
}
