# supabase-repo-wrapper

A generic `BaseRepository<T>` class for Supabase that provides common data access methods out-of-the-box, eliminating boilerplate code and providing a consistent query interface for Supabase-based applications.

[![npm version](https://badge.fury.io/js/supabase-repo-wrapper.svg)](https://badge.fury.io/js/supabase-repo-wrapper)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/558f0fa5347548be829ce238ba99b984)](https://app.codacy.com/gh/angelxmoreno/supabase-repo-wrapper/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
[![codecov](https://codecov.io/gh/angelxmoreno/supabase-repo-wrapper/graph/badge.svg?token=JUQ5VZ1C57)](https://codecov.io/gh/angelxmoreno/supabase-repo-wrapper)

## Features

- 🚀 **Zero boilerplate** - Ready-to-use CRUD operations
- 🔍 **Advanced querying** - Filtering, ordering, and pagination built-in
- 📦 **Bulk operations** - Create, update, and delete multiple records efficiently
- 🔄 **Upsert support** - Insert or update with conflict resolution
- 📊 **Utility methods** - Count, exists, and other helpful operations
- 🎯 **Type-safe** - Full TypeScript support with generics
- 🧪 **Well-tested** - Comprehensive test suite with 32+ tests
- 🔌 **Extensible** - Easy to extend with custom methods

## Installation

```bash
# Using npm
npm install supabase-repo-wrapper @supabase/supabase-js

# Using yarn
yarn add supabase-repo-wrapper @supabase/supabase-js

# Using bun
bun add supabase-repo-wrapper @supabase/supabase-js
```

## Quick Start

### 1. Define your entity type

```typescript
// Using Drizzle (recommended)
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  age: integer('age'),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
});

export type User = typeof users.$inferSelect;

// Or define manually
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  created_at: string;
  updated_at: string;
}
```

### 2. Create your repository

```typescript
import { createClient } from '@supabase/supabase-js';
import { BaseRepository } from 'supabase-repo-wrapper';

export class UserRepository extends BaseRepository<User> {
  constructor(supabaseClient: SupabaseClient) {
    super('users', supabaseClient);
  }

  // Add custom methods specific to your domain
  async findByEmail(email: string): Promise<User | null> {
    const users = await this.find({
      filter: (query) => query.eq('email', email),
    });
    return users[0] || null;
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({
      filter: (query) => query.not('deleted_at', 'is', null),
      orderBy: { column: 'created_at', ascending: false },
    });
  }
}
```

### 3. Use your repository

```typescript
const supabase = createClient('your-url', 'your-anon-key');
const userRepo = new UserRepository(supabase);

// Create a user
const newUser = await userRepo.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// Get a user by ID
const user = await userRepo.get('user-id');

// Find users with filtering and ordering
const adults = await userRepo.find({
  filter: (query) => query.gte('age', 18),
  orderBy: { column: 'name', ascending: true },
});

// Paginated results
const page = await userRepo.findPaginated({
  page: 1,
  pageSize: 10,
  filter: (query) => query.ilike('name', '%john%'),
  orderBy: { column: 'created_at', ascending: false },
});

console.log(page.items); // User[]
console.log(page.pagination); // { page: 1, pageSize: 10, totalCount: 25, totalPages: 3 }
```

## API Reference

### Core CRUD Methods

#### `get(id: string | number): Promise<T | null>`

Retrieve a single record by its ID.

#### `create(data: Omit<T, 'id'>): Promise<T>`

Create a new record and return the created record.

#### `update(id: string | number, data: Partial<Omit<T, 'id'>>): Promise<T>`

Update an existing record and return the updated record.

#### `delete(id: string | number): Promise<void>`

Delete a record by its ID.

### Query Methods

#### `find(options?: FindOptions<T>): Promise<T[]>`

Find multiple records with optional filtering and ordering.

```typescript
interface FindOptions<T> {
  filter?: FilterFunction<T>;
  orderBy?: OrderBy | OrderBy[];
}

type FilterFunction<T> = (query: SupabaseQueryBuilder) => SupabaseQueryBuilder;

interface OrderBy {
  column: string;
  ascending?: boolean; // defaults to true
}
```

#### `findPaginated(options: FindPaginatedOptions<T>): Promise<PaginatedResult<T>>`

Find records with pagination support.

```typescript
interface FindPaginatedOptions<T> extends FindOptions<T> {
  page: number;
  pageSize: number;
}

interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

### Utility Methods

#### `exists(filter: FilterFunction<T>): Promise<boolean>`

Check if any records match the given filter.

#### `count(filter?: FilterFunction<T>): Promise<number>`

Count records, optionally with a filter.

### Bulk Operations

#### `createMany(records: Omit<T, 'id'>[]): Promise<T[]>`

Create multiple records in a single operation.

#### `updateMany(records: Array<{ id: string | number } & Partial<T>>): Promise<T[]>`

Update multiple records in a single operation.

#### `deleteMany(ids: Array<string | number>): Promise<void>`

Delete multiple records by their IDs.

### Advanced Operations

#### `upsert(data: Partial<T>, conflictColumns: string[]): Promise<T>`

Insert a new record or update an existing one based on conflict columns.

```typescript
// Update user or create if email doesn't exist
const user = await userRepo.upsert(
  { name: 'John Doe', email: 'john@example.com', age: 30 },
  ['email']
);
```

## Filtering Examples

The `filter` function receives Supabase's query builder and supports all native filtering methods:

```typescript
// Equality
filter: (query) => query.eq('status', 'active')

// Comparison
filter: (query) => query.gte('age', 18).lte('age', 65)

// Text search
filter: (query) => query.ilike('name', '%john%')

// Multiple conditions
filter: (query) => query
  .eq('status', 'active')
  .gte('created_at', '2024-01-01')
  .in('role', ['admin', 'user'])

// Complex conditions
filter: (query) => query
  .or('age.gte.18,role.eq.admin')
  .not('deleted_at', 'is', null)
```

## Ordering Examples

```typescript
// Single column
orderBy: { column: 'created_at', ascending: false }

// Multiple columns
orderBy: [
  { column: 'status', ascending: true },
  { column: 'created_at', ascending: false }
]
```

## TypeScript Support

This package is built with TypeScript and provides full type safety:

```typescript
// Your entity type is preserved throughout
const user: User = await userRepo.get('id');
const users: User[] = await userRepo.find();

// Compile-time validation for create/update data
await userRepo.create({
  name: 'John',
  email: 'john@example.com',
  // TypeScript will ensure all required fields are present
});

await userRepo.update('id', {
  name: 'Jane',
  // Only allows valid fields from your entity type
});
```

## Error Handling

The repository throws Supabase errors directly, so you can handle them as you would with native Supabase client:

```typescript
try {
  const user = await userRepo.get('non-existent-id');
} catch (error) {
  // Handle Supabase errors
  console.error('Database error:', error.message);
}
```

## Testing

The package includes comprehensive tests. To run them:

```bash
# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Run linting
bun run lint

# Build the package
bun run build
```

## Best Practices

### 1. Use with Drizzle for Schema Management

```typescript
// drizzle/schema.ts
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  created_at: timestamp('created_at').notNull(),
});

export type User = typeof users.$inferSelect;

// repositories/UserRepository.ts
export class UserRepository extends BaseRepository<User> {
  constructor(client: SupabaseClient) {
    super('users', client);
  }
}
```

### 2. Create Repository Factory

```typescript
export class RepositoryFactory {
  constructor(private supabase: SupabaseClient) {}

  get users() {
    return new UserRepository(this.supabase);
  }

  get posts() {
    return new PostRepository(this.supabase);
  }
}

// Usage
const repos = new RepositoryFactory(supabase);
const user = await repos.users.get('id');
```

### 3. Add Custom Domain Methods

```typescript
export class UserRepository extends BaseRepository<User> {
  async findByEmail(email: string) {
    const users = await this.find({
      filter: (query) => query.eq('email', email),
    });
    return users[0] || null;
  }

  async findActiveUsers() {
    return this.find({
      filter: (query) => query.eq('status', 'active'),
      orderBy: { column: 'last_login', ascending: false },
    });
  }

  async deactivateUser(id: string) {
    return this.update(id, { status: 'inactive', deactivated_at: new Date().toISOString() });
  }
}
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.
