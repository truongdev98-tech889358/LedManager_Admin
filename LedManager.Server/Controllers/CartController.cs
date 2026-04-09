using LedManager.Core.Models;
using LedManager.Core.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LedManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<CartViewModel>> GetCart([FromQuery] string sessionId)
        {
            try
            {
                var cart = await _cartService.GetCartAsync(sessionId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<CartItemViewModel>> AddToCart(
            [FromBody] AddToCartRequest request,
            [FromQuery] string sessionId)
        {
            try
            {
                var cartItem = await _cartService.AddToCartAsync(sessionId, request);
                return Ok(cartItem);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}/quantity")]
        [AllowAnonymous]
        public async Task<ActionResult<CartItemViewModel>> UpdateQuantity(
            int id,
            [FromBody] UpdateCartItemRequest request,
            [FromQuery] string sessionId)
        {
            try
            {
                var cartItem = await _cartService.UpdateQuantityAsync(id, request.Quantity, sessionId);
                return Ok(cartItem);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> RemoveFromCart(int id, [FromQuery] string sessionId)
        {
            try
            {
                await _cartService.RemoveFromCartAsync(id, sessionId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete]
        [AllowAnonymous]
        public async Task<IActionResult> ClearCart([FromQuery] string sessionId)
        {
            try
            {
                await _cartService.ClearCartAsync(sessionId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
