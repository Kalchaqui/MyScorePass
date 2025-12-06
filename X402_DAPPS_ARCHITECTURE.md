# Arquitectura x402 en dApps - ScorePass

## 🏗️ Dos Tipos de dApps

### 1️⃣ **Tu dApp: ScorePass (VENDEDOR)**
Vende el servicio de scoring crediticio usando x402

### 2️⃣ **Otras dApps: Plataformas DeFi (COMPRADOR)**
Consumen el SBT/score del usuario para otorgar préstamos

---

## 📱 1. TU dAPP: ScorePass (Con x402)

### Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Usuario hace click: "Calcular Score"                │   │
│  │  → Llama a: POST /api/score/calculate                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express + x402)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware x402 detecta: NO hay pago                │   │
│  │  → Responde: HTTP 402 Payment Required                │   │
│  │  Body: {                                              │   │
│  │    amount: "2.00",                                   │   │
│  │    currency: "USDC",                                  │   │
│  │    network: "avalanche-fuji",                        │   │
│  │    recipient: "0xTuWallet",                          │   │
│  │    description: "Credit score calculation"            │   │
│  │  }                                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (SDK x402)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SDK detecta HTTP 402                                 │   │
│  │  → Muestra modal: "Pagar 2 USDC"                      │   │
│  │  → Usuario aprueba en MetaMask                        │   │
│  │  → SDK firma payload y obtiene proof                  │   │
│  │  → Reintenta request con header: X-PAYMENT            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Verifica Pago)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Middleware x402 verifica pago con Facilitador        │   │
│  │  → Pago válido ✅                                      │   │
│  │  → Ejecuta lógica:                                    │   │
│  │    1. Verifica identidad                              │   │
│  │    2. Calcula score (off-chain)                       │   │
│  │    3. Genera hash del score                           │   │
│  │    4. Llama Smart Contract para mint SBT              │   │
│  │  → Responde: { score, sbtTokenId, scoreHash }         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏦 2. OTRAS dAPPS: Plataformas DeFi (Consumen SBT)

### Opción A: Leer SBT Directamente (Sin x402)

```
┌─────────────────────────────────────────────────────────────┐
│         Plataforma DeFi de Préstamos (Otra dApp)            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Usuario solicita préstamo                            │   │
│  │  → dApp lee SBT del usuario (Smart Contract)          │   │
│  │  → Obtiene: scoreHash, verificationLevel             │   │
│  │  → Evalúa riesgo y aprueba/rechaza préstamo           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Opción B: API de ScorePass con x402 (Si quieres monetizar consultas)

```
┌─────────────────────────────────────────────────────────────┐
│         Plataforma DeFi de Préstamos (Otra dApp)            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Usuario solicita préstamo                            │   │
│  │  → dApp llama: GET /api/score/verify?sbtTokenId=123   │   │
│  │  → ScorePass responde: HTTP 402 (0.10 USDC)           │   │
│  │  → dApp paga y obtiene score verificado               │   │
│  │  → Evalúa riesgo y aprueba préstamo                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 CÓDIGO: Tu dApp (ScorePass)

### Backend con x402

```javascript
// backend/src/routes/score.js
const express = require('express');
const { paymentMiddleware } = require('x402-express');
const router = express.Router();

// Configurar x402 middleware
const x402Config = {
  walletAddress: process.env.X402_WALLET_ADDRESS, // Tu wallet que recibe USDC
  facilitator: process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator',
  network: 'avalanche-fuji', // o 'avalanche' para mainnet
  routes: {
    'POST /api/score/calculate': {
      price: '$2.00',
      description: 'Calculate credit score + identity verification + SBT mint'
    },
    'GET /api/score/query': {
      price: '$0.50',
      description: 'Query existing credit score'
    },
    'GET /api/score/verify': {
      price: '$0.10',
      description: 'Verify SBT and return score (for other dApps)'
    }
  }
};

// Aplicar middleware x402
router.use(paymentMiddleware(x402Config));

// Endpoint: Calcular score (requiere pago de 2 USDC)
router.post('/calculate', async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    // 1. Verificar identidad
    const identity = await verifyIdentity(walletAddress);
    if (!identity.isVerified) {
      return res.status(400).json({ error: 'Identity not verified' });
    }
    
    // 2. Calcular score (off-chain, con tu algoritmo)
    const score = await calculateCreditScore(walletAddress, identity);
    
    // 3. Generar hash del score
    const scoreHash = generateScoreHash(score, walletAddress);
    
    // 4. Mint SBT al usuario
    const sbtTokenId = await mintScorePassSBT(walletAddress, {
      scoreHash,
      verificationLevel: identity.verificationLevel,
      timestamp: Date.now()
    });
    
    // 5. Guardar en base de datos (opcional)
    await saveScoreToDB(walletAddress, score, scoreHash, sbtTokenId);
    
    res.json({
      success: true,
      score,
      scoreHash,
      sbtTokenId,
      maxLoanAmount: score * 10, // Ejemplo: score * 10 = max loan
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Error calculating score:', error);
    res.status(500).json({ error: 'Failed to calculate score' });
  }
});

// Endpoint: Consultar score (requiere pago de 0.50 USDC)
router.get('/query', async (req, res) => {
  const { walletAddress } = req.query;
  
  const scoreData = await getScoreFromDB(walletAddress);
  if (!scoreData) {
    return res.status(404).json({ error: 'Score not found' });
  }
  
  res.json({
    score: scoreData.score,
    scoreHash: scoreData.scoreHash,
    sbtTokenId: scoreData.sbtTokenId,
    lastUpdated: scoreData.timestamp
  });
});

// Endpoint: Verificar SBT (para otras dApps, requiere 0.10 USDC)
router.get('/verify', async (req, res) => {
  const { sbtTokenId, walletAddress } = req.query;
  
  // Verificar que el SBT existe y pertenece al usuario
  const sbtData = await verifySBT(sbtTokenId, walletAddress);
  
  if (!sbtData) {
    return res.status(404).json({ error: 'SBT not found or invalid' });
  }
  
  // Retornar solo datos verificables (no datos privados)
  res.json({
    verified: true,
    scoreHash: sbtData.scoreHash,
    verificationLevel: sbtData.verificationLevel,
    issuedAt: sbtData.timestamp,
    // NO retornamos el score real por privacidad
    // La dApp puede usar el scoreHash para verificar
  });
});

module.exports = router;
```

