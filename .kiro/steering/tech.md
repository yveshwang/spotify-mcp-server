# Tech Stack

## Core Technologies

- TypeScript (ES2022 target)
- Node.js v16+ with ES modules (type: "module")
- Model Context Protocol SDK (@modelcontextprotocol/sdk)
- Spotify Web API SDK (@spotify/web-api-ts-sdk)

## Development Tools

- Biome: Linting and formatting (replaces ESLint + Prettier)
- TypeScript compiler with strict mode enabled
- Zod: Runtime schema validation

## Build System

- TypeScript compiler (tsc) outputs to `./build` directory
- Source files in `./src` directory
- Module resolution: Node16

## Common Commands

```bash
# Build the project
npm run build

# Run authentication flow
npm run auth

# Lint code
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Type checking only (no emit)
npm run typecheck
```

## Code Quality Standards

- Biome enforces 80 character line width
- 2-space indentation
- Single quotes for strings
- Trailing commas required
- Semicolons required
- Strict TypeScript mode enabled
- Import type enforcement for type-only imports
