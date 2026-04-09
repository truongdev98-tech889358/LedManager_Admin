using LedManager.Core.Repositories;
using LedManager.Domain.Entities.Catalog;
using LedManager.Infrastructure.Data;

namespace LedManager.Infrastructure.Repositories
{
    public class CategoryRepository : RepositoryBase<Category>, ICategoryRepository
    {
        public CategoryRepository(ApplicationDbContext context) : base(context) { }
    }

    public class ProductRepository : RepositoryBase<Product>, IProductRepository
    {
        public ProductRepository(ApplicationDbContext context) : base(context) { }
    }

    public class ProductImageRepository : RepositoryBase<ProductImage>, IProductImageRepository
    {
        public ProductImageRepository(ApplicationDbContext context) : base(context) { }
    }

    public class ProductVariantRepository : RepositoryBase<ProductVariant>, IProductVariantRepository
    {
        public ProductVariantRepository(ApplicationDbContext context) : base(context) { }
    }

    public class ProductAccordionRepository : RepositoryBase<ProductAccordion>, IProductAccordionRepository
    {
        public ProductAccordionRepository(ApplicationDbContext context) : base(context) { }
    }
}
