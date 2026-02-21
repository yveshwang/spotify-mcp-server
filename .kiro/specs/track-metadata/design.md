# Design Document: Track Metadata Lookup

## Overview

This feature adds two new MCP tools to the Spotify MCP Server that enable AI assistants to retrieve detailed metadata for Spotify tracks. The implementation follows the existing architectural patterns established in the codebase, organizing the new tools in the `read.ts` module alongside other read-only operations.

The feature provides:
- **Single track lookup**: Retrieve metadata for one track by its Spotify ID
- **Batch track lookup**: Retrieve metadata for up to 50 tracks in a single request

Both tools leverage the official Spotify Web API SDK (`@spotify/web-api-ts-sdk`) and follow the project's established patterns for authentication, error handling, and type safety.

## Architecture

### Module Organization

The track metadata tools will be added to `src/read.ts`, which contains all read-only operations. This placement is consistent with the existing architecture where tools are organized by domain:
- `read.ts`: Read-only operations (search, playlists, now playing, etc.)
- `play.ts`: Playback control and playlist modification
- `albums.ts`: Album-specific operations

### Integration Points

1. **MCP Server Registration** (`src/index.ts`): The new tools will be exported from `read.ts` and automatically registered with the MCP server through the existing `readTools` array.

2. **Spotify API Client** (`src/utils.ts`): Both tools will use `createSpotifyApi()` to obtain an authenticated Spotify API client with automatic token refresh.

3. **Error Handling** (`src/utils.ts`): Both tools will use `handleSpotifyRequest()` wrapper for consistent error handling across the application.

4. **Type Definitions** (`src/types.ts`): New TypeScript interfaces will be added to represent track metadata responses.

### API Endpoints

The implementation will use these official Spotify Web API endpoints:

1. **GET /tracks/{id}**: Retrieve a single track
   - Path parameter: `id` (Spotify track ID)
   - Returns: Track object with full metadata

2. **GET /tracks**: Retrieve multiple tracks
   - Query parameter: `ids` (comma-separated list of Spotify track IDs)
   - Maximum: 50 IDs per request
   - Returns: Array of track objects (null for invalid IDs)

## Components and Interfaces

### Type Definitions

Extend `src/types.ts` with enhanced track metadata interface:

```typescript
export interface SpotifyTrackMetadata {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url: string | null;
  external_ids?: {
    isrc?: string;
  };
  external_urls: {
    spotify: string;
  };
}
```

Note: The existing `SpotifyTrack` interface will remain for backward compatibility. The new `SpotifyTrackMetadata` interface provides additional fields specifically for metadata lookup operations.

### Tool Definitions

#### Tool 1: get_track

```typescript
const getTrack: tool<{
  trackId: z.ZodString;
}> = {
  name: 'get_track',
  description: 'Get detailed metadata for a single Spotify track by its ID',
  schema: {
    trackId: z.string().describe('The Spotify ID of the track'),
  },
  handler: async (args, _extra: SpotifyHandlerExtra) => {
    // Implementation details in next section
  },
};
```

**Input Validation**:
- `trackId`: Required string parameter validated by Zod schema
- No additional format validation (Spotify API will reject invalid IDs)

**Output Format**:
```
# Track Metadata

**Track**: "Song Name"
**Artists**: Artist 1, Artist 2
**Album**: Album Name
**Duration**: 3:45
**Popularity**: 85/100
**Explicit**: Yes/No
**ISRC**: USRC12345678
**Preview**: [URL or "Not available"]
**Spotify URL**: https://open.spotify.com/track/...
**ID**: {track_id}
```

#### Tool 2: get_tracks

```typescript
const getTracks: tool<{
  trackIds: z.ZodArray<z.ZodString>;
}> = {
  name: 'get_tracks',
  description: 'Get detailed metadata for multiple Spotify tracks by their IDs (max 50)',
  schema: {
    trackIds: z.array(z.string()).max(50).describe(
      'Array of Spotify track IDs (maximum 50)'
    ),
  },
  handler: async (args, _extra: SpotifyHandlerExtra) => {
    // Implementation details in next section
  },
};
```

