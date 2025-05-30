import { BaseRepository } from '../src/base-repository.js';
import type { MockSupabaseClient } from './mock-supabase-client.js';

export interface TestEntity {
    id: string;
    name: string;
    email: string;
    age: number;
    created_at: string;
    updated_at: string;
}

export class TestRepository extends BaseRepository<TestEntity> {
    constructor(client: MockSupabaseClient) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        super('users', client as any);
    }
}
