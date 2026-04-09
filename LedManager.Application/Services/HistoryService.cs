using LedManager.Application.Interfaces;
using LedManager.Application.ViewModels;
using LedManager.Domain.Entities.System;
using LedManager.Core.Repositories;

namespace LedManager.Application.Services
{
    public class HistoryService : IHistoryService
    {
        private readonly IHistoryRepository _repository;

        public HistoryService(IHistoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<HistoryListViewModel> GetHistoriesAsync(int entityId, HistoryType type)
        {
            var entities = await _repository.QueryAsync(
                h => h.EntityId == entityId && h.EntityType == type,
                orderBy: q => q.OrderByDescending(h => h.CreatedAt)
            );

            var histories = entities.Select(h => new HistoryViewModel
            {
                Id = h.Id,
                Description = h.Description,
                PerformedBy = h.PerformedBy,
                CreatedAt = h.CreatedAt
            }).ToList();

            return new HistoryListViewModel
            {
                Histories = histories
            };
        }

        public async Task<bool> AddHistoryAsync(HistoryCreateRequest request, string performedBy)
        {
            var history = new History
            {
                EntityType = request.EntityType,
                EntityId = request.EntityId,
                Description = request.Description,
                PerformedBy = performedBy,
                Metadata = request.Metadata,
                Level = request.Level,
                ActionType = request.ActionType
            };

            await _repository.Add(history);
            return true; 
        }
    }
}
