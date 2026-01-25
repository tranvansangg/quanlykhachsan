#!/usr/bin/env node

/**
 * Diagnostic Script to Test API Connection
 * Run this to troubleshoot Network Error issues
 */

const http = require('http');
const https = require('https');

const API_URL = 'http://localhost:8800/api/hotels/search-available';

console.log('\n📋 === HOTEL BOOKING API DIAGNOSTIC ===\n');
console.log('Testing connection to:', API_URL);
console.log('Time:', new Date().toLocaleString());

// Test 1: Check if port 8800 is listening
console.log('\n🔍 Test 1: Checking if API server is running on port 8800...');

const testData = {
  city: 'test',
  roomRequests: [{ adults: 1, children: 0 }],
  checkInDate: new Date().toISOString(),
  checkOutDate: new Date(Date.now() + 86400000).toISOString(),
};

const options = {
  hostname: 'localhost',
  port: 8800,
  path: '/api/hotels/search-available',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': JSON.stringify(testData).length,
  },
  timeout: 5000,
};

const req = http.request(options, (res) => {
  console.log('✅ Server is responding!');
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\n📨 Response:', data.substring(0, 200));
    if (data.length > 200) console.log('... (truncated)');
    
    console.log('\n✅ API CONNECTION TEST PASSED!');
    console.log('\nPossible causes of "Network Error" in browser:');
    console.log('1. Browser cache - Try Ctrl+Shift+Delete to clear cache');
    console.log('2. CORS issue - Check browser console (F12) for CORS errors');
    console.log('3. Environment variable not set - Check client/.env file');
    console.log('4. Client not restarted - Restart "npm start" after changes');
  });
});

req.on('error', (err) => {
  console.log('\n❌ ERROR:', err.message);
  console.log('\nDiagnostic Results:');
  
  if (err.code === 'ECONNREFUSED') {
    console.log('⚠️  API SERVER IS NOT RUNNING on port 8800');
    console.log('\nSolution:');
    console.log('1. Open a terminal');
    console.log('2. Run: cd api');
    console.log('3. Run: npm install (if not done)');
    console.log('4. Run: npm start  (or node index.js)');
    console.log('5. Wait for "Connected to mongoDB." message');
  } else if (err.code === 'ETIMEDOUT') {
    console.log('⚠️  CONNECTION TIMEOUT - Server may be unresponsive');
  } else if (err.code === 'ENOTFOUND') {
    console.log('⚠️  HOST NOT FOUND - Check localhost spelling');
  } else {
    console.log('⚠️  Unknown error:', err.code);
  }
  
  process.exit(1);
});

req.on('timeout', () => {
  console.log('\n❌ REQUEST TIMEOUT');
  console.log('API server is not responding within 5 seconds');
  req.destroy();
  process.exit(1);
});

req.write(JSON.stringify(testData));
req.end();
