using System.Collections.Generic;
using System.Threading.Tasks;
using LedManager.Core.Models;

namespace LedManager.Core.Services
{
    public interface ICategoryService
    {
        Task<PagedResult<CategoryViewModel>> GetListAsync(CategoryListRequest request);
        Task<PagedResult<CategoryViewModel>> GetAll();
        Task<CategoryViewModel?> GetByIdAsync(int id);
        Task AddAsync(CategoryViewModel model);
        Task<PagedResult<CategoryViewModel>> GetFeatures();
        Task UpdateAsync(CategoryViewModel model);
        Task DeleteAsync(int id);
    }

    public interface IProductService
    {
        Task<PagedResult<ProductViewModel>> GetListAsync(ProductListRequest request);
        Task<ProductViewModel?> GetByIdAsync(int id);
        Task<ProductViewModel?> GetBySlugAsync(string slug);
        Task AddAsync(ProductViewModel model);
        Task UpdateAsync(ProductViewModel model);
        Task DeleteAsync(int id);
        Task<List<ProductViewModel>> GetRelatedAsync(string slug, int count = 4);
    }

    public interface IProductImageService
    {
        Task<PagedResult<ProductImageViewModel>> GetListAsync(ProductImageListRequest request);
        Task<ProductImageViewModel?> GetByIdAsync(int id);
        Task AddAsync(ProductImageViewModel model);
        Task UpdateAsync(ProductImageViewModel model);
        Task DeleteAsync(int id);
    }
}
