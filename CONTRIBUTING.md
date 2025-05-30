# Contributing to supabase-repo-wrapper

Thank you for your interest in contributing to `supabase-repo-wrapper`! This document outlines the process for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

This project follows a simple code of conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Help make the project better for everyone

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.1.21 or higher
- [Node.js](https://nodejs.org) v18 or higher (for compatibility)
- Git

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/your-username/supabase-repo-wrapper.git
   cd supabase-repo-wrapper
   ```

3. Install dependencies:

   ```bash
   bun install
   ```

4. Run tests to ensure everything is working:

   ```bash
   bun test
   ```

5. Run linting:

   ```bash
   bun run lint
   ```

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/add-soft-delete` - for new features
- `fix/pagination-bug` - for bug fixes
- `docs/api-examples` - for documentation updates
- `refactor/query-builder` - for refactoring

### Commit Messages

Follow conventional commit format:

```txt
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat` - new feature
- `fix` - bug fix
- `docs` - documentation changes
- `style` - formatting, missing semicolons, etc.
- `refactor` - code change that neither fixes a bug nor adds a feature
- `test` - adding missing tests
- `chore` - maintain build scripts, dependencies, etc.

Examples:

```txt
feat(repository): add soft delete support

Add support for soft delete operations with deleted_at convention.
Includes new methods: softDelete, restore, findActive.

fix(pagination): correct total pages calculation

The total pages calculation was off by one when pageSize 
didn't divide evenly into totalCount.

docs(readme): add upsert examples

Add comprehensive examples showing upsert operations
with different conflict column scenarios.
```

### Code Style

The project uses Biome for linting and formatting:

- Run `bun run lint` to check for issues
- Run `bun run lint:fix` to auto-fix issues
- Follow existing code patterns and conventions
- Use TypeScript strict mode

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test tests/base-repository.test.ts
```

### Writing Tests

- Write tests for all new features and bug fixes
- Use descriptive test names that explain what is being tested
- Follow the existing test structure using Bun's test runner
- Test both success and error scenarios

Example test structure:

```typescript
import { describe, test, expect, beforeEach } from 'bun:test';

describe('FeatureName', () => {
  let repository: TestRepository;

  beforeEach(() => {
    // Setup code
  });

  describe('methodName', () => {
    test('should handle normal case', async () => {
      // Test implementation
    });

    test('should handle edge case', async () => {
      // Test implementation
    });

    test('should throw error when invalid input', async () => {
      // Test error scenarios
    });
  });
});
```

### Test Coverage

- Aim for high test coverage on new code
- Test critical paths and edge cases
- Include integration tests for complex features

## Pull Request Process

### Before Submitting

1. Ensure all tests pass:

   ```bash
   bun test
   ```

2. Ensure linting passes:

   ```bash
   bun run lint
   ```

3. Ensure the build works:

   ```bash
   bun run build
   ```

4. Update documentation if needed
5. Add/update tests for your changes

### Submitting the PR

1. Push your changes to your fork
2. Create a pull request against the `main` branch
3. Fill out the PR template with:
   - Clear description of changes
   - Link to any related issues
   - Testing instructions
   - Screenshots if applicable

### PR Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged

## Types of Contributions

### Bug Fixes

- Check existing issues first
- Create an issue if one doesn't exist
- Include reproduction steps
- Write tests that demonstrate the fix

### New Features

- Discuss major features in an issue first
- Ensure the feature aligns with project goals
- Include comprehensive tests
- Update documentation
- Consider backward compatibility

### Documentation

- Fix typos and improve clarity
- Add examples for common use cases
- Keep documentation up to date with code changes
- Follow existing documentation style

### Performance Improvements

- Include benchmarks showing improvement
- Ensure no functionality is broken
- Consider memory usage and scalability

## Development Guidelines

### Adding New Repository Methods

When adding new methods to `BaseRepository`:

1. Follow existing naming conventions
2. Include proper TypeScript types
3. Add comprehensive JSDoc comments
4. Write thorough tests
5. Update API documentation

Example:

```typescript
/**
 * Finds the first record matching the filter criteria.
 * @param filter - Filter function to apply
 * @returns Promise resolving to the first matching record or null
 */
async findFirst(filter: FilterFunction<T>): Promise<T | null> {
  const results = await this.find({ 
    filter,
    // Implementation details
  });
  return results[0] || null;
}
```

### Updating Dependencies

- Keep dependencies up to date
- Test thoroughly after updates
- Update lock files
- Document any breaking changes

### Breaking Changes

- Avoid breaking changes when possible
- If necessary, follow semantic versioning
- Provide migration guides
- Deprecate old APIs before removing

## Release Process

Releases are handled by maintainers:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release notes
4. Tag the release
5. Publish to npm

## Getting Help

- Check existing issues and discussions
- Create an issue for bugs or feature requests
- Ask questions in discussions
- Review documentation and examples

## Project Structure

```txt
supabase-repo-wrapper/
├── src/                    # Source code
│   ├── base-repository.ts  # Main repository class
│   ├── types.ts           # Type definitions
│   └── index.ts           # Entry point
├── tests/                 # Test files
├── docs/                  # Documentation
├── example/               # Usage examples
└── dist/                  # Built files (ignored)
```

## Coding Principles

- **Type Safety**: Leverage TypeScript's type system
- **Simplicity**: Keep the API simple and intuitive
- **Performance**: Consider query efficiency
- **Flexibility**: Support various use cases
- **Testability**: Write testable code
- **Documentation**: Document public APIs

Thank you for contributing to `supabase-repo-wrapper`!
