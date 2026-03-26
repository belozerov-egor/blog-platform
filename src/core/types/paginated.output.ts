export type QueryOutput = {
  pagesCount: number;
  pageSize: number;
  totalCount: number;
  page: number;
};

export type PaginatedOutput<T> = QueryOutput & {
  data: T;
};