**Input Validation**:
- `trackIds`: Required array of strings
- Maximum length: 50 (enforced by Zod schema)
- Empty array handling: Return empty result set

**Output Format**:
```
# Track Metadata (N tracks)

## 1. "Song Name 1"
**Artists**: Artist 1, Artist 2
**Album**: Album Name
**Duration**: 3:45
**Popularity**: 85/100
**ID**: {track_id_1}

## 2. "Song Name 2"
**Artists**: Artist 3
**Album**: Album Name 2
**Duration**: 4:12
**Popularity**: 72/100
**ID**: {track_id_2}

[Invalid ID]: {track_id_3} - Track not found
```

### Implementation Logic

#### Single Track Lookup (get_track)

```typescript
handler: async (args, _extra: SpotifyHandlerExtra) => {
  const { trackId } = args;

  try {
    const track = await handleSpotifyRequest(async (spotifyApi) => {
      return await spotifyApi.tracks.get(trackId);
    });

    if (!track) {
      return {
        content: [{
          type: 'text',
          text: `Track with ID "${trackId}" not found`,
        }],
      };
    }

    const artists = track.artists.map((a) => a.name).join(', ');
    const duration = formatDuration(track.duration_ms);
    const explicit = track.explicit ? 'Yes' : 'No';
    const preview = track.preview_url || 'Not available';
    const isrc = track.external_ids?.isrc || 'N/A';

    return {
      content: [{
        type: 'text',
        text:
          `# Track Metadata\n\n` +
          `**Track**: "${track.name}"\n` +
          `**Artists**: ${artists}\n` +
          `**Album**: ${track.album.name}\n` +
          `**Duration**: ${duration}\n` +
          `**Popularity**: ${track.popularity}/100\n` +
          `**Explicit**: ${explicit}\n` +
          `**ISRC**: ${isrc}\n` +
          `**Preview**: ${preview}\n` +
          `**Spotify URL**: ${track.external_urls.spotify}\n` +
          `**ID**: ${track.id}`,
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error retrieving track metadata: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }],
    };
  }
}
```

#### Multiple Track Lookup (get_tracks)

```typescript
handler: async (args, _extra: SpotifyHandlerExtra) => {
  const { trackIds } = args;

  // Handle empty array
  if (trackIds.length === 0) {
    return {
      content: [{
        type: 'text',
        text: 'No track IDs provided',
      }],
    };
  }

  try {
    const tracks = await handleSpotifyRequest(async (spotifyApi) => {
      return await spotifyApi.tracks.get(trackIds);
    });

    if (!tracks || tracks.length === 0) {
      return {
        content: [{
          type: 'text',
          text: 'No tracks found for the provided IDs',
        }],
      };
    }

    const formattedTracks = tracks.map((track, index) => {
      if (!track) {
        return `\n[Invalid ID]: ${trackIds[index]} - Track not found`;
      }

      const artists = track.artists.map((a) => a.name).join(', ');
      const duration = formatDuration(track.duration_ms);

      return (
        `\n## ${index + 1}. "${track.name}"\n` +
        `**Artists**: ${artists}\n` +
        `**Album**: ${track.album.name}\n` +
        `**Duration**: ${duration}\n` +
        `**Popularity**: ${track.popularity}/100\n` +
        `**ID**: ${track.id}`
      );
    }).join('\n');

    const validCount = tracks.filter(t => t !== null).length;

    return {
      content: [{
        type: 'text',
        text: `# Track Metadata (${validCount} of ${trackIds.length} tracks)\n${formattedTracks}`,
      }],
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error retrieving track metadata: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }],
    };
  }
}
```

## Data Models

### Input Models

**Single Track Request**:
```typescript
{
  trackId: string  // Spotify track ID (e.g., "11dFghVXANMlKmJXsNCbNl")
}
```

**Multiple Tracks Request**:
```typescript
{
  trackIds: string[]  // Array of Spotify track IDs (max 50)
}
```

### Output Models

**Track Metadata Response** (from Spotify API):
```typescript
{
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    artists: Array<{ id: string; name: string }>;
  };
  duration_ms: number;
  explicit: boolean;
  popularity: number;  // 0-100
  preview_url: string | null;
  external_ids: {
    isrc?: string;
  };
  external_urls: {
    spotify: string;
  };
}
```

**MCP Tool Response**:
```typescript
{
  content: Array<{
    type: 'text';
    text: string;  // Formatted markdown string
  }>;
}
```

### Error Responses

Both tools return error messages in the same MCP response format:

```typescript
{
  content: [{
    type: 'text',
    text: 'Error retrieving track metadata: [error message]'
  }]
}
```

Common error scenarios:
- Invalid track ID: "Track with ID \"xyz\" not found"
- API unavailable: "Error retrieving track metadata: [API error]"
- Authentication failure: Handled by `handleSpotifyRequest()` wrapper
- Empty input: "No track IDs provided"
- Batch size exceeded: Prevented by Zod schema validation (max 50)


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Single Track Retrieval Completeness

*For any* valid Spotify track ID, when the Track_Metadata_Service retrieves the track metadata, the response should contain all required fields: track name, artists array (non-empty), album name, duration (positive integer), popularity (0-100), explicit flag (boolean), and Spotify URL.

**Validates: Requirements 1.1, 1.2**

### Property 2: Invalid Track ID Error Handling

*For any* invalid or malformed Spotify track ID, when the Track_Metadata_Service attempts to retrieve track metadata, the service should return an error response containing a descriptive error message rather than throwing an unhandled exception.

**Validates: Requirements 1.3**

### Property 3: Multiple Track Retrieval with Order Preservation

*For any* non-empty list of valid Spotify track IDs (up to 50), when the Track_Metadata_Service retrieves metadata for multiple tracks, the response array should contain the same number of track objects as input IDs, and each track object at index i should correspond to the track ID at index i in the input array.

**Validates: Requirements 2.1, 2.2**

### Property 4: Mixed Valid and Invalid ID Handling

*For any* list of Spotify track IDs containing both valid and invalid IDs, when the Track_Metadata_Service retrieves metadata for multiple tracks, the response should contain track metadata objects for valid IDs and null values for invalid IDs, maintaining the same order as the input array.

**Validates: Requirements 2.3**

## Error Handling

### Error Categories

1. **Invalid Input Errors**
   - Invalid track ID format
   - Empty track ID
   - Batch size exceeds 50 tracks
   - Empty array for batch request

2. **API Errors**
   - Track not found (404)
   - Authentication failure (401)
   - Rate limiting (429)
   - Service unavailable (503)

3. **Network Errors**
   - Connection timeout
   - DNS resolution failure
   - Network unreachable

### Error Handling Strategy

All errors are handled through the `handleSpotifyRequest()` wrapper, which provides:
- Consistent error message formatting
- Automatic token refresh on authentication errors
- Graceful degradation for API failures

Error responses follow the MCP tool response format:
```typescript
{
  content: [{
    type: 'text',
    text: 'Error retrieving track metadata: [descriptive message]'
  }]
}
```

### Specific Error Handling

**Single Track Lookup**:
- Invalid ID → "Track with ID \"xyz\" not found"
- API error → "Error retrieving track metadata: [API error message]"
- Network error → Propagated through handleSpotifyRequest()

**Multiple Track Lookup**:
- Empty array → "No track IDs provided"
- Batch size > 50 → Prevented by Zod schema validation
- Mixed valid/invalid → Returns null for invalid IDs, metadata for valid IDs
- All invalid IDs → Returns array of nulls with appropriate message

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and error conditions
- Test with known valid track IDs (specific examples)
- Test with empty string track ID
- Test with null/undefined inputs
- Test with exactly 50 track IDs (boundary)
- Test with empty array
- Test error message formatting
- Test integration with handleSpotifyRequest()

**Property Tests**: Verify universal properties across all inputs
- Generate random valid track IDs and verify response structure
- Generate random invalid track IDs and verify error handling
- Generate random lists of track IDs (1-50) and verify order preservation
- Generate mixed valid/invalid ID lists and verify partial success handling

### Property-Based Testing Configuration

**Testing Library**: Use `fast-check` for TypeScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: **Feature: track-metadata, Property {number}: {property_text}**

**Generator Strategies**:

1. **Valid Track ID Generator**: Use a predefined set of known valid Spotify track IDs or generate IDs matching Spotify's format (22-character base62 strings)

2. **Invalid Track ID Generator**: Generate strings that don't match Spotify's ID format:
   - Empty strings
   - Too short/long strings
   - Invalid characters
   - Special characters

3. **Track ID List Generator**: Generate arrays of track IDs with varying lengths (0-50)

4. **Mixed ID List Generator**: Generate arrays containing both valid and invalid track IDs in random positions

### Test Organization

Tests should be organized in a new file: `src/__tests__/track-metadata.test.ts`

**Unit Test Structure**:
```typescript
describe('get_track tool', () => {
  it('should retrieve metadata for a valid track ID', async () => {
    // Test with known valid ID
  });

  it('should return error for invalid track ID', async () => {
    // Test with invalid ID
  });

  it('should handle API errors gracefully', async () => {
    // Mock API error
  });
});

