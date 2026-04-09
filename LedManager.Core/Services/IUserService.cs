using System.Threading.Tasks;
using LedManager.Core.Models;

namespace LedManager.Core.Services
{
    public interface IUserService
    {
        Task<PagedResult<UserViewModel>> GetListAsync(UserListRequest request);
        Task<UserViewModel?> GetByIdAsync(int id);
        Task AddAsync(UserViewModel model);
        Task<UserViewModel?> GetByUserNameAsync(string userName);
        Task UpdateAsync(int id, UserViewModel model);
        Task DeleteAsync(int id);
    }
}
