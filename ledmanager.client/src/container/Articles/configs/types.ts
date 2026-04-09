export interface IArticle {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  categoryId: number;
  categoryName?: string;
  authorId?: number;
  authorName?: string;
  createdDate: string;
}

export interface IArticleListRequest {
  pageIndex?: number;
  pageSize?: number;
  searchTerm?: string;
  categoryId?: number;
}
