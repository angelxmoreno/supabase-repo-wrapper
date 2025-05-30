# API Documentation

Complete API reference for the `BaseRepository<T>` class and related types.

## Table of Contents

- [BaseRepository Class](#baserepository-class)
- [Type Definitions](#type-definitions)
- [Method Reference](#method-reference)
- [Filter Examples](#filter-examples)

## BaseRepository Class

### Constructor

```typescript
constructor(tableName: string, client: SupabaseClient)
```

Creates a new repository instance for the specified table.

**Parameters:**

- `tableName: string` - The name of the database table
- `client: SupabaseClient` - Supabase client instance

**Example:**

```typescript
const userRepo = new UserRepository('users', supabaseClient);
```

## Type Definitions

### FilterFunction

```typescript
type FilterFunction<T> = (query: SupabaseQueryBuilder) => SupabaseQueryBuilder;
```

A function that receives a Supabase query builder and returns a modified query builder with filters applied.

### OrderBy

```typescript
interface OrderBy {
  column: string;
  ascending?: boolean; // defaults to true
}
```

Defines ordering for query results.

### FindOptions

```typescript
interface FindOptions<T> {
  filter?: FilterFunction<T>;
  orderBy?: OrderBy | OrderBy[];
}
```

Options for the `find` method.

### FindPaginatedOptions

```typescript
interface FindPaginatedOptions<T> extends FindOptions<T> {
  page: number;
  pageSize: number;
}
```

Options for the `findPaginated` method.

### Pagination

```typescript
interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
```

Pagination metadata returned by `findPaginated`.

### PaginatedResult

```typescript
interface PaginatedResult<T> {
  items: T[];
  pagination: Pagination;
}
```

Result type for paginated queries.

## Method Reference

### Core CRUD Operations

#### get

```typescript
async get(id: string | number): Promise<T | null>
```

Retrieves a single record by its ID.

**Parameters:**

- `id: string | number` - The primary key value

**Returns:**

- `Promise<T | null>` - The record if found, null otherwise

**Example:**

```typescript
const user = await userRepo.get('123');
if (user) {
  console.log(user.name);
}
```

**Throws:**

- Supabase errors for database issues

#### create

```typescript
async create(data: Omit<T, 'id'>): Promise<T>
```

Creates a new record in the database.

**Parameters:**

- `data: Omit<T, 'id'>` - The record data without the ID field

**Returns:**

- `Promise<T>` - The created record with generated ID

**Example:**

```typescript
const newUser = await userRepo.create({
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});
console.log(newUser.id); // Generated ID
```

**Throws:**

- Supabase errors for validation, constraint violations, etc.

#### update

```typescript
async update(id: string | number, data: Partial<Omit<T, 'id'>>): Promise<T>
```

Updates an existing record.

**Parameters:**

- `id: string | number` - The primary key value
- `data: Partial<Omit<T, 'id'>>` - Partial update data

**Returns:**

- `Promise<T>` - The updated record

**Example:**

```typescript
const updatedUser = await userRepo.update('123', {
  name: 'Jane Doe',
  age: 31
});
```

**Throws:**

- Supabase errors if record not found or update fails

#### delete

```typescript
async delete(id: string | number): Promise<void>
```

Deletes a record by its ID.

**Parameters:**

- `id: string | number` - The primary key value

**Returns:**

- `Promise<void>`

**Example:**

```typescript
await userRepo.delete('123');
```

**Throws:**

- Supabase errors for database issues

### Query Operations

#### find

```typescript
async find(options?: FindOptions<T>): Promise<T[]>
```

Finds multiple records with optional filtering and ordering.

**Parameters:**

- `options?: FindOptions<T>` - Query options

**Returns:**

- `Promise<T[]>` - Array of matching records

**Examples:**

```typescript
// Find all records
const allUsers = await userRepo.find();

// Find with filter
const adults = await userRepo.find({
  filter: (query) => query.gte('age', 18)
});

// Find with ordering
const sortedUsers = await userRepo.find({
  orderBy: { column: 'created_at', ascending: false }
});

// Find with filter and ordering
const activeAdults = await userRepo.find({
  filter: (query) => query.gte('age', 18).eq('status', 'active'),
  orderBy: { column: 'name', ascending: true }
});

// Multiple order columns
const complexSort = await userRepo.find({
  orderBy: [
    { column: 'status', ascending: true },
    { column: 'created_at', ascending: false }
  ]
});
```

#### findPaginated

```typescript
async findPaginated(options: FindPaginatedOptions<T>): Promise<PaginatedResult<T>>
```

Finds records with pagination support.

**Parameters:**

- `options: FindPaginatedOptions<T>` - Pagination and query options

**Returns:**

- `Promise<PaginatedResult<T>>` - Paginated results with metadata

**Example:**

```typescript
const page = await userRepo.findPaginated({
  page: 1,
  pageSize: 10,
  filter: (query) => query.eq('status', 'active'),
  orderBy: { column: 'created_at', ascending: false }
});

console.log(page.items); // Array of 10 users
console.log(page.pagination.totalCount); // Total matching records
console.log(page.pagination.totalPages); // Total pages available
```

### Utility Operations

#### exists

```typescript
async exists(filter: FilterFunction<T>): Promise<boolean>
```

Checks if any records match the given filter.

**Parameters:**

- `filter: FilterFunction<T>` - Filter function to apply

**Returns:**

- `Promise<boolean>` - True if matching records exist

**Example:**

```typescript
const emailExists = await userRepo.exists(
  (query) => query.eq('email', 'john@example.com')
);

if (emailExists) {
  throw new Error('Email already registered');
}
```

#### count

```typescript
async count(filter?: FilterFunction<T>): Promise<number>
```

Counts records, optionally with a filter.

**Parameters:**

- `filter?: FilterFunction<T>` - Optional filter function

**Returns:**

- `Promise<number>` - Count of matching records

**Examples:**

```typescript
// Count all records
const totalUsers = await userRepo.count();

// Count with filter
const activeUsers = await userRepo.count(
  (query) => query.eq('status', 'active')
);
```

### Bulk Operations

#### createMany

```typescript
async createMany(records: Omit<T, 'id'>[]): Promise<T[]>
```

Creates multiple records in a single database operation.

**Parameters:**

- `records: Omit<T, 'id'>[]` - Array of records to create

**Returns:**

- `Promise<T[]>` - Array of created records with generated IDs

**Example:**

```typescript
const newUsers = await userRepo.createMany([
  { name: 'John', email: 'john@example.com', age: 30 },
  { name: 'Jane', email: 'jane@example.com', age: 28 }
]);

console.log(newUsers.length); // 2
```

#### updateMany

```typescript
async updateMany(records: Array<{ id: string | number } & Partial<T>>): Promise<T[]>
```

Updates multiple records. Each record must include its ID.

**Parameters:**

- `records: Array<{ id: string | number } & Partial<T>>` - Array of updates

**Returns:**

- `Promise<T[]>` - Array of updated records

**Example:**

```typescript
const updatedUsers = await userRepo.updateMany([
  { id: '1', name: 'John Updated' },
  { id: '2', age: 32 }
]);
```

**Note:** This method performs individual updates sequentially. For better performance with large datasets, consider using native Supabase bulk operations.

#### deleteMany

```typescript
async deleteMany(ids: Array<string | number>): Promise<void>
```

Deletes multiple records by their IDs.

**Parameters:**

- `ids: Array<string | number>` - Array of primary key values

**Returns:**

- `Promise<void>`

**Example:**

```typescript
await userRepo.deleteMany(['1', '2', '3']);
```

### Advanced Operations

#### upsert

```typescript
async upsert(data: Partial<T>, conflictColumns: string[]): Promise<T>
```

Inserts a new record or updates an existing one based on conflict columns.

**Parameters:**

- `data: Partial<T>` - The record data
- `conflictColumns: string[]` - Columns to check for conflicts

**Returns:**

- `Promise<T>` - The upserted record

**Examples:**

```typescript
// Upsert by email
const user = await userRepo.upsert(
  { name: 'John Doe', email: 'john@example.com', age: 30 },
  ['email']
);

// Upsert by multiple columns
const user = await userRepo.upsert(
  { name: 'John', email: 'john@example.com', department_id: 1 },
  ['email', 'department_id']
);

// Upsert with ID (update if exists, insert if not)
const user = await userRepo.upsert(
  { id: 'specific-id', name: 'John', email: 'john@example.com' },
  ['id']
);
```

## Filter Examples

The `filter` function parameter supports all Supabase query builder methods:

### Equality and Comparison

```typescript
// Exact match
filter: (query) => query.eq('status', 'active')

// Not equal
filter: (query) => query.neq('status', 'deleted')

// Greater than / less than
filter: (query) => query.gt('age', 18)
filter: (query) => query.gte('age', 18)
filter: (query) => query.lt('age', 65)
filter: (query) => query.lte('age', 65)
```

### Text Operations

```typescript
// Case-insensitive pattern matching
filter: (query) => query.ilike('name', '%john%')

// Case-sensitive pattern matching
filter: (query) => query.like('name', 'John%')

// Full text search
filter: (query) => query.textSearch('content', 'programming')
```

### Array and Range Operations

```typescript
// Value in array
filter: (query) => query.in('status', ['active', 'pending'])

// Value contains
filter: (query) => query.contains('tags', ['javascript', 'typescript'])

// Range operations
filter: (query) => query.range('created_at', '2024-01-01', '2024-12-31')
```

### Null Operations

```typescript
// Is null
filter: (query) => query.is('deleted_at', null)

// Is not null
filter: (query) => query.not('deleted_at', 'is', null)
```

### Complex Conditions

```typescript
// Multiple AND conditions
filter: (query) => query
  .eq('status', 'active')
  .gte('age', 18)
  .lte('age', 65)

// OR conditions
filter: (query) => query.or('age.gte.65,role.eq.admin')

// Complex combinations
filter: (query) => query
  .eq('status', 'active')
  .or('age.gte.65,department.eq.engineering')
  .not('deleted_at', 'is', null)
```

## Error Handling

All methods throw Supabase errors directly. Common error scenarios:

```typescript
try {
  const user = await userRepo.get('non-existent-id');
} catch (error) {
  // Handle different error types
  if (error.code === 'PGRST116') {
    // Record not found
  } else if (error.code === '23505') {
    // Unique constraint violation
  }
  console.error('Database error:', error.message);
}
```

## Performance Considerations

### Indexing

Ensure your database has appropriate indexes for columns used in filters:

```sql
-- Index for common filter columns
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_age ON users(age);
CREATE INDEX idx_users_email ON users(email);

-- Composite index for multiple filters
CREATE INDEX idx_users_status_age ON users(status, age);
```

### Pagination

Use `findPaginated` instead of `find` with `limit` for better performance with large datasets:

```typescript
// Better for large datasets
const page = await userRepo.findPaginated({
  page: 1,
  pageSize: 50,
  filter: (query) => query.eq('status', 'active')
});

// Avoid for large datasets
const users = await userRepo.find({
  filter: (query) => query.eq('status', 'active').limit(50)
});
```

### Bulk Operations

Use bulk methods when working with multiple records:

```typescript
// Efficient
await userRepo.createMany(users);

// Less efficient
for (const user of users) {
  await userRepo.create(user);
}
```
