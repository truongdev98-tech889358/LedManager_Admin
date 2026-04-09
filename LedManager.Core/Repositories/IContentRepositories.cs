using LedManager.Domain.Entities.Content;

namespace LedManager.Core.Repositories
{
    public interface IArticleRepository : IRepository<Article> { }
    public interface IArticleCategoryRepository : IRepository<ArticleCategory> { }
    public interface IBannerRepository : IRepository<Banner> { }
    public interface IHomePageContentRepository : IRepository<HomePageContent> { }
}
