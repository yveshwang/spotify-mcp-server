# Spotify API Guidelines

## Official Documentation

**CRITICAL**: Always reference the official Spotify Web API documentation when implementing new endpoints or modifying existing ones:

https://developer.spotify.com/documentation/web-api

## Implementation Requirements

### Before Writing Code

1. **Search the official docs** for the specific endpoint you're implementing
2. **Verify the endpoint path, HTTP method, and parameters** match the current API version
3. **Check required OAuth scopes** for the operation
4. **Review response structure** to ensure types match the actual API response
5. **Note any rate limits or special requirements** mentioned in the docs

### When Creating New Tools

- Use the `@spotify/web-api-ts-sdk` methods that correspond to documented endpoints
- Validate that request parameters match the API specification
- Ensure response parsing aligns with the documented response structure
- Include proper error handling for API-specific error codes
- Document any Premium-only features in tool descriptions

### API Versioning

- The Spotify Web API does not use version numbers in URLs
- API changes are communicated through the developer changelog
- Always verify endpoint behavior against current documentation
- Test new implementations against the live API

## Common Endpoints Reference

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

1. Check if the SDK already has a method for the endpoint
2. Use SDK methods rather than raw fetch calls when possible
3. If SDK method is missing, verify the endpoint exists in official docs before implementing
4. Follow the SDK's authentication pattern via `createSpotifyApi()` in utils.ts

## Testing Against Live API

- Use `npm run auth` to authenticate with real Spotify account
- Test new tools with actual Spotify data
- Verify error handling with invalid inputs
- Check Premium-only features with appropriate account type
