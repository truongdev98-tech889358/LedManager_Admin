using LedManager.Application.ViewModels;
using LedManager.Core.Models;
using LedManager.Domain.Entities.Catalog;
using LedManager.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("product/{productId}")]
        public async Task<ActionResult<PagedResult<ReviewViewModel>>> GetByProduct(int productId, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 10, [FromQuery] string sortOption = "newest")
        {
            var query = _context.Reviews
                .Include(r => r.Images)
                .Where(r => r.ProductId == productId);

            switch (sortOption.ToLower())
            {
                case "oldest":
                    query = query.OrderBy(r => r.CreatedAt);
                    break;
                case "highest":
                    query = query.OrderByDescending(r => r.Rating).ThenByDescending(r => r.CreatedAt);
                    break;
                case "lowest":
                    query = query.OrderBy(r => r.Rating).ThenByDescending(r => r.CreatedAt);
                    break;
                case "newest":
                default:
                    query = query.OrderByDescending(r => r.CreatedAt);
                    break;
            }

            var totalCount = await query.CountAsync();

            var reviews = await query
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ReviewViewModel
                {
                    Id = r.Id,
                    ProductId = r.ProductId,
                    UserName = r.UserName,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    IsVerifiedPurchase = r.IsVerifiedPurchase,
                    Images = r.Images != null ? r.Images.Select(i => i.ImageUrl).ToList() : new List<string>()
                })
                .ToListAsync();

            return Ok(new PagedResult<ReviewViewModel>(reviews, totalCount, pageIndex, pageSize));
        }

        [HttpGet("summary/{productId}")]
        public async Task<ActionResult<ProductRatingSummary>> GetSummary(int productId)
        {
             var reviews = await _context.Reviews
                .Where(r => r.ProductId == productId)
                .ToListAsync();

            if (!reviews.Any())
            {
                return Ok(new ProductRatingSummary());
            }

            var summary = new ProductRatingSummary
            {
                AverageRating = reviews.Average(r => r.Rating),
                TotalReviews = reviews.Count,
                FiveStarCount = reviews.Count(r => r.Rating == 5),
                FourStarCount = reviews.Count(r => r.Rating == 4),
                ThreeStarCount = reviews.Count(r => r.Rating == 3),
                TwoStarCount = reviews.Count(r => r.Rating == 2),
                OneStarCount = reviews.Count(r => r.Rating == 1)
            };

            return Ok(summary);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CreateReviewViewModel model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var review = new Review
            {
                ProductId = model.ProductId,
                UserName = model.UserName,
                Email = model.Email,
                PhoneNumber = model.PhoneNumber,
                Rating = model.Rating,
                Comment = model.Comment,
                CreatedAt = DateTimeOffset.UtcNow,
                IsVerifiedPurchase = false, // Logic to verify purchase could be added here
                IsApproved = true
            };

            if (model.ImageUrls != null && model.ImageUrls.Any())
            {
                review.Images = model.ImageUrls.Select(url => new ReviewImage
                {
                    ImageUrl = url
                }).ToList();
            }

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByProduct), new { productId = model.ProductId }, null);
        }
    }
}
