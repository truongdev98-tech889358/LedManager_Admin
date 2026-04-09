using LedManager.Domain.Entities.Catalog;
using LedManager.Domain.Entities.Content;
using LedManager.Domain.Entities.Sales;
using LedManager.Domain.Entities.System;
using LedManager.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace LedManager.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static async Task InitializeAsync(IServiceProvider serviceProvider)
        {
            var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = serviceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<Role>>();

            // Apply any pending migrations
            await context.Database.MigrateAsync();

            // Seed Menus
            await SeedMenusAsync(context);

            // Seed Footer Menus
            await SeedFooterMenusAsync(context);

            // Seed Roles
            await SeedRolesAsync(roleManager);

            // Seed Users
            await SeedUsersAsync(userManager);

            // Seed Cloned Data from King Of Neons
            // TODO: Fix remaining products to use ProductCategories and variant pricing
            // await SeedClonedDataAsync(context);

            // Seed Banners (Idempotent)
            await SeedBannersAsync(context);

            // Seed Home Page Content
            await SeedHomePageContentAsync(context);

            // Seed Neon Options
            await SeedNeonOptionsAsync(context);

            // Look for any categories.
            if (context.Categories.Any())
            {
                return;   // DB has been seeded
            }

            // Seed Categories
            var categories = new Category[]
            {
                new Category { Name = "Màn hình LED trong nhà", Slug = "man-hinh-led-trong-nha", Description = "Các loại màn hình LED P2, P3, P4... dùng trong nhà", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "Màn hình LED ngoài trời", Slug = "man-hinh-led-ngoai-troi", Description = "Màn hình LED chịu nước, độ sáng cao P5, P6, P10...", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "Linh kiện LED", Slug = "linh-kien-led", Description = "Card điều khiển, nguồn, module LED", CreatedAt = DateTimeOffset.UtcNow }
            };

            context.Categories.AddRange(categories);
            await context.SaveChangesAsync();

            // Seed Products
            var indoorCat = context.Categories.First(c => c.Slug == "man-hinh-led-trong-nha");
            var outdoorCat = context.Categories.First(c => c.Slug == "man-hinh-led-ngoai-troi");

            var products = new Product[]
            {
                new Product
                {
                    Name = "Màn hình LED P2.5 Indoor",
                    Slug = "man-hinh-led-p2-5-indoor",
                    Description = "Màn hình LED P2.5 độ nét cao, phù hợp hội trường, phòng họp.",
                    Content = "<p>Thông số kỹ thuật chi tiết của màn hình LED P2.5...</p>",
                    StockQuantity = 100,
                    ProductCategories = new List<ProductCategory> { new ProductCategory { CategoryId = indoorCat.Id } },
                    CreatedAt = DateTimeOffset.UtcNow
                },
                new Product
                {
                    Name = "Màn hình LED P3 Indoor",
                    Slug = "man-hinh-led-p3-indoor",
                    Description = "Giải pháp hiển thị tối ưu chi phí cho không gian vừa và nhỏ.",
                    Content = "<p>Màn hình LED P3 là lựa chọn phổ biến...</p>",
                    StockQuantity = 50,
                    ProductCategories = new List<ProductCategory> { new ProductCategory { CategoryId = indoorCat.Id } },
                    CreatedAt = DateTimeOffset.UtcNow
                },
                new Product
                {
                    Name = "Màn hình LED P5 Outdoor",
                    Slug = "man-hinh-led-p5-outdoor",
                    Description = "Màn hình LED ngoài trời chống nước IP65, độ sáng cực cao.",
                    Content = "<p>Chuyên dụng cho quảng cáo ngoài trời...</p>",
                    StockQuantity = 30,
                    ProductCategories = new List<ProductCategory> { new ProductCategory { CategoryId = outdoorCat.Id } },
                    CreatedAt = DateTimeOffset.UtcNow
                }
            };

            context.Products.AddRange(products);
            await context.SaveChangesAsync();

            // Seed Variants for the products with pricing
            var p25 = products[0];
            var p3 = products[1];
            
            var variants = new List<ProductVariant>
            {
                new ProductVariant { ProductId = p25.Id, Type = "Size", Label = "30x20cm", Price = 15000000, OriginalPrice = 16000000, StockQuantity = 50 },
                new ProductVariant { ProductId = p25.Id, Type = "Size", Label = "40x30cm", Price = 15500000, OriginalPrice = 16500000, StockQuantity = 30 },
                new ProductVariant { ProductId = p25.Id, Type = "Color", Label = "Red", Price = 15000000, OriginalPrice = 16000000, StockQuantity = 40 },
                new ProductVariant { ProductId = p25.Id, Type = "Color", Label = "Blue", Price = 15000000, OriginalPrice = 16000000, StockQuantity = 40 },
                
                new ProductVariant { ProductId = p3.Id, Type = "Size", Label = "30x20cm", Price = 12000000, OriginalPrice = null, StockQuantity = 20 },
                new ProductVariant { ProductId = p3.Id, Type = "Color", Label = "Green", Price = 12000000, OriginalPrice = null, StockQuantity = 30 }
            };

            context.ProductVariants.AddRange(variants);
            await context.SaveChangesAsync();

            // Seed Article Categories
            var articleCats = new ArticleCategory[]
            {
                new ArticleCategory { Name = "Tin tức công nghệ", Slug = "tin-tuc-cong-nghe", Description = "Cập nhật xu hướng LED mới nhất", CreatedAt = DateTimeOffset.UtcNow },
                new ArticleCategory { Name = "Dự án tiêu biểu", Slug = "du-an-tieu-bieu", Description = "Các công trình đã thực hiện", CreatedAt = DateTimeOffset.UtcNow }
            };

            context.ArticleCategories.AddRange(articleCats);
            await context.SaveChangesAsync();

            // Seed Articles
            var newsCat = context.ArticleCategories.First(c => c.Slug == "tin-tuc-cong-nghe");
            var articles = new Article[]
            {
                new Article
                {
                    Title = "Xu hướng màn hình LED năm 2024",
                    Slug = "xu-huong-man-hinh-led-nam-2024",
                    Summary = "Công nghệ MicroLED dự kiến sẽ bùng nổ...",
                    Content = "<p>Nội dung chi tiết về xu hướng công nghệ...</p>",
                    CategoryId = newsCat.Id,
                    CreatedAt = DateTimeOffset.UtcNow,
                    ImageUrl = "/uploads/news-1.jpg"
                },
                 new Article
                {
                    Title = "Cách chọn màn hình LED phù hợp",
                    Slug = "cach-chon-man-hinh-led-phu-hop",
                    Summary = "Hướng dẫn lựa chọn pixel pitch dựa trên khoảng cách nhìn...",
                    Content = "<p>Để chọn màn hình LED phù hợp, bạn cần quan tâm...</p>",
                    CategoryId = newsCat.Id,
                    CreatedAt = DateTimeOffset.UtcNow,
                     ImageUrl = "/uploads/news-2.jpg"
                }
            };

            context.Articles.AddRange(articles);
            await context.SaveChangesAsync();

            // Seed Orders
            await SeedOrdersAsync(context);

            // Seed Histories
            await SeedHistoriesAsync(context);
        }

        private static async Task SeedMenusAsync(ApplicationDbContext context)
        {
            if (await context.Menus.AnyAsync()) return;

            var menus = new List<Menu>();
            var now = DateTimeOffset.UtcNow;

            // 1. Text to Neon Sign (Link)
            menus.Add(new Menu
            {
                Name = "Text to Neon Sign",
                Link = "/text-to-neon",
                SortOrder = 1,
                Type = MenuType.HeaderHorizontal,
                CreatedAt = now
            });

            // 2. Shop Neon Signs (Mega Menu)
            var shopMenu = new Menu
            {
                Name = "Shop Neon Signs",
                Link = "/collections/shop-all",
                SortOrder = 2,
                Type = MenuType.HeaderHorizontal,
                IsMegaMenu = true,
                CreatedAt = now,
                Children = new List<Menu>()
            };

            // 2.1 Neon Signs (Grid-4)
            var neonSigns = new Menu
            {
                Name = "Neon Signs",
                GridType = "grid-4",
                SortOrder = 1,
                Type = MenuType.HeaderHorizontal, // Submenu type isn't strictly defined but reusing HeaderHorizontal
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu { Name = "Trending now", Link = "#", ImageUrl = "/TRENDING-MM.webp", CreatedAt = now },
                    new Menu { Name = "Business", Link = "#", ImageUrl = "/BUSINESS-MM.webp", CreatedAt = now },
                    new Menu { Name = "Mini", Link = "#", ImageUrl = "/IMG_3527_1.webp", CreatedAt = now },
                    new Menu { Name = "Festivities", Link = "#", ImageUrl = "/FESTIVITIES-MM.webp", CreatedAt = now },
                    new Menu { Name = "HOME DECORS", Link = "#", ImageUrl = "/HOME_DECOR-MM.webp", CreatedAt = now },
                    new Menu { Name = "WEDDINGS", Link = "#", ImageUrl = "/wedding-mm.webp", CreatedAt = now },
                    new Menu { Name = "National geographic", Link = "#", ImageUrl = "/nat-geoMM.webp", CreatedAt = now },
                    new Menu { Name = "ART PIECES", Link = "#", ImageUrl = "/artpic-mm.webp", CreatedAt = now },
                    new Menu { Name = "POP CULTURE", Link = "#", ImageUrl = "/pop-culturemm.webp", CreatedAt = now },
                    new Menu { Name = "Man cave", Link = "#", ImageUrl = "/mancave-mm.webp", CreatedAt = now },
                    new Menu { Name = "sports", Link = "#", ImageUrl = "/game-mm.webp", CreatedAt = now },
                    new Menu { Name = "Discover more", Link = "/collections/all", CreatedAt = now } // Approx link
                }
            };
            shopMenu.Children.Add(neonSigns);

            // 2.2 Acrylic signs (Grid-2)
            var acrylicSigns = new Menu
            {
                Name = "Acrylic signs",
                GridType = "grid-2",
                SortOrder = 2,
                Type = MenuType.HeaderHorizontal,
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu { Name = "Neon Acrylic Backlit Sign", Link = "#", ImageUrl = "/YOUR-Logo-2025-acrylic-sample-logo-for-Menu.webp", CreatedAt = now },
                    new Menu { Name = "Non-lit Acrylic Letters", Link = "#", ImageUrl = "/shutterstock_2200000329.webp", CreatedAt = now },
                    new Menu { Name = "Get A Free Quote", Link = "/quote", CreatedAt = now }
                }
            };
            shopMenu.Children.Add(acrylicSigns);

            // 2.3 3D LETTER SIGNS (Grid-2)
            var letterSigns = new Menu
            {
                Name = "3D LETTER SIGNS",
                GridType = "grid-2",
                SortOrder = 3,
                Type = MenuType.HeaderHorizontal,
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu { Name = "Front / Face-lit Letters", Link = "#", ImageUrl = "/Front___Face-lit_Letters.avif", CreatedAt = now },
                    new Menu { Name = "Back / Halo-lit Letters", Link = "#", ImageUrl = "/Back___Halo-lit_Letters.avif", CreatedAt = now },
                    new Menu { Name = "Get A Free Quote", Link = "/quote", CreatedAt = now }
                }
            };
            shopMenu.Children.Add(letterSigns);

            // 2.4 Lightbox Signs (Grid-2)
            var lightboxSigns = new Menu
            {
                Name = "Lightbox Signs",
                GridType = "grid-2",
                SortOrder = 4,
                Type = MenuType.HeaderHorizontal,
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu { Name = "Single-sided Lightbox's", Link = "#", ImageUrl = "/Single-sided_Lightbox_s.avif", CreatedAt = now },
                    new Menu { Name = "Double-sided Lightbox's", Link = "#", ImageUrl = "/DOUBLE_SIDED_LIGHTBOX.avif", CreatedAt = now },
                    new Menu { Name = "Get A Free Quote", Link = "/quote", CreatedAt = now }
                }
            };
            shopMenu.Children.Add(lightboxSigns);
            menus.Add(shopMenu); // Add Shop Menu to root

            // 3. Learning Hub
            var hubMenu = new Menu
            {
                Name = "Learning Hub",
                SortOrder = 3,
                Type = MenuType.HeaderHorizontal,
                IsMegaMenu = true,
                CreatedAt = now,
                Children = new List<Menu>()
            };

            // 3.1 Learning Hub (Grid-2)
            var learnHubSub = new Menu
            {
                Name = "Learning Hub",
                GridType = "grid-2",
                SortOrder = 1,
                Type = MenuType.HeaderHorizontal,
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu { Name = "Price Guide", Link = "#", ImageUrl = "/Kings_Of_Neon_Quote_2.webp", CreatedAt = now },
                    new Menu { Name = "What Is LUMINEX™ Neon Technology?", Link = "#", ImageUrl = "/Kings_Of_Neon_Luminex_1.webp", CreatedAt = now },
                    new Menu { Name = "Visit the Learning Hub Page", Link = "/hub", CreatedAt = now }
                }
            };
            hubMenu.Children.Add(learnHubSub);

            // 3.2 Case Studies (Grid-4)
            var caseStudies = new Menu
            {
                Name = "Case Studies",
                GridType = "grid-4",
                SortOrder = 2,
                Type = MenuType.HeaderHorizontal,
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu { Name = "Weddings", Link = "#", ImageUrl = "/Wedding_KON.webp", CreatedAt = now },
                    new Menu { Name = "Tourism", Link = "#", ImageUrl = "/TOURISM.webp", CreatedAt = now },
                    new Menu { Name = "Small Businesses", Link = "#", ImageUrl = "/SMALL_BUSINESSES.webp", CreatedAt = now },
                    new Menu { Name = "Retail", Link = "#", ImageUrl = "/RETAIL.webp", CreatedAt = now },
                    new Menu { Name = "Podcast & Streaming", Link = "#", ImageUrl = "/PODCAST_STREAMING.webp", CreatedAt = now },
                    new Menu { Name = "Fitness & Gym", Link = "#", ImageUrl = "/FITNESS_GYMS_c62559e3-676b-46f9-8e0e-d3a7958c1266.webp", CreatedAt = now },
                    new Menu { Name = "Events", Link = "#", ImageUrl = "/EVENTS.webp", CreatedAt = now },
                    new Menu { Name = "Education & Training", Link = "#", ImageUrl = "/BEVERAGES_ALCOHOL_deb50a21-1a62-41d1-b7e4-fb749f7e6c1b.webp", CreatedAt = now },
                    new Menu { Name = "Corporate", Link = "#", ImageUrl = "/CORPORATE_8fc65bd6-8c1d-411c-a15d-dbc51fd86720.webp", CreatedAt = now },
                    new Menu { Name = "Cafe & Restaurants", Link = "#", ImageUrl = "/CAFES_RESTAURANTS_035db823-1ce1-41d0-9899-754e12f3dbb4.webp", CreatedAt = now },
                    new Menu { Name = "Beverage & Alcohol", Link = "#", ImageUrl = "/HAND-AND-DRINK-WHITE.webp", CreatedAt = now },
                    new Menu { Name = "Bars & Clubs", Link = "#", ImageUrl = "/bar.webp", CreatedAt = now },
                }
            };
            hubMenu.Children.Add(caseStudies);

            // 3.3 In Depth Guides (Grid-4)
            var guides = new Menu
            {
                Name = "In Depth Guides",
                GridType = "grid-4",
                SortOrder = 3,
                Type = MenuType.HeaderHorizontal,
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu { Name = "How Are Neon Signs Made", Link = "#", ImageUrl = "/Kings_Of_Neon_LED_Neon_Manufacturing_3_8ae20e42-9a63-4dbd-9b9b-826141224531.webp", CreatedAt = now },
                    new Menu { Name = "How to Make Neon Signs", Link = "#", ImageUrl = "/Kings_Of_Neon_Tradional_Glass_Neon_1.webp", CreatedAt = now },
                    new Menu { Name = "How Do Neon Signs Work", Link = "#", ImageUrl = "/Kings_Of_Neon_LED_Strip_2_a6dd963c-6935-4073-9aca-731115e3f178.webp", CreatedAt = now },
                    new Menu { Name = "Where to Buy Neon Signs", Link = "#", ImageUrl = "/Kings_Of_Neon_Online.webp", CreatedAt = now },
                    new Menu { Name = "What Is UV Print?", Link = "#", ImageUrl = "/Kings_Of_Neon_UV_Print_1.webp", CreatedAt = now },
                    new Menu { Name = "Why Power Adaptors Matter", Link = "#", ImageUrl = "/Kings_Of_Neon_Power_Adaptor_5jpg.webp", CreatedAt = now },
                    new Menu { Name = "How Long Do Neon Signs Last", Link = "#", ImageUrl = "/Kings_Of_Neon_Broken_Sign_2.webp", CreatedAt = now },
                    new Menu { Name = "Custom Neon Price Guide", Link = "#", ImageUrl = "/Kings_Of_Neon_Quote_2.webp", CreatedAt = now },
                    new Menu { Name = "How to Hang a Neon Sign", Link = "#", ImageUrl = "/Kings_Of_Neon_Sign_2_83ec90e5-2162-4032-bb54-eb44a2c8d80e.webp", CreatedAt = now },
                    new Menu { Name = "How to Wall Mount a Neon Sign", Link = "#", ImageUrl = "/Kings_Of_Neon_Sign_5.webp", CreatedAt = now },
                    new Menu { Name = "What is a Neon Sign Acrylic Backboard?", Link = "#", ImageUrl = "/Kings_Of_Neon_Acrylic_Backboard_1.webp", CreatedAt = now },
                    new Menu { Name = "What Is LUMINEX™ Neon Technology?", Link = "#", ImageUrl = "/Kings_Of_Neon_Luminex_1.webp", CreatedAt = now },
                }
            };
            hubMenu.Children.Add(guides);

            // 3.4 Reviews (Grid-2)
            var reviews = new Menu
            {
                Name = "Reviews",
                GridType = "grid-2",
                SortOrder = 4,
                Type = MenuType.HeaderHorizontal,
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu { Name = "Verified Product Purchases", Link = "#", ImageUrl = "/Kings_Of_Neon_Reviews.webp", CreatedAt = now },
                    new Menu { Name = "Google Service Reviews", Link = "#", ImageUrl = "/Kings_Of_Neon_Reviews_2.webp", CreatedAt = now },
                    new Menu { Name = "See all", Link = "/reviews", CreatedAt = now }
                }
            };
            hubMenu.Children.Add(reviews);
            menus.Add(hubMenu); // Add Learning Hub to root

            // 4. About
            var aboutMenu = new Menu
            {
                Name = "About",
                SortOrder = 4,
                Type = MenuType.HeaderHorizontal,
                IsMegaMenu = true,
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu
                    {
                        Name = "About us",
                        GridType = "grid-4",
                        SortOrder = 1,
                        Type = MenuType.HeaderHorizontal,
                        CreatedAt = now,
                        Children = new List<Menu> { /* Sub-items if any */ }
                    },
                    new Menu
                    {
                        Name = "Contact us",
                        GridType = "grid-4",
                        SortOrder = 2,
                        Type = MenuType.HeaderHorizontal,
                        CreatedAt = now,
                         Children = new List<Menu> { /* Sub-items if any */ }
                    }
                }
            };
            menus.Add(aboutMenu);

            await context.SaveChangesAsync();
        }

        private static async Task SeedFooterMenusAsync(ApplicationDbContext context)
        {
            if (await context.Menus.AnyAsync(m => m.Type == MenuType.Footer)) return;

            var now = DateTimeOffset.UtcNow;
            var footerMenus = new List<Menu>();

            // 1. Get in Touch
            var getInTouch = new Menu
            {
                Name = "Get in Touch",
                SortOrder = 1,
                Type = MenuType.Footer,
                CreatedAt = now,
                Link = "/contact",
                Children = new List<Menu>
                {
                    new Menu 
                    { 
                        Name = "USA Headquarters", 
                        Address = "400 S. 4th Street Suite 500, 89101, Las Vegas, United States",
                        PhoneNumber = "+1 702 905 1124",
                        Email = "support@kingsofneon.com",
                        Link = "#", 
                        SortOrder = 1, 
                        Type = MenuType.Footer, 
                        CreatedAt = now 
                    }
                }
            };
            footerMenus.Add(getInTouch);

            // 2. Our Products
            var ourProducts = new Menu
            {
                Name = "Our Products",
                SortOrder = 2,
                Type = MenuType.Footer,
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu { Name = "Upload Your Logo / Design", Link = "#", SortOrder = 1, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Neon Signs - Shop", Link = "#", SortOrder = 2, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Neon Signs - Custom Text", Link = "#", SortOrder = 3, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Neon Signs - Acrylic Backlit", Link = "#", SortOrder = 4, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "LED Back-Lit Signs", Link = "#", SortOrder = 5, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "LED Face-Lit Signs", Link = "#", SortOrder = 6, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "LED Lightbox Signs", Link = "#", SortOrder = 7, Type = MenuType.Footer, CreatedAt = now }
                }
            };
            footerMenus.Add(ourProducts);

            // 3. Case Studies
            var caseStudies = new Menu
            {
                Name = "Case Studies",
                SortOrder = 3,
                Type = MenuType.Footer,
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu { Name = "Small Business", Link = "#", SortOrder = 1, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Retail", Link = "#", SortOrder = 2, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Fitness & Gyms", Link = "#", SortOrder = 3, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Events", Link = "#", SortOrder = 4, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Cafes & Restaurants", Link = "#", SortOrder = 5, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Podcast & Streaming", Link = "#", SortOrder = 6, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Corporate", Link = "#", SortOrder = 7, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Tourism", Link = "#", SortOrder = 8, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Bar & Clubs", Link = "#", SortOrder = 9, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Education & Training", Link = "#", SortOrder = 10, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Weddings", Link = "#", SortOrder = 11, Type = MenuType.Footer, CreatedAt = now }
                }
            };
            footerMenus.Add(caseStudies);

            // 4. Resources
            var resources = new Menu
            {
                Name = "Resources",
                SortOrder = 4,
                Type = MenuType.Footer,
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu { Name = "Custom Neon Price Guide", Link = "#", SortOrder = 1, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "How to Hang a Neon Sign", Link = "#", SortOrder = 2, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "How to Wall Mount a Neon Sign", Link = "#", SortOrder = 3, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "How Are Neon Signs Made", Link = "#", SortOrder = 4, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Why Power Adaptors Matter", Link = "#", SortOrder = 5, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "How Long Do Neon Signs Last", Link = "#", SortOrder = 6, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "What is a Neon Sign Acrylic Backboard", Link = "#", SortOrder = 7, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "What Is Luminex™ LED Neon", Link = "#", SortOrder = 8, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Visit the Learning Hub Page", Link = "/hub", SortOrder = 9, Type = MenuType.Footer, CreatedAt = now }
                }
            };
            footerMenus.Add(resources);

            // 5. Support
            var support = new Menu
            {
                Name = "Support",
                SortOrder = 5,
                Type = MenuType.Footer,
                CreatedAt = now,
                Children = new List<Menu>
                {
                    new Menu { Name = "Contact Us", Link = "#", SortOrder = 1, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Shipping Policy", Link = "#", SortOrder = 2, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Refunds & Warranty", Link = "#", SortOrder = 3, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Privacy Policy", Link = "#", SortOrder = 4, Type = MenuType.Footer, CreatedAt = now },
                    // Sub-section Kings of Neon locations
                    new Menu { Name = "Kings of Neon AU", Link = "#", Icon = "/flag-au.svg", SortOrder = 5, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Kings of Neon NZ", Link = "#", Icon = "/flag-nz.svg", SortOrder = 6, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Kings of Neon USA", Link = "#", Icon = "/flag-us.svg", SortOrder = 7, Type = MenuType.Footer, CreatedAt = now },
                    new Menu { Name = "Kings of Neon UK", Link = "#", Icon = "/flag-uk.svg", SortOrder = 8, Type = MenuType.Footer, CreatedAt = now }
                }
            };
            footerMenus.Add(support);

            context.Menus.AddRange(footerMenus);
            await context.SaveChangesAsync();

            // 6. Footer Bottom Cities
            if (!await context.Menus.AnyAsync(m => m.Type == MenuType.FooterBottom))
            {
                var parent = new Menu
                {
                    Name = "Custom Signs USA Wide!",
                    Link = "#",
                    SortOrder = 1,
                    Type = MenuType.FooterBottom,
                    CreatedAt = now,
                    Children = new List<Menu>()
                };

                var cities = new List<string> { 
                    "Custom Signs NYC", "Custom Signs LA", "Custom Signs Chicago", 
                    "Custom Signs Vegas", "Custom Signs San Antonio", "Custom Signs San Diego", 
                    "Custom Signs Dallas", "Custom Signs Seattle", "Custom Signs Tampa" 
                };

                foreach (var (city, index) in cities.Select((c, i) => (c, i)))
                {
                    parent.Children.Add(new Menu
                    {
                        Name = city,
                        Link = "/collections/all",
                        SortOrder = index + 1,
                        Type = MenuType.FooterBottom,
                        CreatedAt = now
                    });
                }
                
                context.Menus.Add(parent);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedBannersAsync(ApplicationDbContext context)
        {
            if (!await context.Banners.AnyAsync(b => b.Title == "STAND OUT"))
            {
                context.Banners.Add(new Banner
                {
                    Title = "STAND OUT",
                    Description = "We give our customers a platform to bring their brands to life.",
                    ImageUrl = "/uploads/neon-hero-banner.jpg",
                    ButtonText = "DESIGN NEON SIGN",
                    ButtonLink = "/design-neon-sign",
                    ButtonText2 = "UPLOAD YOUR LOGO",
                    ButtonLink2 = "/upload-logo",
                    BannerType = "Hero",
                    TextPosition = "Center",
                    ShowOverlay = true,
                    Position = "Home",
                    IsActive = true,
                    SortOrder = 0,
                    CreatedAt = DateTimeOffset.UtcNow
                });
            }

            await context.SaveChangesAsync();
        }

        private static async Task SeedSystemConfigsAsync(ApplicationDbContext context)
        {
            if (await context.SystemConfigs.AnyAsync()) return;

            var configs = new List<SystemConfig>
            {
                new SystemConfig { ConfigKey = "FooterCopyright", ConfigValue = "Kings Of Neon® USA", Description = "Copyright text in footer" },
                new SystemConfig { ConfigKey = "FooterWebsiteBy", ConfigValue = "Kings Of Neon", Description = "Website by text in footer" },
                new SystemConfig { ConfigKey = "FooterPaymentIcons", ConfigValue = "pi-amazon,pi-american_express,pi-apple_pay,pi-diners_club,pi-discover,pi-google_pay,pi-master,pi-shopify_pay,pi-visa", Description = "Comma separated list of payment icon filenames" },
                new SystemConfig { ConfigKey = "FooterReviewBadges", ConfigValue = "/google-reviews.avif,/product-reviews.avif", Description = "Comma separated list of review badge image paths" },
                new SystemConfig { ConfigKey = "SitePhone", ConfigValue = "+1 702 905 1124", Description = "Main contact phone number" },
                new SystemConfig { ConfigKey = "SiteEmail", ConfigValue = "support@kingsofneon.com", Description = "Main support email" }
            };

            context.SystemConfigs.AddRange(configs);
            await context.SaveChangesAsync();
        }

        private static async Task SeedNeonOptionsAsync(ApplicationDbContext context)
        {
            if (!await context.NeonFonts.AnyAsync())
            {
                var fonts = new List<NeonFont>
                {
                    new NeonFont { Name = "Script", Value = "var(--font-great-vibes)", DisplayOrder = 1 },
                    new NeonFont { Name = "Block", Value = "var(--font-anton)", DisplayOrder = 2 },
                    new NeonFont { Name = "Rounded", Value = "var(--font-quicksand)", DisplayOrder = 3 },
                    new NeonFont { Name = "Classic", Value = "var(--font-courier-prime)", DisplayOrder = 4 },
                    new NeonFont { Name = "Handwritten", Value = "var(--font-pacifico)", DisplayOrder = 5 },
                    new NeonFont { Name = "Vintage", Value = "var(--font-lobster)", DisplayOrder = 6 },
                    new NeonFont { Name = "Tall", Value = "var(--font-bebas-neue)", DisplayOrder = 7 },
                    new NeonFont { Name = "Calligraphy", Value = "var(--font-dancing-script)", DisplayOrder = 8 },
                    new NeonFont { Name = "Marker", Value = "var(--font-caveat)", DisplayOrder = 9 },
                    new NeonFont { Name = "Sci-Fi", Value = "var(--font-orbitron)", DisplayOrder = 10 },
                    new NeonFont { Name = "Note", Value = "var(--font-shadows-into-light)", DisplayOrder = 11 },
                    new NeonFont { Name = "Code", Value = "var(--font-roboto-mono)", DisplayOrder = 12 },
                    new NeonFont { Name = "Brush", Value = "var(--font-satisfy)", DisplayOrder = 13 },
                    new NeonFont { Name = "Elegant", Value = "var(--font-allura)", DisplayOrder = 14 },
                    new NeonFont { Name = "Mono", Value = "var(--font-sacramento)", DisplayOrder = 15 },
                    new NeonFont { Name = "Sweet", Value = "var(--font-cookie)", DisplayOrder = 16 },
                    new NeonFont { Name = "Paris", Value = "var(--font-parisienne)", DisplayOrder = 17 },
                    new NeonFont { Name = "Retro", Value = "var(--font-righteous)", DisplayOrder = 18 },
                    new NeonFont { Name = "Arcade", Value = "var(--font-press-start-2p)", DisplayOrder = 19 },
                    new NeonFont { Name = "Graffiti", Value = "var(--font-permanent-marker)", DisplayOrder = 20 },
                    new NeonFont { Name = "Indie", Value = "var(--font-indie-flower)", DisplayOrder = 21 },
                    new NeonFont { Name = "Thin", Value = "var(--font-amatic-sc)", DisplayOrder = 22 },
                    new NeonFont { Name = "Royal", Value = "var(--font-cinzel)", DisplayOrder = 23 },
                    new NeonFont { Name = "Serif", Value = "var(--font-playfair-display)", DisplayOrder = 24 },
                    new NeonFont { Name = "Modern", Value = "var(--font-oswald)", DisplayOrder = 25 },
                    new NeonFont { Name = "Round", Value = "var(--font-comfortaa)", DisplayOrder = 26 },
                    new NeonFont { Name = "Bold", Value = "var(--font-fredoka)", DisplayOrder = 27 },
                    new NeonFont { Name = "Comic", Value = "var(--font-bangers)", DisplayOrder = 28 },
                    new NeonFont { Name = "BioRhyme Expanded", Value = "var(--font-biorhyme-expanded)", DisplayOrder = 29 },
                    new NeonFont { Name = "Josefin Slab", Value = "var(--font-josefin-slab)", DisplayOrder = 30 },
                    new NeonFont { Name = "Slackside One", Value = "var(--font-slackside-one)", DisplayOrder = 31 },
                    new NeonFont { Name = "Dawning", Value = "var(--font-dawning-of-a-new-day)", DisplayOrder = 32 },
                    new NeonFont { Name = "Monsieur", Value = "var(--font-monsieur-la-doulaise)", DisplayOrder = 33 },
                    new NeonFont { Name = "Petit Formal", Value = "var(--font-petit-formal-script)", DisplayOrder = 34 },
                    new NeonFont { Name = "Cedarville", Value = "var(--font-cedarville-cursive)", DisplayOrder = 35 },
                    new NeonFont { Name = "Mrs Saint", Value = "var(--font-mrs-saint-delafield)", DisplayOrder = 36 },
                    new NeonFont { Name = "Herr Von", Value = "var(--font-herr-von-muellerhoff)", DisplayOrder = 37 },
                    new NeonFont { Name = "Charm", Value = "var(--font-charm)", DisplayOrder = 38 },
                    new NeonFont { Name = "Borel", Value = "var(--font-borel)", DisplayOrder = 39 },
                    new NeonFont { Name = "Nanum Brush", Value = "var(--font-nanum-brush-script)", DisplayOrder = 40 },
                    new NeonFont { Name = "Nanum Pen", Value = "var(--font-nanum-pen-script)", DisplayOrder = 41 },
                    new NeonFont { Name = "Neucha", Value = "var(--font-neucha)", DisplayOrder = 42 },
                    new NeonFont { Name = "Tangerine", Value = "var(--font-tangerine)", DisplayOrder = 43 },
                    new NeonFont { Name = "Signika", Value = "var(--font-signika)", DisplayOrder = 44 },
                    new NeonFont { Name = "Montserrat", Value = "var(--font-montserrat)", DisplayOrder = 45 },
                    new NeonFont { Name = "Alex Brush", Value = "var(--font-alex-brush)", DisplayOrder = 46 },
                    new NeonFont { Name = "Zen Loop", Value = "var(--font-zen-loop)", DisplayOrder = 47 }
                };
                context.NeonFonts.AddRange(fonts);
            }

            if (!await context.NeonColors.AnyAsync())
            {
                var colors = new List<NeonColor>
                {
                    new NeonColor { Name = "Warm White", HexCode = "#FFFDD0", GlowCode = "#FFFDD0", DisplayOrder = 1 },
                    new NeonColor { Name = "Cool White", HexCode = "#F0F8FF", GlowCode = "#ADD8E6", DisplayOrder = 2 },
                    new NeonColor { Name = "Pink", HexCode = "#FF1493", GlowCode = "#FF69B4", DisplayOrder = 3 },
                    new NeonColor { Name = "Red", HexCode = "#FF0000", GlowCode = "#FF4500", DisplayOrder = 4 },
                    new NeonColor { Name = "Blue", HexCode = "#0000FF", GlowCode = "#1E90FF", DisplayOrder = 5 },
                    new NeonColor { Name = "Cyan", HexCode = "#00FFFF", GlowCode = "#E0FFFF", DisplayOrder = 6 },
                    new NeonColor { Name = "Green", HexCode = "#008000", GlowCode = "#32CD32", DisplayOrder = 7 },
                    new NeonColor { Name = "Yellow", HexCode = "#FFD700", GlowCode = "#FFFF00", DisplayOrder = 8 },
                    new NeonColor { Name = "Orange", HexCode = "#FFA500", GlowCode = "#FF8C00", DisplayOrder = 9 },
                    new NeonColor { Name = "Purple", HexCode = "#800080", GlowCode = "#DA70D6", DisplayOrder = 10 },
                    new NeonColor { Name = "Rainbow", HexCode = "rainbow", GlowCode = "rainbow", DisplayOrder = 11 }
                };
                context.NeonColors.AddRange(colors);
            }

            await context.SaveChangesAsync();
        }

        private static async Task SeedRolesAsync(RoleManager<Role> roleManager)
        {
            string[] roleNames = { "Admin", "Content", "Product", "User" };

            foreach (var roleName in roleNames)
            {
                var roleExist = await roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    await roleManager.CreateAsync(new Role { Name = roleName });
                }
            }
        }

        private static async Task SeedUsersAsync(UserManager<User> userManager)
        {
            // Seed Admin
            await EnsureUserAsync(userManager, "admin", "admin@ledmanager.com", "Admin@123", "Administrator", "Admin");

            // Seed Content Manager
            await EnsureUserAsync(userManager, "content", "content@ledmanager.com", "Content@123", "Content Manager", "Content");

            // Seed Product Manager
            await EnsureUserAsync(userManager, "product", "product@ledmanager.com", "Product@123", "Product Manager", "Product");

            // Seed Test User
            await EnsureUserAsync(userManager, "user", "user@ledmanager.com", "User@123", "Test User", "User");
        }

        private static async Task EnsureUserAsync(UserManager<User> userManager, string userName, string email, string password, string fullName, string role)
        {
            var user = await userManager.FindByEmailAsync(email);
            if (user == null)
            {
                var newUser = new User
                {
                    UserName = userName,
                    Email = email,
                    EmailConfirmed = true,
                    FullName = fullName,
                    Role = role
                };

                var result = await userManager.CreateAsync(newUser, password);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newUser, role);
                }
            }
            else
            {
                // Ensure existing user has the correct role
                if (!await userManager.IsInRoleAsync(user, role))
                {
                    await userManager.AddToRoleAsync(user, role);
                }
                user.Role = role; // Update string property too
                await userManager.UpdateAsync(user);
            }
        }

        private static async Task SeedOrdersAsync(ApplicationDbContext context)
        {
            var products = await context.Products.ToListAsync();
            if (!products.Any()) return;

            var orders = new List<Order>();
            var random = new Random();
            var now = DateTimeOffset.UtcNow;
            
            // Get starting index for order codes
            var existingCount = await context.Orders.CountAsync();

            for (int i = 0; i < 25; i++)
            {
                DateTimeOffset orderDate;
                if (i >= 20) // Guarantee 5 orders for today at the end (highest IDs)
                {
                    // Ensure it stays within today by going back at most current hour
                    int hoursBack = now.Hour > 0 ? random.Next(0, now.Hour) : 0;
                    orderDate = now.AddHours(-hoursBack).AddMinutes(-random.Next(0, 59));
                }
                else
                {
                    // Spread other 20 orders over last 14 days
                    orderDate = now.AddDays(-random.Next(1, 14)).AddHours(-random.Next(0, 23));
                }

                var order = new Order
                {
                    OrderCode = $"ORD-{3000 + existingCount + i}",
                    CustomerName = $"Customer {existingCount + i + 1}",
                    CustomerPhone = $"0900000{100 + existingCount + i}",
                    CustomerEmail = $"customer{existingCount + i + 1}@example.com",
                    CustomerAddress = $"{existingCount + i + 1} Main St, City",
                    Status = random.Next(1, 10) > 2 ? OrderStatus.Delivered : OrderStatus.Cancelled,
                    CreatedAt = orderDate,
                    OrderItems = new List<OrderItem>()
                };

                // Add 1-3 items per order
                int itemCount = random.Next(1, 4);
                decimal totalAmount = 0;

                for (int j = 0; j < itemCount; j++)
                {
                    var product = products[random.Next(products.Count)];
                    // Get price from first variant (products now have variant-based pricing)
                    var productPrice = await context.ProductVariants
                        .Where(v => v.ProductId == product.Id)
                        .Select(v => v.Price)
                        .FirstOrDefaultAsync();
                    
                    // Fallback to a default price if no variants exist
                    if (productPrice == 0) productPrice = 100000; // Default price
                    
                    var item = new OrderItem
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        Quantity = random.Next(1, 4),
                        Price = productPrice,
                        CreatedAt = orderDate
                    };
                    order.OrderItems.Add(item);
                    totalAmount += item.Quantity * item.Price;
                }

                order.TotalAmount = totalAmount;
                orders.Add(order);
            }

            context.Orders.AddRange(orders);
            await context.SaveChangesAsync();
        }

        private static async Task SeedHistoriesAsync(ApplicationDbContext context)
        {
            if (context.Histories.Any()) return;

            var orders = await context.Orders.ToListAsync();
            var histories = new List<History>();

            foreach (var order in orders)
            {
                // Creation log
                histories.Add(new History
                {
                    EntityType = HistoryType.Order,
                    EntityId = order.Id,
                    Description = "Đã tạo đơn hàng", // Order created
                    PerformedBy = "System",
                    ActionType = "CREATED",
                    CreatedAt = order.CreatedAt
                });

                // Conditional status change log if not Pending (0)
                if (order.Status != OrderStatus.Pending)
                {
                    histories.Add(new History
                    {
                        EntityType = HistoryType.Order,
                        EntityId = order.Id,
                        Description = $"Đã thay đổi trạng thái sang {order.Status}",
                        PerformedBy = "Admin",
                        ActionType = "STATUS_CHANGE",
                        CreatedAt = order.CreatedAt.AddHours(1)
                    });
                }
            }

            context.Histories.AddRange(histories);
            await context.SaveChangesAsync();
        }
        private static async Task SeedClonedDataAsync(ApplicationDbContext context)
        {
            if (await context.Products.AnyAsync(p => p.Name == "BASKETBALL JUMP LED NEON SIGN")) return;

            // 1. Seed Categories
            var categories = new List<Category>
            {
                new Category { Name = "TRENDING NOW", Slug = "trending-now", Description = "Most popular neon signs", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "BUSINESS", Slug = "business", Description = "Signs for businesses", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "MINI", Slug = "mini", Description = "Small neon signs", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "WEDDINGS", Slug = "weddings", Description = "Wedding decoration signs", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "HOME DECOR", Slug = "home-decor", Description = "Decorate your home", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "FESTIVITIES", Slug = "festivities", Description = "Party and events", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "NATIONAL GEOGRAPHIC", Slug = "national-geographic", Description = "Nat Geo collection", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "POP CULTURE", Slug = "pop-culture", Description = "Pop culture references", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "ART PIECES", Slug = "art-pieces", Description = "Artistic neon designs", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "MAN CAVE", Slug = "man-cave", Description = "For the man cave", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "SPORTS & GAMING", Slug = "sports-gaming", Description = "Sports and gaming themes", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "COUNTRY COLLECTION", Slug = "country-collection", Description = "Country themed signs", CreatedAt = DateTimeOffset.UtcNow },
                new Category { Name = "SHOP NEON SIGNS", Slug = "shop-neon-signs", Description = "General shop", CreatedAt = DateTimeOffset.UtcNow }
            };

            foreach (var cat in categories)
            {
                if (!await context.Categories.AnyAsync(c => c.Slug == cat.Slug))
                {
                    context.Categories.Add(cat);
                }
            }
            await context.SaveChangesAsync();

            // 2. Get reference to a category for products (using 'SHOP NEON SIGNS' as default or specific if applicable)
            var generalCat = await context.Categories.FirstAsync(c => c.Slug == "shop-neon-signs");
            var sportsCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "sports-gaming") ?? generalCat;
            var artCat = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "art-pieces") ?? generalCat;

            // 3. Seed Products
            var products = new List<Product>
            {
                new Product
                {
                    Name = "BASKETBALL JUMP LED NEON SIGN",
                    Slug = "basketball-jump-led-neon-sign",
                    Description = "Energize your space with this dynamic basketball jump neon sign.",
                    Content = "<p>Perfect for sports bars, bedrooms, or game rooms.</p>",
                    StockQuantity = 50,
                    ProductCategories = new List<ProductCategory> { new ProductCategory { CategoryId = sportsCat.Id } },
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/BASKETBALL-V2-HOTPINK_5cd79017-6e0f-4773-a67e-14be2834958b.jpg?v=1632382413&width=800", IsPrimary = true } },
                    Variants = new List<ProductVariant> { new ProductVariant { Type = "Size", Label = "Standard", Price = 349.00m, OriginalPrice = null, StockQuantity = 50 } }
                },
                new Product
                {
                    Name = "LIVE MUSIC LED NEON SIGN",
                    Slug = "live-music-led-neon-sign",
                    Description = "Let everyone know where the music is happening.",
                    Content = "<p>Great for venues, home studios, or living rooms.</p>",
                    StockQuantity = 100,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/LIVE-MUSIC-GREEN.jpg?v=1655696270&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "ON AIR LED NEON SIGN",
                    Slug = "on-air-led-neon-sign",
                    Description = "Classic ON AIR sign for your studio or streaming setup.",
                    Content = "<p>A must-have for podcasters and streamers.</p>",
                    StockQuantity = 75,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/ON-AIR-RED.jpg?v=1655696329&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "BATMAN V2 LED NEON SIGN",
                    Slug = "batman-v2-led-neon-sign",
                    Description = "The Dark Knight symbol in vibrant neon.",
                    Content = "<p>For the ultimate fan cave.</p>",
                    StockQuantity = 40,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/BATMAN-V2-PURPLE.jpg?v=1655783056&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "OPEN LED NEON SIGN",
                    Slug = "open-led-neon-sign",
                    Description = "Bright and inviting OPEN sign for any business.",
                    Content = "<p>Attract more customers with high visibility.</p>",
                    StockQuantity = 200,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/OPEN-HOTPINK_dca4391f-c0ec-47d9-9d98-47ca1283ab0b.jpg?v=1632321723&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "MERRY CHRISTMAS V2 LED NEON SIGN",
                    Slug = "merry-christmas-v2-led-neon-sign",
                    Description = "Festive cheer with a glowing Merry Christmas sign.",
                    Content = "<p>Seasonal decoration that stands out.</p>",
                    StockQuantity = 60,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/MERRY-CHRISTMAS-V2-YELLOW.jpg?v=1655697651&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "STAR WARS LED NEON SIGN",
                    Slug = "star-wars-led-neon-sign",
                    Description = "Iconic Star Wars logo neon sign.",
                    Content = "<p>May the force be with your decor.</p>",
                    StockQuantity = 30,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/STAR-WARS-HOTPINK.jpg?v=1632333783&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "SAXOPHONE LED NEON SIGN",
                    Slug = "saxophone-led-neon-sign",
                    Description = "Smooth jazz vibes with this Saxophone neon.",
                    Content = "<p>Ideal for music lovers and jazz clubs.</p>",
                    StockQuantity = 15,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/SAXOPHONE-ORANGE.jpg?v=1655696156&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "GOOD VIBES ONLY V2 LED NEON SIGN",
                    Slug = "good-vibes-only-v2-led-neon-sign",
                    Description = "Spread positivity with Good Vibes Only.",
                    Content = "<p>A popular choice for bedrooms and social spaces.</p>",
                    StockQuantity = 120,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/GOOD-VIBES-ONLY-LIGHTBLUE_9fbf24fb-f8f1-46c1-9cb2-24a6d739ee6b.jpg?v=1655687388&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "WAVE AND SUN LED NEON SIGN",
                    Slug = "wave-and-sun-led-neon-sign",
                    Description = "Chill beach vibes with Wave and Sun.",
                    Content = "<p>Relaxing decor for any room.</p>",
                    StockQuantity = 45,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/WAVE-V1-BLUE.jpg?v=1655699520&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "THIS MUST BE THE PLACE LED NEON SIGN",
                    Slug = "this-must-be-the-place-led-neon-sign",
                    Description = "Make a statement with This Must Be The Place.",
                    Content = "<p>Iconic phrase for home entryways or businesses.</p>",
                    StockQuantity = 25,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/THIS-MUST-BE-THE-PLACE-ORANGE.jpg?v=1655696973&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "CROWN V1 LED NEON SIGN",
                    Slug = "crown-v1-led-neon-sign",
                    Description = "Royal vibes with this Crown neon sign.",
                    Content = "<p>Fit for a king or queen.</p>",
                    StockQuantity = 55,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/CROWN-V1-ORANGE.jpg?v=1655699637&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "LET'S GET NAKED! LED NEON SIGN",
                    Slug = "lets-get-naked-led-neon-sign",
                    Description = "Cheeky and fun Let's Get Naked sign.",
                    Content = "<p>A bold statement piece.</p>",
                    StockQuantity = 80,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/LET_S-GET-NAKED_-HOTPINK.jpg?v=1632372826&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "007 LED NEON SIGN",
                    Slug = "007-led-neon-sign",
                    Description = "Secret agent style 007 logo.",
                    Content = "<p>For fans of the franchise.</p>",
                    StockQuantity = 10,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/007-HOTPINK.jpg?v=1632332354&width=800", IsPrimary = true } }
                },
                new Product
                {
                    Name = "MUSIC SOUNDS BETTER WITH YOU LED NEON SIGN",
                    Slug = "music-sounds-better-with-you-led-neon-sign",
                    Description = "Romantic and musical sentiment.",
                    Content = "<p>Perfect for shared spaces.</p>",
                    StockQuantity = 5,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Images = new List<ProductImage> { new ProductImage { Url = "https://www.kingsofneon.com/cdn/shop/products/MUSIC-SOUNDS-BETTER-WITH-YOU-YELLOW.jpg?v=1655696447&width=800", IsPrimary = true } }
                }
            };

            context.Products.AddRange(products);
            await context.SaveChangesAsync();
        }

        private static async Task SeedHomePageContentAsync(ApplicationDbContext context)
        {
            if (await context.HomePageContents.AnyAsync()) return;

            var homePageContent = new HomePageContent
            {
                // SEO Metadata
                MetaTitle = "Custom Neon Signs LED - Design Your Own Neon Sign Online",
                MetaDescription = "Create custom LED neon signs online. Fast 7-day turnaround, premium quality, free design mockups. Perfect for business, home decor, weddings & events.",
                MetaKeywords = "custom neon signs, LED neon signs, personalized neon, neon sign maker, business signage, wedding neon signs",
                OgImage = "/og-image-home.jpg",

                // Hero Section
                HeroTitle = "STAND OUT",
                HeroSubtitle = "Create Your Custom Neon Sign",
                HeroDescription = "We give our customers a platform to bring their brands to life with premium LED neon signs.",

                // About Section
                AboutTitle = "Why Choose Custom Neon Signs?",
                AboutDescription = "Transform any space with our premium LED neon signs. From business branding to home decor, our custom neon signs are crafted with precision and designed to last. With over 1,000+ satisfied customers and a 4.9★ rating, we deliver quality you can trust.",
                AboutImage = "/about-neon-signs.jpg",

                // Features Section
                FeaturesTitle = "Premium Quality Features",
                FeaturesDescription = "What makes our neon signs stand out",
                FeaturesJson = System.Text.Json.JsonSerializer.Serialize(new[]
                {
                    new { title = "7-Day Turnaround", description = "Fast production and delivery without compromising quality", icon = "⚡" },
                    new { title = "Free 3D Mockups", description = "See your design come to life before you order", icon = "🎨" },
                    new { title = "Energy Efficient", description = "LED technology uses 80% less energy than traditional neon", icon = "💡" },
                    new { title = "Lifetime Warranty", description = "We stand behind our products with comprehensive coverage", icon = "🛡️" },
                    new { title = "Custom Designs", description = "Upload your logo or create from scratch", icon = "✨" },
                    new { title = "Expert Support", description = "Design consultants available 24/7", icon = "👥" }
                }),

                // FAQ Section - Part 1: General Questions
                FaqPart1Title = "General Questions",
                FaqPart1Description = "Common questions about our neon signs",
                FaqPart1Json = System.Text.Json.JsonSerializer.Serialize(new[]
                {
                    new { question = "How long do LED neon signs last?", answer = "Our LED neon signs are built to last 50,000+ hours (approximately 10+ years with normal use). They're much more durable than traditional glass neon." },
                    new { question = "Are your neon signs safe for indoor use?", answer = "Absolutely! Our LED neon signs operate at low voltage (12V), produce minimal heat, and are completely safe for indoor use in homes, offices, and businesses." },
                    new { question = "Can I use my neon sign outdoors?", answer = "Yes! We offer outdoor-rated neon signs with IP65 waterproof rating. Just select the 'outdoor use' option when customizing your sign." },
                    new { question = "How much do custom neon signs cost?", answer = "Prices vary based on size, complexity, and features. Most custom signs range from $150-$800. Use our online designer for an instant quote!" },
                    new { question = "Do you ship internationally?", answer = "Yes, we ship worldwide! Shipping times vary by location, typically 7-14 days for international orders." }
                }),

                // FAQ Section - Part 2: Technical & Installation
                FaqPart2Title = "Technical & Installation",
                FaqPart2Description = "Questions about installation and technical specifications",
                FaqPart2Json = System.Text.Json.JsonSerializer.Serialize(new[]
                {
                    new { question = "How do I install my neon sign?", answer = "Installation is easy! Each sign comes with pre-drilled holes, mounting hardware, and clear instructions. Most customers install their signs in under 10 minutes." },
                    new { question = "What power source do I need?", answer = "All our signs come with a UL-certified power adapter. Simply plug into any standard wall outlet (110V-240V compatible)." },
                    new { question = "Can I dim my neon sign?", answer = "Yes! Most of our signs include a dimmer switch, allowing you to adjust brightness to your preference." },
                    new { question = "What if my sign arrives damaged?", answer = "We package all signs with premium protective materials. In the rare case of damage, we offer free replacements within 30 days of delivery." },
                    new { question = "Can I change the design after ordering?", answer = "Design changes can be made within 24 hours of ordering. After production begins, changes may incur additional fees." }
                }),

                // Trust Brands Section
                TrustBrandsTitle = "Trusted by Leading Brands",
                TrustBrandsDescription = "We are trusted by the world's leading brands",
                TrustBrandsJson = System.Text.Json.JsonSerializer.Serialize(new[]
                {
                    new { name = "McDonald's", logo = "/MC_DONALDS.webp" },
                    new { name = "Pinterest", logo = "/PINTEREST.webp" },
                    new { name = "TikTok", logo = "/TIKTOK.webp" },
                    new { name = "Red Hot", logo = "/RED_HOT.webp" },
                    new { name = "Twitter", logo = "/TWITTER_82714d1c-fc28-44d1-bc52-af4df111c805.webp" },
                    new { name = "BMW", logo = "/BMW.webp" },
                    new { name = "Fender", logo = "/FENDER_bb7c792c-ac79-428c-a257-3e5da419023a.webp" }
                }),

                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow
            };

            context.HomePageContents.Add(homePageContent);
            await context.SaveChangesAsync();
        }
    }
}
