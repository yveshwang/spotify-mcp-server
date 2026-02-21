# Implementation Plan: Track Metadata Lookup

## Overview

This implementation adds two new MCP tools to the Spotify MCP Server for retrieving track metadata. The tools will be added to `src/read.ts` following the existing architectural patterns. Implementation will proceed incrementally: first extending type definitions, then implementing the single track lookup tool, followed by the multiple track lookup tool, and finally adding comprehensive tests.

## Tasks

- [x] 1. Extend type definitions for track metadata
  - Add `SpotifyTrackMetadata` interface to `src/types.ts`
  - Include fields: id, name, artists, album, duration_ms, explicit, popularity, preview_url, external_ids (with isrc), external_urls
  - Ensure compatibility with existing `SpotifyTrack` interface
  - _Requirements: 4.1, 4.3_

- [ ] 2. Implement single track metadata lookup tool
  - [x] 2.1 Create `get_track` tool definition in `src/read.ts`
    - Define tool with name, description, and Zod schema for trackId parameter
    - Implement handler using `handleSpotifyRequest()` wrapper
    - Use `spotifyApi.tracks.get(trackId)` to fetch track data
    - Format response with all metadata fields (name, artists, album, duration, popularity, explicit, ISRC, preview URL, Spotify URL)
    - Handle track not found case with descriptive error message
    - Use `formatDuration()` utility for duration formatting
    - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.4, 3.5_

  - [x] 2.2 Write property test for single track retrieval completeness
    - **Property 1: Single Track Retrieval Completeness**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 2.3 Write property test for invalid track ID error handling
    - **Property 2: Invalid Track ID Error Handling**
    - **Validates: Requirements 1.3**

  - [x] 2.4 Write unit tests for single track lookup edge cases
    - Test with empty string track ID
    - Test with null/undefined inputs
    - Test error message formatting
    - _Requirements: 1.3, 1.4_

- [x] 3. Implement multiple track metadata lookup tool
  - [x] 3.1 Create `get_tracks` tool definition in `src/read.ts`
    - Define tool with name, description, and Zod schema for trackIds array parameter (max 50)
    - Implement handler using `handleSpotifyRequest()` wrapper
    - Use `spotifyApi.tracks.get(trackIds)` to fetch multiple tracks
    - Handle empty array input with appropriate message
    - Format response with numbered track list
    - Handle null values for invalid IDs in response
    - Display count of valid tracks vs total requested
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.4, 3.5_

  - [x] 3.2 Write property test for multiple track retrieval with order preservation
    - **Property 3: Multiple Track Retrieval with Order Preservation**
    - **Validates: Requirements 2.1, 2.2**

  - [x] 3.3 Write property test for mixed valid and invalid ID handling
    - **Property 4: Mixed Valid and Invalid ID Handling**
    - **Validates: Requirements 2.3**

  - [x] 3.4 Write unit tests for multiple track lookup edge cases
    - Test with empty array (edge case for requirement 2.4)
    - Test with exactly 50 track IDs (boundary condition for requirement 2.5)
    - Test with array containing only invalid IDs
    - Test error handling for batch size validation
    - _Requirements: 2.4, 2.5_

- [x] 4. Register new tools with MCP server
  - [x] 4.1 Export new tools from `src/read.ts`
    - Add `getTrack` and `getTracks` to the `readTools` array export
    - Verify tools are automatically registered in `src/index.ts`
    - _Requirements: 3.1, 3.2_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across many inputs
- Unit tests validate specific examples and edge cases
- The implementation follows existing patterns in `src/read.ts` for consistency
- No new OAuth scopes are required (track metadata is publicly accessible)
- Testing requires `fast-check` library for property-based testing
