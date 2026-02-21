---
name: typescript-standards
description: TypeScript and Node.js coding standards for this project
inclusion: fileMatch
fileMatchPattern: ["**/*.ts", "**/*.tsx", "**/tsconfig.*.json"]
---

# TypeScript/Node.js Standards

## Code Style
- Use Biome for linting and formatting (already configured)
- 2-space indentation
- Single quotes for strings
- Trailing commas required
- Semicolons required

## TypeScript
- Strict mode enabled
- Explicit return types for exported functions
- Use `type` for object shapes, `interface` for extensible contracts
- Avoid `any`, use `unknown` when type is truly unknown

## Error Handling
- Use custom error classes
- Always handle promise rejections
- Validate inputs with Zod schemas

## MCP Specific
- Tool handlers should be async
- Use proper MCP SDK types from @modelcontextprotocol/sdk
- Validate all tool parameters with Zod