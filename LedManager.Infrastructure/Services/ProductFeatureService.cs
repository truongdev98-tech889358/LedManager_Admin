using LedManager.Core.Models;
using LedManager.Core.Services;
using LedManager.Domain.Entities.Content;
using LedManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LedManager.Infrastructure.Services
{
    public class ProductFeatureService : IProductFeatureService
    {
        private readonly ApplicationDbContext _context;

        public ProductFeatureService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductFeatureViewModel>> GetActiveListAsync()
        {
            var features = await _context.ProductFeatures
                .Where(x => x.IsActive)
                .OrderBy(x => x.DisplayOrder)
                .ToListAsync();

            return features.Select(x => new ProductFeatureViewModel
            {
                Id = x.Id,
                Title = x.Title,
                Description = x.Description,
                IconUrl = x.IconUrl,
                BlockType = x.BlockType,
                Position = x.Position,
                DisplayOrder = x.DisplayOrder,
                IsActive = x.IsActive
            }).ToList();
        }

        public async Task<PagedResult<ProductFeatureViewModel>> GetListAsync(PagingRequest request)
        {
            var query = _context.ProductFeatures.AsQueryable();

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                query = query.Where(x => x.Title.Contains(request.Keyword) || x.Description.Contains(request.Keyword));
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(x => x.DisplayOrder)
                .Skip((request.PageIndex - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(x => new ProductFeatureViewModel
                {
                    Id = x.Id,
                    Title = x.Title,
                    Description = x.Description,
                    IconUrl = x.IconUrl,
                    BlockType = x.BlockType,
                    Position = x.Position,
                    DisplayOrder = x.DisplayOrder,
                    IsActive = x.IsActive
                })
                .ToListAsync();

            return new PagedResult<ProductFeatureViewModel>
            {
                Items = items,
                TotalCount = totalCount,
                PageIndex = request.PageIndex,
                PageSize = request.PageSize
            };
        }

        public async Task<ProductFeatureViewModel?> GetByIdAsync(int id)
        {
            var feature = await _context.ProductFeatures.FindAsync(id);
            if (feature == null) return null;

            return new ProductFeatureViewModel
            {
                Id = feature.Id,
                Title = feature.Title,
                Description = feature.Description,
                IconUrl = feature.IconUrl,
                BlockType = feature.BlockType,
                Position = feature.Position,
                DisplayOrder = feature.DisplayOrder,
                IsActive = feature.IsActive
            };
        }

        public async Task AddAsync(ProductFeatureViewModel model)
        {
            var feature = new ProductFeature
            {
                Title = model.Title,
                Description = model.Description,
                IconUrl = model.IconUrl ?? string.Empty,
                BlockType = model.BlockType,
                Position = model.Position,
                DisplayOrder = model.DisplayOrder,
                IsActive = model.IsActive
            };

            _context.ProductFeatures.Add(feature);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ProductFeatureViewModel model)
        {
            var feature = await _context.ProductFeatures.FindAsync(model.Id);
            if (feature == null) return;

            feature.Title = model.Title;
            feature.Description = model.Description;
            feature.IconUrl = model.IconUrl ?? string.Empty;
            feature.BlockType = model.BlockType;
            feature.Position = model.Position;
            feature.DisplayOrder = model.DisplayOrder;
            feature.IsActive = model.IsActive;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var feature = await _context.ProductFeatures.FindAsync(id);
            if (feature != null)
            {
                _context.ProductFeatures.Remove(feature);
                await _context.SaveChangesAsync();
            }
        }
    }
}
