using System.Linq.Expressions;
using LedManager.Core.Exceptions;
using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Entities.System;

namespace LedManager.Application.Services
{
    public class SystemConfigService : ISystemConfigService
    {
        private readonly ISystemConfigRepository _repository;

        public SystemConfigService(ISystemConfigRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<SystemConfigViewModel>> GetListAsync(SystemConfigListRequest request)
        {
            Expression<Func<SystemConfig, bool>> filter = x => !x.IsDeleted;
            if (!string.IsNullOrEmpty(request.Keyword))
            {
                filter = x => !x.IsDeleted && x.ConfigKey != null && (x.ConfigKey.Contains(request.Keyword) || (x.Description != null && x.Description.Contains(request.Keyword)));
            }

            var totalCount = await _repository.Count(filter);
            var entities = await _repository.QueryAsync(filter, pageSize: request.PageSize, page: request.PageIndex - 1);

            var items = entities.Select(e => new SystemConfigViewModel
            {
                Id = e.Id,
                ConfigKey = e.ConfigKey,
                ConfigValue = e.ConfigValue,
                Description = e.Description
            }).ToList();

            return new PagedResult<SystemConfigViewModel>(items, totalCount, request.PageIndex, request.PageSize);
        }

        public async Task<SystemConfigViewModel?> GetByIdAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            return entity == null ? null : new SystemConfigViewModel
            {
                Id = entity.Id,
                ConfigKey = entity.ConfigKey,
                ConfigValue = entity.ConfigValue,
                Description = entity.Description
            };
        }

        public async Task AddAsync(SystemConfigViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrEmpty(model.ConfigKey)) throw new ValidationException("Config Key is required.");

            var entity = new SystemConfig
            {
                ConfigKey = model.ConfigKey,
                ConfigValue = model.ConfigValue,
                Description = model.Description
            };
            await _repository.Add(entity);
        }

        public async Task UpdateAsync(SystemConfigViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == model.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(SystemConfig), model.Id);
            }

            entity.ConfigKey = model.ConfigKey;
            entity.ConfigValue = model.ConfigValue;
            entity.Description = model.Description;
            await _repository.Update(entity);
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(SystemConfig), id);
            }
            await _repository.Delete(entity);
        }
    }
}
