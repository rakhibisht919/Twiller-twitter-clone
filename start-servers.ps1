Write-Host "🛠️ Starting Twitter Clone Servers..." -ForegroundColor Green

# Kill any existing node processes
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start backend server
Write-Host "Starting backend server on port 5001..." -ForegroundColor Cyan
Set-Location "D:\twiller-twitterclone\server"
$backendJob = Start-Job -ScriptBlock { 
    Set-Location "D:\twiller-twitterclone\server"
    npm start 
}

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend server
Write-Host "Starting frontend server on port 3000..." -ForegroundColor Cyan
Set-Location "D:\twiller-twitterclone\twiller"
$frontendJob = Start-Job -ScriptBlock { 
    Set-Location "D:\twiller-twitterclone\twiller"
    npm start 
}

# Wait for frontend to start
Start-Sleep -Seconds 8

Write-Host "Checking server status..." -ForegroundColor Cyan

# Check if ports are listening
$backend = netstat -an | findstr ":5001"
$frontend = netstat -an | findstr ":3000"

if ($backend) {
    Write-Host "✅ Backend server is running on port 5001" -ForegroundColor Green
} else {
    Write-Host "❌ Backend server is NOT running" -ForegroundColor Red
}

if ($frontend) {
    Write-Host "✅ Frontend server is running on port 3000" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend server is NOT running" -ForegroundColor Red
}

Write-Host ""
Write-Host "📱 If both servers are running, access your site at:" -ForegroundColor Yellow
Write-Host "   http://192.168.29.125:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Backend API available at:" -ForegroundColor Yellow  
Write-Host "   http://192.168.29.125:5001" -ForegroundColor White
Write-Host ""

# Keep jobs running
Write-Host "Servers are running in background. Press Ctrl+C to stop." -ForegroundColor Magenta
try {
    while ($true) {
        Start-Sleep -Seconds 5
        # Check if jobs are still running
        if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
            Write-Host "⚠️ One or more servers have stopped!" -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host "Stopping background jobs..." -ForegroundColor Yellow
    $backendJob | Stop-Job -Force
    $frontendJob | Stop-Job -Force
    $backendJob | Remove-Job -Force
    $frontendJob | Remove-Job -Force
}