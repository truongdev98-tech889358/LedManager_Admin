export interface IProductImage {
  id: number;
  url?: string;
  isPrimary: boolean;
  productId: number;
}

export interface IProductSpecification {
  id?: number;
  productId?: number;
  key: string;
  value: string;
  displayOrder: number;
}

export interface ICategory {
  id: number;
  name: string;
  slug?: string;
}

export interface IProductVariant {
  id?: number;
  productId?: number;
  type: string; // e.g., "Size", "Color"
  label: string; // e.g., "Small", "Pink"
  value?: string; // e.g., "29.53 in x 27.95 in", "#FFC0CB"
  price: number; // Absolute price for this variant
  originalPrice?: number; // Sale price support
  stockQuantity: number;
  imageUrl?: string;
  // Computed
  isOnSale?: boolean;
  discountPercentage?: number;
}

export interface IPackageInclude {
  id?: number;
  productId?: number;
  itemName: string;
  quantity: number;
}

export interface IProductContentBlock {
  id?: number;
  title: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  displayOrder: number;
}

export interface IProductAccordion {
  id?: number;
  title: string;
  content?: string;
  displayOrder: number;
  isExpanded?: boolean;
}

export interface IProduct {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  content?: string;
  stockQuantity?: number; // Auto-calculated from variants
  usageSupport?: string;
  outdoorPriceUpgrade?: number;
  isFeatured?: boolean;
  categoryIds?: number[]; // Multiple categories
  categories?: ICategory[];
  images?: IProductImage[];
  specifications?: IProductSpecification[];
  variants?: IProductVariant[];
  packageIncludes?: IPackageInclude[];
  contentBlocks?: IProductContentBlock[];
  accordions?: IProductAccordion[];
  // Computed from variants
  minPrice?: number;
  maxPrice?: number;
  isOnSale?: boolean;
  discountPercentage?: number;
}

export interface IProductListRequest {
  pageIndex?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
}
