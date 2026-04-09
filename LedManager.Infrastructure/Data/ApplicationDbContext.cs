using LedManager.Domain.Entities.Catalog;
using LedManager.Domain.Entities.CMS;
using LedManager.Domain.Entities.Content;
using LedManager.Domain.Entities.Sales;
using LedManager.Domain.Entities.System;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LedManager.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, Role, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Category> Categories { get; set; } = default!;
        public DbSet<Product> Products { get; set; } = default!;
        public DbSet<ProductCategory> ProductCategories { get; set; } = default!;
        public DbSet<ProductImage> ProductImages { get; set; } = default!;
        public DbSet<ProductSpecification> ProductSpecifications { get; set; } = default!;
        public DbSet<ProductVariant> ProductVariants { get; set; } = default!;
        public DbSet<ProductPackageItem> ProductPackageItems { get; set; } = default!;
        public DbSet<ProductContentBlock> ProductContentBlocks { get; set; } = default!;
        public DbSet<ProductAccordion> ProductAccordions { get; set; } = default!;
        public DbSet<Review> Reviews { get; set; } = default!;
        public DbSet<ReviewImage> ReviewImages { get; set; } = default!;
        public DbSet<NeonFont> NeonFonts { get; set; } = default!;
        public DbSet<NeonColor> NeonColors { get; set; } = default!;
        public DbSet<NeonBackground> NeonBackgrounds { get; set; } = default!;

        public DbSet<Order> Orders { get; set; } = default!;
        public DbSet<OrderItem> OrderItems { get; set; } = default!;
        public DbSet<CartItem> CartItems { get; set; } = default!;
        
        public DbSet<ArticleCategory> ArticleCategories { get; set; } = default!;
        public DbSet<Article> Articles { get; set; } = default!;
        public DbSet<ArticleSection> ArticleSections { get; set; } = default!;
        public DbSet<Banner> Banners { get; set; } = default!;
        public DbSet<ProductFeature> ProductFeatures { get; set; } = default!;

        public DbSet<Menu> Menus { get; set; } = default!;
        public DbSet<SystemConfig> SystemConfigs { get; set; } = default!;
        public DbSet<History> Histories { get; set; } = default!;
        public DbSet<NeonContent> NeonContents { get; set; } = default!;
        public DbSet<HomePageContent> HomePageContents { get; set; } = default!;
        
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Configure relationships and constraints

            // Product - Category (Many-to-Many via ProductCategory)
            builder.Entity<ProductCategory>()
                .HasKey(pc => new { pc.ProductId, pc.CategoryId });
// ... (omitted for brevity, just ensuring the replacement targets the top)

            // Article - Author (User)
            builder.Entity<Article>()
                .HasOne(a => a.Author)
                .WithMany()
                .HasForeignKey(a => a.AuthorId)
                .OnDelete(DeleteBehavior.SetNull);

            // Article - ArticleSections
            builder.Entity<ArticleSection>()
                .HasOne(s => s.Article)
                .WithMany(a => a.Sections)
                .HasForeignKey(s => s.ArticleId)
                .OnDelete(DeleteBehavior.Cascade);


            // Product - ProductContentBlock (One-to-Many)
            builder.Entity<ProductContentBlock>()
                .HasOne(cb => cb.Product)
                .WithMany(p => p.ContentBlocks)
                .HasForeignKey(cb => cb.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Product - ProductAccordion (One-to-Many)
            builder.Entity<ProductAccordion>()
                .HasOne(a => a.Product)
                .WithMany(p => p.Accordions)
                .HasForeignKey(a => a.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Menu Self-Referencing
            builder.Entity<Menu>()
                .HasOne(m => m.Parent)
                .WithMany(m => m.Children)
                .HasForeignKey(m => m.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Reviews
            builder.Entity<Review>()
                .HasOne(r => r.Product)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ReviewImage>()
                .HasOne(ri => ri.Review)
                .WithMany(r => r.Images)
                .HasForeignKey(ri => ri.ReviewId)
                .OnDelete(DeleteBehavior.Cascade);

            // PostgreSQL DateTime Configuration
            // Configure all DateTimeOffset properties to use timestamptz (timestamp with timezone)
            foreach (var entityType in builder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTimeOffset) || property.ClrType == typeof(DateTimeOffset?))
                    {
                        property.SetColumnType("timestamptz");
                    }
                    else if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                    {
                        property.SetColumnType("timestamp");
                    }
                }
            }
            }
    }
}
