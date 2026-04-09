using System;
using System.IO;
using System.Threading.Tasks;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Hosting; // Cần package Microsoft.AspNetCore.Hosting.Abstractions hoặc Framework reference

namespace LedManager.Infrastructure.Services
{
    public class LocalFileService : IFileService
    {
        private readonly IWebHostEnvironment _env;

        public LocalFileService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string folderName = "uploads")
        {
            var webRootPath = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            
            // Tạo đường dẫn thư mục: wwwroot/uploads
            var uploadPath = Path.Combine(webRootPath, folderName);
            
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            // Tạo tên file duy nhất để tránh trùng
            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = Path.Combine(uploadPath, uniqueFileName);

            // Lưu file
            using (var fileOnlyStream = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(fileOnlyStream);
            }

            // Trả về đường dẫn tương đối để lưu vào DB (ví dụ: /uploads/abc.jpg)
            return $"/{folderName}/{uniqueFileName}";
        }

        public Task DeleteFileAsync(string filePath)
        {
            if (string.IsNullOrEmpty(filePath)) return Task.CompletedTask;

            var webRootPath = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            var fullPath = Path.Combine(webRootPath, filePath.TrimStart('/').Replace("/", "\\"));
            
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
            return Task.CompletedTask;
        }
    }
}
