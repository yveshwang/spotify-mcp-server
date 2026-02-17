# Product Overview

Spotify MCP Server is a Model Context Protocol (MCP) server that enables AI assistants to control Spotify playback and manage playlists through natural language commands.

## Core Functionality

The server provides three main categories of operations:

- Read operations: Search, get now playing, playlists, queue, devices, and saved tracks
- Play/Create operations: Control playback (play, pause, skip), manage playlists, adjust volume, and queue management
- Album operations: Get album details, tracks, and manage saved albums

## Target Users

Developers integrating AI assistants (Claude Desktop, Cursor, Cline) with Spotify for voice/text-controlled music management.

## Authentication

Uses OAuth 2.0 with automatic token refresh. Requires Spotify Premium for volume control features.
