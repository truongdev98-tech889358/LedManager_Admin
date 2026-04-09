using LedManager.Domain.Entities.System;

namespace LedManager.Core.Repositories
{
    public interface IMenuRepository : IRepository<Menu> { }
    public interface ISystemConfigRepository : IRepository<SystemConfig> { }
    public interface IHistoryRepository : IRepository<History> { }
}
