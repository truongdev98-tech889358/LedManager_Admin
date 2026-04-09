using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Catalog
{
    public class NeonColor : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string HexCode { get; set; } = string.Empty;
        public string GlowCode { get; set; } = string.Empty;
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
