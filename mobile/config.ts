/**
 * Configuration for the AREA mobile app
 */

// Development configuration
export const CONFIG = {
  // Your development server URL
  // Updated to match your current network IP
  WEB_URL: 'http://10.109.252.131:3000', // Your current network IP
  
  // Alternative URLs you can try:
  // Local: 'http://localhost:3000' (won't work on physical device)
  // Previous network: 'http://192.168.1.30:3000' 
  // Current network: 'http://10.109.252.131:3000' (updated)
  // If using different port: 'http://10.109.252.131:8081'
  
  // App configuration
  APP_NAME: 'AREA',
  VERSION: '1.0.0',
};

// Helper function to get your network IP
export const getNetworkInstructions = () => {
  return `
To find your network IP:

1. On Linux/Mac: run 'ip addr' or 'ifconfig' 
2. On Windows: run 'ipconfig'
3. Look for your local network IP (usually 192.168.x.x)
4. Update the WEB_URL in mobile/config.ts
5. Make sure your frontend is running with: npm run dev

Example: If your IP is 192.168.1.50, use:
WEB_URL: 'http://192.168.1.50:8081'
  `;
};