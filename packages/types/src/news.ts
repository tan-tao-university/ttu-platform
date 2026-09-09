export interface News {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail?: string;
  category: NewsCategory;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isFeatured: boolean;
  isPublished: boolean;
  viewCount: number;
}

export type NewsCategory =
  | "announcement"
  | "event"
  | "scholarship"
  | "research"
  | "student_life"
  | "admission"
  | "achievement";

export interface NewsFilter {
  category?: NewsCategory;
  tags?: string[];
  search?: string;
  isFeatured?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaginatedNews {
  items: News[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
