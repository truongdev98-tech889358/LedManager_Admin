using LedManager.Application.ViewModels;
using LedManager.Domain.Entities.System;

namespace LedManager.Application.Interfaces
{
    public interface IHistoryService
    {
        Task<HistoryListViewModel> GetHistoriesAsync(int entityId, HistoryType type);
        Task<bool> AddHistoryAsync(HistoryCreateRequest request, string performedBy);
    }
}
