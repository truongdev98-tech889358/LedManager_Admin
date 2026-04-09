using LedManager.Core.Models;
using LedManager.Core.Repositories;
using LedManager.Core.Services;
using LedManager.Domain.Entities.Catalog;
using LedManager.Domain.Entities.Sales;
using System.Text.Json;

namespace LedManager.Infrastructure.Services
{
    public class CartService : ICartService
    {
        private readonly ICartItemRepository _cartItemRepository;
        private readonly IProductRepository _productRepository;
        private readonly IProductVariantRepository _productVariantRepository;
        private readonly IProductAccordionRepository _productAccordionRepository;
        private readonly IFileService _fileService;

        public CartService(
            ICartItemRepository cartItemRepository,
            IProductRepository productRepository,
            IProductVariantRepository productVariantRepository,
            IProductAccordionRepository productAccordionRepository,
            IFileService fileService)
        {
            _cartItemRepository = cartItemRepository;
            _productRepository = productRepository;
            _productVariantRepository = productVariantRepository;
            _productAccordionRepository = productAccordionRepository;
            _fileService = fileService;
        }

        public async Task<CartViewModel> GetCartAsync(string sessionId, int? userId = null)
        {
            // Use QueryAsync from RepositoryBase
            var includes = "Product,Product.Images,Product.Variants";
            
            // Build filter
            System.Linq.Expressions.Expression<Func<CartItem, bool>> filter = c => c.SessionId == sessionId;
            if (userId.HasValue)
            {
                filter = c => c.UserId == userId.Value || c.SessionId == sessionId;
            }

            var cartItems = await _cartItemRepository.QueryAsync(
                filter: filter,
                orderBy: q => q.OrderByDescending(c => c.CreatedAt),
                includeProperties: includes
            );

            var items = cartItems.Select(c => new CartItemViewModel
            {
                Id = c.Id,
                ProductId = c.ProductId,
                ProductName = c.Product.Name,
                ProductSlug = c.Product.Slug,
                ProductSku = c.ProductVariant?.Label ?? c.Product.Slug,
                IsCustomNeon = c.Product.IsCustom,
                IsImageBased = c.Product.CustomConfig?.Contains("\"isImageBased\":true") ?? false,
                CustomConfig = c.CustomConfig ?? c.Product.CustomConfig, // Prefer item config, fallback to product config
                PreviewImageUrl = c.Product!.Images!.FirstOrDefault()?.Url,
                Quantity = c.Quantity,
                UnitPrice = c.ProductVariant?.Price ?? c.UnitPrice,
                TotalPrice = (c.ProductVariant?.Price ?? c.UnitPrice) * c.Quantity,
                CreatedAt = c.CreatedAt
            }).ToList();

            return new CartViewModel
            {
                Items = items,
                Subtotal = items.Sum(i => i.TotalPrice),
                TotalItems = items.Sum(i => i.Quantity)
            };
        }

