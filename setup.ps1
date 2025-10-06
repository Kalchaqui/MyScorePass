# DeFiCred Setup Script para Windows PowerShell
# Ejecutar con: .\setup.ps1

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "  DeFiCred Setup Automatizado   " -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green

# Verificar npm
Write-Host "Verificando npm..." -ForegroundColor Yellow
$npmVersion = npm --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm no está instalado" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm instalado: $npmVersion" -ForegroundColor Green
Write-Host ""

# Instalar dependencias de contratos
Write-Host "1️⃣  Instalando dependencias de contratos..." -ForegroundColor Cyan
Set-Location contracts
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias de contratos" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencias de contratos instaladas" -ForegroundColor Green

# Crear .env de contratos si no existe
if (-Not (Test-Path ".env")) {
    Write-Host "Creando .env para contratos..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Recuerda editar contracts/.env con tu PRIVATE_KEY" -ForegroundColor Yellow
}
Set-Location ..
Write-Host ""

# Instalar dependencias de frontend
Write-Host "2️⃣  Instalando dependencias de frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias de frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencias de frontend instaladas" -ForegroundColor Green

# Crear .env de frontend si no existe
if (-Not (Test-Path ".env")) {
    Write-Host "Creando .env para frontend..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Recuerda editar frontend/.env con las direcciones de contratos después del deployment" -ForegroundColor Yellow
}
Set-Location ..
Write-Host ""

# Instalar dependencias de backend
Write-Host "3️⃣  Instalando dependencias de backend..." -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias de backend" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencias de backend instaladas" -ForegroundColor Green

# Crear .env de backend si no existe
if (-Not (Test-Path ".env")) {
    Write-Host "Creando .env para backend..." -ForegroundColor Yellow
    Copy-Item .env.example .env
}
Set-Location ..
Write-Host ""

# Resumen
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "     ✅ Setup Completado! 🎉     " -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Edita contracts/.env con tu PRIVATE_KEY" -ForegroundColor White
Write-Host "2. Ejecuta: cd contracts && npx hardhat run scripts/deploy.js --network moonbase" -ForegroundColor White
Write-Host "3. Guarda las direcciones de contratos" -ForegroundColor White
Write-Host "4. Edita frontend/.env con las direcciones de contratos" -ForegroundColor White
Write-Host "5. Ejecuta: cd frontend && npm run dev (en una terminal)" -ForegroundColor White
Write-Host "6. Ejecuta: cd backend && npm run dev (en otra terminal)" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentación completa en: DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host "⚡ Guía rápida en: QUICK_START.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "¡Buena suerte con la hackathon! 🚀" -ForegroundColor Green


