# Two-Laptop Field Test Guide

**Purpose**: Test Icebreaker with two real laptops sharing one backend server. This guide covers LAN setup, HTTPS requirements, and tunneling options.

## Prerequisites

- Two laptops on the same network (or use tunneling for remote testing)
- Node.js 18+ installed on both machines
- Host laptop: Backend server running
- Guest laptop: Frontend client connecting to host backend

## Quick Start

### Option 1: LAN Setup (Same Network)

**Best for**: Testing in the same room/building

#### Host Laptop (Backend Server)

1. **Find your IP address**:
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # Look for inet address (e.g., 192.168.1.100)
   ```

2. **Start backend bound to all interfaces**:
   ```bash
   cd backend
   npm install  # (if not already done)
   
   # Set environment variables
   export HOST=0.0.0.0  # Windows: set HOST=0.0.0.0
   export PORT=8000
   export CORS_ORIGIN=*  # Allow all origins for testing
   
   npm run dev
   ```

   **Note**: Backend will listen on `http://0.0.0.0:8000` (accessible from other machines)

3. **Configure firewall** (if needed):
   - **Windows**: Allow Node.js through Windows Firewall on port 8000
   - **Mac**: System Preferences → Security → Firewall → Allow Node.js
   - **Linux**: `sudo ufw allow 8000/tcp` (if using UFW)

#### Guest Laptop (Frontend Client)

1. **Set environment variables**:
   ```bash
   cd frontend
   
   # Replace <HOST_IP> with host laptop's IP address
   export VITE_API_URL=http://<HOST_IP>:8000  # Windows: set VITE_API_URL=http://<HOST_IP>:8000
   export VITE_WS_URL=ws://<HOST_IP>:8000  # Windows: set VITE_WS_URL=ws://<HOST_IP>:8000
   ```

2. **Start frontend**:
   ```bash
   npm install  # (if not already done)
   npm run dev
   ```

3. **Open browser**: Visit `http://localhost:3000`

**⚠️ Geolocation Limitation**: Browser Geolocation API requires HTTPS (except `localhost`). On LAN with HTTP, location step will fail silently. See **Option 2: HTTPS Setup** below.

---

### Option 2: HTTPS Setup (Required for Geolocation)

**Best for**: Full feature testing including location services

#### Host Laptop (Backend + Frontend with HTTPS)

1. **Install mkcert** (local CA for HTTPS):
   ```bash
   # Windows (using Chocolatey)
   choco install mkcert
   
   # Mac (using Homebrew)
   brew install mkcert
   
   # Linux
   # See: https://github.com/FiloSottile/mkcert#linux
   ```

2. **Create local CA and certificates**:
   ```bash
   # Install local CA
   mkcert -install
   
   # Generate certificate for your IP address
   mkcert <HOST_IP> localhost 127.0.0.1 ::1
   # Creates: <HOST_IP>+3.pem and <HOST_IP>+3-key.pem
   ```

3. **Start backend with HTTPS**:
   ```bash
   cd backend
   
   # Set environment variables
   export HOST=0.0.0.0
   export PORT=8000
   export CORS_ORIGIN=*
   export SSL_CERT=./<HOST_IP>+3.pem
   export SSL_KEY=./<HOST_IP>+3-key.pem
   
   # Note: Backend HTTPS support needs to be added
   # For now, use tunneling (Option 3) or test without location
   ```

4. **Start frontend with HTTPS**:
   ```bash
   cd frontend
   
   export VITE_API_URL=https://<HOST_IP>:8000
   export VITE_WS_URL=wss://<HOST_IP>:8000
   
   # Vite supports HTTPS via --https flag
   npm run dev -- --https
   ```

#### Guest Laptop (Frontend Client)

1. **Install mkcert CA** (same CA as host):
   ```bash
   mkcert -install
   ```

2. **Set environment variables**:
   ```bash
   cd frontend
   
   export VITE_API_URL=https://<HOST_IP>:8000
   export VITE_WS_URL=wss://<HOST_IP>:8000
   ```

3. **Start frontend**:
   ```bash
   npm run dev -- --https
   ```

