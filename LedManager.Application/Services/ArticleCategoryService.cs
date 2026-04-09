using System.Linq.Expressions;
using LedManager.Core.Exceptions;
using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Entities.Content;

namespace LedManager.Application.Services
{
    public class ArticleCategoryService : IArticleCategoryService
    {
        private readonly IArticleCategoryRepository _repository;

        public ArticleCategoryService(IArticleCategoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<ArticleCategoryViewModel>> GetListAsync(ArticleCategoryListRequest request)
        {
            Expression<Func<ArticleCategory, bool>> filter = x => !x.IsDeleted;
            if (!string.IsNullOrEmpty(request.Keyword))
            {
                filter = x => !x.IsDeleted && (x.Name.Contains(request.Keyword) || (x.Description != null && x.Description.Contains(request.Keyword)));
            }

            var totalCount = await _repository.Count(filter);
            var entities = await _repository.QueryAsync(filter, pageSize: request.PageSize, page: request.PageIndex - 1);
            
            var items = entities.Select(e => new ArticleCategoryViewModel
            {
                Id = e.Id,
                Name = e.Name,
                Slug = e.Slug,
                Description = e.Description
            }).ToList();

            return new PagedResult<ArticleCategoryViewModel>(items, totalCount, request.PageIndex, request.PageSize);
        }

        public async Task<ArticleCategoryViewModel?> GetByIdAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            return entity == null ? null : new ArticleCategoryViewModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Slug = entity.Slug,
                Description = entity.Description
            };
        }

        public async Task AddAsync(ArticleCategoryViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrEmpty(model.Name)) throw new ValidationException("Category Name is required.");

            var entity = new ArticleCategory
            {
                Name = model.Name,
                Slug = model.Slug ?? string.Empty,
                Description = model.Description
            };
            await _repository.Add(entity);
        }

        public async Task UpdateAsync(ArticleCategoryViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == model.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(ArticleCategory), model.Id);
            }

            entity.Name = model.Name;
            entity.Slug = model.Slug ?? string.Empty;
            entity.Description = model.Description;
            await _repository.Update(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(ArticleCategory), id);
            }
            await _repository.Delete(entity);
        }
    }
}
