Fixes and install steps for common installation issues (pnpm/npm, optional deps, socket.io)

PowerShell (Windows):

1. Open PowerShell as your user and run:

```powershell
cd 'E:\new health app\arogya-vault'
# remove previous installs
Remove-Item -Recurse -Force node_modules, package-lock.json, pnpm-lock.yaml
npm cache clean --force
# install with npm avoiding optional native deps
npm install --no-optional
```

2. If you prefer pnpm (recommended for monorepos):

```powershell
cd 'E:\new health app\arogya-vault'
# ensure pnpm home is set up
pnpm setup
pnpm install --frozen-lockfile || pnpm install
```

WSL / Linux:

```bash
cd '/mnt/e/new health app/arogya-vault'
rm -rf node_modules package-lock.json pnpm-lock.yaml
npm cache clean --force
npm install --no-optional
# or
pnpm setup
pnpm install --frozen-lockfile || pnpm install
```

If you see errors about a missing package version (e.g., socket.io-client@^4.9.1), ensure package.json versions are compatible. We synchronized `backend/package.json` to `^4.8.3` to match the latest published `socket.io-client`.

If issues persist, paste the full output of your install command and the file `C:\Users\Karn\AppData\Local\Temp\ng-*\angular-errors.log` (or the pnpm log). Also include `pnpm-lock.yaml`/`package-lock.json` if present.
