# 🚀 Próximos Pasos - MyScorePass MVP

## ✅ Lo que ya está funcionando

1. ✅ **Endpoints x402** - Los 3 endpoints están funcionando con simulación de pago
2. ✅ **Contrato SBT** - Creado `MyScorePassSBT.sol` (ERC-5192)
3. ✅ **Servicio de contratos** - Backend preparado para interactuar con contratos
4. ✅ **Rutas actualizadas** - Backend integrado con lógica de contratos

## 📋 Pasos para completar el MVP

### 1. Desplegar Contratos en Avalanche Fuji

```bash
cd contracts

# Configurar .env con:
# PRIVATE_KEY=tu_private_key
# AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc

# Compilar contratos
npm run compile

# Desplegar (usando Hardhat Ignition)
npx hardhat ignition deploy ignition/modules/MyScorePass.js --network avalancheFuji
```

**Guarda las direcciones de los contratos desplegados:**
- `IdentityRegistry`: `0x...`
- `CreditScoringMini`: `0x...`
- `MyScorePassSBT`: `0x...`

### 2. Configurar Variables de Entorno

#### Backend (`backend/.env`)

```env
PORT=3001
RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
BACKEND_PRIVATE_KEY=tu_private_key_del_backend
IDENTITY_REGISTRY_ADDRESS=0x...
CREDIT_SCORING_ADDRESS=0x...
SCOREPASS_SBT_ADDRESS=0x...
MERCHANT_WALLET_ADDRESS=0x... # Wallet que recibe pagos x402
```

#### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=tu_client_id
NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_CREDIT_SCORING_ADDRESS=0x...
NEXT_PUBLIC_SCOREPASS_SBT_ADDRESS=0x...
NEXT_PUBLIC_MERCHANT_WALLET_ADDRESS=0x...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Mejorar Frontend para Mostrar SBT

**Tareas pendientes:**
- [ ] Crear componente `SBTCard.tsx` para mostrar el SBT recibido
- [ ] Actualizar `/dashboard` para mostrar el SBT del usuario
- [ ] Agregar visualización del score en `/dashboard/score`
- [ ] Mostrar metadata del SBT (scoreHash, verificationLevel, etc.)

### 4. Probar Flujo Completo

1. **Conectar wallet** en `http://localhost:3000`
2. **Verificar identidad** (subir DNI en `/onboarding`)
3. **Aprobar identidad** (admin endpoint o manualmente en contrato)
4. **Calcular score** en `/test`:
   - Debe devolver HTTP 402 primero
   - Simular pago
   - Debe calcular score real y mintear SBT
5. **Verificar SBT** en blockchain explorer (SnowTrace)

### 5. Preparar para Hackathon

- [ ] Actualizar README con instrucciones claras para jueces
- [ ] Crear video demo (2-3 minutos)
- [ ] Preparar presentación (pitch deck)
- [ ] Documentar arquitectura y decisiones técnicas
- [ ] Listar features implementadas vs. planificadas

## 🔧 Comandos Útiles

### Verificar contratos desplegados

```bash
# Verificar en SnowTrace
# https://testnet.snowtrace.io/address/0x... (dirección del contrato)
```

### Probar endpoints manualmente

```bash
# Calcular score (con header X-Payment)
curl -X POST http://localhost:3001/api/score/calculate \
  -H "Content-Type: application/json" \
  -H "X-Payment: simulated-payment-proof" \
  -d '{"walletAddress": "0x..."}'

# Consultar score
curl "http://localhost:3001/api/score/query?walletAddress=0x..." \
  -H "X-Payment: simulated-payment-proof"

# Verificar SBT
curl "http://localhost:3001/api/score/verify?walletAddress=0x..." \
  -H "X-Payment: simulated-payment-proof"
```

## 📝 Notas Importantes

1. **Pagos x402**: Actualmente están simulados. Para producción, necesitas:
   - Configurar Thirdweb facilitator
   - Verificar pagos reales en el middleware

2. **Private Key del Backend**: 
   - Debe tener AVAX para gas
   - Debe ser el owner de los contratos (o tener permisos)

3. **SBT**: 
   - Solo se puede mintear uno por usuario
   - Si se mintea uno nuevo, el anterior se revoca automáticamente

4. **Score Inicial**: 
   - Por defecto es 300 (según `CreditScoringMini`)
   - Puedes mejorarlo con `rewardScore()` desde el owner

## 🎯 Prioridades para Hackathon

**MUST HAVE:**
1. ✅ Contratos desplegados y funcionando
2. ✅ Endpoints x402 funcionando
3. ✅ Frontend básico para probar
4. ⏳ SBT visible en frontend
5. ⏳ Documentación clara

**SHOULD HAVE:**
- Algoritmo de scoring más sofisticado
- Verificación real de pagos x402
- UI/UX mejorada

**COULD HAVE:**
- Integración con más wallets
- Dashboard avanzado
- Historial de scores