### Frontend con SDK x402

```typescript
// frontend/lib/x402Client.ts
import { x402Client } from '@coinbase/x402'; // o SDK de Avalanche

const client = new x402Client({
  network: 'avalanche-fuji',
  facilitator: process.env.NEXT_PUBLIC_X402_FACILITATOR
});

export async function calculateScore(walletAddress: string) {
  try {
    // El SDK maneja automáticamente:
    // - Detectar HTTP 402
    // - Mostrar UI de pago
    // - Firmar transacción
    // - Reintentar con X-PAYMENT header
    
    const response = await client.request({
      url: `${process.env.NEXT_PUBLIC_API_URL}/api/score/calculate`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress })
    });
    
    return await response.json();
  } catch (error) {
    console.error('x402 payment error:', error);
    throw error;
  }
}
```

### Componente React

```typescript
// frontend/app/dashboard/score/page.tsx
'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { calculateScore } from '@/lib/x402Client';
import toast from 'react-hot-toast';

export default function ScorePage() {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState(null);

  const handleCalculateScore = async () => {
    if (!address) {
      toast.error('Conecta tu wallet primero');
      return;
    }

    setLoading(true);
    try {
      // Esta función maneja automáticamente el pago x402
      const result = await calculateScore(address);
      
      setScoreData(result);
      toast.success('¡Score calculado exitosamente!');
      
      // Mostrar SBT en UI
      // Refrescar datos del SBT desde blockchain
      
    } catch (error) {
      if (error.status === 402) {
        // El SDK ya mostró el modal de pago
        toast.error('Pago cancelado o fallido');
      } else {
        toast.error('Error al calcular score');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={handleCalculateScore}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Procesando pago...' : 'Calcular Score (2 USDC)'}
      </button>
      
      {scoreData && (
        <div>
          <p>Score: {scoreData.score}</p>
          <p>SBT Token ID: {scoreData.sbtTokenId}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🏦 CÓDIGO: Otra dApp (Plataforma de Préstamos)

### Opción A: Leer SBT Directamente (Gratis)

```typescript
// Otra dApp: Leer SBT del usuario
import { useContractRead } from 'wagmi';
import { SCOREPASS_SBT_ADDRESS, scorePassABI } from './config';

export function useScorePass(userAddress: string) {
  // Leer SBT del usuario directamente desde blockchain
  const { data: sbtData } = useContractRead({
    address: SCOREPASS_SBT_ADDRESS,
    abi: scorePassABI,
    functionName: 'getUserSBT',
    args: [userAddress]
  });

  return {
    scoreHash: sbtData?.scoreHash,
    verificationLevel: sbtData?.verificationLevel,
    hasValidSBT: !!sbtData
  };
}

// En componente de préstamo
function LoanRequest() {
  const { address } = useAccount();
  const { scoreHash, verificationLevel, hasValidSBT } = useScorePass(address);

  const handleRequestLoan = async () => {
    if (!hasValidSBT) {
      alert('Necesitas un ScorePass primero');
      return;
    }

    // Evaluar riesgo basado en verificationLevel
    const riskLevel = verificationLevel >= 2 ? 'low' : 'high';
    const maxLoan = riskLevel === 'low' ? 1000 : 300;

    // Procesar préstamo...
  };
}
```

### Opción B: API de ScorePass con x402 (Si monetizas)

```typescript
// Otra dApp: Consultar API de ScorePass (paga 0.10 USDC)
import { x402Client } from '@coinbase/x402';

const client = new x402Client({
  network: 'avalanche-fuji',
  facilitator: 'https://x402.org/facilitator'
});

export async function verifyUserScore(sbtTokenId: string, userAddress: string) {
  // Esta llamada requiere pago de 0.10 USDC
  const response = await client.request({
    url: `https://scorepass-api.com/api/score/verify?sbtTokenId=${sbtTokenId}&walletAddress=${userAddress}`,
    method: 'GET'
  });
  
  return await response.json();
}
```

---

## 📊 Resumen de Flujos

### Tu dApp (ScorePass)
- ✅ Usuario paga 2 USDC → Obtiene score + SBT
- ✅ Otras dApps pueden leer SBT gratis (directo desde blockchain)
- ✅ Otras dApps pueden pagar 0.10 USDC para verificar score (opcional)

### Otras dApps
- ✅ Leen SBT directamente (sin costo)
- ✅ O pueden pagar para verificar score via API (si implementas ese endpoint)

---

## 🎯 Ventajas de esta Arquitectura

1. **Monetización clara**: Usuario paga por obtener score
2. **SBT portátil**: Una vez obtenido, el usuario lo usa en cualquier dApp
3. **Privacidad**: Score hash en blockchain, datos completos off-chain
4. **Escalable**: Otras dApps no necesitan pagar para leer SBT básico
5. **Opcional**: Puedes monetizar verificaciones adicionales si quieres

