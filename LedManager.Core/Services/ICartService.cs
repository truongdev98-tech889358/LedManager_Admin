using LedManager.Core.Models;

namespace LedManager.Core.Services
{
    public interface ICartService
    {
        Task<CartViewModel> GetCartAsync(string sessionId, int? userId = null);
        Task<CartItemViewModel> AddToCartAsync(string sessionId, AddToCartRequest request, int? userId = null);
        Task<CartItemViewModel> UpdateQuantityAsync(int cartItemId, int quantity, string sessionId);
        Task RemoveFromCartAsync(int cartItemId, string sessionId);
        Task ClearCartAsync(string sessionId, int? userId = null);
        Task<decimal> CalculatePriceAsync(string customConfig, bool isImageBased);
    }
}
