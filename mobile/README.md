# IMPORTANT

meme wifi que le telephone

# AREA Mobile App

React Native Expo app that displays the AREA web application in a WebView.

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your phone (iOS/Android)

### Setup

1. **Configure the web URL**:
   ```bash
   # Edit mobile/config.ts and set your network IP
   # Find your IP with: ip addr show (Linux) or ipconfig (Windows)
   ```

2. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

3. **Start your frontend server** (in another terminal):
   ```bash
   cd frontend
   npm run dev
   # Make sure it's running on http://YOUR_IP:8081
   ```

4. **Start the mobile app**:
   ```bash
   cd mobile
   npm start
   # Scan QR code with Expo Go app
   ```

## 📱 Testing on Device

### Physical Device (Recommended)
1. Install Expo Go from App Store/Play Store
2. Make sure your phone and computer are on the same WiFi network
3. Update `CONFIG.WEB_URL` in `config.ts` with your computer's network IP
4. Run `npm start` and scan the QR code

### Simulator/Emulator
- iOS: `npm run ios` (requires Xcode on macOS)
- Android: `npm run android` (requires Android Studio)

## 🔧 Configuration

Edit `mobile/config.ts` to update:
- `WEB_URL`: Your frontend server URL
- Make sure the port matches your frontend (default: 8081)

## 📝 Network Setup

### Find Your Network IP:

**Linux/macOS:**
```bash
ip addr show | grep inet
# or
ifconfig | grep inet
```

**Windows:**
```bash
ipconfig
```

Look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)

### Frontend Configuration:
Make sure your Nuxt frontend accepts connections from your network:
```bash
# In frontend directory
npm run dev -- --host 0.0.0.0
# This allows connections from other devices on your network
```

## 🐛 Troubleshooting

### "Cannot connect to AREA web app"
1. Check that your frontend is running: `curl http://YOUR_IP:8081`
2. Make sure both devices are on the same WiFi network
3. Check firewall settings on your computer
4. Try accessing the URL in your phone's browser first

### WebView not loading
1. Clear Expo cache: `npx expo start --clear`
2. Restart Expo Go app
3. Check the URL in `config.ts` is correct

### Development on different network
If you need to test on a different network, consider using ngrok:
```bash
# Install ngrok
npm install -g ngrok

# In frontend directory (after starting your server)
ngrok http 8081

# Use the ngrok URL in mobile/config.ts
```

## 📦 Building for Production

### Build APK/IPA
```bash
cd mobile
npx eas build
```

### Run locally
```bash
# Development build
npx expo run:android
npx expo run:ios
```

## 🔗 Related

- Main frontend: `../frontend/`
- Backend API: `../backend/`
- Project docs: `../mobile-implementation-comparison.md`
