using LedManager.Domain.Entities.Catalog;

namespace LedManager.Core.Repositories
{
    public interface ICategoryRepository : IRepository<Category> { }
    public interface IProductRepository : IRepository<Product> { }
    public interface IProductImageRepository : IRepository<ProductImage> { }
    public interface IProductVariantRepository : IRepository<ProductVariant> { }
    public interface IProductAccordionRepository : IRepository<ProductAccordion> { }
}
