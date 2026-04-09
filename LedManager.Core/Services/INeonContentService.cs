using LedManager.Core.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LedManager.Core.Services
{
    public interface INeonContentService
    {
        Task<List<NeonContentViewModel>> GetListAsync(int? type = null);
        Task<NeonContentViewModel?> GetByIdAsync(int id);
        Task<NeonContentViewModel> CreateAsync(NeonContentRequest request);
        Task<NeonContentViewModel> UpdateAsync(int id, NeonContentRequest request);
        Task DeleteAsync(int id);
        Task<List<NeonContentViewModel>> GetByTypeAsync(string type);
    }
}
