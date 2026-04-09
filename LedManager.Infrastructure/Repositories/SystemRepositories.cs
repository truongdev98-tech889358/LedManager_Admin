using LedManager.Core.Repositories;
using LedManager.Domain.Entities.System;
using LedManager.Infrastructure.Data;

namespace LedManager.Infrastructure.Repositories
{
    public class MenuRepository : RepositoryBase<Menu>, IMenuRepository
    {
        public MenuRepository(ApplicationDbContext context) : base(context) { }
    }

    public class SystemConfigRepository : RepositoryBase<SystemConfig>, ISystemConfigRepository
    {
        public SystemConfigRepository(ApplicationDbContext context) : base(context) { }
    }

    public class HistoryRepository : RepositoryBase<History>, IHistoryRepository
    {
        public HistoryRepository(ApplicationDbContext context) : base(context) { }
    }
}
