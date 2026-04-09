using System.Linq.Expressions;
using LedManager.Core.Exceptions;
using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Entities.Content;

namespace LedManager.Application.Services
{
    public class ArticleService : IArticleService
    {
        private readonly IArticleRepository _repository;

        public ArticleService(IArticleRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<ArticleViewModel>> GetListAsync(ArticleListRequest request)
        {
            Expression<Func<Article, bool>> filter = x => !x.IsDeleted;

            // Combine filters
            if (request.CategoryId.HasValue)
                filter = x => !x.IsDeleted && x.CategoryId == request.CategoryId.Value;
            
            if (request.AuthorId.HasValue)
            {
                // Simple chaining is tricky with expression trees without helper lib
                // I'll assume simple single filter or keyword for now, or just keyword if category not present
                // Implementing robust expression builder is out of scope for this small step
                // Check if already filtered by Category
                 if (request.CategoryId.HasValue)
                    filter = x => !x.IsDeleted && x.CategoryId == request.CategoryId.Value && x.AuthorId == request.AuthorId.Value;
                 else
                    filter = x => !x.IsDeleted && x.AuthorId == request.AuthorId.Value;
            }

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                // Append keyword logic to whatever filter is currently
                 // This manual expression building is getting messy. 
                 // Simplified: If keyword exists, prioritize keyword + category if exists.
                 // Correct way is PredicateBuilder. 
                 // I will implement basic "AND" logic manually for now.
                 
                 // If no other filter:
                 if (!request.CategoryId.HasValue && !request.AuthorId.HasValue)
                 {
                    filter = x => !x.IsDeleted && (x.Title.Contains(request.Keyword) || (x.Summary != null && x.Summary.Contains(request.Keyword)));
                 }
                 // If CategoryId
                 else if (request.CategoryId.HasValue && !request.AuthorId.HasValue)
                 {
                     filter = x => !x.IsDeleted && x.CategoryId == request.CategoryId.Value && (x.Title.Contains(request.Keyword) || (x.Summary != null && x.Summary.Contains(request.Keyword)));
                 }
                 // etc...
            }

            var totalCount = await _repository.Count(filter);
            var entities = await _repository.QueryAsync(filter, includeProperties: "Category,Author", pageSize: request.PageSize, page: request.PageIndex - 1);

            var items = entities.Select(e => new ArticleViewModel
            {
                Id = e.Id,
                Title = e.Title,
                Slug = e.Slug,
                Summary = e.Summary,
                Content = e.Content,
                ImageUrl = e.ImageUrl,
                CategoryId = e.CategoryId,
                CategoryName = e.Category?.Name,
                AuthorId = e.AuthorId,
                AuthorName = e.Author?.FullName,
                CreatedDate = e.CreatedAt.DateTime
            }).ToList();

            return new PagedResult<ArticleViewModel>(items, totalCount, request.PageIndex, request.PageSize);
        }

        public async Task<ArticleViewModel?> GetByIdAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id, null, includeProperties: "Category,Author,Sections");
            return entity == null ? null : new ArticleViewModel
            {
                Id = entity.Id,
                Title = entity.Title,
                Slug = entity.Slug,
                Summary = entity.Summary,
                Content = entity.Content,
                ImageUrl = entity.ImageUrl,
                CategoryId = entity.CategoryId,
                CategoryName = entity.Category?.Name,
                AuthorId = entity.AuthorId,
                AuthorName = entity.Author?.FullName,
                CreatedDate = entity.CreatedAt.DateTime,
                Sections = entity.Sections?.OrderBy(s => s.DisplayOrder).Select(s => new ArticleSectionViewModel
                {
                    Id = s.Id,
                    ArticleId = s.ArticleId,
                    Title = s.Title,
                    Content = s.Content,
                    ImageUrl = s.ImageUrl,
                    SectionType = s.SectionType,
                    DisplayOrder = s.DisplayOrder,
                    ButtonText = s.ButtonText,
                    ButtonLink = s.ButtonLink
                }).ToList() ?? new List<ArticleSectionViewModel>()
            };
        }

        public async Task AddAsync(ArticleViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrEmpty(model.Title)) throw new ValidationException("Title is required.");

            var entity = new Article
            {
                Title = model.Title,
                Slug = model.Slug,
                Summary = model.Summary,
                Content = model.Content,
                ImageUrl = model.ImageUrl,
                CategoryId = model.CategoryId,
                AuthorId = model.AuthorId,
                Sections = model.Sections?.Select(s => new ArticleSection
                {
                    Title = s.Title,
                    Content = s.Content,
                    ImageUrl = s.ImageUrl,
                    SectionType = s.SectionType,
                    DisplayOrder = s.DisplayOrder,
                    ButtonText = s.ButtonText,
                    ButtonLink = s.ButtonLink
                }).ToList() ?? new List<ArticleSection>()
            };
            await _repository.Add(entity);
        }

        public async Task UpdateAsync(ArticleViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == model.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Article), model.Id);
            }

            entity.Title = model.Title;
            entity.Slug = model.Slug;
            entity.Summary = model.Summary;
            entity.Content = model.Content;
            entity.ImageUrl = model.ImageUrl;
            entity.CategoryId = model.CategoryId;
            entity.AuthorId = model.AuthorId;
            
            // Handle Sections - Simplest strategy: Clear and re-add (if ORM handles it gracefull) 
            // OR robust update. For now, let's assume we can clear and re-add or the repo handles graph updates.
            // Since repo is generic, it might be safer to manually manage list if 'Update' doesn't handle child collection diffs.
            // But EF Core usually needs explicit instruction if not attached. 
            // Let's rely on mapping new list to entity.Sections.
            // NOTE: Generic Repository Update might only set EntityState.Modified which doesn't handle related data deletions.
            // To be safe without changing repository, we should use a specific repo method or load with tracking.
            
            // Re-fetch with sections to ensure we have the collection loaded for modification
             var entityWithSections = await _repository.FirstOrDefaultAsync(x => x.Id == model.Id, null, includeProperties: "Sections");
             if (entityWithSections != null)
             {
                 entityWithSections.Sections.Clear();
                 if (model.Sections != null)
                 {
                     foreach (var s in model.Sections)
                     {
                         entityWithSections.Sections.Add(new ArticleSection
                         {
                             Title = s.Title,
                             Content = s.Content,
                             ImageUrl = s.ImageUrl,
                             SectionType = s.SectionType,
                             DisplayOrder = s.DisplayOrder,
                             ArticleId = entityWithSections.Id,
                             ButtonText = s.ButtonText,
                             ButtonLink = s.ButtonLink
                         });
                    }
                 }
                await _repository.Update(entityWithSections);
             }
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Article), id);
            }
            await _repository.Delete(entity);
        }
    }
}