        public async Task<CartItemViewModel> AddToCartAsync(string sessionId, AddToCartRequest request, int? userId = null)
        {
            int productId;
            int? productVariantId = null;
            decimal unitPrice;

            if (request.IsCustomNeon)
            {
                var customProduct = await CreateCustomProductAsync(request);
                productId = customProduct.Id;
                
                var variant = await _productVariantRepository.FirstOrDefaultAsync(v => v.ProductId == customProduct.Id);
                if (variant != null)
                {
                    productVariantId = variant.Id;
                    unitPrice = variant.Price;
                }
                else
                {
                    unitPrice = 0; 
                }
            }
            else
            {
                if (!request.ProductId.HasValue)
                    throw new ArgumentException("ProductId is required for catalog products");

                var product = await _productRepository.FirstOrDefaultAsync(p => p.Id == request.ProductId.Value);
                if (product == null)
                    throw new ArgumentException("Product not found");

                productId = product.Id;
                
                if (request.ProductVariantId.HasValue)
                {
                    var variant = await _productVariantRepository.FirstOrDefaultAsync(v => v.Id == request.ProductVariantId.Value);
                    if (variant != null)
                    {
                         productVariantId = variant.Id;
                         unitPrice = variant.Price;
                    }
                    else
                    {
                         unitPrice = 0; // Or throw error
                    }
                }
                else
                {
                    // Fallback to first variant
                    var variants = await _productVariantRepository.QueryAsync(v => v.ProductId == productId);
                    var variant = variants.FirstOrDefault();
                    
                    if (variant != null)
                    {
                        productVariantId = variant.Id;
                        unitPrice = variant.Price;
                    }
                    else 
                    {
                        unitPrice = 0; 
                    }
                }

                // Check for Outdoor Usage in CustomConfig
                if (!string.IsNullOrEmpty(request.CustomConfig))
                {
                    try
                    {
                        var config = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(request.CustomConfig);
                        if (config != null && config.ContainsKey("usage"))
                        {
                            var usage = config["usage"].GetString();
                            if (string.Equals(usage, "outdoor", StringComparison.OrdinalIgnoreCase))
                            {
                                unitPrice += product.OutdoorPriceUpgrade;
                            }
                        }
                    }
                    catch
                    {
                        // Ignore parsing errors, just don't add upgrade price
                    }
                }
            }

            var cartItem = new CartItem
            {
                SessionId = sessionId,
                UserId = userId,
                ProductId = productId,
                ProductVariantId = productVariantId, // Use the selected variant ID
                Quantity = request.Quantity,
                UnitPrice = unitPrice,
                CustomConfig = request.CustomConfig // Save the selected options
            };

            await _cartItemRepository.Add(cartItem);

            // Fetch to return view model
            var productRef = await _productRepository.FirstOrDefaultAsync(p => p.Id == productId, includeProperties: "Images");
            
            return new CartItemViewModel
            {
                Id = cartItem.Id,
                ProductId = productId,
                ProductName = productRef?.Name ?? "",
                ProductSlug = productRef?.Slug,
                ProductSku = productRef?.Slug,
                IsCustomNeon = request.IsCustomNeon,
                IsImageBased = request.IsImageBased,
                CustomConfig = request.CustomConfig,
                PreviewImageUrl = productRef?.Images!.FirstOrDefault()?.Url,
                Quantity = request.Quantity,
                UnitPrice = unitPrice,
                TotalPrice = unitPrice * request.Quantity,
                CreatedAt = cartItem.CreatedAt
            };
        }

        public async Task<CartItemViewModel> UpdateQuantityAsync(int cartItemId, int quantity, string sessionId)
        {
            if (quantity < 1 || quantity > 10)
                throw new ArgumentException("Quantity must be between 1 and 10");

            var cartItem = await _cartItemRepository.FirstOrDefaultAsync(
                c => c.Id == cartItemId && c.SessionId == sessionId,
                includeProperties: "Product,Product.Images,ProductVariant"
            );

            if (cartItem == null)
                throw new ArgumentException("Cart item not found");

            cartItem.Quantity = quantity;
            await _cartItemRepository.Update(cartItem);

            return new CartItemViewModel
            {
                Id = cartItem.Id,
                ProductId = cartItem.ProductId,
                ProductName = cartItem.Product.Name,
                ProductSlug = cartItem.Product.Slug,
                ProductSku = cartItem.ProductVariant?.Label ?? cartItem.Product.Slug,
                IsCustomNeon = cartItem.Product.IsCustom,
                IsImageBased = cartItem.Product.CustomConfig?.Contains("\"isImageBased\":true") ?? false,
                CustomConfig = cartItem.Product.CustomConfig,
                PreviewImageUrl = cartItem.Product.Images!.FirstOrDefault()?.Url,
                Quantity = cartItem.Quantity,
                UnitPrice = cartItem.ProductVariant?.Price ?? cartItem.UnitPrice,
                TotalPrice = (cartItem.ProductVariant?.Price ?? cartItem.UnitPrice) * cartItem.Quantity,
                CreatedAt = cartItem.CreatedAt
            };
        }

        public async Task RemoveFromCartAsync(int cartItemId, string sessionId)
        {
            var cartItem = await _cartItemRepository.FirstOrDefaultAsync(c => c.Id == cartItemId && c.SessionId == sessionId);

            if (cartItem == null)
                throw new ArgumentException("Cart item not found");

            await _cartItemRepository.Delete(cartItem);
        }

        public async Task ClearCartAsync(string sessionId, int? userId = null)
        {
            System.Linq.Expressions.Expression<Func<CartItem, bool>> filter = c => c.SessionId == sessionId;
            if (userId.HasValue)
            {
                filter = c => c.UserId == userId.Value || c.SessionId == sessionId;
            }

            var cartItems = await _cartItemRepository.QueryAsync(filter);
            foreach (var item in cartItems)
            {
                await _cartItemRepository.Delete(item);
            }
        }

