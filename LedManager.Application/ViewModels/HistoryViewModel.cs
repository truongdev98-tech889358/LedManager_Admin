using LedManager.Domain.Entities.System;

namespace LedManager.Application.ViewModels
{
    public class HistoryViewModel
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public string PerformedBy { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
    }

    public class HistoryListViewModel
    {
        public List<HistoryViewModel> Histories { get; set; } = new();
    }

    public class HistoryCreateRequest
    {
        public HistoryType EntityType { get; set; }
        public int EntityId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Metadata { get; set; } = string.Empty;
        public int Level { get; set; }
        public string ActionType { get; set; } = string.Empty;
    }
}
