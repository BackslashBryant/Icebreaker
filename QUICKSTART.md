# Quick Start Guide - Get Icebreaker Running

## Prerequisites
- Node.js 18+ installed
- Two terminal windows/tabs

## Step 1: Start Backend Server

In Terminal 1:
```bash
cd backend
npm install  # (if not already done)
npm run dev
```

You should see:
```
Backend server running on http://localhost:8000
WebSocket server available on ws://localhost:8000/ws
```

## Step 2: Start Frontend Dev Server

In Terminal 2:
```bash
cd frontend
npm install  # (if not already done)
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
```

## Step 3: Open the App

Open your browser to: **http://localhost:3000**

You'll start at the Welcome screen. Click "PRESS START" to begin onboarding.

## What You Can Do

1. **Onboarding Flow**:
   - Complete the 4 steps (What We Are/Not → 18+ Consent → Location → Vibe & Tags)
   - Create your session and see your generated handle

2. **Radar View**:
   - See nearby people (if any are online)
   - Toggle between CRT Sweep and List views
   - Click on people to see their PersonCard

3. **Chat**:
   - Click "START CHAT" on a PersonCard to request a chat
   - If someone accepts, you'll enter the terminal-style chat interface

4. **Profile/Settings**:
   - Click the User icon in Radar header to access Profile
   - Toggle visibility, add emergency contact, adjust accessibility settings

5. **Safety Features**:
   - Panic Button (FAB) - Always accessible for immediate exit
   - Block/Report - Right-click or long-press PersonCard for safety options

## Testing with Multiple Users

To test chat/radar interactions, open multiple browser windows:
- Use **Incognito/Private mode** for additional sessions
- Each session gets a unique handle
- You'll see each other on Radar if both have visibility ON

## Troubleshooting

**Backend won't start?**
- Check if port 8000 is already in use: `npm run ports:status`
- Kill existing processes: `npm run ports:free:win` (Windows) or `npm run ports:free` (Mac/Linux)

**Frontend won't connect?**
- Verify backend is running on port 8000
- Check browser console for WebSocket connection errors
- Ensure CORS is enabled (should be automatic)

**No people on Radar?**
- This is normal if you're the only one online
- Open a second browser window (incognito) to see yourself
- Make sure visibility is ON in Profile settings

## Ports Used
- **Backend**: `http://localhost:8000` (HTTP + WebSocket)
- **Frontend**: `http://localhost:3000` (Vite dev server)

## Environment Variables (Optional)
No environment variables required for basic operation. All features work with defaults.

For production, you may want to set:
- `PORT` (backend port, default: 8000)
- `VITE_API_URL` (frontend API URL, default: http://localhost:8000)
