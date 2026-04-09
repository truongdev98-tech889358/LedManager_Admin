using LedManager.Core.Models;
using LedManager.Domain.Enums;

namespace LedManager.Core.Services
{
    public interface IMenuService
    {
        Task<PagedResult<MenuViewModel>> GetListAsync(MenuListRequest request);
        Task<MenuViewModel?> GetByIdAsync(int id);
        Task AddAsync(MenuViewModel model);
        Task UpdateAsync(MenuViewModel model);
        Task DeleteAsync(int id);
        Task<List<MenuViewModel>> GetMenuTreeAsync(MenuType type);
    }

    public interface ISystemConfigService
    {
        Task<PagedResult<SystemConfigViewModel>> GetListAsync(SystemConfigListRequest request);
        Task<SystemConfigViewModel?> GetByIdAsync(int id);
        Task AddAsync(SystemConfigViewModel model);
        Task UpdateAsync(SystemConfigViewModel model);
        Task DeleteAsync(int id);
    }
}
