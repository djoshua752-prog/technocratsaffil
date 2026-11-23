export interface ProductCatalogItem {
  id: string;
  name: string;
  group: string;
  link: string;
  image: string;
  featured?: { subtitle: string; title: string; title2: string; description: string };
  categoryCard?: { rank?: number; title: string; subTitle: string; badge: string; bgColor: string };
  trending?: false | { rank?: number; name?: string; category?: string; badge?: string; imageSize?: string; nameLines?: number };
  weekly?: { rank?: number; name?: string; rightImage?: string; background: string };
}

export const productCatalog: ProductCatalogItem[];
export const featuredProducts: (NonNullable<ProductCatalogItem["featured"]> & { id: string; img: string; link: string })[];
export const categoryProducts: (NonNullable<ProductCatalogItem["categoryCard"]> & { id: string; image: string; link: string })[];
export const trendingProducts: { id: string; name: string; img: string; link: string; category: string; badge: string; imageSize?: string; nameLines: number }[];
export const weeklyDeals: { name: string; link: string; leftImage: string; rightImage: string; background: string }[];
export function productReviewUrl(productId: string): string;
