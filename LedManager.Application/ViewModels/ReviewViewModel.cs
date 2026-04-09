using LedManager.Domain.Entities.Catalog;

namespace LedManager.Application.ViewModels
{
    public class ReviewViewModel
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string UserName { get; set; } = default!;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public bool IsVerifiedPurchase { get; set; }
        public List<string> Images { get; set; } = new();
    }

    public class CreateReviewViewModel
    {
        public int ProductId { get; set; }
        public string UserName { get; set; } = default!;
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public List<string>? ImageUrls { get; set; } // Uploaded separately or handled in controller
    }
    
    public class ProductRatingSummary
    {
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public int FiveStarCount { get; set; }
        public int FourStarCount { get; set; }
        public int ThreeStarCount { get; set; }
        public int TwoStarCount { get; set; }
        public int OneStarCount { get; set; }
    }
}
