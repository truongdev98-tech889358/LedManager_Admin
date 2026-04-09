using LedManager.Core.Exceptions;
using LedManager.Core.Models;
using LedManager.Core.Services;
using LedManager.Domain.Entities.System;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace LedManager.Application.Services
{
    public class UserService : IUserService
    {
        private readonly UserManager<User> _userManager;

        public UserService(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        public async Task<PagedResult<UserViewModel>> GetListAsync(UserListRequest request)
        {
            var query = _userManager.Users.Where(x => !x.IsDeleted);

            if (!string.IsNullOrEmpty(request.Keyword))
            {
                query = query.Where(x => (x.UserName != null && x.UserName.Contains(request.Keyword)) || 
                                         (x.FirstName != null && x.FirstName.Contains(request.Keyword)) || 
                                         (x.LastName != null && x.LastName.Contains(request.Keyword)) ||
                                         (x.Email != null && x.Email.Contains(request.Keyword)));
            }

            var totalCount = await query.CountAsync();
            var itemsRaw = await query.Skip((request.PageIndex - 1) * request.PageSize)
                                   .Take(request.PageSize)
                                   .ToListAsync();

            var items = new List<UserViewModel>();
            foreach (var u in itemsRaw)
            {
                var roles = await _userManager.GetRolesAsync(u);
                items.Add(new UserViewModel
                {
                    Id = u.Id,
                    UserName = u.UserName,
                    Email = u.Email,
                    PhoneNumber = u.PhoneNumber,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    FullName = (u.LastName + " " + u.FirstName).Trim(),
                    Note = u.Note,
                    Roles = roles.ToList(),
                    Role = u.Role,
                    GroupId = u.GroupId,
                    Permissions = u.Permissions,
                    IsActive = u.IsActive
                });
            }

            return new PagedResult<UserViewModel>(items, totalCount, request.PageIndex, request.PageSize);
        }

        public async Task<UserViewModel?> GetByIdAsync(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null || user.IsDeleted) return null;

            var roles = await _userManager.GetRolesAsync(user);

            return new UserViewModel
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = (user.LastName + " " + user.FirstName).Trim(),
                Note = user.Note,
                Roles = roles.ToList(),
                Role = user.Role,
                GroupId = user.GroupId,
                Permissions = user.Permissions,
                IsActive = user.IsActive
            };
        }

        public async Task<UserViewModel?> GetByUserNameAsync(string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);
            if (user == null || user.IsDeleted) return null;

            var roles = await _userManager.GetRolesAsync(user);

            return new UserViewModel
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = (user.LastName + " " + user.FirstName).Trim(),
                Note = user.Note,
                Roles = roles.ToList(),
                Role = user.Role,
                GroupId = user.GroupId,
                Permissions = user.Permissions,
                IsActive = user.IsActive
            };
        }

        public async Task AddAsync(UserViewModel model)
        {
            if (model == null) throw new ArgumentNullException(nameof(model));
            
            var user = new User
            {
                UserName = model.UserName,
                Email = model.Email,
                PhoneNumber = model.PhoneNumber,
                FirstName = model.FirstName,
                LastName = model.LastName,
                FullName = (model.LastName + " " + model.FirstName).Trim(),
                Note = model.Note,
                Role = model.Role ?? (model.Roles != null && model.Roles.Any() ? model.Roles.First() : null),
                GroupId = model.GroupId,
                Permissions = model.Permissions,
                IsActive = model.IsActive,
                CreatedDate = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, model.Password ?? "Default@123");
            if (!result.Succeeded)
            {
                throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            if (model.Roles != null && model.Roles.Any())
            {
                await _userManager.AddToRolesAsync(user, model.Roles);
            }
        }

        public async Task UpdateAsync(int id, UserViewModel model)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null || user.IsDeleted) throw new NotFoundException(nameof(User), id);

            user.Email = model.Email;
            user.PhoneNumber = model.PhoneNumber;
            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.FullName = (model.LastName + " " + model.FirstName).Trim();
            user.Note = model.Note;
            user.Role = model.Role ?? (model.Roles != null && model.Roles.Any() ? model.Roles.First() : null);
            user.GroupId = model.GroupId;
            user.Permissions = model.Permissions;
            user.IsActive = model.IsActive;
            user.UpdatedDate = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                throw new ValidationException(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            // Update Roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            if (model.Roles != null)
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                await _userManager.AddToRolesAsync(user, model.Roles);
            }

            if (!string.IsNullOrEmpty(model.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                var passwordResult = await _userManager.ResetPasswordAsync(user, token, model.Password);
                 if (!passwordResult.Succeeded)
                {
                     throw new ValidationException(string.Join(", ", passwordResult.Errors.Select(e => e.Description)));
                }
            }
        }

        public async Task DeleteAsync(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) throw new NotFoundException(nameof(User), id);

            // Soft delete
            user.IsDeleted = true;
            user.UpdatedDate = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);
        }
    }
}
