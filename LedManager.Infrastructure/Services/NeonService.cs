using LedManager.Core.Models;
using LedManager.Core.Services;
using LedManager.Domain.Entities.Catalog;
using LedManager.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LedManager.Infrastructure.Services
{
    public class NeonService : INeonService
    {
        private readonly ApplicationDbContext _context;

        public NeonService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Public methods
        public async Task<List<NeonFontViewModel>> GetFontsAsync()
        {
            return await _context.NeonFonts
                .Where(f => f.IsActive)
                .OrderBy(f => f.DisplayOrder)
                .Select(f => new NeonFontViewModel
                {
                    Id = f.Id,
                    Name = f.Name,
                    Value = f.Value,
                    DisplayOrder = f.DisplayOrder,
                    IsActive = f.IsActive
                })
                .ToListAsync();
        }

        public async Task<List<NeonColorViewModel>> GetColorsAsync()
        {
            return await _context.NeonColors
                .Where(c => c.IsActive)
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new NeonColorViewModel
                {
                    Id = c.Id,
                    Name = c.Name,
                    HexCode = c.HexCode,
                    GlowCode = c.GlowCode,
                    DisplayOrder = c.DisplayOrder,
                    IsActive = c.IsActive
                })
                .ToListAsync();
        }

        // Admin methods
        public async Task<List<NeonFontViewModel>> GetAllFontsAsync()
        {
            return await _context.NeonFonts
                .OrderBy(f => f.DisplayOrder)
                .Select(f => new NeonFontViewModel
                {
                    Id = f.Id,
                    Name = f.Name,
                    Value = f.Value,
                    DisplayOrder = f.DisplayOrder,
                    IsActive = f.IsActive
                })
                .ToListAsync();
        }

        public async Task<NeonFontViewModel> CreateFontAsync(NeonFontRequest request)
        {
            var font = new NeonFont
            {
                Name = request.Name,
                Value = request.Value,
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.NeonFonts.Add(font);
            await _context.SaveChangesAsync();

            return new NeonFontViewModel
            {
                Id = font.Id,
                Name = font.Name,
                Value = font.Value,
                DisplayOrder = font.DisplayOrder,
                IsActive = font.IsActive
            };
        }

        public async Task<NeonFontViewModel> UpdateFontAsync(int id, NeonFontRequest request)
        {
            var font = await _context.NeonFonts.FindAsync(id);
            if (font == null) throw new Exception("Font not found");

            font.Name = request.Name;
            font.Value = request.Value;
            font.DisplayOrder = request.DisplayOrder;
            font.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return new NeonFontViewModel
            {
                Id = font.Id,
                Name = font.Name,
                Value = font.Value,
                DisplayOrder = font.DisplayOrder,
                IsActive = font.IsActive
            };
        }

        public async Task DeleteFontAsync(int id)
        {
            var font = await _context.NeonFonts.FindAsync(id);
            if (font != null)
            {
                _context.NeonFonts.Remove(font);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<NeonColorViewModel>> GetAllColorsAsync()
        {
            return await _context.NeonColors
                .OrderBy(c => c.DisplayOrder)
                .Select(c => new NeonColorViewModel
                {
                    Id = c.Id,
                    Name = c.Name,
                    HexCode = c.HexCode,
                    GlowCode = c.GlowCode,
                    DisplayOrder = c.DisplayOrder,
                    IsActive = c.IsActive
                })
                .ToListAsync();
        }

        public async Task<NeonColorViewModel> CreateColorAsync(NeonColorRequest request)
        {
            var color = new NeonColor
            {
                Name = request.Name,
                HexCode = request.HexCode,
                GlowCode = request.GlowCode,
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.NeonColors.Add(color);
            await _context.SaveChangesAsync();

            return new NeonColorViewModel
            {
                Id = color.Id,
                Name = color.Name,
                HexCode = color.HexCode,
                GlowCode = color.GlowCode,
                DisplayOrder = color.DisplayOrder,
                IsActive = color.IsActive
            };
        }

        public async Task<NeonColorViewModel> UpdateColorAsync(int id, NeonColorRequest request)
        {
            var color = await _context.NeonColors.FindAsync(id);
            if (color == null) throw new Exception("Color not found");

            color.Name = request.Name;
            color.HexCode = request.HexCode;
            color.GlowCode = request.GlowCode;
            color.DisplayOrder = request.DisplayOrder;
            color.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return new NeonColorViewModel
            {
                Id = color.Id,
                Name = color.Name,
                HexCode = color.HexCode,
                GlowCode = color.GlowCode,
                DisplayOrder = color.DisplayOrder,
                IsActive = color.IsActive
            };
        }

        public async Task DeleteColorAsync(int id)
        {
            var color = await _context.NeonColors.FindAsync(id);
            if (color != null)
            {
                _context.NeonColors.Remove(color);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<NeonBackgroundViewModel>> GetBackgroundsAsync()
        {
            return await _context.NeonBackgrounds
                .Where(b => b.IsActive)
                .OrderBy(b => b.DisplayOrder)
                .Select(b => new NeonBackgroundViewModel
                {
                    Id = b.Id,
                    Name = b.Name,
                    ImageUrl = b.ImageUrl,
                    DisplayOrder = b.DisplayOrder,
                    IsActive = b.IsActive
                })
                .ToListAsync();
        }

        public async Task<List<NeonBackgroundViewModel>> GetAllBackgroundsAsync()
        {
            return await _context.NeonBackgrounds
                .OrderBy(b => b.DisplayOrder)
                .Select(b => new NeonBackgroundViewModel
                {
                    Id = b.Id,
                    Name = b.Name,
                    ImageUrl = b.ImageUrl,
                    DisplayOrder = b.DisplayOrder,
                    IsActive = b.IsActive
                })
                .ToListAsync();
        }

        public async Task<NeonBackgroundViewModel> CreateBackgroundAsync(NeonBackgroundRequest request)
        {
            var background = new NeonBackground
            {
                Name = request.Name,
                ImageUrl = request.ImageUrl,
                DisplayOrder = request.DisplayOrder,
                IsActive = request.IsActive,
                CreatedAt = DateTimeOffset.UtcNow
            };

            _context.NeonBackgrounds.Add(background);
            await _context.SaveChangesAsync();

            return new NeonBackgroundViewModel
            {
                Id = background.Id,
                Name = background.Name,
                ImageUrl = background.ImageUrl,
                DisplayOrder = background.DisplayOrder,
                IsActive = background.IsActive
            };
        }

        public async Task<NeonBackgroundViewModel> UpdateBackgroundAsync(int id, NeonBackgroundRequest request)
        {
            var background = await _context.NeonBackgrounds.FindAsync(id);
            if (background == null) throw new Exception("Background not found");

            background.Name = request.Name;
            background.ImageUrl = request.ImageUrl;
            background.DisplayOrder = request.DisplayOrder;
            background.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return new NeonBackgroundViewModel
            {
                Id = background.Id,
                Name = background.Name,
                ImageUrl = background.ImageUrl,
                DisplayOrder = background.DisplayOrder,
                IsActive = background.IsActive
            };
        }

        public async Task DeleteBackgroundAsync(int id)
        {
            var background = await _context.NeonBackgrounds.FindAsync(id);
            if (background != null)
            {
                _context.NeonBackgrounds.Remove(background);
                await _context.SaveChangesAsync();
            }
        }
    }
}
