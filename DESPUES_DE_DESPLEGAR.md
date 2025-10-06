# ✅ Checklist: Después de Desplegar en Remix

## 🎯 Acabas de Desplegar los 6 Contratos

Tienes las 6 direcciones guardadas. **¿Qué sigue?**

---

## PASO 1: Actualizar Frontend (5 minutos)

### A. Crear archivo .env.local

```powershell
cd frontend
```

Crear archivo: `frontend/.env.local`

```env
# Direcciones de Contratos Desplegados
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0xTU_DIRECCION_AQUI
NEXT_PUBLIC_CREDIT_SCORING_ADDRESS=0xTU_DIRECCION_AQUI
NEXT_PUBLIC_LENDING_POOL_ADDRESS=0xTU_DIRECCION_AQUI
NEXT_PUBLIC_INSURANCE_POOL_ADDRESS=0xTU_DIRECCION_AQUI
NEXT_PUBLIC_LOAN_MANAGER_ADDRESS=0xTU_DIRECCION_AQUI
NEXT_PUBLIC_USDC_ADDRESS=0xTU_DIRECCION_AQUI

# Network Config
NEXT_PUBLIC_CHAIN_ID=420420422
NEXT_PUBLIC_RPC_URL=https://testnet-passet-hub-eth-rpc.polkadot.io
NEXT_PUBLIC_NETWORK_NAME=Paseo Asset Hub
```

### B. Reiniciar Frontend

```powershell
# Ctrl+C para detener
npm run dev
```

---

## PASO 2: Obtener Tokens USDC (2 minutos)

En **Remix IDE**, con MockUSDC desplegado:

```
1. En "Deployed Contracts", expandir MockUSDC
2. Buscar función: faucet
3. Ingresar amount: 10000000000
4. Click [transact]
5. Confirmar en MetaMask
6. Esperar confirmación
```

**Verificar:** En MetaMask, deberías ver 10,000 USDC

---

## PASO 3: Depositar Liquidez en el Pool (5 minutos)

**Para que el sistema tenga fondos para prestar:**

### A. Aprobar USDC para LendingPool

En Remix, con MockUSDC:
```
1. Función: approve
2. spender: [pegar dirección de LendingPool]
3. amount: 5000000000 (5,000 USDC)
4. [transact] → Confirmar
```

### B. Depositar en el Pool

En Remix, con LendingPool:
```
1. Función: deposit
2. _amount: 5000000000 (5,000 USDC)
3. [transact] → Confirmar
```

**Verificar:** Pool ahora tiene $5,000 para prestar

---

## PASO 4: Probar el Sistema Completo (15 minutos)

### Test 1: Crear Identidad

