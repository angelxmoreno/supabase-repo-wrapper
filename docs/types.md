# TypeScript Types Reference

Complete reference for all TypeScript types and interfaces provided by `supabase-repo-wrapper`.

## Table of Contents

- [Core Types](#core-types)
- [Filter Types](#filter-types)
- [Query Options](#query-options)
- [Pagination Types](#pagination-types)
- [Generic Constraints](#generic-constraints)
- [Usage Examples](#usage-examples)

## Core Types

### BaseRepository\<T\>

```typescript
export abstract class BaseRepository<T extends Record<string, any>>
```

The main repository class that provides CRUD operations for entities of type `T`.

**Type Parameters:**
- `T extends Record<string, any>` - The entity type that this repository manages

**Example:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

class UserRepository extends BaseRepository<User> {
  // T is automatically inferred as User
}
```

## Filter Types

### FilterFunction\<T\>

```typescript
export type FilterFunction<T> = (query: any) => any;
```

A function type that receives a Supabase query builder and returns a modified query builder with filters applied.

**Parameters:**
- `query: SupabaseQueryBuilder` - The Supabase query builder instance

**Returns:**
- `SupabaseQueryBuilder` - The modified query builder with filters applied

**Example:**
```typescript
const ageFilter: FilterFunction<User> = (query) => query.gte('age', 18);

const complexFilter: FilterFunction<User> = (query) => 
  query
    .eq('status', 'active')
    .gte('created_at', '2024-01-01');
```

## Query Options

### OrderBy

```typescript
export interface OrderBy {
  column: string;
  ascending?: boolean; // defaults to true
}
```

Defines sorting options for query results.

**Properties:**
- `column: string` - The column name to sort by
- `ascending?: boolean` - Sort direction (true for ASC, false for DESC). Defaults to `true`

**Examples:**
```typescript
// Simple ascending sort
const sortByName: OrderBy = { column: 'name' };

// Descending sort
const sortByDate: OrderBy = { column: 'created_at', ascending: false };

// Multiple sorts
const multipleSorts: OrderBy[] = [
  { column: 'status', ascending: true },
  { column: 'created_at', ascending: false }
];
```

### FindOptions\<T\>

```typescript
export interface FindOptions<T> {
  filter?: FilterFunction<T>;
  orderBy?: OrderBy | OrderBy[];
}
```

Options for the `find` method.

**Properties:**
- `filter?: FilterFunction<T>` - Optional filter function to apply
- `orderBy?: OrderBy | OrderBy[]` - Optional sorting (single or multiple columns)

**Examples:**
```typescript
// Just filtering
const filterOnly: FindOptions<User> = {
  filter: (query) => query.eq('status', 'active')
};

// Just sorting
const sortOnly: FindOptions<User> = {
  orderBy: { column: 'name', ascending: true }
};

// Both filtering and sorting
const filterAndSort: FindOptions<User> = {
  filter: (query) => query.gte('age', 18),
  orderBy: { column: 'created_at', ascending: false }
};

// Multiple sorts
const multipleSortOptions: FindOptions<User> = {
  orderBy: [
    { column: 'status' },
    { column: 'name', ascending: false }
  ]
};
```

### FindPaginatedOptions\<T\>

```typescript
export interface FindPaginatedOptions<T> extends FindOptions<T> {
  page: number;
  pageSize: number;
}
```

Options for the `findPaginated` method, extending `FindOptions` with pagination parameters.

**Properties:**
- `page: number` - The page number (1-based)
- `pageSize: number` - Number of items per page
- `filter?: FilterFunction<T>` - Inherited from `FindOptions`
- `orderBy?: OrderBy | OrderBy[]` - Inherited from `FindOptions`

**Example:**
```typescript
const paginatedOptions: FindPaginatedOptions<User> = {
  page: 1,
  pageSize: 20,
  filter: (query) => query.eq('status', 'active'),
  orderBy: { column: 'created_at', ascending: false }
};
```

## Pagination Types

### Pagination

```typescript
export interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

Metadata about paginated results.

**Properties:**
- `page: number` - Current page number (1-based)
- `pageSize: number` - Number of items per page
- `totalCount: number` - Total number of items across all pages
- `totalPages: number` - Total number of pages available

**Example:**
```typescript
const pagination: Pagination = {
  page: 2,
  pageSize: 10,
  totalCount: 156,
  totalPages: 16
};
```

### PaginatedResult\<T\>

```typescript
export interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}
```

The return type for paginated queries, containing both the data and pagination metadata.

**Properties:**
- `items: T[]` - Array of items for the current page
- `pagination: Pagination` - Pagination metadata

**Example:**
```typescript
const result: PaginatedResult<User> = {
  items: [
    { id: '1', name: 'John', email: 'john@example.com', age: 30 },
    { id: '2', name: 'Jane', email: 'jane@example.com', age: 25 }
  ],
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1
  }
};
```

## Generic Constraints

### Entity Type Constraint

```typescript
T extends Record<string, any>
```

All entities managed by `BaseRepository` must extend `Record<string, any>`, meaning they must be objects with string keys.

**Valid Entity Types:**
```typescript
// ✅ Valid - simple interface
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Valid - with optional properties
interface Post {
  id: string;
  title: string;
  content?: string;
  published: boolean;
}

// ✅ Valid - with complex types
interface Product {
  id: string;
  name: string;
  price: number;
  tags: string[];
  metadata: Record<string, any>;
}

// ✅ Valid - using type alias
type UserType = {
  id: string;
  name: string;
  email: string;
};
```

**Invalid Entity Types:**
```typescript
// ❌ Invalid - primitive type
type UserId = string;

// ❌ Invalid - array type
type Users = User[];

// ❌ Invalid - union type
type UserOrPost = User | Post;
```

## Usage Examples

### Type-Safe Repository Creation

```typescript
// Define your entity type
interface BlogPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Create type-safe repository
class BlogPostRepository extends BaseRepository<BlogPost> {
  constructor(client: SupabaseClient) {
    super('posts', client);
  }

  // TypeScript will enforce correct types
  async createPost(data: Omit<BlogPost, 'id'>): Promise<BlogPost> {
    return this.create(data); // ✅ Type-safe
  }

  async updatePost(id: string, data: Partial<Omit<BlogPost, 'id'>>): Promise<BlogPost> {
    return this.update(id, data); // ✅ Type-safe
  }
}
```

### Advanced Type Usage

```typescript
// Using conditional types for different entity variations
type WithTimestamps<T> = T & {
  created_at: string;
  updated_at: string;
};

type WithSoftDelete<T> = T & {
  deleted_at: string | null;
};

// Base user type
interface BaseUser {
  id: string;
  name: string;
  email: string;
}

// User with timestamps
type User = WithTimestamps<BaseUser>;

// User with soft delete capability
type SoftDeleteUser = WithTimestamps<WithSoftDelete<BaseUser>>;

class UserRepository extends BaseRepository<User> {
  // Methods are automatically type-safe for User type
}

class SoftDeleteUserRepository extends BaseRepository<SoftDeleteUser> {
  async softDelete(id: string): Promise<SoftDeleteUser> {
    return this.update(id, { 
      deleted_at: new Date().toISOString() 
    });
  }

  async findActive(): Promise<SoftDeleteUser[]> {
    return this.find({
      filter: (query) => query.is('deleted_at', null)
    });
  }
}
```

### Working with Drizzle Types

```typescript
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Drizzle schema definition
const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  age: integer('age'),
  created_at: timestamp('created_at').notNull(),
});

// Infer types from Drizzle schema
type User = typeof users.$inferSelect;
type NewUser = typeof users.$inferInsert;

class UserRepository extends BaseRepository<User> {
  constructor(client: SupabaseClient) {
    super('users', client);
  }

  // Use Drizzle insert type for creation
  async createUser(data: Omit<NewUser, 'id'>): Promise<User> {
    return this.create(data);
  }
}
```

### Custom Filter Type Helpers

```typescript
// Create reusable filter helpers
type UserFilters = {
  byStatus: (status: string) => FilterFunction<User>;
  byAge: (min: number, max?: number) => FilterFunction<User>;
  byEmail: (email: string) => FilterFunction<User>;
  active: () => FilterFunction<User>;
};

const userFilters: UserFilters = {
  byStatus: (status) => (query) => query.eq('status', status),
  byAge: (min, max) => (query) => {
    let q = query.gte('age', min);
    if (max !== undefined) {
      q = q.lte('age', max);
    }
    return q;
  },
  byEmail: (email) => (query) => query.eq('email', email),
  active: () => (query) => query.eq('status', 'active'),
};

// Usage with type safety
const activeUsers = await userRepo.find({
  filter: userFilters.active(),
});

const adultUsers = await userRepo.find({
  filter: userFilters.byAge(18, 65),
});
```

### Repository Method Return Types

```typescript
class TypedUserRepository extends BaseRepository<User> {
  // Return types are automatically inferred
  
  async getUser(id: string): Promise<User | null> {
    return this.get(id); // Returns Promise<User | null>
  }

  async findUsers(): Promise<User[]> {
    return this.find(); // Returns Promise<User[]>
  }

  async findPaginatedUsers(page: number): Promise<PaginatedResult<User>> {
    return this.findPaginated({ page, pageSize: 10 }); // Returns Promise<PaginatedResult<User>>
  }

  async createUser(data: Omit<User, 'id'>): Promise<User> {
    return this.create(data); // Returns Promise<User>
  }

  async updateUser(id: string, data: Partial<Omit<User, 'id'>>): Promise<User> {
    return this.update(id, data); // Returns Promise<User>
  }

  async userExists(email: string): Promise<boolean> {
    return this.exists((query) => query.eq('email', email)); // Returns Promise<boolean>
  }

  async countUsers(): Promise<number> {
    return this.count(); // Returns Promise<number>
  }
}
```

## Type Utilities

### Extract Entity Type

```typescript
// Utility to extract the entity type from a repository
type EntityType<T> = T extends BaseRepository<infer U> ? U : never;

// Usage
type UserType = EntityType<UserRepository>; // User
```

### Repository Factory Types

```typescript
interface RepositoryMap {
  users: UserRepository;
  posts: PostRepository;
  comments: CommentRepository;
}

class TypedRepositoryFactory {
  constructor(private supabase: SupabaseClient) {}

  get<K extends keyof RepositoryMap>(name: K): RepositoryMap[K] {
    const repos: RepositoryMap = {
      users: new UserRepository(this.supabase),
      posts: new PostRepository(this.supabase),
      comments: new CommentRepository(this.supabase),
    };
    return repos[name];
  }
}

// Type-safe usage
const factory = new TypedRepositoryFactory(supabase);
const userRepo = factory.get('users'); // Type: UserRepository
const postRepo = factory.get('posts'); // Type: PostRepository
```

This comprehensive type reference ensures you can leverage TypeScript's full power when using `supabase-repo-wrapper` for type-safe database operations.