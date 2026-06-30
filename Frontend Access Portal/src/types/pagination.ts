export type PaginationType = {
  page: number; // Current page number (0-based index)
  size: number; // Number of items per page
  totalElements?: number; // Total number of items across all pages
  totalPages?: number; // Total number of pages
};

export type PaginatedSpringData<T> = {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { unsorted: boolean; sorted: boolean; empty: boolean };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: { unsorted: boolean; sorted: boolean; empty: boolean };
  first: boolean;
  empty: boolean;
};
