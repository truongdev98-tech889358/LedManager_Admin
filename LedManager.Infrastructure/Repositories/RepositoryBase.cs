using LedManager.Core.Repositories;
using LedManager.Domain.Entities.Base;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace LedManager.Infrastructure.Repositories
{
    public class RepositoryBase<T> : IRepository<T> where T : class, IBaseEntity
    {
        protected DbContext _context;

        public RepositoryBase(DbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Method add entity to db
        /// </summary>
        /// <param name="obj"></param>
        /// <param name="commit"></param>
        /// <returns></returns>
        public async Task Add(T obj, bool commit = true)
        {
            // add object to entity
            _context.Set<T>().Add(obj);

            // if commit save to db
            if (commit)
                await Commit();
        }

        /// <summary>
        /// Method using save changes to database
        /// </summary>
        /// <returns></returns>
        public async Task Commit()
        {
            // save changes to db
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Method using find, orderby object by conditions
        /// </summary>
        /// <param name="filter"></param>
        /// <param name="orderBy"></param>
        /// <param name="includeProperties"></param>
        /// <param name="includeDeleted"></param>
        /// <returns>IEnumerable<T></returns>
        public T? FirstOrDefault(Expression<Func<T, bool>>? filter = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, string includeProperties = AppOptions.EmptyText)
        {
            // get object from database
            IQueryable<T> query = _context.Set<T>();

            // Filter out deleted records
            query = query.Where(i => !i.IsDeleted);

            // if fillter
            if (filter != null)
            {
                // fillter by condition
                query = query.Where(filter);
            }

            // get list properties to display
            var properties = includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            // loop properties
            foreach (var includeProperty in properties)
            {
                // Get the desired properties of the object
                query = query.Include(includeProperty);
            }

            // if order by
            if (orderBy != null)
            {
                // sort query
                query = orderBy(query);
            }

            query = query.AsSplitQuery();
            // return result
            return query.FirstOrDefault();
        }

        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>>? filter = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, string includeProperties = AppOptions.EmptyText)
        {
            // get object from database
            IQueryable<T> query = _context.Set<T>();

            // Filter out deleted records
            query = query.Where(i => !i.IsDeleted);

            // if fillter
            if (filter != null)
            {
                // fillter by condition
                query = query.Where(filter);
            }

            // get list properties to display
            var properties = includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            // loop properties
            foreach (var includeProperty in properties)
            {
                // Get the desired properties of the object
                query = query.Include(includeProperty);
            }

            // if order by
            if (orderBy != null)
            {
                // sort query
                query = orderBy(query);
            }

            // return result
            return await query
                .AsSplitQuery()
                .FirstOrDefaultAsync();
        }

        public async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>>? filter = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, params Expression<Func<T, object>>[] includes)
        {
            IQueryable<T> query = _context.Set<T>();

            // Filter out deleted records
            query = query.Where(i => !i.IsDeleted);

            if (filter != null)
            {
                query = query.Where(filter);
            }

            // Apply includes (lambda-based)
            if (includes != null)
            {
                foreach (var include in includes)
                {
                    query = query.Include(include);
                }
            }

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            return await query
                .AsSplitQuery()
                .FirstOrDefaultAsync();
        }

        public bool Any(Expression<Func<T, bool>>? filter = null)
        {
            // get object from database only query data
            var query = _context.Set<T>().AsNoTracking();

            // Filter out deleted records
            query = query.Where(i => !i.IsDeleted);

            // if fillter
            if (filter != null)
            {
                // fillter by condition
                query = query.Where(filter);
            }

            return query.Any();

        }
        public async Task<bool> AnyAsync(Expression<Func<T, bool>>? filter = null)
        {
            // get object from database only query data
            var query = _context.Set<T>().AsNoTracking();

            // Filter out deleted records
            query = query.Where(i => !i.IsDeleted);

            // if fillter
            if (filter != null)
            {
                // fillter by condition
                query = query.Where(filter);
            }

            return await query.AnyAsync();

        }

        /// <summary>
        /// method using get data from table 
        /// </summary>
        /// <param name="filter"></param>
        /// <param name="orderBy"></param>
        /// <param name="includeProperties"></param>
        /// <returns>IQueryable<Object></returns>
        public async Task<ICollection<T>> QueryAsync(Expression<Func<T, bool>>? filter = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, string includeProperties = AppOptions.EmptyText, int pageSize = 0, int page = -1, bool? isTracking = false, bool includeDeleted = false)
        {
            // get object from database only query data
            IQueryable<T> query = _context.Set<T>();

            if (!includeDeleted)
                query = query.Where(i => !i.IsDeleted);

            if (isTracking != true)
            {
                query = query.AsNoTracking();
            }

            // if fillter
            if (filter != null)
            {
                // fillter by condition
                query = query.Where(filter);
            }

            // get list properties to display
            var properties = includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            // loop properties
            foreach (var includeProperty in properties)
            {
                // Get the desired properties of the object
                query = query.Include(includeProperty);
            }


            // if order by
            if (orderBy != null)
            {
                // sort query
                query = orderBy(query);
            }
            else if (pageSize > 0 && page > -1)
            {
                // Default ordering to avoid EF exception with Skip/Take
                query = query.OrderByDescending(x => x.Id);
            }

            //if paging
            if (pageSize > 0 && page > -1)
            {
                query = query.Skip(pageSize * page).Take(pageSize);
            }
            query = query.AsSplitQuery();
            // return result
            return await query.ToListAsync();
        }

        public async Task<ICollection<TResult>> QueryAndSelectAsync<TResult>(Expression<Func<T, TResult>> selector, Expression<Func<T, bool>>? filter = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
                string includeProperties = AppOptions.EmptyText, int pageSize = 0, int page = -1, bool includeDeleted = false) where TResult : class
        {

            // get object from database only query data
            IQueryable<T> query = _context.Set<T>();

            if (!includeDeleted)
                query = query.Where(i => !i.IsDeleted);

            query = query.AsNoTracking();

            // if fillter
            if (filter != null)
            {
                // fillter by condition
                query = query.Where(filter);
            }

            // get list properties to display
            var properties = includeProperties.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            // loop properties
            foreach (var includeProperty in properties)
            {
                // Get the desired properties of the object
                query = query.Include(includeProperty);
            }


            // if order by
            if (orderBy != null)
            {
                // sort query
                query = orderBy(query);
            }
            else if (pageSize > 0 && page > -1)
            {
                // Default ordering to avoid EF exception with Skip/Take
                query = query.OrderByDescending(x => x.Id);
            }

            //if paging
            if (pageSize > 0 && page > -1)
            {
                query = query.Skip(pageSize * page).Take(pageSize);
            }

            //project and return

            // return result
            return await query.Select(selector)
                .AsSplitQuery()
                .ToListAsync();

        }

        public async Task<T?> Get(Expression<Func<T, bool>> filter, string includeProperties = AppOptions.EmptyText)
        {
            IQueryable<T> query = _context.Set<T>();
            
            // Filter out deleted records
            query = query.Where(i => !i.IsDeleted);
            
            foreach (var includeProperty in includeProperties.Split
                (new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
            {
                query = query.Include(includeProperty);
            }
            query = query.AsSplitQuery();
            return await query.FirstOrDefaultAsync(filter);
        }

        public async Task Update(T obj, bool commit = true)
        {
            _context.Set<T>().Update(obj);
            if (commit)
                await _context.SaveChangesAsync();
        }

        public async Task Delete(T obj, bool commit = true)
        {
            // Soft delete: set IsDeleted = true instead of removing
            obj.IsDeleted = true;
            obj.UpdatedAt = DateTimeOffset.UtcNow;
            await Update(obj, commit);
        }

        public async Task Delete(int id, bool commit = true)
        {
             var entity = await _context.Set<T>().FindAsync(id);
             if (entity != null)
             {
                 // Soft delete: set IsDeleted = true instead of removing
                 entity.IsDeleted = true;
                 entity.UpdatedAt = DateTimeOffset.UtcNow;
                 await Update(entity, commit);
             }
        }

        public async Task TruncateTable(string tableName)
        {
            string cmd = $"TRUNCATE TABLE {tableName}";
            await _context.Database.ExecuteSqlRawAsync(cmd);
        }

        public async Task<int> Count(Expression<Func<T, bool>>? filter = null, bool includeDeleted = false)
        {
            // get object from database only query data
            IQueryable<T> query = _context.Set<T>();

            if (!includeDeleted) query = query.Where(i => !i.IsDeleted);

            query = query.AsNoTracking();

            // if fillter
            if (filter != null)
            {
                // fillter by condition
                query = query.Where(filter);
            }

            return await query.CountAsync();
        }

        public void EntryEntity(T entity)
        {
            _context.Entry(entity).State = EntityState.Unchanged;
        }
    }
}
