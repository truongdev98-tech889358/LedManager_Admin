using System.Linq;
using System.Linq.Expressions;
using LedManager.Core.Exceptions;
using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Entities.System;
using LedManager.Domain.Enums;

namespace LedManager.Application.Services
{
    public class MenuService : IMenuService
    {
        private readonly IMenuRepository _repository;

        public MenuService(IMenuRepository repository)
        {
            _repository = repository;
        }

        public async Task<PagedResult<MenuViewModel>> GetListAsync(MenuListRequest request)
        {
            Expression<Func<Menu, bool>> filter = x => !x.IsDeleted;
            
            if (request.Type.HasValue)
            {
                filter = x => !x.IsDeleted && x.Type == request.Type.Value;
            }

            if (request.ParentId.HasValue)
            {
                var currentFilter = filter;
                filter = x => x.ParentId == request.ParentId.Value;
                // Combine with existing filter if needed, but usually ParentId is enough 
                // However, for safety and to keep the IsDeleted check:
                filter = x => !x.IsDeleted && x.ParentId == request.ParentId.Value;
                if (request.Type.HasValue)
                {
                    filter = x => !x.IsDeleted && x.ParentId == request.ParentId.Value && x.Type == request.Type.Value;
                }
            }

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                // We should combine Keyword with existing filter
                var keyword = request.Keyword.ToLower();
                if (request.ParentId.HasValue && request.Type.HasValue)
                    filter = x => !x.IsDeleted && x.ParentId == request.ParentId.Value && x.Type == request.Type.Value && x.Name.ToLower().Contains(keyword);
                else if (request.ParentId.HasValue)
                    filter = x => !x.IsDeleted && x.ParentId == request.ParentId.Value && x.Name.ToLower().Contains(keyword);
                else if (request.Type.HasValue)
                    filter = x => !x.IsDeleted && x.Type == request.Type.Value && x.Name.ToLower().Contains(keyword);
                else
                    filter = x => !x.IsDeleted && x.Name.ToLower().Contains(keyword);
            }

            var totalCount = await _repository.Count(filter);
            var entities = await _repository.QueryAsync(filter, pageSize: request.PageSize, page: request.PageIndex - 1, orderBy: q => q.OrderBy(m => m.SortOrder));

            var items = entities.Select(e => new MenuViewModel
            {
                Id = e.Id,
                Name = e.Name,
                Link = e.Link,
                Icon = e.Icon,
                SortOrder = e.SortOrder,
                Type = e.Type,
                ParentId = e.ParentId,
                Address = e.Address,
                PhoneNumber = e.PhoneNumber,
                ImageUrl = e.ImageUrl,
                Description = e.Description,
                GridType = e.GridType,
                IsMegaMenu = e.IsMegaMenu,
                Email = e.Email
            }).ToList();

            return new PagedResult<MenuViewModel>(items, totalCount, request.PageIndex, request.PageSize);
        }

        public async Task<MenuViewModel?> GetByIdAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            return entity == null ? null : new MenuViewModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Link = entity.Link,
                Icon = entity.Icon,
                SortOrder = entity.SortOrder,
                Type = entity.Type,
                ParentId = entity.ParentId,
                Address = entity.Address,
                PhoneNumber = entity.PhoneNumber,
                ImageUrl = entity.ImageUrl,
                Description = entity.Description,
                GridType = entity.GridType,
                IsMegaMenu = entity.IsMegaMenu,
                Email = entity.Email
            };
        }

        public async Task AddAsync(MenuViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            if (string.IsNullOrEmpty(model.Name)) throw new ValidationException("Menu Name is required.");

            var entity = new Menu
            {
                Name = model.Name,
                Link = model.Link,
                Icon = model.Icon,
                SortOrder = model.SortOrder,
                Type = model.Type,
                ParentId = model.ParentId,
                Address = model.Address,
                PhoneNumber = model.PhoneNumber,
                ImageUrl = model.ImageUrl,
                Description = model.Description,
                GridType = model.GridType,
                IsMegaMenu = model.IsMegaMenu,
                Email = model.Email
            };
            await _repository.Add(entity);
        }

        public async Task UpdateAsync(MenuViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));

            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == model.Id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Menu), model.Id);
            }

            entity.Name = model.Name ?? string.Empty;
            entity.Link = model.Link;
            entity.Icon = model.Icon;
            entity.SortOrder = model.SortOrder;
            entity.Type = model.Type;
            entity.ParentId = model.ParentId;
            entity.Address = model.Address;
            entity.PhoneNumber = model.PhoneNumber;
            entity.ImageUrl = model.ImageUrl;
            entity.Description = model.Description;
            entity.GridType = model.GridType;
            entity.IsMegaMenu = model.IsMegaMenu;
            entity.Email = model.Email;
            await _repository.Update(entity);
        }

        public async Task<List<MenuViewModel>> GetMenuTreeAsync(MenuType type)
        {
            // Get all root menus (no parent) of the specified type
            var rootMenus = await _repository.QueryAsync(
                x => !x.IsDeleted && x.Type == type && x.ParentId == null,
                orderBy: q => q.OrderBy(m => m.SortOrder)
            );

            var result = new List<MenuViewModel>();
            foreach (var menu in rootMenus)
            {
                var viewModel = await MapToViewModelWithChildren(menu);
                result.Add(viewModel);
            }

            return result;
        }

        private async Task<MenuViewModel> MapToViewModelWithChildren(Menu entity)
        {
            var viewModel = new MenuViewModel
            {
                Id = entity.Id,
                Name = entity.Name,
                Link = entity.Link,
                Icon = entity.Icon,
                SortOrder = entity.SortOrder,
                Type = entity.Type,
                ParentId = entity.ParentId,
                Address = entity.Address,
                PhoneNumber = entity.PhoneNumber,
                ImageUrl = entity.ImageUrl,
                Description = entity.Description,
                GridType = entity.GridType,
                IsMegaMenu = entity.IsMegaMenu,
                Email = entity.Email
            };

            // Load children recursively
            var children = await _repository.QueryAsync(
                x => !x.IsDeleted && x.ParentId == entity.Id,
                orderBy: q => q.OrderBy(m => m.SortOrder)
            );

            if (children.Any())
            {
                viewModel.Children = new List<MenuViewModel>();
                foreach (var child in children)
                {
                    var childViewModel = await MapToViewModelWithChildren(child);
                    viewModel.Children.Add(childViewModel);
                }
            }

            return viewModel;
        }


        public async Task DeleteAsync(int id)
        {
            var entity = await _repository.FirstOrDefaultAsync(x => x.Id == id);
            if (entity == null)
            {
                throw new NotFoundException(nameof(Menu), id);
            }
            await _repository.Delete(entity);
        }
    }
}
