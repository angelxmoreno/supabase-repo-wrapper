import { beforeEach, describe, expect, test } from 'bun:test';
import { MockSupabaseClient } from './mock-supabase-client.js';
import { type TestEntity, TestRepository } from './test-repository.js';

describe('BaseRepository - Upsert', () => {
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

    describe('upsert', () => {
        test('should update existing record', async () => {
            const upsertData = {
                id: '1',
                name: 'John Updated',
                email: 'john.updated@example.com',
                age: 31,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-05T00:00:00Z',
            };

            const result = await repository.upsert(upsertData, ['id']);

            expect(result.id).toBe('1');
            expect(result.name).toBe('John Updated');
            expect(result.email).toBe('john.updated@example.com');
            expect(result.age).toBe(31);
        });

        test('should insert new record when id does not exist', async () => {
            const upsertData = {
                id: '3',
                name: 'New User',
                email: 'new@example.com',
                age: 28,
                created_at: '2024-01-03T00:00:00Z',
                updated_at: '2024-01-03T00:00:00Z',
            };

            const result = await repository.upsert(upsertData, ['id']);

            expect(result.id).toBe('3');
            expect(result.name).toBe('New User');
            expect(result.email).toBe('new@example.com');
            expect(result.age).toBe(28);
        });

        test('should insert new record without id', async () => {
            const upsertData = {
                name: 'Another New User',
                email: 'another@example.com',
                age: 26,
                created_at: '2024-01-04T00:00:00Z',
                updated_at: '2024-01-04T00:00:00Z',
            };

            const result = await repository.upsert(upsertData, ['email']);

            expect(result.id).toBeDefined();
            expect(result.name).toBe('Another New User');
            expect(result.email).toBe('another@example.com');
            expect(result.age).toBe(26);
        });

        test('should update existing record by email conflict', async () => {
            const upsertData = {
                name: 'John Updated by Email',
                email: 'john@example.com', // existing email
                age: 32,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-06T00:00:00Z',
            };

            const result = await repository.upsert(upsertData, ['email']);

            expect(result.id).toBe('1'); // existing id
            expect(result.name).toBe('John Updated by Email');
            expect(result.email).toBe('john@example.com');
            expect(result.age).toBe(32);
        });

        test('should handle partial data update', async () => {
            const upsertData = {
                id: '1',
                name: 'John Partial Update',
                // age and other fields not provided
            };

            const result = await repository.upsert(upsertData, ['id']);

            expect(result.id).toBe('1');
            expect(result.name).toBe('John Partial Update');
            expect(result.email).toBe('john@example.com'); // should remain unchanged
            expect(result.age).toBe(30); // should remain unchanged
        });

        test('should handle multiple conflict columns', async () => {
            const upsertData = {
                id: '1',
                name: 'Multi Conflict Update',
                email: 'john@example.com',
                age: 33,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-07T00:00:00Z',
            };

            const result = await repository.upsert(upsertData, ['id', 'email']);

            expect(result.id).toBe('1');
            expect(result.name).toBe('Multi Conflict Update');
            expect(result.age).toBe(33);
        });
    });
});