        public Task<decimal> CalculatePriceAsync(string customConfig, bool isImageBased)
        {
            try
            {
                if (string.IsNullOrEmpty(customConfig)) return Task.FromResult(100m);
                
                var config = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(customConfig);
                if (config == null) return Task.FromResult(100m);

                decimal basePrice = 100;

                // 1. Size Multiplier
                decimal multiplier = 1;
                if (config.ContainsKey("isCustomSize") && config["isCustomSize"].GetBoolean())
                {
                    if (config.ContainsKey("customWidth"))
                    {
                        var width = config["customWidth"].GetDecimal();
                        multiplier = width / 31.5m;
                    }
                }
                else if (config.ContainsKey("sizeName"))
                {
                    var sizeName = config["sizeName"].GetString();
                    multiplier = sizeName switch
                    {
                        "Mini" => 0.8m,
                        "Small" => 1.0m,
                        "Midi" => 1.3m,
                        "Medium" => 1.6m,
                        "Large" => 2.0m,
                        "Extra Large" => 2.5m,
                        "Super Size" => 3.0m,
                        _ => 1.0m
                    };
                }
                basePrice *= multiplier;

                // 2. Text Length Factor
                if (!isImageBased && config.ContainsKey("text"))
                {
                    var text = config["text"].GetString() ?? "";
                    if (text.Length > 5)
                    {
                        basePrice += (decimal)(text.Length - 5) * 10m;
                    }
                }

                // 3. Option Modifiers
                if (config.ContainsKey("usage") && config["usage"].GetString() == "Outdoor")
                {
                    basePrice += 145m;
                }
                
                if (config.ContainsKey("backing") && config["backing"].GetString() == "Cut to Shape")
                {
                    basePrice += 35m;
                }

                if (config.ContainsKey("backboardColor"))
                {
                    var bColor = config["backboardColor"].GetString();
                    if (bColor != "Clear" && bColor != "White")
                    {
                        basePrice += 39m;
                    }
                }

                if (config.ContainsKey("remoteType"))
                {
                    var remote = config["remoteType"].GetString();
                    if (remote == "Entry Series (Mono)") basePrice += 45m;
                    else if (remote == "Pro Series (Mono)") basePrice += 65m;
                }

                return Task.FromResult(basePrice);
            }
            catch
            {
                return Task.FromResult(100m); // Default price
            }
        }

        private async Task<Product> CreateCustomProductAsync(AddToCartRequest request)
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var orderId = $"#{new Random().Next(1000, 9999)}";
            
            var product = new Product
            {
                Name = request.IsImageBased ? $"Custom Logo Neon - Order {orderId}" : $"Custom Neon Sign - Order {orderId}",
                Slug = request.IsImageBased ? $"CUSTOM-IMAGE-{timestamp}" : $"CUSTOM-TEXT-{timestamp}",
                Description = "Custom Neon Sign Configuration", 
                CustomConfig = request.CustomConfig,
                IsCustom = true,
                IsFeatured = false,
                StockQuantity = 1
            };

            // Calculate price
            var price = await CalculatePriceAsync(request.CustomConfig ?? "{}", request.IsImageBased);
            
            // Upload preview image if provided
            if (!string.IsNullOrEmpty(request.PreviewImageBase64))
            {
                try
                {
                    var imageBytes = Convert.FromBase64String(request.PreviewImageBase64.Split(',').Last());
                    var fileName = $"custom-neon-{timestamp}.png";
                    using var stream = new MemoryStream(imageBytes);
                    var imageUrl = await _fileService.SaveFileAsync(stream, fileName);
                    
                    product.Images = new List<ProductImage>
                    {
                        new ProductImage
                        {
                            Url = imageUrl,
                        }
                    };

                    product.Variants = new List<ProductVariant>()
                    {
                        new ProductVariant
                        {
                            Type = "Color",
                            Label = request.ColorName ?? "Default",
                            Price = price,
                            StockQuantity = 1,
                            ImageUrl = imageUrl,
                            Value = request.ColorCode ?? "Default"
                        }
                    };

                    // Create Accordion for Description
                    var description = FormatProductDescription(request.CustomConfig ?? "", request.IsImageBased);
                    var accordion = new ProductAccordion
                    {
                        ProductId = product.Id,
                        Title = "DESCRIPTION",
                        Content = description,
                        DisplayOrder = 1,
                        IsExpanded = true
                    };

                    product.Description = description;

                    product.Accordions = new List<ProductAccordion> { accordion };
                }
                catch (Exception ex)
                {
                    // Log error but continue
                    Console.WriteLine($"Error uploading preview image: {ex.Message}");
                }
            }

            // Save product query DB, commit=true
            await _productRepository.Add(product);
            
