type BasePaginationMeta = {
  per_page: number;
  total_items: number;
  has_next_page: boolean;
  has_previous_page: boolean;
};

export type PagePaginationMeta = BasePaginationMeta & {
  page: number;
  total_pages: number;
};

export type CursorPaginationMeta = BasePaginationMeta & {
  next_cursor: string;
  previous_cursor: string;
};
