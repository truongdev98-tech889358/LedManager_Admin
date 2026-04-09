using System.Collections.Generic;
using System.Threading.Tasks;
using LedManager.Core.Models;

namespace LedManager.Core.Services
{
    public interface INeonService
    {
        // Public methods
        Task<List<NeonFontViewModel>> GetFontsAsync();
        Task<List<NeonColorViewModel>> GetColorsAsync();
        Task<List<NeonBackgroundViewModel>> GetBackgroundsAsync();

        // Admin methods
        Task<List<NeonFontViewModel>> GetAllFontsAsync();
        Task<NeonFontViewModel> CreateFontAsync(NeonFontRequest request);
        Task<NeonFontViewModel> UpdateFontAsync(int id, NeonFontRequest request);
        Task DeleteFontAsync(int id);

        Task<List<NeonColorViewModel>> GetAllColorsAsync();
        Task<NeonColorViewModel> CreateColorAsync(NeonColorRequest request);
        Task<NeonColorViewModel> UpdateColorAsync(int id, NeonColorRequest request);
        Task DeleteColorAsync(int id);

        Task<List<NeonBackgroundViewModel>> GetAllBackgroundsAsync();
        Task<NeonBackgroundViewModel> CreateBackgroundAsync(NeonBackgroundRequest request);
        Task<NeonBackgroundViewModel> UpdateBackgroundAsync(int id, NeonBackgroundRequest request);
        Task DeleteBackgroundAsync(int id);
    }
}
