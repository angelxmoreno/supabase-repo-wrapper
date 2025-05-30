import { createClient } from '@supabase/supabase-js';
import { BaseRepository } from '../src/index.js';

// Example user entity type (would typically come from Drizzle schema)
export interface UserEntity {
    id: string;
    email: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export class UserRepository extends BaseRepository<UserEntity> {
    constructor(client: ReturnType<typeof createClient>) {
        super('users', client);
    }

    // Add custom methods specific to users
    public async findByEmail(email: string): Promise<UserEntity | null> {
        const users = await this.find({
            filter: (query) => query.eq('email', email),
        });
        return users[0] || null;
    }

    public async findActiveUsers(): Promise<UserEntity[]> {
        return this.find({
            filter: (query) => query.not('deleted_at', 'is', null),
            orderBy: { column: 'created_at', ascending: false },
        });
    }
}

// Example usage
const example = async () => {
    const supabase = createClient('your-url', 'your-anon-key');
    const userRepo = new UserRepository(supabase);

    // Basic CRUD
    const user = await userRepo.create({
        email: 'test@example.com',
        name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    const foundUser = await userRepo.get(user.id);

    const updatedUser = await userRepo.update(user.id, { name: 'Updated Name' });

    // Query methods
    const allUsers = await userRepo.find({
        filter: (query) => query.ilike('name', '%test%'),
        orderBy: { column: 'created_at', ascending: false },
    });

    const paginatedUsers = await userRepo.findPaginated({
        page: 1,
        pageSize: 10,
        filter: (query) => query.gte('created_at', '2024-01-01'),
        orderBy: { column: 'name', ascending: true },
    });

    // Bulk operations
    const newUsers = await userRepo.createMany([
        {
            email: 'user1@example.com',
            name: 'User 1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            email: 'user2@example.com',
            name: 'User 2',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ]);

    // Utility methods
    const userExists = await userRepo.exists((query) => query.eq('email', 'test@example.com'));
    const userCount = await userRepo.count((query) => query.gte('created_at', '2024-01-01'));

    // Custom methods
    const userByEmail = await userRepo.findByEmail('test@example.com');
    const activeUsers = await userRepo.findActiveUsers();

    return {
        user,
        foundUser,
        updatedUser,
        allUsers,
        paginatedUsers,
        newUsers,
        userExists,
        userCount,
        userByEmail,
        activeUsers,
    };
};
