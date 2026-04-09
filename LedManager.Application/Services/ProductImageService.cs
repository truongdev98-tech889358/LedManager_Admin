using System.Linq.Expressions;
using LedManager.Core.Exceptions;
using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Entities.Catalog;

namespace LedManager.Application.Services
{
    public class ProductImageService : IProductImageService
    {
        private readonly IProductImageRepository _repository;

        public ProductImageService(IProductImageRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<ProductImageViewModel>> GetListAsync(ProductImageListRequest request)
        {
            // Usually ProductImage is filtered by ProductId, but interface defined generically or by list
            // For now generic list
            Expression<Func<ProductImage, bool>> filter = x => !x.IsDeleted;
            if (request.ProductId.HasValue)
            {
                filter = x => !x.IsDeleted && x.ProductId == request.ProductId.Value;
            }
            
            var totalCount = await _repository.Count(filter);
            var entities = await _repository.QueryAsync(filter, pageSize: request.PageSize, page: request.PageIndex - 1);

            var items = entities.Select(e => new ProductImageViewModel
            {
                Id = e.Id,
                Url = e.Url,
                IsPrimary = e.IsPrimary,
                ProductId = e.ProductId
            }).ToList();

            return new PagedResult<ProductImageViewModel>(items, totalCount, request.PageIndex, request.PageSize);
        }

        public async Task<ProductImageViewModel?> GetByIdAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            return entity == null ? null : new ProductImageViewModel
            {
                Id = entity.Id,
                Url = entity.Url,
                IsPrimary = entity.IsPrimary,
                ProductId = entity.ProductId
            };
        }

        public async Task AddAsync(ProductImageViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrEmpty(model.Url)) throw new ValidationException("Image URL is required.");

            var entity = new ProductImage
            {
                Url = model.Url,
                IsPrimary = model.IsPrimary,
                ProductId = model.ProductId
            };
            await _repository.Add(entity);
        }

        public async Task UpdateAsync(ProductImageViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == model.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(ProductImage), model.Id);
            }

            entity.Url = model.Url ?? string.Empty;
            entity.IsPrimary = model.IsPrimary;
            entity.ProductId = model.ProductId;
            await _repository.Update(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(ProductImage), id);
            }
            await _repository.Delete(entity);
        }
    }
}