**En Frontend** (http://localhost:3000/dashboard):

1. Click "Crear Identidad"
2. Subir cualquier imagen como "documento"
3. Confirmar transacción en MetaMask
4. Esperar confirmación

**Verificar en Remix:**
```
IdentityRegistry → getIdentity
└─ _user: [tu wallet]
└─ Debería mostrar tu identidad
```

---

### Test 2: Verificar Identidad (Como Admin)

**En Remix**, con IdentityRegistry:

```
1. Función: verifyIdentity
2. _user: [tu wallet address]
3. _level: 2
4. [transact] → Confirmar
```

**Verificar en Frontend:**
- Refresca la página
- Deberías ver "Verificado - Nivel 2"

---

### Test 3: Calcular Score

**En Frontend:**

1. Click "Calcular Score"
2. Confirmar transacción
3. Esperar... tu score aparecerá!

**Deberías ver:**
```
Score: 300-400/1000
Límite: $300-$400
```

---

### Test 4: Solicitar Préstamo

**En Frontend** → `/dashboard/borrow`:

1. Ingresar monto: **200** (dentro de tu límite)
2. Seleccionar plan: **6 cuotas (12%)**
3. Ver calculadora actualizar
4. Click "Solicitar Préstamo"
5. Confirmar transacción

**¡Deberías recibir 200 USDC en tu wallet!**

**Verificar:**
- Balance USDC aumentó
- En `/dashboard/loans` aparece tu préstamo
- Progress bar 0/6 cuotas

---

### Test 5: Ver Préstamo Activo

**En Frontend** → `/dashboard/loans`:

Deberías ver:
```
┌────────────────────────────────┐
│ 💰 Préstamo Activo             │
│ Préstamo #1                     │
│ Monto: 200 USDC                 │
│ Cuotas: 0/6 pagadas             │
│ Próximo pago: [fecha]           │
│ Cuota: $35.33                   │
│ [Pagar Cuota] [Pagar Todo]     │
└────────────────────────────────┘
```

---

## PASO 5: Tomar Screenshots (10 minutos)

**Screenshots necesarios para la hackathon:**

### 1. Contratos en BlockScout
```
URL: https://blockscout-passet-hub.parity-testnet.parity.io
Buscar cada dirección de contrato
Capturar pantalla mostrando:
- ✅ Contrato creado
- ✅ Transacción exitosa
```

### 2. Landing Page
```
http://localhost:3000
- Capturar hero section
- Con gradiente animado visible
```

### 3. Dashboard
```
http://localhost:3000/dashboard
- Con tus 3 cards
- Mostrando datos reales
```

### 4. Selector de Cuotas
```
http://localhost:3000/dashboard/borrow
- Con calculadora funcionando
- Plan de 6 cuotas seleccionado
```

### 5. Préstamo Activo
```
http://localhost:3000/dashboard/loans
- Mostrando tu préstamo
- Con progress bar
```

### 6. MetaMask
```
- Balance de USDC
- Balance de PAS
- Red Paseo seleccionada
```

---

## PASO 6: Preparar Demo (20 minutos)

### Opción A: Video Pregrabado (Recomendado)

**Usar Loom o OBS:**

1. Grabar pantalla
2. Narrar mientras muestras:
   ```
   0:00-0:30 → Landing page
   0:30-1:00 → Problema y solución
   1:00-2:30 → Demo completa (crear identidad → préstamo)
   2:30-3:00 → Tecnología y visión
   ```
3. Exportar video
4. Tener como backup

### Opción B: Demo en Vivo

**Preparar:**
1. Wallet 1 (tuya): Admin
2. Wallet 2 (nueva): Usuario demo
3. Practicar 3 veces el flujo completo
4. Tener video de backup por si falla

---

## PASO 7: Actualizar Documentación (10 minutos)

### A. README.md

Agregar al inicio:

```markdown
## 🎉 Contratos Desplegados en Paseo Testnet

- **MockUSDC**: 0x...
- **IdentityRegistry**: 0x...
- **CreditScoring**: 0x...
- **LendingPool**: 0x...
- **InsurancePool**: 0x...
- **LoanManager**: 0x...

🔗 **Explorer**: https://blockscout-passet-hub.parity-testnet.parity.io
🌐 **Demo en Vivo**: http://tu-deployment-url.com (si hosteas)
```

### B. HACKATHON_SUBMISSION.md

Actualizar con:
- ✅ Links a contratos verificados
- ✅ Screenshots
- ✅ Link a video demo

---

## PASO 8: Preparar Presentación (30 minutos)

### A. Slides

1. Abrir `PRESENTACION_NERDCONF.md`
2. Copiar a Google Slides o Canva
3. Agregar screenshots que tomaste
4. Agregar link a contratos en BlockScout

### B. Practicar Pitch

```
1. Leer guion 1 vez
2. Practicar con timer (5 minutos exactos)
3. Grabar en tu teléfono
4. Ver y ajustar
5. Practicar 2 veces más
```

---

## PASO 9: Testing Final (15 minutos)

**Crear wallet de prueba y hacer flujo completo:**

1. Nueva wallet en MetaMask
2. Enviarle PAS y USDC
3. Hacer TODO el flujo como usuario nuevo:
   - Conectar wallet
   - Crear identidad
   - Calcular score
   - Solicitar préstamo
   - Ver préstamo activo

**Si funciona de principio a fin:** ✅ LISTO PARA HACKATHON

---

## PASO 10: Backup y Seguridad (5 minutos)

### A. Commit a GitHub

```bash
git add .
git commit -m "feat: DeFiCred completo - Desplegado en Paseo"
git push origin main
```

### B. Guardar Información Crítica

Crear archivo `DEPLOYMENT_INFO.txt`:

```
Proyecto: DeFiCred
Network: Paseo Testnet (420420422)
Fecha: [fecha]

Direcciones:
- MockUSDC: 0x...
- IdentityRegistry: 0x...
- CreditScoring: 0x...
- LendingPool: 0x...
- InsurancePool: 0x...
- LoanManager: 0x...

Admin Wallet: 0x6ceffA0beE387C7c58bAb3C81e17D32223E68718

Explorer:
https://blockscout-passet-hub.parity-testnet.parity.io

Frontend:
http://localhost:3000

Demo Video:
[link cuando lo subas]
```

---

## 📊 Checklist Final Pre-Hackathon:

```
□ Contratos desplegados en Paseo ✅
□ Direcciones guardadas en múltiples lugares
□ Frontend actualizado con direcciones
□ Frontend conectado y funcionando
□ Tokens USDC obtenidos
□ Liquidez depositada en pool ($5,000+)
□ Flujo completo probado end-to-end
□ Screenshots tomados (6 mínimo)
□ Video demo grabado o practicado
□ Presentación creada en Slides
□ Pitch practicado (5 min exactos)
□ Código en GitHub
□ Documentación actualizada
□ Plan B preparado (video backup)
```

---

## 🎯 Timeline Después de Desplegar:

```
Minuto 0-5:   Actualizar frontend .env
Minuto 5-7:   Obtener USDC
Minuto 7-12:  Depositar liquidez
Minuto 12-27: Probar flujo completo
Minuto 27-37: Tomar screenshots
Minuto 37-57: Preparar demo
Minuto 57-67: Actualizar docs
Minuto 67-97: Practicar presentación

Total: ~1 hora 40 minutos después de desplegar
```

---

## 🚨 Si Algo Falla:

### **Frontend no conecta:**
- Verificar direcciones en `.env.local`
- Reiniciar servidor (`npm run dev`)
- Verificar MetaMask en red Paseo

### **Transacciones fallan:**
- Verificar gas suficiente (PAS)
- Verificar aprobaciones de USDC
- Ver error en consola del navegador

### **Contratos no funcionan:**
- Verificar permisos configurados
- Verificar en BlockScout que transacciones confirmaron
- Probar funciones directamente en Remix

---

## 📞 Soporte:

**Si necesitas ayuda:**
- Discord de Polkadot
- NERDCONF Discord
- O avísame y te ayudo a debuggear

---

✅ **Este archivo es tu guía para después de desplegar**

Primero termina el deployment en Remix, y luego vuelve aquí! 🚀
