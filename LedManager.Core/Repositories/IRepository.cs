using LedManager.Domain.Entities.Base;
using System.Linq.Expressions;

namespace LedManager.Core.Repositories
{
    public interface IRepository<T> where T : IBaseEntity
    {
        private const string emptyText = "";

        Task Add(T obj, bool commit = true);

        Task<T?> Get(Expression<Func<T, bool>> filter, string includeProperties = emptyText);

        Task Update(T obj, bool commit = true);

        Task Delete(T obj, bool commit = true);

        Task Delete(int id, bool commit = true);

        Task Commit();

        T? FirstOrDefault(Expression<Func<T, bool>>? filter = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, string includeProperties = emptyText);

        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>>? filter = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, string includeProperties = emptyText);

        Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>>? filter = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, params Expression<Func<T, object>>[] includes);

        bool Any(Expression<Func<T, bool>>? filter = null);

        Task<bool> AnyAsync(Expression<Func<T, bool>>? filter = null);

        Task<ICollection<T>> QueryAsync(Expression<Func<T, bool>>? filter = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, string includeProperties = emptyText, int pageSize = 0,
                                int page = -1, bool? isTracking = false, bool includeDeleted = false);

        Task<ICollection<TResult>> QueryAndSelectAsync<TResult>(Expression<Func<T, TResult>> selector, Expression<Func<T, bool>>? filter = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, string includeProperties = emptyText,
                                int pageSize = 0, int page = -1, bool includeDeleted = false) where TResult : class;
        Task TruncateTable(string tableName);

        void EntryEntity(T entity);

        Task<int> Count(Expression<Func<T, bool>>? filter = null, bool includeDeleted = false);
    }
}
