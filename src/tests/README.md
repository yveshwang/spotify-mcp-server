# Tests Directory

This directory contains all test files and test utilities for the Spotify MCP Server.

## Structure

```
src/tests/
├── README.md                           # This file
├── vitest.config.ts                    # Vitest configuration
├── track-metadata.test.ts              # Property-based and unit tests for track metadata
└── scripts/                            # Test utility scripts (not run by vitest)
    └── check-audio-features.js         # Manual script to check Audio Features API access
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run specific test file
```bash
npm test -- track-metadata
```

### Run with coverage
```bash
npm test -- --coverage
```

## Test Types

### Property-Based Tests (PBT)
Located in `track-metadata.test.ts`, these tests use `fast-check` to validate universal properties across many random inputs:
- Property 1: Single track retrieval completeness
- Property 2: Invalid track ID error handling
- Property 3: Multiple track retrieval with order preservation
- Property 4: Mixed valid and invalid ID handling

### Unit Tests
Located in `track-metadata.test.ts`, these tests cover specific edge cases:
- Empty string handling
- Special character handling
- Boundary conditions (50 track limit)
- Error message formatting

## Test Scripts

### Check Audio Features Access
Manual script to test if your Spotify app has access to the Audio Features API (BPM/tempo data):

```bash
node src/tests/scripts/check-audio-features.js
```

This script is not run by vitest - it's a standalone utility for checking API access.

## Test Configuration

Tests are configured in `src/tests/vitest.config.ts`:
- Test timeout: 30 seconds (for API calls)
- Test pattern: `**/*.test.{ts,js}` (relative to tests directory)
- Environment: Node.js

## Writing New Tests

1. Create test files with `.test.ts` or `.test.js` extension
2. Place them in `src/tests/` directory
3. Use vitest's `describe`, `it`, and `expect` for unit tests
4. Use `fast-check` for property-based tests
5. Follow existing patterns in `track-metadata.test.ts`

## Notes

- Tests require valid Spotify authentication (run `npm run auth` first)
- Property-based tests run with 5 iterations by default (configurable)
- Network failures may cause intermittent test failures
- Test scripts in `scripts/` directory are excluded from vitest runs
