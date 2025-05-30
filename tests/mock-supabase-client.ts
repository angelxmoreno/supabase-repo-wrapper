export interface MockSupabaseResponse<T = any> {
    data: T | null;
    error: any | null;
    count?: number | null;
}

export class MockSupabaseClient {
    private mockResponses: Map<string, MockSupabaseResponse> = new Map();
    private mockData: Map<string, any[]> = new Map();

    // Set up mock data for a table
    public setTableData(tableName: string, data: any[]) {
        this.mockData.set(tableName, data);
    }

    // Set up mock response for specific operations
    public setMockResponse(key: string, response: MockSupabaseResponse) {
        this.mockResponses.set(key, response);
    }

    public from(tableName: string) {
        return new MockPostgrestQueryBuilder(tableName, this.mockData, this.mockResponses);
    }
}

class MockPostgrestQueryBuilder {
    private tableName: string;
    private mockData: Map<string, any[]>;
    private mockResponses: Map<string, MockSupabaseResponse>;
    private filters: Array<(item: any) => boolean> = [];
    private orderBy: Array<{ column: string; ascending: boolean }> = [];
    private selectFields = '*';
    private rangeStart: number | null = null;
    private rangeEnd: number | null = null;
    private isCountQuery = false;
    private isHeadOnly = false;

    constructor(tableName: string, mockData: Map<string, any[]>, mockResponses: Map<string, MockSupabaseResponse>) {
        this.tableName = tableName;
        this.mockData = mockData;
        this.mockResponses = mockResponses;
    }

    public select(fields = '*', options?: { count?: string; head?: boolean }) {
        this.selectFields = fields;
        if (options?.count === 'exact') {
            this.isCountQuery = true;
        }
        if (options?.head) {
            this.isHeadOnly = true;
        }
        return this;
    }

    public eq(column: string, value: any) {
        this.filters.push((item) => item[column] === value);
        return this;
    }

    public neq(column: string, value: any) {
        this.filters.push((item) => item[column] !== value);
        return this;
    }

    public gt(column: string, value: any) {
        this.filters.push((item) => item[column] > value);
        return this;
    }

    public gte(column: string, value: any) {
        this.filters.push((item) => item[column] >= value);
        return this;
    }

    public lt(column: string, value: any) {
        this.filters.push((item) => item[column] < value);
        return this;
    }

    public lte(column: string, value: any) {
        this.filters.push((item) => item[column] <= value);
        return this;
    }

    public ilike(column: string, pattern: string) {
        const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i');
        this.filters.push((item) => regex.test(item[column]));
        return this;
    }

    public not(column: string, operator: string, value: any) {
        if (operator === 'is' && value === null) {
            this.filters.push((item) => item[column] !== null);
        }
        return this;
    }

    public in(column: string, values: any[]) {
        this.filters.push((item) => values.includes(item[column]));
        return this;
    }

    public order(column: string, options?: { ascending?: boolean }) {
        this.orderBy.push({ column, ascending: options?.ascending ?? true });
        return this;
    }

    public range(start: number, end: number) {
        this.rangeStart = start;
        this.rangeEnd = end;
        return this;
    }

    public single() {
        const result = this.executeQuery();
        if (result.error) return result;

        const data = result.data as any[];
        if (!data || data.length === 0) {
            return { data: null, error: null };
        }
        if (data.length > 1) {
            return { data: null, error: new Error('Multiple rows returned') };
        }
        return { data: data[0], error: null };
    }

    public insert(data: any | any[]) {
        const insertData = Array.isArray(data) ? data : [data];
        const tableData = this.mockData.get(this.tableName) || [];

        const insertedData = insertData.map((item, index) => ({
            id: `mock-id-${Date.now()}-${index}`,
            ...item,
        }));

        tableData.push(...insertedData);
        this.mockData.set(this.tableName, tableData);

        return {
            select: () => ({
                single: () => ({
                    data: Array.isArray(data) ? insertedData : insertedData[0],
                    error: null,
                }),
                then: async (callback: any) =>
                    callback({
                        data: insertedData,
                        error: null,
                    }),
            }),
            then: async (callback: any) =>
                callback({
                    data: insertedData,
                    error: null,
                }),
        };
    }

    public update(data: any) {
        return {
            eq: (column: string, value: any) => ({
                select: () => ({
                    single: () => {
                        const tableData = this.mockData.get(this.tableName) || [];
                        const itemIndex = tableData.findIndex((item) => item[column] === value);

                        if (itemIndex === -1) {
                            return { data: null, error: new Error('No rows updated') };
                        }

                        const updatedItem = { ...tableData[itemIndex], ...data };
                        tableData[itemIndex] = updatedItem;
                        this.mockData.set(this.tableName, tableData);

                        return { data: updatedItem, error: null };
                    },
                }),
            }),
        };
    }

    public upsert(data: any, options?: { onConflict?: string }) {
        const upsertData = Array.isArray(data) ? data : [data];
        const tableData = this.mockData.get(this.tableName) || [];
        const conflictColumns = options?.onConflict?.split(',') || ['id'];

        const result = upsertData.map((item) => {
            // Find existing record based on conflict columns
            const existingIndex = tableData.findIndex((existing) => {
                return conflictColumns.some(
                    (column) => existing[column] !== undefined && existing[column] === item[column]
                );
            });

            if (existingIndex >= 0) {
                const updated = { ...tableData[existingIndex], ...item };
                tableData[existingIndex] = updated;
                return updated;
            } else {
                const newItem = item.id ? item : { id: `mock-id-${Date.now()}`, ...item };
                tableData.push(newItem);
                return newItem;
            }
        });

        this.mockData.set(this.tableName, tableData);

        return {
            select: () => ({
                single: () => ({
                    data: Array.isArray(data) ? result : result[0],
                    error: null,
                }),
            }),
        };
    }

    public delete() {
        return {
            eq: (column: string, value: any) => {
                const tableData = this.mockData.get(this.tableName) || [];
                const filteredData = tableData.filter((item) => item[column] !== value);
                this.mockData.set(this.tableName, filteredData);
                return { data: null, error: null };
            },
            in: (column: string, values: any[]) => {
                const tableData = this.mockData.get(this.tableName) || [];
                const filteredData = tableData.filter((item) => !values.includes(item[column]));
                this.mockData.set(this.tableName, filteredData);
                return { data: null, error: null };
            },
        };
    }

    private executeQuery(): MockSupabaseResponse {
        const tableData = this.mockData.get(this.tableName) || [];
        let filteredData = [...tableData];

        // Apply filters
        for (const filter of this.filters) {
            filteredData = filteredData.filter(filter);
        }

        // Apply ordering
        if (this.orderBy.length > 0) {
            filteredData.sort((a, b) => {
                for (const order of this.orderBy) {
                    const aVal = a[order.column];
                    const bVal = b[order.column];
                    if (aVal < bVal) return order.ascending ? -1 : 1;
                    if (aVal > bVal) return order.ascending ? 1 : -1;
                }
                return 0;
            });
        }

        const count = filteredData.length;

        // Apply range
        if (this.rangeStart !== null && this.rangeEnd !== null) {
            filteredData = filteredData.slice(this.rangeStart, this.rangeEnd + 1);
        }

        if (this.isHeadOnly) {
            return { data: null, error: null, count };
        }

        return {
            data: filteredData,
            error: null,
            count: this.isCountQuery ? count : null,
        };
    }

    public async then(callback: (result: MockSupabaseResponse) => any) {
        return callback(this.executeQuery());
    }
}
