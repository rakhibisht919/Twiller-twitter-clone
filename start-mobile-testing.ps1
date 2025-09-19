Write-Host "🚀 Starting Twiller for Mobile Testing..." -ForegroundColor Green

# Stop any existing Node processes
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Cyan
Set-Location "D:\twiller-twitterclone\server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend server
Write-Host "Starting frontend server..." -ForegroundColor Cyan
Set-Location "D:\twiller-twitterclone\twiller"

# Copy mobile environment file
Copy-Item ".env.mobile" ".env" -Force

Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# Wait and display connection info
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "📱 Mobile Testing Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Access your app on mobile devices using:" -ForegroundColor Yellow
Write-Host "   http://192.168.29.125:3000" -ForegroundColor White
Write-Host ""
Write-Host "📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Make sure your phone is connected to the same WiFi network"
Write-Host "2. Open your mobile browser"
Write-Host "3. Go to: http://192.168.29.125:3000"
Write-Host "4. Your Twitter clone should load and work on mobile!"
Write-Host ""
Write-Host "🔧 API Endpoint:" -ForegroundColor Yellow  
Write-Host "   http://192.168.29.125:5001" -ForegroundColor White
Write-Host ""

# Check if ports are listening
Write-Host "Checking server status..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
$portCheck = netstat -an | findstr ":5001"
if ($portCheck) {
    Write-Host "✅ Backend server is running on port 5001" -ForegroundColor Green
} else {
    Write-Host "❌ Backend server is not running" -ForegroundColor Red
}

$frontendCheck = netstat -an | findstr ":3000" 
if ($frontendCheck) {
    Write-Host "✅ Frontend server is running on port 3000" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend server is not running" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")