using LedManager.Core.Repositories;
using LedManager.Domain.Entities.Content;
using LedManager.Infrastructure.Data;

namespace LedManager.Infrastructure.Repositories
{
    public class ArticleRepository : RepositoryBase<Article>, IArticleRepository
    {
        public ArticleRepository(ApplicationDbContext context) : base(context) { }
    }

    public class ArticleCategoryRepository : RepositoryBase<ArticleCategory>, IArticleCategoryRepository
    {
        public ArticleCategoryRepository(ApplicationDbContext context) : base(context) { }
    }

    public class BannerRepository : RepositoryBase<Banner>, IBannerRepository
    {
        public BannerRepository(ApplicationDbContext context) : base(context) { }
    }

    public class HomePageContentRepository : RepositoryBase<HomePageContent>, IHomePageContentRepository
    {
        public HomePageContentRepository(ApplicationDbContext context) : base(context) { }
    }
}
