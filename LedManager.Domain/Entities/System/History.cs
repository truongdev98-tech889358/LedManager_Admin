using LedManager.Domain.Entities.Base;

namespace LedManager.Domain.Entities.System
{
    public enum HistoryType
    {
        Booking = 0,
        Order = 1,
        Ticket = 2
    }

    public class History : BaseEntity
    {
        public HistoryType EntityType { get; set; }
        public int EntityId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string PerformedBy { get; set; } = string.Empty;
        public string Metadata { get; set; } = string.Empty;
        public int Level { get; set; }
        public string ActionType { get; set; } = string.Empty;
    }
}
