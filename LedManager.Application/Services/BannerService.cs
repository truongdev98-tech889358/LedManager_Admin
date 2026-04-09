using System.Linq.Expressions;
using LedManager.Core.Exceptions;
using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Entities.Content;

namespace LedManager.Application.Services
{
    public class BannerService : IBannerService
    {
        private readonly IBannerRepository _repository;

        public BannerService(IBannerRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<BannerViewModel>> GetListAsync(BannerListRequest request)
        {
            Expression<Func<Banner, bool>> filter = x => !x.IsDeleted;
            
            if (request.IsActive.HasValue)
                 filter = x => !x.IsDeleted && x.IsActive == request.IsActive.Value;

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                if (request.IsActive.HasValue)
                    filter = x => !x.IsDeleted && x.IsActive == request.IsActive.Value && x.Title.Contains(request.Keyword);
                else
                    filter = x => !x.IsDeleted && x.Title.Contains(request.Keyword);
            }

            if (!string.IsNullOrEmpty(request.Position))
            {
               filter = x => !x.IsDeleted && x.Position.Contains(request.Position);
            }

            var totalCount = await _repository.Count(filter);
            var entities = await _repository.QueryAsync(filter, pageSize: request.PageSize, page: request.PageIndex - 1);

            var items = entities.Select(e => new BannerViewModel
            {
                Id = e.Id,
                Title = e.Title,
                Subtitle = e.Subtitle,
                Description = e.Description,
                ImageUrl = e.ImageUrl,
                MobileImageUrl = e.MobileImageUrl,
                VideoUrl = e.VideoUrl,
                MobileVideoUrl = e.MobileVideoUrl,
                MediaType = e.MediaType,
                Link = e.Link,
                ButtonText = e.ButtonText,
                ButtonLink = e.ButtonLink,
                ButtonText2 = e.ButtonText2,
                ButtonLink2 = e.ButtonLink2,
                TextPosition = e.TextPosition,
                ShowOverlay = e.ShowOverlay,
                BannerType = e.BannerType,
                SortOrder = e.SortOrder,
                IsActive = e.IsActive,
                Position = e.Position
            }).ToList();

            return new PagedResult<BannerViewModel>(items, totalCount, request.PageIndex, request.PageSize);
        }

        public async Task<BannerViewModel?> GetByIdAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            return entity == null ? null : new BannerViewModel
            {
                Id = entity.Id,
                Title = entity.Title,
                Subtitle = entity.Subtitle,
                Description = entity.Description,
                ImageUrl = entity.ImageUrl,
                MobileImageUrl = entity.MobileImageUrl,
                VideoUrl = entity.VideoUrl,
                MobileVideoUrl = entity.MobileVideoUrl,
                MediaType = entity.MediaType,
                Link = entity.Link,
                ButtonText = entity.ButtonText,
                ButtonLink = entity.ButtonLink,
                ButtonText2 = entity.ButtonText2,
                ButtonLink2 = entity.ButtonLink2,
                TextPosition = entity.TextPosition,
                ShowOverlay = entity.ShowOverlay,
                BannerType = entity.BannerType,
                SortOrder = entity.SortOrder,
                IsActive = entity.IsActive,
                Position = entity.Position
            };
        }

        public async Task AddAsync(BannerViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (model.MediaType == "Image" && string.IsNullOrEmpty(model.ImageUrl)) throw new ValidationException("Image URL is required for Image banners.");
            if (model.MediaType == "Video" && string.IsNullOrEmpty(model.VideoUrl)) throw new ValidationException("Video URL is required for Video banners.");

            var entity = new Banner
            {
                Title = model.Title ?? string.Empty,
                Subtitle = model.Subtitle,
                Description = model.Description,
                ImageUrl = model.ImageUrl ?? string.Empty,
                MobileImageUrl = model.MobileImageUrl,
                VideoUrl = model.VideoUrl,
                MobileVideoUrl = model.MobileVideoUrl,
                MediaType = model.MediaType ?? "Image",
                Link = model.Link,
                ButtonText = model.ButtonText,
                ButtonLink = model.ButtonLink,
                ButtonText2 = model.ButtonText2,
                ButtonLink2 = model.ButtonLink2,
                TextPosition = model.TextPosition ?? "Left",
                ShowOverlay = model.ShowOverlay,
                BannerType = model.BannerType ?? "Hero",
                SortOrder = model.SortOrder,
                IsActive = model.IsActive,
                Position = model.Position ?? string.Empty
            };
            await _repository.Add(entity);
        }

        public async Task UpdateAsync(BannerViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == model.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Banner), model.Id);
            }

            entity.Title = model.Title ?? string.Empty;
            entity.Subtitle = model.Subtitle;
            entity.Description = model.Description;
            entity.ImageUrl = model.ImageUrl ?? string.Empty;
            entity.MobileImageUrl = model.MobileImageUrl;
            entity.VideoUrl = model.VideoUrl;
            entity.MobileVideoUrl = model.MobileVideoUrl;
            entity.MediaType = model.MediaType ?? "Image";
            entity.Link = model.Link;
            entity.ButtonText = model.ButtonText;
            entity.ButtonLink = model.ButtonLink;
            entity.ButtonText2 = model.ButtonText2;
            entity.ButtonLink2 = model.ButtonLink2;
            entity.TextPosition = model.TextPosition ?? "Left";
            entity.ShowOverlay = model.ShowOverlay;
            entity.BannerType = model.BannerType ?? "Hero";
            entity.SortOrder = model.SortOrder;
            entity.IsActive = model.IsActive;
            entity.Position = model.Position ?? string.Empty;
            await _repository.Update(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Banner), id);
            }
            await _repository.Delete(entity);
        }
    }
}
