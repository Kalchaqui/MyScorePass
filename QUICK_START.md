# ⚡ Quick Start - DeFiCred

Guía rápida para poner en marcha DeFiCred en Windows en 5 minutos.

## 📋 Pre-requisitos

- ✅ Node.js instalado (v18+)
- ✅ MetaMask con Moonbase Alpha configurado
- ✅ Tokens DEV del faucet
- ✅ Git instalado

## 🚀 Setup Rápido (PowerShell)

### 1. Clonar e Instalar

```powershell
# Clonar repositorio
git clone https://github.com/tu-usuario/DeFiCred.git
cd DeFiCred

# Instalar todas las dependencias
cd contracts
npm install

cd ..\frontend
npm install

cd ..\backend
npm install

cd ..
```

### 2. Configurar Contratos

```powershell
cd contracts

# Crear .env
Copy-Item .env.example .env

# Editar .env con tu PRIVATE_KEY (abre en notepad)
notepad .env
```

Agregar:
```
PRIVATE_KEY=tu_private_key_sin_0x
```

### 3. Desplegar Contratos

```powershell
# Compilar
npx hardhat compile

# Ejecutar tests (opcional)
npx hardhat test

# Desplegar en Moonbase Alpha
npx hardhat run scripts/deploy.js --network moonbase
```

**⚠️ Guarda las direcciones que te muestra en pantalla!**

### 4. Configurar Frontend

```powershell
cd ..\frontend

# Crear .env
Copy-Item .env.example .env

# Editar con las direcciones de los contratos
notepad .env
```

Reemplazar las direcciones con las que obtuviste en el deployment:
```
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_CREDIT_SCORING_ADDRESS=0x...
NEXT_PUBLIC_LENDING_POOL_ADDRESS=0x...
NEXT_PUBLIC_LOAN_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
```

### 5. Configurar Backend

```powershell
cd ..\backend

# Crear .env
Copy-Item .env.example .env

# Editar (opcional, los defaults funcionan)
notepad .env
```

### 6. Iniciar Todo 🎉

Necesitas **3 terminales de PowerShell**:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

**Terminal 3 - Para obtener tokens USDC:**
```powershell
cd contracts
npx hardhat console --network moonbase
```

En la consola de Hardhat:
```javascript
const MockUSDC = await ethers.getContractAt("MockUSDC", "TU_USDC_ADDRESS");
await MockUSDC.faucet(ethers.parseUnits("1000", 6));
// Presiona Ctrl+C para salir
```

## 🌐 Abrir la Aplicación

1. Ir a: http://localhost:3000
2. Click en "Connect Wallet"
3. Aprobar conexión en MetaMask
4. ¡Listo! Ya puedes usar DeFiCred

## ✅ Checklist de Verificación

- [ ] Node.js instalado
- [ ] MetaMask con Moonbase Alpha configurado
- [ ] Tokens DEV obtenidos del faucet
- [ ] Contratos desplegados exitosamente
- [ ] Direcciones guardadas en frontend/.env
- [ ] Backend corriendo en puerto 3001
- [ ] Frontend corriendo en puerto 3000
- [ ] Wallet conectada
- [ ] Tokens USDC obtenidos

## 🐛 Problemas Comunes

### "npx no se reconoce como comando"

**Solución:**
```powershell
# Reinstalar Node.js desde nodejs.org
# Reiniciar PowerShell
```

### "Insufficient funds for gas"

**Solución:**
```powershell
# Ir a: https://faucet.moonbeam.network/
# Pegar tu dirección de wallet
# Esperar 1 minuto
```

### "Cannot connect to localhost:3000"

**Solución:**
```powershell
# Verificar que el frontend esté corriendo
cd frontend
npm run dev
```

### "Contract not found"

**Solución:**
- Verificar que las direcciones en `.env` sean correctas
- Verificar en https://moonbase.moonscan.io/ que los contratos existan

## 📚 Documentación Completa

- `README.md` - Documentación principal
- `DEPLOYMENT_GUIDE.md` - Guía detallada de deployment
- `HACKATHON_SUBMISSION.md` - Resumen para la hackathon

## 🎯 Flujo de Prueba Rápido

1. **Crear Identidad**
   - Dashboard → "Crear Identidad"
   - Aprobar transacción

2. **Obtener USDC**
   - Usar el comando de faucet de arriba

3. **Calcular Score**
   - Dashboard → "Calcular Score"
   - Aprobar transacción

4. **Depositar (como Prestamista)**
   - Dashboard → "Prestar Fondos"
   - Aprobar USDC
   - Depositar (ej: 500 USDC)

5. **Solicitar Préstamo (como Prestatario)**
   - Dashboard → "Solicitar Préstamo"
   - Ingresar monto
   - Aprobar transacción

6. **Ver Préstamo**
   - Dashboard → "Mis Préstamos"

## 💻 Comandos Útiles

### Ver logs del backend
```powershell
cd backend
npm run dev
# Los logs aparecerán aquí
```

### Recompilar contratos
```powershell
cd contracts
npx hardhat clean
npx hardhat compile
```

### Ejecutar tests
```powershell
cd contracts
npx hardhat test
```

### Ver balance de wallet
```powershell
cd contracts
npx hardhat console --network moonbase
```
```javascript
const [signer] = await ethers.getSigners();
console.log(await ethers.provider.getBalance(signer.address));
```

## 🎥 Video Tutorial

[Link al video cuando esté disponible]

## ❓ ¿Necesitas Ayuda?

1. Revisar esta guía completamente
2. Revisar `DEPLOYMENT_GUIDE.md` para más detalles
3. Buscar el error en la consola
4. Abrir un issue en GitHub

## 🎉 ¡Listo!

Si todo funciona, deberías tener:
- ✅ Backend corriendo
- ✅ Frontend corriendo
- ✅ Contratos desplegados
- ✅ Wallet conectada
- ✅ Aplicación funcional

**¡Disfruta usando DeFiCred! 🚀**

---

**Tiempo estimado de setup: 5-10 minutos**

*Para la hackathon NERDCONF de Polkadot*


