// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FilterFunction<T> = (query: any) => any;

export type OrderBy = {
    column: string;
    ascending?: boolean;
};

export type FindOptions<T> = {
    filter?: FilterFunction<T>;
    orderBy?: OrderBy | OrderBy[];
};

export type FindPaginatedOptions<T> = FindOptions<T> & {
    page: number;
    pageSize: number;
};

export type Pagination = {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
};

export type PaginatedResult<T> = {
    items: T[];
    pagination: Pagination;
};
