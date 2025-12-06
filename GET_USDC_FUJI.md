# Cómo Obtener USDC de Prueba en Avalanche Fuji

## Tu Dirección Core Wallet
**`0xaAd92902bD807A5c54741F564A35B8eD46740865`**

## Método 1: Usar un DEX (Recomendado)

### Paso 1: Obtener AVAX de Prueba
1. Ve a: https://faucet.avax.network/ o https://faucets.chain.link/avalanche-fuji
2. Conecta tu Core Wallet o ingresa tu dirección: `0xaAd92902bD807A5c54741F564A35B8eD46740865`
3. Selecciona "Fuji Testnet"
4. Solicita AVAX (puedes pedir hasta 2 AVAX cada 24 horas)

### Paso 2: Intercambiar AVAX por USDC en un DEX

**Opción A: TraderJoe (DEX en Fuji)**
1. Ve a: https://testnet.traderjoexyz.com/
2. Conecta tu wallet
3. Selecciona el par AVAX/USDC
4. Intercambia una pequeña cantidad de AVAX por USDC

**Opción B: Pangolin (DEX en Fuji)**
1. Ve a: https://app.pangolin.exchange/
2. Cambia a Fuji Testnet
3. Conecta tu wallet
4. Intercambia AVAX por USDC

## Método 2: Usar el Contrato USDC Directamente

### Contrato USDC en Fuji
```
Dirección: 0x5425890298aed601595a70AB815c96711a31Bc65
Símbolo: USDC
Decimals: 6
```

### Añadir USDC a Core Wallet
1. Abre Core Wallet
2. Ve a la sección de tokens
3. Añade token personalizado con la dirección: `0x5425890298aed601595a70AB815c96711a31Bc65`
4. Símbolo: USDC, Decimals: 6

## Método 3: Script de Mint (Si tienes acceso)

Si tienes acceso al contrato USDC o conoces a alguien que pueda mintear, puedes usar el script en `contracts/scripts/mintUSDC.js` (ver abajo).

## Verificar Balance

Una vez que tengas USDC, puedes verificar tu balance:

1. En Core Wallet: Debería aparecer en la lista de tokens
2. En Snowtrace (explorador de Fuji): https://testnet.snowtrace.io/address/0xaAd92902bD807A5c54741F564A35B8eD46740865#tokentxns

## Nota Importante

Para el MVP de MyScorePass, los pagos x402 están **simulados**. No necesitas USDC real para probar la funcionalidad, ya que el backend acepta cualquier request con el header `X-Payment` (sin verificación real aún).

Sin embargo, si quieres probar el flujo completo con pagos reales, necesitarás USDC de prueba.

