import type { SupabaseClient } from '@supabase/supabase-js';
import type { FilterFunction, FindOptions, FindPaginatedOptions, OrderBy, PaginatedResult } from './types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class BaseRepository<T extends Record<string, any>> {
    protected readonly tableName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected readonly client: SupabaseClient<any, any, any>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(tableName: string, client: SupabaseClient<any, any, any>) {
        this.tableName = tableName;
        this.client = client;
    }

    public async get(id: string | number): Promise<T | null> {
        const { data, error } = await this.client.from(this.tableName).select().eq('id', id).single();

        if (error) {
            throw error;
        }

        return data as T;
    }

    public async find(options: FindOptions<T> = {}): Promise<T[]> {
        let query = this.client.from(this.tableName).select();

        if (options.filter) {
            query = options.filter(query);
        }

        if (options.orderBy) {
            const orderBy = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy];
            for (const order of orderBy) {
                query = query.order(order.column, { ascending: order.ascending ?? true });
            }
        }

        const { data, error } = await query;

        if (error) {
            throw error;
        }

        return data as T[];
    }

    public async findPaginated(options: FindPaginatedOptions<T>): Promise<PaginatedResult<T>> {
        const { page, pageSize, filter, orderBy } = options;
        const offset = (page - 1) * pageSize;

        const totalCount = await this.getTotalCount(filter);
        const totalPages = Math.ceil(totalCount / pageSize);
        const items = await this.getPaginatedData(offset, pageSize, filter, orderBy);

        return {
            items,
            pagination: {
                page,
                pageSize,
                totalCount,
                totalPages,
            },
        };
    }

    private async getTotalCount(filter?: FilterFunction<T>): Promise<number> {
        let countQuery = this.client.from(this.tableName).select('*', { count: 'exact', head: true });
        if (filter) {
            countQuery = filter(countQuery);
        }
        const { count, error: countError } = await countQuery;

        if (countError) {
            throw countError;
        }

        return count ?? 0;
    }

    private async getPaginatedData(
        offset: number,
        pageSize: number,
        filter?: FilterFunction<T>,
        orderBy?: OrderBy | OrderBy[]
    ): Promise<T[]> {
        let dataQuery = this.client
            .from(this.tableName)
            .select()
            .range(offset, offset + pageSize - 1);

        if (filter) {
            dataQuery = filter(dataQuery);
        }

        dataQuery = this.applyOrderBy(dataQuery, orderBy);

        const { data, error } = await dataQuery;

        if (error) {
            throw error;
        }

        return data as T[];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private applyOrderBy<Q extends { order(column: string, options: { ascending?: boolean }): Q }>(
        query: Q,
        orderBy?: OrderBy | OrderBy[]
    ): Q {
        if (!orderBy) {
            return query;
        }

        let result = query;
        const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
        for (const order of orderByArray) {
            result = result.order(order.column, { ascending: order.ascending ?? true });
        }
        return result;
    }

    public async create(data: Omit<T, 'id'>): Promise<T> {
        const { data: result, error } = await this.client.from(this.tableName).insert(data).select().single();

        if (error) {
            throw error;
        }

        return result as T;
    }

    public async update(id: string | number, data: Partial<Omit<T, 'id'>>): Promise<T> {
        const { data: result, error } = await this.client
            .from(this.tableName)
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return result as T;
    }

    public async delete(id: string | number): Promise<void> {
        const { error } = await this.client.from(this.tableName).delete().eq('id', id);

        if (error) {
            throw error;
        }
    }

    public async upsert(data: Partial<T>, conflictColumns: string[]): Promise<T> {
        const { data: result, error } = await this.client
            .from(this.tableName)
            .upsert(data, { onConflict: conflictColumns.join(',') })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return result as T;
    }

    public async exists(filter: FilterFunction<T>): Promise<boolean> {
        let query = this.client.from(this.tableName).select('id', { count: 'exact', head: true });
        query = filter(query);

        const { count, error } = await query;

        if (error) {
            throw error;
        }

        return (count ?? 0) > 0;
    }

    public async count(filter?: FilterFunction<T>): Promise<number> {
        let query = this.client.from(this.tableName).select('*', { count: 'exact', head: true });

        if (filter) {
            query = filter(query);
        }

        const { count, error } = await query;

        if (error) {
            throw error;
        }

        return count ?? 0;
    }

    public async createMany(records: Omit<T, 'id'>[]): Promise<T[]> {
        const { data, error } = await this.client.from(this.tableName).insert(records).select();

        if (error) {
            throw error;
        }

        return data as T[];
    }

    public async updateMany(records: ({ id: string | number } & Partial<T>)[]): Promise<T[]> {
        const results: T[] = [];

        for (const record of records) {
            const { id, ...updateData } = record;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updatedRecord = await this.update(id, updateData as any);
            results.push(updatedRecord);
        }

        return results;
    }

    public async deleteMany(ids: (string | number)[]): Promise<void> {
        const { error } = await this.client.from(this.tableName).delete().in('id', ids);

        if (error) {
            throw error;
        }
    }
}
