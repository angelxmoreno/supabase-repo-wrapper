/**
 * A function that receives a Supabase PostgrestFilterBuilder and returns a modified query.
 * The query parameter provides methods like eq(), neq(), gt(), gte(), lt(), lte(),
 * like(), ilike(), is(), in(), not(), or(), etc. for building filter conditions.
 *
 * @example
 * const filter: FilterFunction<User> = (query) => query.eq('status', 'active').gte('age', 18);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FilterFunction<T> = (query: any) => any;

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
