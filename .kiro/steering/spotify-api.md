---
inclusion: auto
---

# Spotify API Guidelines

## Official Documentation

**CRITICAL**: Always reference the official Spotify Web API documentation when implementing new endpoints or modifying existing ones:

https://developer.spotify.com/documentation/web-api

**MANDATORY VALIDATION**: Before implementing any Spotify API endpoint, you MUST:
1. Look up the exact endpoint in the official documentation
2. Verify the request schema (path parameters, query parameters, request body)
3. Verify the response schema (structure, field types, optional vs required fields)
4. Confirm OAuth scopes required for the endpoint
5. Check for any rate limits or special requirements

## Implementation Requirements

### Schema and Syntax Validation (MANDATORY)

**Before implementing ANY Spotify API endpoint:**

1. **Navigate to the official docs** at https://developer.spotify.com/documentation/web-api
2. **Find the specific endpoint** you're implementing (use the search or browse by category)
3. **Document the exact request schema:**
   - HTTP method (GET, POST, PUT, DELETE)
   - Full endpoint path with parameter placeholders
   - Path parameters (type, required/optional, format)
   - Query parameters (type, required/optional, default values, constraints)
   - Request body schema (if applicable)
4. **Document the exact response schema:**
   - Success response structure (all fields and their types)
   - Field optionality (which fields can be null or undefined)
   - Nested object structures
   - Array item types
5. **Verify OAuth scopes** required for the operation
6. **Note constraints:** rate limits, pagination, batch size limits, Premium requirements

**Example validation checklist for GET /tracks/{id}:**
- ✓ Path parameter: `id` (string, required, Spotify track ID format)
- ✓ Response: Track object with fields: id, name, artists[], album{}, duration_ms, explicit, popularity, preview_url, external_ids{isrc}, external_urls{spotify}
- ✓ OAuth scope: None required (public data)
- ✓ Rate limit: Standard rate limiting applies

### Before Writing Code

1. **Search the official docs** for the specific endpoint you're implementing
2. **Verify the endpoint path, HTTP method, and parameters** match the current API version
3. **Check required OAuth scopes** for the operation
4. **Review response structure** to ensure types match the actual API response
5. **Note any rate limits or special requirements** mentioned in the docs

### When Creating New Tools

- **ALWAYS verify the endpoint exists** in the official documentation first
- Use the `@spotify/web-api-ts-sdk` methods that correspond to documented endpoints
- **Match request parameters exactly** to the API specification (names, types, constraints)
- **Match response parsing exactly** to the documented response structure
- Include proper error handling for API-specific error codes (400, 401, 403, 404, 429, 500, 503)
- Document any Premium-only features in tool descriptions
- **Validate TypeScript types** match the actual API response fields

### Type Safety Requirements

When defining TypeScript interfaces for Spotify API responses:
- Field names must match the API documentation exactly (snake_case as per Spotify API)
- Field types must match the documented types (string, number, boolean, object, array)
- Mark optional fields with `?` or `| null` as documented
- Include nested object structures as documented
- Use arrays with proper item types (e.g., `Artist[]` not `any[]`)

**Example:**
```typescript
// Correct - matches Spotify API docs
interface SpotifyTrack {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;  // Can be null per docs
  external_ids?: {              // Optional per docs
    isrc?: string;
  };
  external_urls: {
    spotify: string;
  };
}
```

### API Versioning

- The Spotify Web API does not use version numbers in URLs
- API changes are communicated through the developer changelog
- Always verify endpoint behavior against current documentation
- Test new implementations against the live API

## Common Endpoints Reference

**NOTE**: Always verify current endpoint details in official docs. This is a quick reference only.

### Tracks API
- GET `/tracks/{id}` - Get track metadata
  - Path: `id` (string, required)
  - Response: Track object
  - Scopes: None
- GET `/tracks` - Get multiple tracks
  - Query: `ids` (comma-separated string, max 50)
  - Response: `{ tracks: (Track | null)[] }`
  - Scopes: None

### Player API
- GET `/me/player` - Get playback state
- PUT `/me/player/play` - Start/resume playback
- PUT `/me/player/pause` - Pause playback
- POST `/me/player/next` - Skip to next
- POST `/me/player/previous` - Skip to previous
- PUT `/me/player/volume` - Set volume

### Playlists API
- GET `/me/playlists` - Get user's playlists
- GET `/playlists/{playlist_id}/tracks` - Get playlist tracks
- POST `/users/{user_id}/playlists` - Create playlist
- POST `/playlists/{playlist_id}/tracks` - Add tracks to playlist

### Library API
- GET `/me/tracks` - Get saved tracks
- GET `/me/albums` - Get saved albums
- PUT `/me/albums` - Save albums
- DELETE `/me/albums` - Remove albums

### Search API
- GET `/search` - Search for items (tracks, albums, artists, playlists)

## Required OAuth Scopes

Ensure tools request appropriate scopes in `src/auth.ts`:

- `user-read-playback-state` - Read player state
- `user-modify-playback-state` - Control playback
- `playlist-read-private` - Read private playlists
- `playlist-modify-private` - Modify private playlists
- `playlist-modify-public` - Modify public playlists
- `user-library-read` - Read saved tracks/albums
- `user-library-modify` - Save/remove tracks/albums
- `user-read-recently-played` - Read recently played

## SDK Usage

This project uses `@spotify/web-api-ts-sdk` which wraps the REST API. When implementing:

1. **Check the official Spotify API docs first** (not just the SDK docs)
2. Check if the SDK already has a method for the endpoint
3. **Verify the SDK method signature matches the API specification**
4. Use SDK methods rather than raw fetch calls when possible
5. If SDK method is missing, verify the endpoint exists in official docs before implementing
6. Follow the SDK's authentication pattern via `createSpotifyApi()` in utils.ts
7. **Test that SDK method returns data matching the documented response schema**

### SDK Method Verification

When using an SDK method like `spotifyApi.tracks.get()`:
1. Verify it calls the correct Spotify API endpoint
2. Check that parameters match the API specification
3. Confirm the return type matches the documented response
4. Test with real data to ensure schema alignment

## Testing Against Live API

- Use `npm run auth` to authenticate with real Spotify account
- Test new tools with actual Spotify data
- **Verify response structure matches documentation** by inspecting actual API responses
- Verify error handling with invalid inputs
- Check Premium-only features with appropriate account type
- **Validate that all documented fields are present** in responses
- **Check for undocumented fields** that might appear in responses (log warnings if found)

## Common Validation Mistakes to Avoid

1. ❌ Assuming field types without checking docs
2. ❌ Not handling null values for optional fields
3. ❌ Using camelCase when API uses snake_case
4. ❌ Not validating array item types
5. ❌ Ignoring pagination parameters
6. ❌ Not checking batch size limits (e.g., 50 tracks max)
7. ❌ Forgetting to verify OAuth scopes
8. ❌ Not handling rate limiting (429 errors)

## Quick Validation Workflow

For every new endpoint implementation:
1. 📖 Open official docs: https://developer.spotify.com/documentation/web-api
2. 🔍 Find the specific endpoint page
3. 📝 Copy the request schema (method, path, parameters)
4. 📝 Copy the response schema (all fields and types)
5. 🔐 Note required OAuth scopes
6. ⚠️ Note any constraints or limits
7. 💻 Implement with exact schema matching
8. ✅ Test with real API calls
9. ✅ Verify response matches documented schema
