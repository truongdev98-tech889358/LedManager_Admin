using System.Linq.Expressions;
using LedManager.Core.Exceptions;
using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Entities.Catalog;

namespace LedManager.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repository;

        public CategoryService(ICategoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<CategoryViewModel>> GetListAsync(CategoryListRequest request)
        {
            // 1. If searching, return flat list of matches
            if (!string.IsNullOrEmpty(request.Keyword))
            {
                Expression<Func<Category, bool>> filter = x => !x.IsDeleted && (x.Name.Contains(request.Keyword) || (x.Description != null && x.Description.Contains(request.Keyword)));
                var totalCount = await _repository.Count(filter);
                var entities = await _repository.QueryAsync(filter, pageSize: request.PageSize, page: request.PageIndex - 1);
                
                var items = entities.Select(e => new CategoryViewModel
                {
                    Id = e.Id,
                    Name = e.Name,
                    Slug = e.Slug,
                    Description = e.Description,
                    ImageUrl = e.ImageUrl,
                    ParentId = e.ParentId
                }).ToList();

                return new PagedResult<CategoryViewModel>(items, totalCount, request.PageIndex, request.PageSize);
            }

            // 1b. If filtering by IsFeatured, return flat list
            if (request.IsFeatured.HasValue)
            {
                Expression<Func<Category, bool>> filter = x => !x.IsDeleted && x.IsFeatured == request.IsFeatured.Value;
                var totalCount = await _repository.Count(filter);
                var entities = await _repository.QueryAsync(filter, pageSize: request.PageSize, page: request.PageIndex - 1, includeProperties: "ProductCategories.Product.Images,ProductCategories.Product.Variants,ProductCategories.Product.Reviews");
                
                var items = entities.Select(e => new CategoryViewModel
                {
                    Id = e.Id,
                    Name = e.Name,
                    Slug = e.Slug,
                    Description = e.Description,
                    ImageUrl = e.ImageUrl,
                    IsFeatured = e.IsFeatured,
                    ParentId = e.ParentId,
                    Products = e.ProductCategories?.Select(pc => new ProductViewModel
                    {
                        Id = pc.Product!.Id,
                        Name = pc.Product.Name,
                        Slug = pc.Product.Slug,
                        Description = pc.Product.Description,
                        Content = pc.Product.Content,
                        StockQuantity = pc.Product.StockQuantity,
                        UsageSupport = pc.Product.UsageSupport,
                        OutdoorPriceUpgrade = pc.Product.OutdoorPriceUpgrade,
                        IsFeatured = pc.Product.IsFeatured,
                        AverageRating = pc.Product.Reviews != null && pc.Product.Reviews.Any() ? pc.Product.Reviews.Average(r => r.Rating) : 0,
                        TotalReviews = pc.Product.Reviews?.Count ?? 0,
                        Images = pc.Product.Images?.Select(img => new ProductImageViewModel
                        {
                            Id = img.Id,
                            Url = img.Url,
                            IsPrimary = img.IsPrimary,
                            ProductId = img.ProductId
                        }).ToList(),
                        Variants = pc.Product.Variants?.Select(v => new ProductVariantViewModel
                        {
                            Id = v.Id,
                            Type = v.Type,
                            Label = v.Label,
                            Price = v.Price,
                            OriginalPrice = v.OriginalPrice,
                            StockQuantity = v.StockQuantity
                        }).ToList()
                    }).ToList()
                }).ToList();

                return new PagedResult<CategoryViewModel>(items, totalCount, request.PageIndex, request.PageSize);
            }

            // 2. If no search, return Tree structure (Root nodes with Children)
            // Fetch all categories (limit to 1000 for safety)
            var allEntities = await _repository.QueryAsync(x => !x.IsDeleted, pageSize: 1000, page: 0);

            var allViewModels = allEntities.Select(e => new CategoryViewModel
            {
                Id = e.Id,
                Name = e.Name,
                Slug = e.Slug,
                Description = e.Description,
                ImageUrl = e.ImageUrl,
                IsFeatured = e.IsFeatured,
                ParentId = e.ParentId,
                Children = new List<CategoryViewModel>()
            }).ToList();

            // Build Tree
            var lookup = allViewModels.ToDictionary(x => x.Id);
            var rootNodes = new List<CategoryViewModel>();

            foreach (var item in allViewModels)
            {
                if (item.ParentId.HasValue && lookup.ContainsKey(item.ParentId.Value))
                {
                    lookup[item.ParentId.Value].Children!.Add(item);
                }
                else
                {
                    rootNodes.Add(item);
                }
            }

            // Note: For tree view, pagination is applied to Root Nodes typically, 
            // but for dropdowns/full view we usually want everything.
            // Current frontend logic requests pageSize=100 or default params.
            // We will return root nodes. Front-end flattener will handle the rest.
            
            return new PagedResult<CategoryViewModel>(rootNodes, rootNodes.Count, 1, rootNodes.Count);
        }


        public async Task<PagedResult<CategoryViewModel>> GetAll()
        {
            // 2. If no search, return Tree structure (Root nodes with Children)
            // Fetch all categories (limit to 1000 for safety)
            var allEntities = await _repository.QueryAsync(x => !x.IsDeleted && !x.IsFeatured, pageSize: 1000, page: 0);

            var allViewModels = allEntities.Select(e => new CategoryViewModel
            {
                Id = e.Id,
                Name = e.Name,
                Slug = e.Slug,
                Description = e.Description,
                ImageUrl = e.ImageUrl,
                IsFeatured = e.IsFeatured,
                ParentId = e.ParentId,
                Children = new List<CategoryViewModel>()
            }).ToList();

            return new PagedResult<CategoryViewModel>(allViewModels,0,0,0);
        }

        public async Task<PagedResult<CategoryViewModel>> GetFeatures()
        {
            // 1. If searching, return flat list of matches
            
                Expression<Func<Category, bool>> filter = x => !x.IsDeleted && x.IsFeatured;

                var totalCount = await _repository.Count(filter);
                var entities = await _repository.QueryAsync(filter, pageSize: 0, page: -1, includeProperties: "ProductCategories.Product.Images,ProductCategories.Product.Variants,ProductCategories.Product.Reviews");

                var items = entities.Select(e => new CategoryViewModel
                {
                    Id = e.Id,
                    Name = e.Name,
                    Slug = e.Slug,
                    Description = e.Description,
                    ImageUrl = e.ImageUrl,
                    IsFeatured = e.IsFeatured,
                    ParentId = e.ParentId,
                    Products = e.ProductCategories?.Select(pc => new ProductViewModel
                    {
                        Id = pc.Product!.Id,
                        Name = pc.Product.Name,
                        Slug = pc.Product.Slug,
                        Description = pc.Product.Description,
                        Content = pc.Product.Content,
                        StockQuantity = pc.Product.StockQuantity,
                        UsageSupport = pc.Product.UsageSupport,
                        OutdoorPriceUpgrade = pc.Product.OutdoorPriceUpgrade,
                        IsFeatured = pc.Product.IsFeatured,
                        AverageRating = pc.Product.Reviews != null && pc.Product.Reviews.Any() ? pc.Product.Reviews.Average(r => r.Rating) : 0,
                        TotalReviews = pc.Product.Reviews?.Count ?? 0,
                        Variants = pc.Product.Variants?.Select(v => new ProductVariantViewModel
                        {
                            Id = v.Id,
                            Type = v.Type,
                            Label = v.Label,
                            Value = v.Value,
                            ImageUrl = v.ImageUrl,
                            Price = v.Price,
                            OriginalPrice = v.OriginalPrice,
                            StockQuantity = v.StockQuantity
                        }).ToList(),
                        Images = pc.Product.Images?.Select(img => new ProductImageViewModel
                        {
                            Id = img.Id,
                            Url = img.Url,
                            IsPrimary = img.IsPrimary,
                            ProductId = img.ProductId
                        }).ToList()
                    }).ToList()
                }).ToList();

                return new PagedResult<CategoryViewModel>(items, totalCount, 0,0);
        }

        public async Task<CategoryViewModel?> GetByIdAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            return entity == null ? null : new CategoryViewModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Slug = entity.Slug,
                Description = entity.Description,
                ImageUrl = entity.ImageUrl,
                IsFeatured = entity.IsFeatured,
                ParentId = entity.ParentId
            };
        }

        public async Task AddAsync(CategoryViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrEmpty(model.Name)) throw new ValidationException("Category Name is required.");

            var entity = new Category
            {
                Name = model.Name,
                Slug = model.Slug ?? string.Empty,
                Description = model.Description,
                ImageUrl = model.ImageUrl,
                IsFeatured = model.IsFeatured,
                ParentId = model.ParentId
            };
            await _repository.Add(entity);
        }

        public async Task UpdateAsync(CategoryViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == model.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Category), model.Id);
            }

            entity.Name = model.Name ?? string.Empty;
            entity.Slug = model.Slug ?? string.Empty;
            entity.Description = model.Description;
            entity.ImageUrl = model.ImageUrl;
            entity.IsFeatured = model.IsFeatured;
            entity.ParentId = model.ParentId;
            await _repository.Update(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Category), id);
            }
            await _repository.Delete(entity);
        }
    }
}
