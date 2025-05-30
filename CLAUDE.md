# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `bun install`
- **Run the project**: `bun run src/index.ts`
- **Lint code**: `bun run lint`
- **Auto-fix linting issues**: `bun run lint:fix`

## Architecture

This is a Bun-based TypeScript project that appears to be a wrapper for Supabase functionality. The project is currently minimal with just a single entry point at `src/index.ts`.

### Tech Stack

- **Runtime**: Bun (v1.1.21+)
- **Language**: TypeScript with ESNext target
- **Linter/Formatter**: Biome (with 4-space indentation, single quotes, trailing commas)
- **Git Hooks**: Lefthook for pre-commit linting and conventional commit message validation

### Code Quality Tools

- Pre-commit hooks run Biome linting automatically
- Commit messages must follow conventional commit format (enforced by commitlint)
- TypeScript strict mode enabled with bundler module resolution

### File Structure

- `src/index.ts` - Main entry point (currently minimal)
- Configuration files: `biome.json`, `tsconfig.json`, `lefthook.yml`
