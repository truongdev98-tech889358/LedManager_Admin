using LedManager.Domain.Entities.Base;
using LedManager.Domain.Entities.Catalog;

namespace LedManager.Domain.Entities.Catalog
{
    public class Review : BaseEntity
    {
        public int ProductId { get; set; }
        public virtual Product Product { get; set; } = default!;

        public string UserName { get; set; } = default!;
        public string? Email { get; set; } // Optional: to contact or verify
        public string? PhoneNumber { get; set; } // Optional

        public int Rating { get; set; } // 1 to 5
        public string? Comment { get; set; }
        
        // Photos? The user showed photos in reviews.
        public virtual ICollection<ReviewImage>? Images { get; set; }

        public bool IsVerifiedPurchase { get; set; }
        public bool IsApproved { get; set; } = true; // Auto-approve by default?
    }

    public class ReviewImage : BaseEntity
    {
        public int ReviewId { get; set; }
        public virtual Review Review { get; set; } = default!;
        public string ImageUrl { get; set; } = default!;
    }
}
