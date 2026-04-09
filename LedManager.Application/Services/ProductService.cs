using System.Linq.Expressions;
using LedManager.Core.Exceptions;
using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Entities.Catalog;

using LedManager.Core.Extensions;

namespace LedManager.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repository;
        private readonly IProductImageRepository _imageRepository;

        public ProductService(IProductRepository repository, IProductImageRepository imageRepository)
        {
            _repository = repository;
            _imageRepository = imageRepository;
        }

        public async Task<PagedResult<ProductViewModel>> GetListAsync(ProductListRequest request)
        {
            Expression<Func<Product, bool>> filter = x => !x.IsDeleted;

            // Category Filter
            if (request.CategoryId.HasValue)
            {
                filter = filter.And(x => x.ProductCategories!.Any(pc => pc.CategoryId == request.CategoryId.Value));
            }
            if (!string.IsNullOrEmpty(request.CategorySlug))
            {
                filter = filter.And(x => x.ProductCategories!.Any(pc => pc.Category!.Slug == request.CategorySlug));
            }

            // Keyword Filter
            if (!string.IsNullOrEmpty(request.Keyword))
            {
                var keyword = request.Keyword.Trim();
                filter = filter.And(x => x.Name.Contains(keyword) || (x.Description != null && x.Description.Contains(keyword)));
            }

            // IsFeatured Filter
            if (request.IsFeatured.HasValue)
            {
                filter = filter.And(x => x.IsFeatured == request.IsFeatured.Value);
            }

            // Price Range Filter - Filter by variant prices
            // A product matches if ANY of its variants fall within the price range
            if (request.MinPrice.HasValue)
            {
                filter = filter.And(x => x.Variants!.Any(v => v.Price >= request.MinPrice.Value));
            }
            if (request.MaxPrice.HasValue)
            {
                filter = filter.And(x => x.Variants!.Any(v => v.Price <= request.MaxPrice.Value));
            }

            // Stock Availability Filter
            if (request.InStock.HasValue)
            {
                if (request.InStock.Value)
                    filter = filter.And(x => x.StockQuantity > 0);
                else
                    filter = filter.And(x => x.StockQuantity <= 0);
            }

            // Sorting
            Func<IQueryable<Product>, IOrderedQueryable<Product>> orderBy = q => q.OrderByDescending(p => p.Id);
            if (!string.IsNullOrEmpty(request.SortLabel))
            {
                switch (request.SortLabel.ToLower())
                {
                    case "name":
                        orderBy = request.IsAscending ? q => q.OrderBy(p => p.Name) : q => q.OrderByDescending(p => p.Name);
                        break;
                    case "price":
                        // Sort by minimum variant price
                        orderBy = request.IsAscending
                            ? q => q.OrderBy(p => p.Variants!.Min(v => v.Price))
                            : q => q.OrderByDescending(p => p.Variants!.Min(v => v.Price));
                        break;
                    case "bestselling":
                        // Sort by total sold quantity
                        orderBy = q => q.OrderByDescending(p => p.TotalSold);
                        break;
                    case "created":
                    case "date":
                        orderBy = request.IsAscending ? q => q.OrderBy(p => p.Id) : q => q.OrderByDescending(p => p.Id);
                        break;
                    case "featured":
                        orderBy = q => q.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.Id);
                        break;
                }
            }

            var totalCount = await _repository.Count(filter);
            // Include ProductCategories.Category, Images, Specifications, and Variants for list view
            var entities = await _repository.QueryAsync(filter, orderBy: orderBy, includeProperties: "ProductCategories.Category,Images,Specifications,Variants,Reviews", pageSize: request.PageSize, page: request.PageIndex - 1);

            var items = entities.Select(e => new ProductViewModel
            {
                Id = e.Id,
                Name = e.Name,
                Slug = e.Slug,
                Description = e.Description,
                Content = e.Content,
                StockQuantity = e.StockQuantity,
                UsageSupport = e.UsageSupport,
                OutdoorPriceUpgrade = e.OutdoorPriceUpgrade,
                IsFeatured = e.IsFeatured,
                AverageRating = e.Reviews != null && e.Reviews.Any() ? e.Reviews.Average(r => r.Rating) : 0,
                TotalReviews = e.Reviews?.Count ?? 0,
                CategoryIds = e.ProductCategories?.Select(pc => pc.CategoryId).ToList(),
                Categories = e.ProductCategories?.Select(pc => new CategoryViewModel
                {
                    Id = pc.Category!.Id,
                    Name = pc.Category.Name,
                    Slug = pc.Category.Slug
                }).ToList(),
                Images = e.Images?.Select(i => new ProductImageViewModel
                {
                    Id = i.Id,
                    Url = i.Url,
                    IsPrimary = i.IsPrimary,
                    ProductId = i.ProductId
                }).ToList(),
                Specifications = e.Specifications?.Select(s => new ProductSpecificationViewModel
                {
                    Id = s.Id,
                    Key = s.Key,
                    Value = s.Value,
                    DisplayOrder = s.DisplayOrder
                }).ToList(),
                Variants = e.Variants?.Select(v => new ProductVariantViewModel
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
                PackageIncludes = e.PackageIncludes?.Select(p => new ProductPackageItemViewModel
                {
                    Id = p.Id,
                    ItemName = p.ItemName,
                    Quantity = p.Quantity
                }).ToList()
            }).ToList();

            return new PagedResult<ProductViewModel>(items, totalCount, request.PageIndex, request.PageSize);
        }

        public async Task<ProductViewModel?> GetByIdAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id, null, "ProductCategories.Category,Images,Specifications,Variants,PackageIncludes,ContentBlocks,Accordions");
            return entity == null ? null : new ProductViewModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Slug = entity.Slug,
                Description = entity.Description,
                Content = entity.Content,
                StockQuantity = entity.StockQuantity,
                UsageSupport = entity.UsageSupport,
                OutdoorPriceUpgrade = entity.OutdoorPriceUpgrade,
                IsFeatured = entity.IsFeatured,
                CategoryIds = entity.ProductCategories?.Select(pc => pc.CategoryId).ToList(),
                Categories = entity.ProductCategories?.Select(pc => new CategoryViewModel
                {
                    Id = pc.Category!.Id,
                    Name = pc.Category.Name,
                    Slug = pc.Category.Slug
                }).ToList(),
                Images = entity.Images?.Select(i => new ProductImageViewModel
                {
                    Id = i.Id,
                    Url = i.Url,
                    IsPrimary = i.IsPrimary,
                    ProductId = i.ProductId
                }).ToList(),
                Specifications = entity.Specifications?.Select(s => new ProductSpecificationViewModel
                {
                    Id = s.Id,
                    Key = s.Key,
                    Value = s.Value,
                    DisplayOrder = s.DisplayOrder
                }).ToList(),
                Variants = entity.Variants?.Select(v => new ProductVariantViewModel
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
                PackageIncludes = entity.PackageIncludes?.Select(p => new ProductPackageItemViewModel
                {
                    Id = p.Id,
                    ItemName = p.ItemName,
                    Quantity = p.Quantity
                }).ToList() ?? new List<ProductPackageItemViewModel>(),
                ContentBlocks = entity.ContentBlocks?.OrderBy(cb => cb.DisplayOrder).Select(cb => new ProductContentBlockViewModel
                {
                    Id = cb.Id,
                    Title = cb.Title,
                    Description = cb.Description,
                    ImageUrl = cb.ImageUrl,
                    ButtonText = cb.ButtonText,
                    ButtonLink = cb.ButtonLink,
                    DisplayOrder = cb.DisplayOrder,
                    TextPosition = cb.TextPosition
                }).ToList() ?? new List<ProductContentBlockViewModel>(),
                Accordions = entity.Accordions?.OrderBy(a => a.DisplayOrder).Select(a => new ProductAccordionViewModel
                {
                    Id = a.Id,
                    Title = a.Title,
                    Content = a.Content,
                    DisplayOrder = a.DisplayOrder,
                    IsExpanded = a.IsExpanded
                }).ToList() ?? new List<ProductAccordionViewModel>()
            };
        }

        public async Task<ProductViewModel?> GetBySlugAsync(string slug)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Slug == slug, null, "ProductCategories.Category,Images,Specifications,Variants,PackageIncludes,ContentBlocks,Accordions,Reviews");

            return entity == null ? null : new ProductViewModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Slug = entity.Slug,
                Description = entity.Description,
                AverageRating = entity.Reviews != null && entity.Reviews.Any() ? entity.Reviews.Average(r => r.Rating) : 0,
                TotalReviews = entity.Reviews?.Count ?? 0,
                Content = entity.Content,
                StockQuantity = entity.StockQuantity,
                UsageSupport = entity.UsageSupport,
                OutdoorPriceUpgrade = entity.OutdoorPriceUpgrade,
                IsFeatured = entity.IsFeatured,
                CategoryIds = entity.ProductCategories?.Select(pc => pc.CategoryId).ToList(),
                Categories = entity.ProductCategories?.Select(pc => new CategoryViewModel
                {
                    Id = pc.Category!.Id,
                    Name = pc.Category.Name,
                    Slug = pc.Category.Slug
                }).ToList(),
                Images = entity.Images?.Select(i => new ProductImageViewModel
                {
                    Id = i.Id,
                    Url = i.Url,
                    IsPrimary = i.IsPrimary,
                    ProductId = i.ProductId
                }).ToList(),
                Specifications = entity.Specifications?.Select(s => new ProductSpecificationViewModel
                {
                    Id = s.Id,
                    Key = s.Key,
                    Value = s.Value,
                    DisplayOrder = s.DisplayOrder
                }).ToList(),
                Variants = entity.Variants?.Select(v => new ProductVariantViewModel
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
                PackageIncludes = entity.PackageIncludes?.Select(p => new ProductPackageItemViewModel
                {
                    Id = p.Id,
                    ItemName = p.ItemName,
                    Quantity = p.Quantity
                }).ToList(),
                Accordions = entity.Accordions?.OrderBy(a => a.DisplayOrder).Select(a => new ProductAccordionViewModel
                {
                    Id = a.Id,
                    Title = a.Title,
                    Content = a.Content,
                    DisplayOrder = a.DisplayOrder,
                    IsExpanded = a.IsExpanded
                }).ToList() ?? new List<ProductAccordionViewModel>(),
                ContentBlocks = entity.ContentBlocks?.OrderBy(cb => cb.DisplayOrder).Select(cb => new ProductContentBlockViewModel
                {
                    Id = cb.Id,
                    Title = cb.Title,
                    Description = cb.Description,
                    ImageUrl = cb.ImageUrl,
                    ButtonText = cb.ButtonText,
                    ButtonLink = cb.ButtonLink,
                    DisplayOrder = cb.DisplayOrder,
                    TextPosition = cb.TextPosition
                }).ToList()
            };
        }

        public async Task AddAsync(ProductViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrEmpty(model.Name)) throw new ValidationException("Product Name is required.");
            // Price validation removed - now on variants
            // if (model.Price < 0) throw new ValidationException("Price cannot be negative.");

            var entity = new Product
            {
                Name = model.Name,
                Slug = model.Slug ?? string.Empty,
                Description = model.Description,
                Content = model.Content,
                UsageSupport = model.UsageSupport,
                OutdoorPriceUpgrade = model.OutdoorPriceUpgrade,
                IsFeatured = model.IsFeatured,
                ProductCategories = model.CategoryIds?.Select(catId => new ProductCategory
                {
                    CategoryId = catId
                }).ToList(),
                Images = model.Images?.Select(i => new ProductImage
                {
                    Url = i.Url ?? string.Empty,
                    IsPrimary = i.IsPrimary
                }).ToList(),
                Specifications = model.Specifications?.Select(s => new ProductSpecification
                {
                    Key = s.Key ?? string.Empty,
                    Value = s.Value ?? string.Empty,
                    DisplayOrder = s.DisplayOrder
                }).ToList(),
                Variants = model.Variants?.Select(v => new ProductVariant
                {
                    Type = v.Type ?? string.Empty,
                    Label = v.Label ?? string.Empty,
                    Value = v.Value,
                    ImageUrl = v.ImageUrl,
                    Price = v.Price,
                    OriginalPrice = v.OriginalPrice,
                    StockQuantity = v.StockQuantity
                }).ToList(),
                PackageIncludes = model.PackageIncludes?.Select(pi => new ProductPackageItem
                {
                    ItemName = pi.ItemName ?? string.Empty,
                    Quantity = pi.Quantity
                }).ToList(),
                ContentBlocks = model.ContentBlocks?.Select(cb => new ProductContentBlock
                {
                    Title = cb.Title,
                    Description = cb.Description,
                    ImageUrl = cb.ImageUrl,
                    ButtonText = cb.ButtonText,
                    ButtonLink = cb.ButtonLink,
                    DisplayOrder = cb.DisplayOrder,
                    TextPosition = cb.TextPosition
                }).ToList(),
                Accordions = model.Accordions?.Select(a => new ProductAccordion
                {
                    Title = a.Title,
                    Content = a.Content,
                    DisplayOrder = a.DisplayOrder,
                    IsExpanded = a.IsExpanded
                }).ToList()
            };

            // Auto-calculate total stock from variants
            entity.StockQuantity = entity.Variants?.Sum(v => v.StockQuantity) ?? 0;

            await _repository.Add(entity);
        }

        public async Task UpdateAsync(ProductViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            // Load entity with existing related data including ProductCategories and ContentBlocks
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == model.Id, includeProperties: "ProductCategories,Images,Specifications,Variants,PackageIncludes,ContentBlocks,Accordions");
            if (entity == null)
            {
                throw new NotFoundException(nameof(Product), model.Id);
            }

            entity.Name = model.Name ?? string.Empty;
            entity.Slug = model.Slug ?? string.Empty;
            entity.Description = model.Description;
            entity.Content = model.Content;
            entity.UsageSupport = model.UsageSupport;
            entity.OutdoorPriceUpgrade = model.OutdoorPriceUpgrade;
            entity.IsFeatured = model.IsFeatured;
            // Note: StockQuantity will be auto-calculated from variants below

            // Handle Collections Update (Simple Clear and Re-add strategy)

            // ProductCategories
            entity.ProductCategories ??= new List<ProductCategory>();
            entity.ProductCategories.Clear();
            if (model.CategoryIds != null)
            {
                foreach (var catId in model.CategoryIds)
                    entity.ProductCategories.Add(new ProductCategory { CategoryId = catId, ProductId = entity.Id });
            }

            // Images
            if (entity.Images != null)
            {
                var imagesToRemove = entity.Images.ToList();
                foreach (var img in imagesToRemove)
                {
                    await _imageRepository.Delete(img, commit: false);
                }
                entity.Images.Clear();
            }
            entity.Images ??= new List<ProductImage>();

            if (model.Images != null)
            {
                foreach (var item in model.Images)
                    entity.Images.Add(new ProductImage { Url = item.Url ?? string.Empty, IsPrimary = item.IsPrimary, ProductId = entity.Id });
            }

            // Specifications
            entity.Specifications ??= new List<ProductSpecification>();
            entity.Specifications.Clear();
            if (model.Specifications != null)
            {
                foreach (var item in model.Specifications)
                    entity.Specifications.Add(new ProductSpecification { Key = item.Key ?? string.Empty, Value = item.Value ?? string.Empty, DisplayOrder = item.DisplayOrder, ProductId = entity.Id });
            }

            // Variants
            entity.Variants ??= new List<ProductVariant>();
            if (model.Variants != null)
            {
                // 1. Delete removed variants
                var incomingIds = model.Variants.Where(x => x.Id > 0).Select(x => x.Id).ToList();
                var variantsToDelete = entity.Variants.Where(x => !incomingIds.Contains(x.Id)).ToList();
                foreach (var variant in variantsToDelete)
                {
                    entity.Variants.Remove(variant);
                }

                // 2. Update existing & Add new
                foreach (var item in model.Variants)
                {
                    var existingVariant = entity.Variants.FirstOrDefault(x => x.Id == item.Id && x.Id > 0);
                    if (existingVariant != null)
                    {
                        existingVariant.Type = item.Type ?? string.Empty;
                        existingVariant.Label = item.Label ?? string.Empty;
                        existingVariant.Value = item.Value;
                        existingVariant.ImageUrl = item.ImageUrl;
                        existingVariant.Price = item.Price;
                        existingVariant.OriginalPrice = item.OriginalPrice;
                        existingVariant.StockQuantity = item.StockQuantity;
                    }
                    else
                    {
                        entity.Variants.Add(new ProductVariant
                        {
                            Type = item.Type ?? string.Empty,
                            Label = item.Label ?? string.Empty,
                            Value = item.Value,
                            ImageUrl = item.ImageUrl,
                            Price = item.Price,
                            OriginalPrice = item.OriginalPrice,
                            StockQuantity = item.StockQuantity,
                            ProductId = entity.Id
                        });
                    }
                }
            }
            else
            {
                entity.Variants.Clear();
            }

            // PackageIncludes
            entity.PackageIncludes ??= new List<ProductPackageItem>();
            entity.PackageIncludes.Clear();
            if (model.PackageIncludes != null)
            {
                foreach (var item in model.PackageIncludes)
                    entity.PackageIncludes.Add(new ProductPackageItem { ItemName = item.ItemName ?? string.Empty, Quantity = item.Quantity, ProductId = entity.Id });
            }

            // ContentBlocks
            entity.ContentBlocks ??= new List<ProductContentBlock>();
            if (model.ContentBlocks != null)
            {
                // 1. Delete removed
                var incomingIds = model.ContentBlocks.Where(x => x.Id > 0).Select(x => x.Id).ToList();
                var toDelete = entity.ContentBlocks.Where(x => !incomingIds.Contains(x.Id)).ToList();
                foreach (var item in toDelete)
                {
                    entity.ContentBlocks.Remove(item);
                }

                // 2. Update & Add
                foreach (var item in model.ContentBlocks)
                {
                    var existing = entity.ContentBlocks.FirstOrDefault(x => x.Id == item.Id && x.Id > 0);
                    if (existing != null)
                    {
                        existing.Title = item.Title;
                        existing.Description = item.Description;
                        existing.ImageUrl = item.ImageUrl;
                        existing.ButtonText = item.ButtonText;
                        existing.ButtonLink = item.ButtonLink;
                        existing.DisplayOrder = item.DisplayOrder;
                        existing.TextPosition = item.TextPosition;
                    }
                    else
                    {
                        entity.ContentBlocks.Add(new ProductContentBlock
                        {
                            Title = item.Title,
                            Description = item.Description,
                            ImageUrl = item.ImageUrl,
                            ButtonText = item.ButtonText,
                            ButtonLink = item.ButtonLink,
                            DisplayOrder = item.DisplayOrder,
                            TextPosition = item.TextPosition,
                            ProductId = entity.Id
                        });
                    }
                }
            }
            else
            {
                entity.ContentBlocks.Clear();
            }

            // Accordions
            entity.Accordions ??= new List<ProductAccordion>();
            if (model.Accordions != null)
            {
                // 1. Delete removed
                var incomingIds = model.Accordions.Where(x => x.Id > 0).Select(x => x.Id).ToList();
                var toDelete = entity.Accordions.Where(x => !incomingIds.Contains(x.Id)).ToList();
                foreach (var item in toDelete)
                {
                    entity.Accordions.Remove(item);
                }

                // 2. Update & Add
                foreach (var item in model.Accordions)
                {
                    var existing = entity.Accordions.FirstOrDefault(x => x.Id == item.Id && x.Id > 0);
                    if (existing != null)
                    {
                        existing.Title = item.Title;
                        existing.Content = item.Content;
                        existing.DisplayOrder = item.DisplayOrder;
                        existing.IsExpanded = item.IsExpanded;
                    }
                    else
                    {
                        entity.Accordions.Add(new ProductAccordion
                        {
                            Title = item.Title,
                            Content = item.Content,
                            DisplayOrder = item.DisplayOrder,
                            IsExpanded = item.IsExpanded,
                            ProductId = entity.Id
                        });
                    }
                }
            }
            else
            {
                entity.Accordions.Clear();
            }

            // Auto-calculate total stock from variants
            entity.StockQuantity = entity.Variants?.Sum(v => v.StockQuantity) ?? 0;

            await _repository.Update(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Product), id);
            }
            await _repository.Delete(entity);
        }

        public async Task<List<ProductViewModel>> GetRelatedAsync(string slug, int count = 4)
        {
            var product = await _repository.FirstOrDefaultAsync(x => x.Slug == slug, includeProperties: "ProductCategories");
            if (product == null) return new List<ProductViewModel>();

            // Get category IDs from the product
            var categoryIds = product.ProductCategories?.Select(pc => pc.CategoryId).ToList() ?? new List<int>();
            if (!categoryIds.Any()) return new List<ProductViewModel>();

            // Find products that share at least one category
            // Note: This is a simplified approach - may need optimization for production
            var entities = await _repository.QueryAsync(
                filter: x => !x.IsDeleted && x.Id != product.Id,
                orderBy: x => x.OrderByDescending(p => p.Id),
                includeProperties: "ProductCategories.Category,Images,Variants,Reviews",
                pageSize: count * 3, // Get more to filter
                page: 0
            );

            // Filter to products sharing categories and take count
            var relatedProducts = entities
                .Where(e => e.ProductCategories?.Any(pc => categoryIds.Contains(pc.CategoryId)) == true)
                .Take(count);

            return relatedProducts.Select(e => new ProductViewModel
            {
                Id = e.Id,
                Name = e.Name,
                Slug = e.Slug,
                IsFeatured = e.IsFeatured,
                AverageRating = e.Reviews != null && e.Reviews.Any() ? e.Reviews.Average(r => r.Rating) : 0,
                TotalReviews = e.Reviews?.Count ?? 0,
                CategoryIds = e.ProductCategories?.Select(pc => pc.CategoryId).ToList(),
                Categories = e.ProductCategories?.Select(pc => new CategoryViewModel
                {
                    Id = pc.Category!.Id,
                    Name = pc.Category.Name,
                    Slug = pc.Category.Slug
                }).ToList(),
                Images = e.Images?.Select(i => new ProductImageViewModel
                {
                    Url = i.Url,
                    IsPrimary = i.IsPrimary
                }).ToList(),
                Variants = e.Variants?.Select(v => new ProductVariantViewModel
                {
                    Id = v.Id,
                    Type = v.Type,
                    Label = v.Label,
                    Price = v.Price,
                    OriginalPrice = v.OriginalPrice
                }).ToList()
            }).ToList();
        }
    }
}
