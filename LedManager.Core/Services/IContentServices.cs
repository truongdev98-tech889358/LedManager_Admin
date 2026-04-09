using System.Collections.Generic;
using System.Threading.Tasks;
using LedManager.Core.Models;

namespace LedManager.Core.Services
{
    public interface IArticleService
    {
        Task<PagedResult<ArticleViewModel>> GetListAsync(ArticleListRequest request);
        Task<ArticleViewModel?> GetByIdAsync(int id);
        Task AddAsync(ArticleViewModel model);
        Task UpdateAsync(ArticleViewModel model);
        Task DeleteAsync(int id);
    }

    public interface IArticleCategoryService
    {
        Task<PagedResult<ArticleCategoryViewModel>> GetListAsync(ArticleCategoryListRequest request);
        Task<ArticleCategoryViewModel?> GetByIdAsync(int id);
        Task AddAsync(ArticleCategoryViewModel model);
        Task UpdateAsync(ArticleCategoryViewModel model);
        Task DeleteAsync(int id);
    }

    public interface IBannerService
    {
        Task<PagedResult<BannerViewModel>> GetListAsync(BannerListRequest request);
        Task<BannerViewModel?> GetByIdAsync(int id);
        Task AddAsync(BannerViewModel model);
        Task UpdateAsync(BannerViewModel model);
        Task DeleteAsync(int id);
    }

    public interface IProductFeatureService
    {
        Task<List<ProductFeatureViewModel>> GetActiveListAsync();
        Task<PagedResult<ProductFeatureViewModel>> GetListAsync(PagingRequest request);
        Task<ProductFeatureViewModel?> GetByIdAsync(int id);
        Task AddAsync(ProductFeatureViewModel model);
        Task UpdateAsync(ProductFeatureViewModel model);
        Task DeleteAsync(int id);
    }

    public interface IHomePageContentService
    {
        Task<HomePageContentViewModel?> GetActiveAsync();
        Task<PagedResult<HomePageContentViewModel>> GetListAsync(PagingRequest request);
        Task<HomePageContentViewModel?> GetByIdAsync(int id);
        Task AddAsync(HomePageContentViewModel model);
        Task UpdateAsync(HomePageContentViewModel model);
        Task DeleteAsync(int id);
    }
}
