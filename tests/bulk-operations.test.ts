import { beforeEach, describe, expect, test } from 'bun:test';
import { MockSupabaseClient } from './mock-supabase-client.js';
import { type TestEntity, TestRepository } from './test-repository.js';

describe('BaseRepository - Bulk Operations', () => {
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
        ];

        mockClient.setTableData('users', testData);
    });

    describe('createMany', () => {
        test('should create multiple records', async () => {
            const newUsers = [
                {
                    name: 'Alice Brown',
                    email: 'alice@example.com',
                    age: 28,
                    created_at: '2024-01-03T00:00:00Z',
                    updated_at: '2024-01-03T00:00:00Z',
                },
                {
                    name: 'Charlie Wilson',
                    email: 'charlie@example.com',
                    age: 32,
                    created_at: '2024-01-04T00:00:00Z',
                    updated_at: '2024-01-04T00:00:00Z',
                },
            ];

            const result = await repository.createMany(newUsers);

            expect(result).toHaveLength(2);
            expect(result[0]).toMatchObject(newUsers[0]);
            expect(result[1]).toMatchObject(newUsers[1]);
            expect(result[0].id).toBeDefined();
            expect(result[1].id).toBeDefined();
        });

        test('should create single record in array', async () => {
            const newUser = [
                {
                    name: 'Single User',
                    email: 'single@example.com',
                    age: 24,
                    created_at: '2024-01-05T00:00:00Z',
                    updated_at: '2024-01-05T00:00:00Z',
                },
            ];

            const result = await repository.createMany(newUser);

            expect(result).toHaveLength(1);
            expect(result[0]).toMatchObject(newUser[0]);
            expect(result[0].id).toBeDefined();
        });
    });

    describe('updateMany', () => {
        test('should update multiple records', async () => {
            const updates = [
                { id: '1', name: 'John Updated', age: 31 },
                { id: '2', name: 'Jane Updated', age: 26 },
            ];

            const result = await repository.updateMany(updates);

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('John Updated');
            expect(result[0].age).toBe(31);
            expect(result[0].email).toBe('john@example.com'); // unchanged
            expect(result[1].name).toBe('Jane Updated');
            expect(result[1].age).toBe(26);
            expect(result[1].email).toBe('jane@example.com'); // unchanged
        });

        test('should update partial fields only', async () => {
            const updates = [
                { id: '1', name: 'Only Name Updated' },
                { id: '2', age: 99 },
            ];

            const result = await repository.updateMany(updates);

            expect(result).toHaveLength(2);
            expect(result[0].name).toBe('Only Name Updated');
            expect(result[0].age).toBe(30); // unchanged
            expect(result[1].name).toBe('Jane Smith'); // unchanged
            expect(result[1].age).toBe(99);
        });
    });

    describe('deleteMany', () => {
        test('should delete multiple records by ids', async () => {
            await repository.deleteMany(['1', '2']);

            const user1 = await repository.get('1');
            const user2 = await repository.get('2');

            expect(user1).toBeNull();
            expect(user2).toBeNull();
        });

        test('should delete some records', async () => {
            // Add a third user first
            await repository.create({
                name: 'Third User',
                email: 'third@example.com',
                age: 40,
                created_at: '2024-01-03T00:00:00Z',
                updated_at: '2024-01-03T00:00:00Z',
            });

            await repository.deleteMany(['1']);

            const user1 = await repository.get('1');
            const user2 = await repository.get('2');

            expect(user1).toBeNull();
            expect(user2).not.toBeNull();
        });

        test('should handle empty array', async () => {
            await repository.deleteMany([]);

            const allUsers = await repository.find();
            expect(allUsers).toHaveLength(2); // no users deleted
        });

        test('should handle non-existent ids', async () => {
            await repository.deleteMany(['999', '1000']);

            const allUsers = await repository.find();
            expect(allUsers).toHaveLength(2); // no users deleted
        });
    });
});
