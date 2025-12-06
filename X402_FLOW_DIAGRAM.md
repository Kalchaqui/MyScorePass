# Flujo Visual: x402 en dApps

## 🎯 Escenario Completo

### Usuario quiere obtener su ScorePass

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO (Frontend)                           │
│  scorepass.com/dashboard                                         │
│                                                                  │
│  [Botón: "Calcular Score - 2 USDC"]                             │
│         ↓ Click                                                 │
│  fetch('/api/score/calculate', { walletAddress })               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express + x402)                     │
│  localhost:3001/api/score/calculate                              │
│                                                                  │
│  Middleware x402:                                                │
│  ❌ No hay header X-PAYMENT                                      │
│  → Responde: HTTP 402 Payment Required                           │
│                                                                  │
│  Body: {                                                         │
│    "amount": "2.00",                                            │
│    "currency": "USDC",                                          │
│    "network": "avalanche-fuji",                                 │
│    "recipient": "0xTuWallet...",                                │
│    "description": "Credit score + SBT"                          │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (SDK x402)                           │
│                                                                  │
│  SDK detecta: HTTP 402                                          │
│  → Muestra Modal:                                               │
│     ┌─────────────────────────────┐                            │
│     │  💳 Pago Requerido          │                            │
│     │                              │                            │
│     │  Monto: 2.00 USDC            │                            │
│     │  Red: Avalanche Fuji         │                            │
│     │                              │                            │
│     │  [Aprobar en MetaMask]       │                            │
│     └─────────────────────────────┘                            │
│                                                                  │
│  Usuario aprueba → SDK firma → Obtiene proof                    │
│  → Reintenta request con:                                        │
│     Header: X-PAYMENT: <proof>                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Verifica + Procesa)                  │
│                                                                  │
│  Middleware x402:                                                │
│  ✅ Header X-PAYMENT presente                                    │
│  → Llama Facilitador: /verify                                    │
│  → Pago válido ✅                                                │
│                                                                  │
│  Ejecuta lógica:                                                │
│  1. Verifica identidad (IdentityRegistry)                       │
│  2. Calcula score (off-chain, algoritmo)                        │
│  3. Genera hash: keccak256(score + wallet + timestamp)          │
│  4. Llama Smart Contract:                                        │
│     mintScorePassSBT(wallet, scoreHash, level)                  │
│  5. Guarda en DB (opcional)                                     │
│                                                                  │
│  → Responde: HTTP 200                                           │
│  Body: {                                                         │
│    "score": 750,                                                │
│    "scoreHash": "0xabc123...",                                  │
│    "sbtTokenId": 123,                                           │
│    "maxLoanAmount": 7500                                        │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Muestra Resultado)                  │
│                                                                  │
│  ✅ Score: 750                                                   │
│  ✅ SBT Token ID: #123                                          │
│  ✅ Puedes usar este SBT en otras plataformas                   │
│                                                                  │
│  [Ver mi SBT] [Solicitar Préstamo]                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏦 Usuario quiere préstamo en OTRA dApp

### Opción 1: Leer SBT Directamente (Gratis)

```
┌─────────────────────────────────────────────────────────────────┐
│         Plataforma DeFi: lendapp.com                            │
│                                                                  │
│  Usuario: "Quiero préstamo de 500 USDC"                         │
│         ↓                                                        │
│  dApp lee SBT del usuario:                                      │
│                                                                  │
│  const sbt = await scorePassContract.getUserSBT(userAddress);    │
│  // sbt = {                                                      │
│  //   scoreHash: "0xabc123...",                                │
│  //   verificationLevel: 2,                                     │
│  //   timestamp: 1234567890                                    │
│  // }                                                            │
│                                                                  │
│  → Evalúa: verificationLevel >= 2 ✅                           │
│  → Aprobar préstamo de 500 USDC                                 │
│                                                                  │
│  ✅ Préstamo aprobado (sin costo adicional)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Opción 2: Verificar Score via API (0.10 USDC)

```
┌─────────────────────────────────────────────────────────────────┐
│         Plataforma DeFi: lendapp.com                            │
│                                                                  │
│  Usuario: "Quiero préstamo de 500 USDC"                         │
│         ↓                                                        │
│  dApp llama API de ScorePass:                                   │
│  GET scorepass-api.com/api/score/verify?sbtTokenId=123           │
│         ↓                                                        │
│  ScorePass responde: HTTP 402 (0.10 USDC)                       │
│         ↓                                                        │
│  dApp paga 0.10 USDC (automático con SDK)                      │
│         ↓                                                        │
│  ScorePass retorna: {                                           │
│    verified: true,                                             │
│    scoreHash: "0xabc123...",                                    │
│    verificationLevel: 2                                         │
│  }                                                               │
│         ↓                                                        │
│  dApp evalúa y aprueba préstamo                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Comparación de Flujos

| Acción | Tu dApp (ScorePass) | Otra dApp (LendApp) |
|--------|---------------------|---------------------|
| **Usuario obtiene score** | Paga 2 USDC → Recibe SBT | - |
| **Usuario solicita préstamo** | - | Lee SBT gratis O paga 0.10 USDC para verificar |
| **Datos disponibles** | Score completo + SBT | Solo scoreHash + level (verificable) |

---

## 🔑 Puntos Clave

1. **Usuario paga UNA VEZ** (2 USDC) para obtener su SBT
2. **SBT es portátil** - Lo usa en cualquier dApp sin pagar más
3. **Otras dApps leen SBT gratis** desde blockchain
4. **Opcional**: Puedes monetizar verificaciones adicionales (0.10 USDC)

