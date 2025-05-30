// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FilterFunction<T = any> = (query: any) => any;

export interface OrderBy {
    column: string;
    ascending?: boolean;
}

export interface FindOptions<T> {
    filter?: FilterFunction<T>;
    orderBy?: OrderBy | OrderBy[];
}

export type FindPaginatedOptions<T> = FindOptions<T> & {
    page: number;
    pageSize: number;
};

export interface Pagination {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface PaginatedResult<T> {
    items: T[];
    pagination: Pagination;
}
