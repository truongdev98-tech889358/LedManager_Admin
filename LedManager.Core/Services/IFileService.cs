using System.IO;
using System.Threading.Tasks;

namespace LedManager.Core.Services
{
    public interface IFileService
    {
        Task<string> SaveFileAsync(Stream fileStream, string fileName, string folderName = "uploads");
        Task DeleteFileAsync(string filePath);
    }
}
