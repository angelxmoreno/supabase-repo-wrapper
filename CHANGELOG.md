# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of supabase-repo-wrapper
- BaseRepository class with comprehensive CRUD operations
- TypeScript support with full type safety
- Comprehensive test suite with 32+ tests
- Complete documentation with examples

### Features
- **Core CRUD Operations**: get, create, update, delete
- **Query Methods**: find with filtering and ordering, findPaginated
- **Utility Methods**: exists, count
- **Bulk Operations**: createMany, updateMany, deleteMany
- **Advanced Operations**: upsert with conflict resolution
- **Type Safety**: Full TypeScript support with generics
- **Filtering**: Support for all Supabase query builder methods
- **Ordering**: Single and multiple column sorting
- **Pagination**: Built-in pagination with metadata

## [1.0.0] - 2024-01-XX

### Added
- Initial stable release
- BaseRepository abstract class
- Complete TypeScript type definitions
- Comprehensive documentation
- Usage examples and API reference
- Test suite with MockSupabaseClient
- Build and publish configuration

### Dependencies
- @supabase/supabase-js ^2.49.8
- drizzle-orm ^0.44.0

### Documentation
- README.md with quick start guide
- API documentation (docs/api.md)
- Usage examples (docs/examples.md)
- TypeScript types reference (docs/types.md)
- Contributing guidelines (CONTRIBUTING.md)

### Testing
- 32 comprehensive tests
- MockSupabaseClient for isolated testing
- Coverage for all BaseRepository methods
- Bulk operations testing
- Pagination testing
- Error scenario testing

### Development
- Bun-based build system
- Biome for linting and formatting
- TypeScript strict mode
- Lefthook for git hooks
- Conventional commit enforcement

---

## Release Notes Template

### [X.Y.Z] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes in existing functionality

#### Deprecated
- Soon-to-be removed features

#### Removed
- Now removed features

#### Fixed
- Bug fixes

#### Security
- Vulnerability fixes

---

## Version History

- **1.0.0**: Initial stable release with core BaseRepository functionality
- **Future releases**: Will follow semantic versioning for backward compatibility

## Migration Guides

### Upgrading to 1.0.0

This is the initial release, no migration needed.

## Breaking Changes

None in 1.0.0 release.

## Deprecation Notices

None in 1.0.0 release.