describe('get_tracks tool', () => {
  it('should retrieve metadata for multiple valid track IDs', async () => {
    // Test with array of valid IDs
  });

  it('should return empty result for empty array', async () => {
    // Test edge case
  });

  it('should handle mixed valid and invalid IDs', async () => {
    // Test partial success
  });

  it('should reject arrays with more than 50 IDs', async () => {
    // Test boundary validation
  });
});
```

**Property Test Structure**:
```typescript
describe('Property-based tests for track metadata', () => {
  it('Property 1: Single track retrieval completeness', async () => {
    // Feature: track-metadata, Property 1: Single track retrieval completeness
    await fc.assert(
      fc.asyncProperty(
        validTrackIdGenerator(),
        async (trackId) => {
          const result = await getTrack({ trackId });
          // Verify all required fields present
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Invalid track ID error handling', async () => {
    // Feature: track-metadata, Property 2: Invalid track ID error handling
    await fc.assert(
      fc.asyncProperty(
        invalidTrackIdGenerator(),
        async (trackId) => {
          const result = await getTrack({ trackId });
          // Verify error response
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: Multiple track retrieval with order preservation', async () => {
    // Feature: track-metadata, Property 3: Multiple track retrieval with order preservation
    await fc.assert(
      fc.asyncProperty(
        fc.array(validTrackIdGenerator(), { minLength: 1, maxLength: 50 }),
        async (trackIds) => {
          const result = await getTracks({ trackIds });
          // Verify order preservation and completeness
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: Mixed valid and invalid ID handling', async () => {
    // Feature: track-metadata, Property 4: Mixed valid and invalid ID handling
    await fc.assert(
      fc.asyncProperty(
        mixedTrackIdListGenerator(),
        async (trackIds) => {
          const result = await getTracks({ trackIds });
          // Verify partial success handling
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Testing Balance

- Unit tests should focus on specific examples and edge cases (empty arrays, boundary conditions, specific error scenarios)
- Property tests should focus on universal behaviors across many random inputs
- Avoid writing too many unit tests for cases that property tests already cover
- Integration tests should verify the tools work correctly with the actual Spotify API (manual testing during development)
