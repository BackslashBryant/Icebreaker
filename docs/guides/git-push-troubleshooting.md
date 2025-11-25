# Git Push Troubleshooting (Windows + WSL)

Use this guide whenever `git push` fails with DNS errors (`getaddrinfo() thread failed`), timeouts, or GitHub auth issues while working inside WSL/Cursor.

## Default Push Flow (SSH remote)
1. Confirm SSH auth once (only if you haven’t already):
   ```bash
   ssh -T git@github.com
   ```
   Accept the GitHub fingerprint and ensure your public key is registered (GitHub → Settings → SSH keys).
2. Commit your work on the issue branch: `git status` → `git commit`.
3. Run the helper script (wraps `git push` with retries):  
   `node tools/git-push-with-retry.mjs agent/<agent>/<issue>-<slug>`
4. For completion work on `main`: `node tools/git-push-with-retry.mjs main`

If that succeeds, you are done. If it fails, follow the steps below before escalating.

## Step 1 – Verify GitHub Auth
1. Run `gh auth status`. If not logged in, run `gh auth login`.
2. If the script reports `Authentication failed` or `403`, refresh credentials: `gh auth refresh -s repo`.

## Step 2 – Reset Windows DNS/WinSock
1. Open **Administrator PowerShell**.
2. Run:
   ```powershell
   netsh winsock reset
   ipconfig /flushdns
   ```
3. Reboot Windows. (Required for `netsh winsock reset` to take effect.)
4. Retry the push script once after reboot.

## Step 3 – Use Native Windows Git (Bypasses WSL networking)
When DNS still fails inside WSL, push with the Windows Git binary:
```powershell
& 'C:\Program Files\Git\cmd\git.exe' -C 'C:\Users\<you>\Desktop\DevOps\1. Projects\Icebreaker' push -u origin agent/<agent>/<issue>-<slug>
& 'C:\Program Files\Git\cmd\git.exe' -C 'C:\Users\<you>\Desktop\DevOps\1. Projects\Icebreaker' push origin main
```
- Adjust the path if your repo lives elsewhere.
- This uses the same commits but routes over native WinSock which is more stable after long WSL sessions.

## Step 4 – Switch Remote to SSH (Optional, avoids HTTPS auth/DNS)
If you already have SSH keys registered with GitHub:
```bash
git remote set-url origin git@github.com:BackslashBryant/Icebreaker.git
ssh -T git@github.com   # first-time trust prompt
git push -u origin agent/<agent>/<issue>-<slug>
```
Switch back to HTTPS with `git remote set-url origin https://github.com/BackslashBryant/Icebreaker.git` if needed.

## Other Tips
- Turn off VPNs and corporate firewalls before pushing; many block Git traffic.
- Keep WSL sessions short. Restart the terminal if it has been running for hours.
- If a push still fails after **Step 3**, capture the error text and escalate in the issue thread with the exact command/output.

Once the branch and `main` are successfully pushed, Vercel/Railway auto-deploy and the change is available for field tests immediately.