            return product;
        }

        private string FormatProductDescription(string customConfig, bool isImageBased)
        {
            try
            {
                if (string.IsNullOrEmpty(customConfig)) return "";

                var config = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(customConfig);
                if (config == null) return "Custom Neon Sign";

                var lines = new List<string>();

                // Text (for text-based only)
                if (!isImageBased && config.ContainsKey("text"))
                {
                    lines.Add($"<strong>Text:</strong> {config["text"].GetString()}");
                }

                // Text Align
                lines.Add("<strong>Text Align:</strong> Center");

                // Font
                if (config.ContainsKey("font"))
                {
                    var font = config["font"].GetString() ?? "Default";
                    font = font.Replace("var(--font-", "").Replace(")", "").Replace("-", " ");
                    font = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(font);
                    lines.Add($"<strong>Font:</strong> {font}");
                }

                // Dimensions
                if (config.ContainsKey("customWidth"))
                {
                    var width = config["customWidth"].GetDecimal();
                    lines.Add($"<strong>Dimensions:</strong> {width:F2}inch (W)");
                }

                lines.Add("<strong>Material:</strong> Small Business & Domestic");

                // Neon Colors
                if (config.ContainsKey("color"))
                {
                    var color = config["color"].GetString() ?? "Pink";
                    color = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(color);
                    lines.Add($"<strong>Neon Colors:</strong> {color}");
                }

                // Backboard
                if (config.ContainsKey("backing"))
                {
                    var backing = config["backing"].GetString() ?? "";
                    lines.Add($"<strong>Backboard:</strong> {System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(backing)}");
                }

                // Backboard Colour
                if (config.ContainsKey("backboardColor"))
                {
                    var bColor = config["backboardColor"].GetString() ?? "";
                     lines.Add($"<strong>Backboard Colour:</strong> {System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(bColor)}");
                }

                // Mounting
                if (config.ContainsKey("installation"))
                {
                     var install = config["installation"].GetString() ?? "";
                    lines.Add($"<strong>Mounting:</strong> {System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(install)}");
                }

                // Remote Type
                if (config.ContainsKey("remoteType"))
                {
                    lines.Add($"<strong>Remote Type:</strong> {config["remoteType"].GetString()}");
                }

                lines.Add("<strong>Plug Type:</strong> USA/CAN");

                // Power Cable
                if (config.ContainsKey("powerCableSide") && config.ContainsKey("powerCableLength"))
                {
                    lines.Add($"<strong>Power Cable:</strong> {config["powerCableSide"].GetString()}, {config["powerCableLength"].GetString()}");
                }

                // Neon Style (Image Only)
                if (config.ContainsKey("neonStyle"))
                {
                    var style = config["neonStyle"].GetString() ?? "Filled";
                    lines.Add($"<strong>Neon Style:</strong> {System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(style)}");
                }

                // Tubing Type (Image Only)
                if (config.ContainsKey("tubingType"))
                {
                    var tubing = config["tubingType"].GetString() ?? "Colored";
                    lines.Add($"<strong>Tubing Type:</strong> {System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(tubing)}");
                     // Dynamic Colored Jacket based on Tubing Type
                    lines.Add($"<strong>Colored Jacket:</strong> {(tubing == "colored" ? "Yes" : "No")}");
                }
                else
                {
                     // Default for Text or legacy
                     lines.Add("<strong>Colored Jacket:</strong> Yes");
                }

                // Background Option (Image Only)
                if (config.ContainsKey("backgroundOption"))
                {
                    var bgOpt = config["backgroundOption"].GetString();
                    var bgDisplay = bgOpt == "remove" ? "Removed" : "Original Kept";
                    lines.Add($"<strong>Background:</strong> {bgDisplay}");
                }

                // UV Print
                if (config.ContainsKey("uvPrint"))
                {
                    lines.Add($"<strong>UV Print:</strong> {(config["uvPrint"].GetBoolean() ? "Yes" : "No")}");
                }

                // Usage (Indoor/Outdoor)
                if (config.ContainsKey("usage"))
                {
                    lines.Add($"<strong>Usage:</strong> {config["usage"].GetString()}");
                }

                // Special Requests
                if (config.ContainsKey("specialRequests"))
                {
                    var requests = config["specialRequests"].GetString();
                    lines.Add($"<strong>Special Requests:</strong> {(string.IsNullOrEmpty(requests) ? "None" : requests)}");
                }

                return string.Join("<br>", lines);
            }
            catch
            {
                return "Custom Neon Sign";
            }
        }
    }
}
