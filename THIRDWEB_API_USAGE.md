# 🔧 Uso de Thirdweb API - Guía de Referencia

## ⚠️ ¿Necesitas esto para el MVP?

**NO**, no es necesario para el MVP básico del hackathon.

Ya tienes todo funcionando con:
- ✅ Tu propia wallet (`0x5d7282E3fe75956E2E1a1625a17c26e9766662FA`)
- ✅ Ethers.js para firmar transacciones
- ✅ Backend que puede mintear SBTs directamente

## 🤔 ¿Cuándo SÍ lo necesitarías?

Solo si quisieras:

1. **Que Thirdweb pague el gas por ti**
   - El Project Wallet de Thirdweb pagaría el gas
   - No necesitarías AVAX en tu wallet del backend

2. **Usar el facilitator de x402 completamente**
   - Thirdweb manejaría los pagos x402
   - Verificación automática de pagos

3. **Delegar gestión de transacciones**
   - Thirdweb se encarga de enviar y monitorear transacciones
   - Menos código que mantener

## 📋 Configuración Necesaria

Si quisieras usarlo, necesitarías:

### 1. Secret Key de Thirdweb

```env
# backend/.env
THIRDWEB_SECRET_KEY=v2-tu-secret-key-completo
```

### 2. Chain ID Correcto

Para Avalanche Fuji:
```typescript
const chainId = 43113; // No 421614 (ese es Arbitrum Sepolia)
```

### 3. Encodear la Función

Necesitarías encodear la llamada a la función del contrato:

```typescript
import { ethers } from 'ethers';

const sbtABI = [
  'function mintSBT(address _to, bytes32 _scoreHash, uint256 _score, uint256 _verificationLevel) external returns (uint256)'
];

const iface = new ethers.Interface(sbtABI);
const encodedData = iface.encodeFunctionData('mintSBT', [
  toAddress,
  scoreHash,
  score,
  verificationLevel
]);
```

## 💻 Ejemplo Completo en TypeScript

```typescript
// backend/src/services/thirdwebApi.ts
export async function mintSBTViaThirdweb(
  secretKey: string,
  sbtContractAddress: string,
  to: string,
  scoreHash: string,
  score: number,
  verificationLevel: number
): Promise<string> {
  const { ethers } = require('ethers');
  
  // ABI de la función
  const sbtABI = [
    'function mintSBT(address _to, bytes32 _scoreHash, uint256 _score, uint256 _verificationLevel) external returns (uint256)'
  ];
  
  // Encodear la función
  const iface = new ethers.Interface(sbtABI);
  const encodedData = iface.encodeFunctionData('mintSBT', [
    to,
    scoreHash,
    score,
    verificationLevel
  ]);
  
  // Enviar via Thirdweb API
  const response = await fetch('https://api.thirdweb.com/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-secret-key': secretKey,
    },
    body: JSON.stringify({
      chainId: 43113, // Avalanche Fuji
      transactions: [
        {
          data: encodedData,
          to: sbtContractAddress,
          value: '0',
        },
      ],
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Thirdweb API error: ${error.message}`);
  }
  
  const result = await response.json();
  return result.result?.transactionHash || result.queueId;
}
```

## 🔄 Comparación: Con vs Sin Thirdweb API

### Sin Thirdweb API (Lo que tienes ahora) ✅

```typescript
// backend/src/services/contracts.js
const tx = await scorePassSBT.mintSBT(
  walletAddress,
  scoreHash,
  score,
  verificationLevel
);
await tx.wait();
```

**Ventajas:**
- ✅ Más control
- ✅ No depende de servicios externos
- ✅ Más rápido (sin llamadas API)
- ✅ Funciona perfectamente para el MVP

**Desventajas:**
- ❌ Necesitas AVAX en tu wallet para gas
- ❌ Tú gestionas las transacciones

### Con Thirdweb API (Opcional)

```typescript
// backend/src/services/thirdwebApi.ts
const txHash = await mintSBTViaThirdweb(
  process.env.THIRDWEB_SECRET_KEY,
  sbtAddress,
  walletAddress,
  scoreHash,
  score,
  verificationLevel
);
```

**Ventajas:**
- ✅ Thirdweb paga el gas
- ✅ No necesitas AVAX en tu wallet
- ✅ Thirdweb gestiona las transacciones

**Desventajas:**
- ❌ Dependes de un servicio externo
- ❌ Más lento (llamadas API)
- ❌ Necesitas configurar Secret Key
- ❌ Más complejo

## 🎯 Recomendación para el Hackathon

**Para el MVP: NO uses Thirdweb API**

Razones:
1. Ya tienes todo funcionando con ethers.js
2. Es más simple y directo
3. No necesitas configurar Secret Key
4. Funciona perfectamente para demostrar el concepto

**Para producción futura: Considera Thirdweb API**

Si en el futuro quieres:
- Escalar sin preocuparte por gas
- Usar el facilitator de x402 completamente
- Delegar gestión de transacciones

Entonces SÍ sería útil.

## 📝 Resumen

| Característica | Sin Thirdweb API | Con Thirdweb API |
|----------------|------------------|------------------|
| **Complejidad** | ✅ Simple | ❌ Más complejo |
| **Gas** | Tú pagas | Thirdweb paga |
| **Dependencias** | Solo ethers.js | API externa |
| **Para MVP** | ✅ Recomendado | ❌ No necesario |
| **Para Producción** | ✅ Funciona | ✅ Útil si escalas |

## 🔗 Referencias

- [Thirdweb API Docs](https://portal.thirdweb.com/references/transactions/v1/overview)
- [Thirdweb Transactions API](https://portal.thirdweb.com/references/transactions/v1/send-transaction)

---

**Conclusión**: Para el hackathon MVP, **NO necesitas usar Thirdweb API**. Tu implementación actual con ethers.js es perfecta. 🚀

