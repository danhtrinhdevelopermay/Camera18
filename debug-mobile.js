// Debug script to test mobile detection and Camera API
console.log('=== Mobile Debug Test ===');

// Test 1: Capacitor detection
console.log('1. Capacitor Detection:');
console.log('  window.Capacitor exists:', typeof window.Capacitor !== 'undefined');
console.log('  window.Capacitor.isNativePlatform():', 
  typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform ? 
  window.Capacitor.isNativePlatform() : 'Not available');

// Test 2: Camera API import
console.log('2. Camera API:');
try {
  // This will work only after proper import
  console.log('  Camera API available:', typeof Camera !== 'undefined');
} catch (e) {
  console.log('  Camera API error:', e.message);
}

// Test 3: User Agent
console.log('3. User Agent:', navigator.userAgent);

// Test 4: Platform info
console.log('4. Platform Info:');
console.log('  Platform:', navigator.platform);
console.log('  Device Memory:', navigator.deviceMemory || 'Not available');
console.log('  Touch Support:', 'ontouchstart' in window);

// Test 5: MediaDevices support
console.log('5. MediaDevices Support:');
console.log('  getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
console.log('  enumerateDevices:', !!navigator.mediaDevices?.enumerateDevices);

export default function debugMobile() {
  return 'Debug info logged to console';
}