using System.Threading.Tasks;
using LedManager.Core.Models;

namespace LedManager.Core.Services
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<bool> RegisterAsync(RegisterRequest request);
    }
}
