# Cursor Skills: /StartApp /StopApp /ResetApp

These commands are defined to manage the connector Docker stack.

## /StartApp
- Runs: `powershell -File scripts/StartApp.ps1`
- Behavior: starts connector API + Postgres via Docker Compose.

## /StopApp
- Runs: `powershell -File scripts/StopApp.ps1`
- Behavior: stops connector stack while preserving DB volume.

## /ResetApp
- Runs: `powershell -File scripts/ResetApp.ps1`
- Behavior: stops stack and removes connector DB volume for a clean reset.
