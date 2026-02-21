#!/usr/bin/env node

/**
 * Quick test script to check if we have access to Spotify Audio Features API
 * This will test if we can get BPM/tempo data for tracks
 */

import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { readFileSync } from 'fs';

// Load config
const config = JSON.parse(readFileSync('./spotify-config.json', 'utf-8'));

// Create Spotify API client with OAuth tokens
const spotifyApi = SpotifyApi.withAccessToken(config.clientId, {
  access_token: config.accessToken,
  token_type: 'Bearer',
  expires_in: 3600,
  refresh_token: config.refreshToken,
});

// Test track ID (Mr. Brightside by The Killers)
const testTrackId = '3n3Ppam7vgaVa1iaRUc9Lp';

console.log('🔍 Testing Spotify Audio Features API access...\n');
console.log(`Test Track ID: ${testTrackId}`);
console.log('Attempting to fetch audio features (includes BPM/tempo)...\n');

try {
  // Try to get audio features
  const audioFeatures = await spotifyApi.tracks.audioFeatures(testTrackId);
  
  console.log('✅ SUCCESS! You have access to the Audio Features API!\n');
  console.log('Audio Features Data:');
  console.log('==================');
  console.log(`BPM (Tempo): ${audioFeatures.tempo}`);
  console.log(`Time Signature: ${audioFeatures.time_signature}/4`);
  console.log(`Key: ${audioFeatures.key}`);
  console.log(`Mode: ${audioFeatures.mode === 1 ? 'Major' : 'Minor'}`);
  console.log(`Danceability: ${audioFeatures.danceability}`);
  console.log(`Energy: ${audioFeatures.energy}`);
  console.log(`Loudness: ${audioFeatures.loudness} dB`);
  console.log(`Speechiness: ${audioFeatures.speechiness}`);
  console.log(`Acousticness: ${audioFeatures.acousticness}`);
  console.log(`Instrumentalness: ${audioFeatures.instrumentalness}`);
  console.log(`Liveness: ${audioFeatures.liveness}`);
  console.log(`Valence: ${audioFeatures.valence}`);
  console.log('\n✨ You can implement BPM/tempo features in your MCP server!');
  
} catch (error) {
  if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
    console.log('❌ ACCESS DENIED (403 Forbidden)\n');
    console.log('Your Spotify app does NOT have access to the Audio Features API.');
    console.log('\nThis means:');
    console.log('- Your app was likely created after November 27, 2024');
    console.log('- You cannot access BPM/tempo data');
    console.log('- You cannot access other audio features (danceability, energy, etc.)');
    console.log('\nThis is a Spotify API restriction for new applications.');
  } else {
    console.log('⚠️  ERROR occurred while testing:\n');
    console.log(error.message || error);
    console.log('\nFull error:', error);
  }
}
