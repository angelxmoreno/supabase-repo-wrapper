import { beforeEach, describe, expect, test } from 'bun:test';
import { MockSupabaseClient } from './mock-supabase-client.js';
import { type TestEntity, TestRepository } from './test-repository.js';

describe('BaseRepository', () => {
    let mockClient: MockSupabaseClient;
    let repository: TestRepository;
    let testData: TestEntity[];

    beforeEach(() => {
        mockClient = new MockSupabaseClient();
        repository = new TestRepository(mockClient);

        testData = [
            {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                age: 30,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            },
            {
                id: '2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                age: 25,
                created_at: '2024-01-02T00:00:00Z',
                updated_at: '2024-01-02T00:00:00Z',
            },
            {
                id: '3',
                name: 'Bob Johnson',
                email: 'bob@example.com',
                age: 35,
                created_at: '2024-01-03T00:00:00Z',
                updated_at: '2024-01-03T00:00:00Z',
            },
        ];

        mockClient.setTableData('users', testData);
    });

    describe('get', () => {
        test('should return a single record by id', async () => {
            const result = await repository.get('1');
            expect(result).toEqual(testData[0]);
        });

        test('should return null when record not found', async () => {
            const result = await repository.get('999');
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        test('should create a new record', async () => {
            const newUser = {
                name: 'New User',
                email: 'new@example.com',
                age: 28,
                created_at: '2024-01-04T00:00:00Z',
                updated_at: '2024-01-04T00:00:00Z',
            };

            const result = await repository.create(newUser);

            expect(result).toMatchObject(newUser);
            expect(result.id).toBeDefined();
        });
    });

    describe('update', () => {
        test('should update an existing record', async () => {
            const updateData = { name: 'John Updated', age: 31 };
            const result = await repository.update('1', updateData);

            expect(result.name).toBe('John Updated');
            expect(result.age).toBe(31);
            expect(result.id).toBe('1');
            expect(result.email).toBe('john@example.com'); // unchanged
        });
    });

    describe('delete', () => {
        test('should delete a record', async () => {
            await repository.delete('1');
            const result = await repository.get('1');
            expect(result).toBeNull();
        });
    });

    describe('find', () => {
        test('should return all records without filter', async () => {
            const result = await repository.find();
            expect(result).toHaveLength(3);
            expect(result).toEqual(testData);
        });

        test('should filter records', async () => {
            const result = await repository.find({
                filter: (query) => query.eq('name', 'John Doe'),
            });

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(testData[0]);
        });

        test('should filter records with greater than', async () => {
            const result = await repository.find({
                filter: (query) => query.gt('age', 30),
            });

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe('Bob Johnson');
        });

        test('should order records', async () => {
            const result = await repository.find({
                orderBy: { column: 'age', ascending: false },
            });

            expect(result[0].name).toBe('Bob Johnson');
            expect(result[1].name).toBe('John Doe');
            expect(result[2].name).toBe('Jane Smith');
        });

        test('should filter and order records', async () => {
            const result = await repository.find({
                filter: (query) => query.gte('age', 25),
                orderBy: { column: 'name', ascending: true },
            });

            expect(result).toHaveLength(3);
            expect(result[0].name).toBe('Bob Johnson');
            expect(result[1].name).toBe('Jane Smith');
            expect(result[2].name).toBe('John Doe');
        });

        test('should handle multiple order by clauses', async () => {
            const result = await repository.find({
                orderBy: [
                    { column: 'age', ascending: true },
                    { column: 'name', ascending: false },
                ],
            });

            expect(result[0].name).toBe('Jane Smith'); // age 25
            expect(result[1].name).toBe('John Doe'); // age 30
            expect(result[2].name).toBe('Bob Johnson'); // age 35
        });
    });

    describe('findPaginated', () => {
        test('should return paginated results', async () => {
            const result = await repository.findPaginated({
                page: 1,
                pageSize: 2,
                orderBy: { column: 'name', ascending: true },
            });

            expect(result.items).toHaveLength(2);
            expect(result.pagination).toEqual({
                page: 1,
                pageSize: 2,
                totalCount: 3,
                totalPages: 2,
            });
            expect(result.items[0].name).toBe('Bob Johnson');
            expect(result.items[1].name).toBe('Jane Smith');
        });

        test('should return second page', async () => {
            const result = await repository.findPaginated({
                page: 2,
                pageSize: 2,
                orderBy: { column: 'name', ascending: true },
            });

            expect(result.items).toHaveLength(1);
            expect(result.pagination.page).toBe(2);
            expect(result.items[0].name).toBe('John Doe');
        });

        test('should filter and paginate', async () => {
            const result = await repository.findPaginated({
                page: 1,
                pageSize: 10,
                filter: (query) => query.gte('age', 30),
            });

            expect(result.items).toHaveLength(2);
            expect(result.pagination.totalCount).toBe(2);
            expect(result.pagination.totalPages).toBe(1);
        });
    });

    describe('exists', () => {
        test('should return true when record exists', async () => {
            const result = await repository.exists((query) => query.eq('email', 'john@example.com'));
            expect(result).toBe(true);
        });

        test('should return false when record does not exist', async () => {
            const result = await repository.exists((query) => query.eq('email', 'nonexistent@example.com'));
            expect(result).toBe(false);
        });
    });

    describe('count', () => {
        test('should return total count without filter', async () => {
            const result = await repository.count();
            expect(result).toBe(3);
        });

        test('should return filtered count', async () => {
            const result = await repository.count((query) => query.gte('age', 30));
            expect(result).toBe(2);
        });
    });
});
