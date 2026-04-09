using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.Content
{
    public class ProductFeature : BaseEntity
    {
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public string IconUrl { get; set; } = default!;
        public string BlockType { get; set; } = "ProductFeature"; // ProductFeature, HowItWorksStep
        public string Position { get; set; } = "ProductDetail"; // ProductDetail, HomePage_HowItWorks
        public int DisplayOrder { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
