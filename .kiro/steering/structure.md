# Project Structure

## Directory Layout

```
spotify-mcp-server/
├── src/                    # Source TypeScript files
│   ├── tests/             # Test files and test utilities
│   │   ├── vitest.config.ts  # Vitest configuration
│   │   ├── scripts/       # Test utility scripts (not run by vitest)
│   │   └── *.test.ts      # Vitest test files
│   ├── index.ts           # Main entry point, MCP server setup
│   ├── types.ts           # Shared TypeScript types and interfaces
│   ├── utils.ts           # Spotify API client, auth, config utilities
│   ├── read.ts            # Read operation tools (search, playlists, etc.)
│   ├── play.ts            # Playback control tools
│   ├── albums.ts          # Album operation tools
│   └── auth.ts            # OAuth authentication flow
├── build/                  # Compiled JavaScript output (gitignored)
├── node_modules/          # Dependencies (gitignored)
└── spotify-config.json    # Spotify API credentials (gitignored)
```

## Architecture Patterns

### Tool Organization

Tools are organized by domain into separate modules:
- `read.ts`: Read-only operations (search, get playlists, now playing)
- `play.ts`: Playback control and playlist modification
- `albums.ts`: Album-specific operations

Each module exports an array of tool definitions that are registered in `index.ts`.

### Tool Definition Pattern

Tools follow a consistent structure defined in `types.ts`:
- `name`: Tool identifier
- `description`: Human-readable description
- `schema`: Zod schema for parameter validation
- `handler`: Async function that executes the tool logic

### Spotify API Integration

- `utils.ts` provides `createSpotifyApi()` for authenticated API access
- Automatic token refresh when access token expires
- `handleSpotifyRequest()` wrapper handles common error cases
- Config loaded from `spotify-config.json` in project root

### Type Safety

- Shared types in `types.ts` for Spotify entities (Track, Album, Artist)
- Zod schemas validate tool parameters at runtime
- TypeScript strict mode catches type errors at compile time

## File Naming Conventions

- Use kebab-case for filenames (enforced by Biome)
- TypeScript files use `.ts` extension
- ES module imports require `.js` extension in import paths (Node16 resolution)

## Testing

### Test Organization

Tests are located in `src/tests/` directory:
- `*.test.ts` files are run by vitest
- `scripts/` directory contains utility scripts not run by vitest

### Test Types

- **Property-based tests**: Use `fast-check` to validate universal properties
- **Unit tests**: Test specific edge cases and error conditions
- **Integration tests**: Test against live Spotify API (require authentication)

### Running Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
```

### Test Configuration

- Configured in `src/tests/vitest.config.ts`
- Test timeout: 30 seconds (for API calls)
- Test pattern: `**/*.test.{ts,js}` (relative to tests directory)
