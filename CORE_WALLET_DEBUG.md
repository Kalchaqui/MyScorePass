# Debug: Core Wallet No Aparece en RainbowKit

## Problema
Solo aparece MetaMask en el modal de RainbowKit, pero Core Wallet está instalado.

## Posibles Causas

1. **Core Wallet no está exponiendo el provider correctamente**
2. **MetaMask tiene prioridad y oculta otros wallets**
3. **RainbowKit está filtrando wallets duplicados**

## Soluciones a Probar

### Solución 1: Verificar en la Consola

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Verificar qué providers están disponibles
console.log('window.ethereum:', window.ethereum);
console.log('window.ethereum.providers:', window.ethereum?.providers);

// Si hay múltiples providers, Core Wallet puede estar en el array
if (window.ethereum?.providers) {
  window.ethereum.providers.forEach((provider, index) => {
    console.log(`Provider ${index}:`, {
      isMetaMask: provider.isMetaMask,
      isAvalanche: provider.isAvalanche,
      isCore: provider.isCore,
      constructor: provider.constructor.name
    });
  });
}
```

### Solución 2: Deshabilitar Temporalmente MetaMask

1. Ve a `chrome://extensions/` (o `edge://extensions/`)
2. Deshabilita MetaMask temporalmente
3. Refresca la página
4. Core Wallet debería aparecer si está instalado

### Solución 3: Usar el Botón Personalizado

El componente `CoreWalletButton` que creamos debería funcionar como fallback. Si Core Wallet está instalado, el botón debería aparecer.

### Solución 4: Verificar Versión de Core Wallet

Asegúrate de tener la última versión de Core Wallet instalada. Versiones antiguas pueden no exponer correctamente el provider EIP-1193.

## Configuración Actual

La configuración actual usa `getDefaultWallets` que debería detectar automáticamente Core Wallet usando EIP-6963. Si no aparece, puede ser:

1. Core Wallet no está implementando EIP-6963 correctamente
2. Hay un conflicto con MetaMask
3. El navegador está bloqueando la detección

## Próximos Pasos

1. Ejecuta el código de verificación en la consola
2. Comparte los resultados
3. Si Core Wallet aparece en `window.ethereum.providers`, podemos crear un conector personalizado

