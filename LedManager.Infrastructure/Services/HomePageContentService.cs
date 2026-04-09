using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Entities.Content;

namespace LedManager.Infrastructure.Services
{
    public class HomePageContentService : IHomePageContentService
    {
        private readonly IHomePageContentRepository _repository;

        public HomePageContentService(IHomePageContentRepository repository)
        {
            _repository = repository;
        }

        public async Task<HomePageContentViewModel?> GetActiveAsync()
        {
            var entity = await _repository.FirstOrDefaultAsync(x => !x.IsDeleted && x.IsActive);

            if (entity == null) return null;

            return MapToViewModel(entity);
        }

        public async Task<PagedResult<HomePageContentViewModel>> GetListAsync(PagingRequest request)
        {
            var query = await _repository.QueryAndSelectAsync(entity => new HomePageContentViewModel
            {
                Id = entity.Id,
                MetaTitle = entity.MetaTitle,
                MetaDescription = entity.MetaDescription,
                MetaKeywords = entity.MetaKeywords,
                OgImage = entity.OgImage,
                HeroTitle = entity.HeroTitle,
                HeroSubtitle = entity.HeroSubtitle,
                HeroDescription = entity.HeroDescription,
                AboutTitle = entity.AboutTitle,
                AboutDescription = entity.AboutDescription,
                AboutImage = entity.AboutImage,
                FeaturesTitle = entity.FeaturesTitle,
                FeaturesDescription = entity.FeaturesDescription,
                FeaturesJson = entity.FeaturesJson,
                FaqPart1Title = entity.FaqPart1Title,
                FaqPart1Description = entity.FaqPart1Description,
                FaqPart1Json = entity.FaqPart1Json,
                FaqPart2Title = entity.FaqPart2Title,
                FaqPart2Description = entity.FaqPart2Description,
                FaqPart2Json = entity.FaqPart2Json,
                TrustBrandsTitle = entity.TrustBrandsTitle,
                TrustBrandsDescription = entity.TrustBrandsDescription,
                TrustBrandsJson = entity.TrustBrandsJson,

                IsActive = entity.IsActive
            },x => !x.IsDeleted);

            var total = query.Count();

            return new PagedResult<HomePageContentViewModel>
            {
                Items = query.ToList(),
                TotalCount = total,
                PageIndex = request.PageIndex,
                PageSize = request.PageSize
            };
        }

        public async Task<HomePageContentViewModel?> GetByIdAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x=> x.Id == id);

            if (entity == null || entity.IsDeleted) return null;
            
            return MapToViewModel(entity);
        }

        public async Task AddAsync(HomePageContentViewModel model)
        {
            var entity = new HomePageContent
            {
                MetaTitle = model.MetaTitle,
                MetaDescription = model.MetaDescription,
                MetaKeywords = model.MetaKeywords,
                OgImage = model.OgImage,
                HeroTitle = model.HeroTitle,
                HeroSubtitle = model.HeroSubtitle,
                HeroDescription = model.HeroDescription,
                AboutTitle = model.AboutTitle,
                AboutDescription = model.AboutDescription,
                AboutImage = model.AboutImage,
                FeaturesTitle = model.FeaturesTitle,
                FeaturesDescription = model.FeaturesDescription,
                FeaturesJson = model.FeaturesJson,
                FaqPart1Title = model.FaqPart1Title,
                FaqPart1Description = model.FaqPart1Description,
                FaqPart1Json = model.FaqPart1Json,
                FaqPart2Title = model.FaqPart2Title,
                FaqPart2Description = model.FaqPart2Description,
                FaqPart2Json = model.FaqPart2Json,
                TrustBrandsTitle = model.TrustBrandsTitle,
                TrustBrandsDescription = model.TrustBrandsDescription,
                TrustBrandsJson = model.TrustBrandsJson,

                IsActive = model.IsActive
            };

            await _repository.Add(entity);
        }

        public async Task UpdateAsync(HomePageContentViewModel model)
        {
            var entity = await _repository.FirstOrDefaultAsync(x=>x.Id == model.Id);
            if (entity == null || entity.IsDeleted)
                throw new Exception("Home page content not found");

            entity.MetaTitle = model.MetaTitle;
            entity.MetaDescription = model.MetaDescription;
            entity.MetaKeywords = model.MetaKeywords;
            entity.OgImage = model.OgImage;
            entity.HeroTitle = model.HeroTitle;
            entity.HeroSubtitle = model.HeroSubtitle;
            entity.HeroDescription = model.HeroDescription;
            entity.AboutTitle = model.AboutTitle;
            entity.AboutDescription = model.AboutDescription;
            entity.AboutImage = model.AboutImage;
            entity.FeaturesTitle = model.FeaturesTitle;
            entity.FeaturesDescription = model.FeaturesDescription;
            entity.FeaturesJson = model.FeaturesJson;
            entity.FaqPart1Title = model.FaqPart1Title;
            entity.FaqPart1Description = model.FaqPart1Description;
            entity.FaqPart1Json = model.FaqPart1Json;
            entity.FaqPart2Title = model.FaqPart2Title;
            entity.FaqPart2Description = model.FaqPart2Description;
            entity.FaqPart2Json = model.FaqPart2Json;
            entity.TrustBrandsTitle = model.TrustBrandsTitle;
            entity.TrustBrandsDescription = model.TrustBrandsDescription;
            entity.TrustBrandsJson = model.TrustBrandsJson;

            entity.IsActive = model.IsActive;

            await _repository.Update(entity);
        }

        public async Task DeleteAsync(int id)
        {
            await _repository.Delete(id);
        }

        private HomePageContentViewModel MapToViewModel(HomePageContent entity)
        {
            return new HomePageContentViewModel
            {
                Id = entity.Id,
                MetaTitle = entity.MetaTitle,
                MetaDescription = entity.MetaDescription,
                MetaKeywords = entity.MetaKeywords,
                OgImage = entity.OgImage,
                HeroTitle = entity.HeroTitle,
                HeroSubtitle = entity.HeroSubtitle,
                HeroDescription = entity.HeroDescription,
                AboutTitle = entity.AboutTitle,
                AboutDescription = entity.AboutDescription,
                AboutImage = entity.AboutImage,
                FeaturesTitle = entity.FeaturesTitle,
                FeaturesDescription = entity.FeaturesDescription,
                FeaturesJson = entity.FeaturesJson,
                FaqPart1Title = entity.FaqPart1Title,
                FaqPart1Description = entity.FaqPart1Description,
                FaqPart1Json = entity.FaqPart1Json,
                FaqPart2Title = entity.FaqPart2Title,
                FaqPart2Description = entity.FaqPart2Description,
                FaqPart2Json = entity.FaqPart2Json,
                TrustBrandsTitle = entity.TrustBrandsTitle,
                TrustBrandsDescription = entity.TrustBrandsDescription,
                TrustBrandsJson = entity.TrustBrandsJson,

                IsActive = entity.IsActive
            };
        }
    }
}
