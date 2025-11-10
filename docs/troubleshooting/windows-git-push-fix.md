# Fix: Windows Git Push "getaddrinfo() thread failed to start" in Cursor

## Quick Fix (Try First)

1. **Check for third-party firewalls** - Uninstall (not disable) any third-party firewall software and test. This has resolved the issue for multiple users.

2. **Set HTTP version to 1.1**:
   ```powershell
   git config --global http.version HTTP/1.1
   ```

3. **Remove problematic configs**:
   ```powershell
   git config --global --unset http.threads
   git config --global --unset http.lowspeedlimit
   git config --global --unset http.lowspeedtime
   git config --global --unset http.receivepack
   ```

4. **Restart Cursor completely** (close all windows, reopen)

## Permanent Solutions

### Option 1: Use IP Address (Bypass DNS)
```powershell
# Get GitHub IP
$ip = [System.Net.Dns]::GetHostAddresses("github.com")[0].IPAddressToString

# Update remote to use IP
git remote set-url origin "https://$ip/BackslashBryant/Icebreaker.git"

# Push
git push origin agent/vector/1-onboarding-flow

# Restore later if needed
git remote set-url origin https://github.com/BackslashBryant/Icebreaker.git
```

### Option 2: Switch to SSH (Bypass HTTP Threading)
```powershell
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: Settings > SSH and GPG keys > New SSH key
# Copy public key: cat ~/.ssh/id_ed25519.pub

# Update remote to SSH
git remote set-url origin git@github.com:BackslashBryant/Icebreaker.git

# Push
git push origin agent/vector/1-onboarding-flow
```

### Option 3: Check Third-Party Firewall (CRITICAL)
**Some users resolved this by uninstalling third-party firewalls** (not just disabling).

Common culprits:
- Free Firewall
- Comodo Firewall
- ZoneAlarm
- Norton Firewall
- Kaspersky Firewall
- Any other third-party firewall software

**Action**: Temporarily uninstall (not just disable) any third-party firewall and test. If it works, reinstall with proper Git.exe exceptions, or switch to Windows Defender Firewall only.

### Option 4: Add Git to Windows Firewall Exceptions
1. Windows Security > Firewall & network protection
2. Allow an app through firewall
3. Add `C:\Program Files\Git\cmd\git.exe` to exceptions (both inbound and outbound)
4. Restart Cursor

### Option 5: Update Git for Windows
1. Download latest: https://git-scm.com/downloads
2. Install (may fix threading bugs)
3. Restart Cursor

## If All Else Fails

Push manually from your PowerShell terminal (outside Cursor):
```powershell
cd 'C:\Users\OrEo2\Desktop\DevOps\1. Projects\Icebreaker'
git push origin agent/vector/1-onboarding-flow
```

Token is already configured in Windows Credential Manager, so it will work automatically.

## Root Cause

Windows DNS threading bug in git's HTTP client when executed in Cursor's subprocess context. Not a network or authentication issue - git can't spawn DNS resolution threads in the subprocess environment.