4. **Open browser**: Visit `https://localhost:3000` (accept self-signed certificate warning)

---

### Option 3: Tunneling (Easiest for Remote Testing)

**Best for**: Testing across networks or avoiding HTTPS setup

#### Host Laptop (Backend Server)

1. **Start backend** (same as Option 1):
   ```bash
   cd backend
   export HOST=0.0.0.0
   export PORT=8000
   export CORS_ORIGIN=*
   npm run dev
   ```

2. **Create tunnel** (choose one):

   **Option A: ngrok** (recommended):
   ```bash
   # Install ngrok: https://ngrok.com/download
   ngrok http 8000
   # Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
   ```

   **Option B: Cloudflare Tunnel**:
   ```bash
   # Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   cloudflared tunnel --url http://localhost:8000
   # Copy the HTTPS URL
   ```

#### Guest Laptop (Frontend Client)

1. **Set environment variables** (use tunnel URL):
   ```bash
   cd frontend
   
   # Replace <TUNNEL_URL> with tunnel URL (without https://)
   export VITE_API_URL=https://<TUNNEL_URL>
   export VITE_WS_URL=wss://<TUNNEL_URL>
   ```

2. **Start frontend**:
   ```bash
   npm run dev
   ```

3. **Open browser**: Visit `http://localhost:3000`

**✅ Geolocation works**: Tunnel provides HTTPS, so location services work automatically.

---

## Testing Checklist

Once both laptops are connected:

- [ ] **Onboarding**: Complete onboarding on both laptops
- [ ] **Radar**: Both users appear on each other's Radar
- [ ] **Location**: Location step completes successfully (requires HTTPS)
- [ ] **Chat**: Request and accept chat between laptops
- [ ] **WebSocket**: Real-time updates work (radar updates, chat messages)
- [ ] **Safety**: Block/report works across laptops
- [ ] **Panic**: Panic button works and hides user from other laptop's Radar

## Troubleshooting

### Backend not accessible from guest laptop

- **Check firewall**: Ensure port 8000 is open on host laptop
- **Verify IP address**: Use `ipconfig`/`ifconfig` to confirm host IP
- **Test connection**: From guest laptop, run `curl http://<HOST_IP>:8000/api/health`
- **Check CORS**: Ensure `CORS_ORIGIN=*` is set on backend

### Geolocation fails silently

- **Requires HTTPS**: Browser Geolocation API blocks HTTP (except `localhost`)
- **Solutions**: Use tunneling (Option 3) or HTTPS setup (Option 2)
- **Workaround**: Skip location step for testing (set `location: null` in onboarding data)

### WebSocket connection fails

- **Check URL**: Ensure `VITE_WS_URL` uses `ws://` (HTTP) or `wss://` (HTTPS)
- **Verify backend**: Ensure backend WebSocket server is running
- **Check token**: Ensure session token is valid (complete onboarding first)

### Frontend can't connect to backend

- **Verify environment variables**: Check `VITE_API_URL` and `VITE_WS_URL` are set
- **Check network**: Ensure both laptops are on same network (for LAN setup)
- **Test API**: From guest laptop, run `curl <VITE_API_URL>/api/health`

## Production Alternative (Zero Setup - Recommended for Alpha Testing)

**Easiest option**: Both laptops just visit the production URL. No installation or configuration needed!

- **Frontend**: https://frontend-coral-two-84.vercel.app
- **Backend**: https://airy-fascination-production.up.railway.app (automatic)

**Instructions**:
1. Open browser on both laptops
2. Visit: https://frontend-coral-two-84.vercel.app
3. Start testing!

**Advantages**:
- ✅ Zero setup (no Node.js, no dependencies)
- ✅ HTTPS enabled (Geolocation works automatically)
- ✅ Results automatically tracked in Sentry
- ✅ Works immediately

**See**: `Docs/guides/alpha-testing.md` for complete alpha testing guide.

**For local testing** (if you need isolated environment), use the LAN/Tunneling options above.

---

**Next Steps**: Once field testing is complete, document any issues in `Docs/analysis/mvp-readiness-review-2025-11-16.md` and update this guide with lessons learned.

