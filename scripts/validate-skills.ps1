Write-Host "Validating /StartApp"
powershell -File scripts/StartApp.ps1
Write-Host "Checking health endpoint"
try {
  Invoke-RestMethod -Uri "http://localhost:8081/health/live" -Method Get | Out-Null
  Write-Host "Health check OK"
} catch {
  Write-Error "Health check failed"
  exit 1
}
Write-Host "Validating /StopApp"
powershell -File scripts/StopApp.ps1
Write-Host "Validating /ResetApp"
powershell -File scripts/ResetApp.ps1
Write-Host "Skill validation complete"
