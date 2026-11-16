# Grow More and Stable Life - Local Development Runner
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Grow More and Stable Life Local Dev Services" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# 1. Start Backend in Background or New Window
Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.app.main:app --reload --port 8000"

# 2. Start Frontend in Background or New Window
Write-Host "[2/2] Starting Next.js 14 Frontend on http://localhost:3000..." -ForegroundColor Green
Set-Location frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm.cmd run dev"

Write-Host "All local services launched!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  Docs:     http://127.0.0.1:8000/docs" -ForegroundColor White
