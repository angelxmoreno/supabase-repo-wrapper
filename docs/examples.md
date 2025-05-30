# Usage Examples

Comprehensive examples showing how to use `supabase-repo-wrapper` in real-world scenarios.

## Table of Contents

- [Basic Setup](#basic-setup)
- [CRUD Operations](#crud-operations)
- [Querying Data](#querying-data)
- [Pagination](#pagination)
- [Bulk Operations](#bulk-operations)
- [Advanced Patterns](#advanced-patterns)
- [Real-World Use Cases](#real-world-use-cases)

## Basic Setup

### With Drizzle ORM (Recommended)

```typescript
// schema.ts
import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  age: integer('age'),
  status: text('status').notNull().default('active'),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
});

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  author_id: text('author_id').notNull(),
  published: boolean('published').default(false),
  created_at: timestamp('created_at').notNull(),
});

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
```

```typescript
// repositories.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from 'supabase-repo-wrapper';
import type { User, Post } from './schema';

export class UserRepository extends BaseRepository<User> {
  constructor(client: SupabaseClient) {
    super('users', client);
  }

  async findByEmail(email: string): Promise<User | null> {
    const users = await this.find({
      filter: (query) => query.eq('email', email),
    });
    return users[0] || null;
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({
      filter: (query) => query.eq('status', 'active'),
      orderBy: { column: 'created_at', ascending: false },
    });
  }
}

export class PostRepository extends BaseRepository<Post> {
  constructor(client: SupabaseClient) {
    super('posts', client);
  }

  async findPublishedPosts(): Promise<Post[]> {
    return this.find({
      filter: (query) => query.eq('published', true),
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async findPostsByAuthor(authorId: string): Promise<Post[]> {
    return this.find({
      filter: (query) => query.eq('author_id', authorId),
      orderBy: { column: 'created_at', ascending: false },
    });
  }
}
```

### Repository Factory Pattern

```typescript
// repository-factory.ts
export class RepositoryFactory {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  get users() {
    return new UserRepository(this.supabase);
  }

  get posts() {
    return new PostRepository(this.supabase);
  }

  // Add more repositories as needed
}

// Usage
const repos = new RepositoryFactory(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const user = await repos.users.findByEmail('john@example.com');
const posts = await repos.posts.findPublishedPosts();
```

## CRUD Operations

### Creating Records

```typescript
const userRepo = new UserRepository(supabaseClient);

// Create a single user
const newUser = await userRepo.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

console.log('Created user:', newUser.id);
```

### Reading Records

```typescript
// Get by ID
const user = await userRepo.get('user-123');
if (user) {
  console.log(`Found user: ${user.name} (${user.email})`);
} else {
  console.log('User not found');
}

// Find by custom criteria
const activeUsers = await userRepo.findActiveUsers();
const userByEmail = await userRepo.findByEmail('john@example.com');
```

### Updating Records

```typescript
// Update specific fields
const updatedUser = await userRepo.update('user-123', {
  name: 'John Smith',
  age: 31,
  updated_at: new Date().toISOString(),
});

console.log('Updated user:', updatedUser.name);
```

### Deleting Records

```typescript
// Delete a single user
await userRepo.delete('user-123');
console.log('User deleted');
```

## Querying Data

### Basic Filtering

```typescript
// Find users by age
const adults = await userRepo.find({
  filter: (query) => query.gte('age', 18),
});

// Find users by status
const activeUsers = await userRepo.find({
  filter: (query) => query.eq('status', 'active'),
});

// Multiple conditions
const activeAdults = await userRepo.find({
  filter: (query) => query
    .eq('status', 'active')
    .gte('age', 18),
});
```

### Text Search

```typescript
// Case-insensitive name search
const johnUsers = await userRepo.find({
  filter: (query) => query.ilike('name', '%john%'),
});

// Email domain search
const companyUsers = await userRepo.find({
  filter: (query) => query.ilike('email', '%@company.com'),
});
```

### Array Operations

```typescript
// Find users with specific IDs
const specificUsers = await userRepo.find({
  filter: (query) => query.in('id', ['user-1', 'user-2', 'user-3']),
});

// Find users by multiple statuses
const relevantUsers = await userRepo.find({
  filter: (query) => query.in('status', ['active', 'pending']),
});
```

### Date Range Queries

```typescript
// Users created in the last month
const recentUsers = await userRepo.find({
  filter: (query) => query.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  orderBy: { column: 'created_at', ascending: false },
});

// Users created between specific dates
const usersInRange = await userRepo.find({
  filter: (query) => query
    .gte('created_at', '2024-01-01T00:00:00Z')
    .lte('created_at', '2024-12-31T23:59:59Z'),
});
```

### Complex Queries with OR Conditions

```typescript
// Users who are either admin or over 65
const privilegedUsers = await userRepo.find({
  filter: (query) => query.or('status.eq.admin,age.gte.65'),
});

// Users with special conditions
const specialUsers = await userRepo.find({
  filter: (query) => query
    .eq('status', 'active')
    .or('age.gte.65,email.ilike.%@company.com'),
});
```

## Pagination

### Basic Pagination

```typescript
// First page
const firstPage = await userRepo.findPaginated({
  page: 1,
  pageSize: 10,
  orderBy: { column: 'created_at', ascending: false },
});

console.log(`Showing ${firstPage.items.length} of ${firstPage.pagination.totalCount} users`);
console.log(`Page ${firstPage.pagination.page} of ${firstPage.pagination.totalPages}`);
```

### Pagination with Filtering

```typescript
// Paginated active users
const activePage = await userRepo.findPaginated({
  page: 1,
  pageSize: 20,
  filter: (query) => query.eq('status', 'active'),
  orderBy: { column: 'name', ascending: true },
});

// Handle pagination in a loop
async function getAllActiveUsers(): Promise<User[]> {
  const allUsers: User[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const result = await userRepo.findPaginated({
      page,
      pageSize,
      filter: (query) => query.eq('status', 'active'),
    });

    allUsers.push(...result.items);

    if (page >= result.pagination.totalPages) {
      break;
    }

    page++;
  }

  return allUsers;
}
```

## Bulk Operations

### Creating Multiple Records

```typescript
// Create multiple users at once
const newUsers = await userRepo.createMany([
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 28,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    name: 'Bob Wilson',
    email: 'bob@example.com',
    age: 35,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]);

console.log(`Created ${newUsers.length} users`);
```

### Updating Multiple Records

```typescript
// Update multiple users
const updates = [
  { id: 'user-1', status: 'inactive' },
  { id: 'user-2', status: 'inactive' },
  { id: 'user-3', age: 31 },
];

const updatedUsers = await userRepo.updateMany(updates);
console.log(`Updated ${updatedUsers.length} users`);
```

### Deleting Multiple Records

```typescript
// Delete multiple users
const userIdsToDelete = ['user-1', 'user-2', 'user-3'];
await userRepo.deleteMany(userIdsToDelete);
console.log(`Deleted ${userIdsToDelete.length} users`);
```

## Advanced Patterns

### Upsert Operations

```typescript
// Upsert by email (update if exists, create if not)
const user = await userRepo.upsert(
  {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  ['email']
);

// Upsert with specific ID
const userWithId = await userRepo.upsert(
  {
    id: 'specific-user-id',
    name: 'Jane Doe',
    email: 'jane@example.com',
    age: 25,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  ['id']
);
```

### Utility Operations

```typescript
// Check if email exists
const emailExists = await userRepo.exists(
  (query) => query.eq('email', 'john@example.com')
);

if (emailExists) {
  throw new Error('Email already registered');
}

// Count users by status
const activeUserCount = await userRepo.count(
  (query) => query.eq('status', 'active')
);

const totalUsers = await userRepo.count();
console.log(`${activeUserCount} active users out of ${totalUsers} total`);
```

### Custom Repository Methods

```typescript
export class UserRepository extends BaseRepository<User> {
  constructor(client: SupabaseClient) {
    super('users', client);
  }

  // Business logic methods
  async activateUser(id: string): Promise<User> {
    return this.update(id, {
      status: 'active',
      updated_at: new Date().toISOString(),
    });
  }

  async deactivateUser(id: string): Promise<User> {
    return this.update(id, {
      status: 'inactive',
      updated_at: new Date().toISOString(),
    });
  }

  async getUserStats(): Promise<{ total: number; active: number; inactive: number }> {
    const [total, active, inactive] = await Promise.all([
      this.count(),
      this.count((query) => query.eq('status', 'active')),
      this.count((query) => query.eq('status', 'inactive')),
    ]);

    return { total, active, inactive };
  }

  async findUsersOlderThan(age: number): Promise<User[]> {
    return this.find({
      filter: (query) => query.gt('age', age),
      orderBy: { column: 'age', ascending: false },
    });
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    return this.find({
      filter: (query) => query
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`),
      orderBy: { column: 'name', ascending: true },
    });
  }
}
```

## Real-World Use Cases

### User Management System

```typescript
class UserService {
  constructor(private userRepo: UserRepository) {}

  async registerUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    // Check if email already exists
    const existingUser = await this.userRepo.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Create new user
    return this.userRepo.create({
      ...userData,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  async updateUserProfile(id: string, updates: Partial<Pick<User, 'name' | 'age'>>) {
    return this.userRepo.update(id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  }

  async getUserDashboard(userId: string) {
    const user = await this.userRepo.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const stats = await this.userRepo.getUserStats();
    
    return {
      user,
      stats,
    };
  }

  async bulkImportUsers(users: Array<Omit<User, 'id' | 'created_at' | 'updated_at'>>) {
    const now = new Date().toISOString();
    const usersToCreate = users.map(user => ({
      ...user,
      status: 'active' as const,
      created_at: now,
      updated_at: now,
    }));

    return this.userRepo.createMany(usersToCreate);
  }
}
```

### Blog System

```typescript
class BlogService {
  constructor(
    private postRepo: PostRepository,
    private userRepo: UserRepository
  ) {}

  async createPost(authorId: string, postData: Pick<Post, 'title' | 'content'>) {
    // Verify author exists
    const author = await this.userRepo.get(authorId);
    if (!author) {
      throw new Error('Author not found');
    }

    return this.postRepo.create({
      ...postData,
      author_id: authorId,
      published: false,
      created_at: new Date().toISOString(),
    });
  }

  async publishPost(postId: string) {
    return this.postRepo.update(postId, {
      published: true,
    });
  }

  async getPublishedPostsWithPagination(page: number, pageSize: number) {
    return this.postRepo.findPaginated({
      page,
      pageSize,
      filter: (query) => query.eq('published', true),
      orderBy: { column: 'created_at', ascending: false },
    });
  }

  async getAuthorPosts(authorId: string) {
    const [author, posts] = await Promise.all([
      this.userRepo.get(authorId),
      this.postRepo.findPostsByAuthor(authorId),
    ]);

    return {
      author,
      posts,
      publishedCount: posts.filter(p => p.published).length,
      draftCount: posts.filter(p => !p.published).length,
    };
  }

  async searchPosts(searchTerm: string) {
    return this.postRepo.find({
      filter: (query) => query
        .eq('published', true)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`),
      orderBy: { column: 'created_at', ascending: false },
    });
  }
}
```

### Data Migration Example

```typescript
async function migrateUserStatuses() {
  const userRepo = new UserRepository(supabaseClient);
  
  // Find all users with old status format
  const usersToMigrate = await userRepo.find({
    filter: (query) => query.in('status', ['1', '0']), // Old numeric statuses
  });

  console.log(`Found ${usersToMigrate.length} users to migrate`);

  // Update in batches
  const batchSize = 50;
  for (let i = 0; i < usersToMigrate.length; i += batchSize) {
    const batch = usersToMigrate.slice(i, i + batchSize);
    
    const updates = batch.map(user => ({
      id: user.id,
      status: user.status === '1' ? 'active' : 'inactive', // Convert to new format
      updated_at: new Date().toISOString(),
    }));

    await userRepo.updateMany(updates);
    console.log(`Migrated batch ${Math.floor(i / batchSize) + 1}`);
  }

  console.log('Migration completed');
}
```

### Error Handling Patterns

```typescript
class UserService {
  constructor(private userRepo: UserRepository) {}

  async safeGetUser(id: string): Promise<User | null> {
    try {
      return await this.userRepo.get(id);
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async createUserWithValidation(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    try {
      // Validate email uniqueness
      const exists = await this.userRepo.exists(
        (query) => query.eq('email', userData.email)
      );

      if (exists) {
        throw new Error('Email already exists');
      }

      return await this.userRepo.create({
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Email already exists');
      }
      throw error; // Re-throw other errors
    }
  }
}
```

These examples demonstrate the flexibility and power of the `supabase-repo-wrapper` in real-world applications. The library handles the database operations while allowing you to focus on your business logic.