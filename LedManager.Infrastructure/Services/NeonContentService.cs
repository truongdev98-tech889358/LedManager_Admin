using LedManager.Core.Models;
using LedManager.Core.Services;
using LedManager.Domain.Entities.CMS;
using LedManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LedManager.Infrastructure.Services
{
    public class NeonContentService : INeonContentService
    {
        private readonly ApplicationDbContext _context;

        public NeonContentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<NeonContentViewModel>> GetListAsync(int? type = null)
        {
            var query = _context.NeonContents.AsQueryable();

            if (type.HasValue)
            {
                var typeEnum = (NeonContentType)type.Value;
                query = query.Where(x => x.Type == typeEnum);
            }

            var items = await query
                .OrderBy(x => x.Type)
                .ThenBy(x => x.DisplayOrder)
                .ToListAsync();

            return items.Select(MapToViewModel).ToList();
        }

        public async Task<NeonContentViewModel?> GetByIdAsync(int id)
        {
            var item = await _context.NeonContents.FindAsync(id);
            return item == null ? null : MapToViewModel(item);
        }

        public async Task<NeonContentViewModel> CreateAsync(NeonContentRequest request)
        {
            var item = new NeonContent
            {
                Type = (NeonContentType)request.Type,
                Title = request.Title,
                Content = request.Content,
                ImageUrl = request.ImageUrl,
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive
            };

            _context.NeonContents.Add(item);
            await _context.SaveChangesAsync();

            return MapToViewModel(item);
        }

        public async Task<NeonContentViewModel> UpdateAsync(int id, NeonContentRequest request)
        {
            var item = await _context.NeonContents.FindAsync(id);
            if (item == null) throw new Exception("Content not found");

            item.Type = (NeonContentType)request.Type;
            item.Title = request.Title;
            item.Content = request.Content;
            item.ImageUrl = request.ImageUrl;
            item.DisplayOrder = request.DisplayOrder;
            item.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return MapToViewModel(item);
        }

        public async Task DeleteAsync(int id)
        {
            var item = await _context.NeonContents.FindAsync(id);
            if (item != null)
            {
                _context.NeonContents.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<NeonContentViewModel>> GetByTypeAsync(string type)
        {
             if (!Enum.TryParse<NeonContentType>(type, true, out var typeEnum))
             {
                 return new List<NeonContentViewModel>();
             }

            var items = await _context.NeonContents
                .Where(x => x.Type == typeEnum && x.IsActive)
                .OrderBy(x => x.DisplayOrder)
                .ToListAsync();

            return items.Select(MapToViewModel).ToList();
        }

        private static NeonContentViewModel MapToViewModel(NeonContent item)
        {
            return new NeonContentViewModel
            {
                Id = item.Id,
                Type = item.Type.ToString(),
                Title = item.Title,
                Content = item.Content,
                ImageUrl = item.ImageUrl,
                DisplayOrder = item.DisplayOrder,
                IsActive = item.IsActive
            };
        }
    }
}
