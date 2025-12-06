# Tips para Conectar Core Wallet

## El Error 4001 "User rejected the request"

Este error significa que **Core Wallet está mostrando un popup de conexión, pero el usuario lo está rechazando** (o el popup se cierra automáticamente).

## Solución: Usar el Modal de RainbowKit

Si Core Wallet aparece en el modal de RainbowKit (como en la imagen que compartiste), **usa ese botón directamente** en lugar del botón personalizado.

### Pasos:

1. **Haz clic en "Conectar Wallet"** (botón de RainbowKit)
2. **Selecciona "Core"** en el modal
3. **Acepta la solicitud en Core Wallet** cuando aparezca el popup
4. **Asegúrate de NO cerrar el popup** hasta que veas "Conectado" en la dApp

## Si el Popup No Aparece

1. **Verifica que Core Wallet esté activo:**
   - Abre Core Wallet manualmente
   - Asegúrate de que esté desbloqueado

2. **Permisos del navegador:**
   - Algunos navegadores bloquean popups
   - Verifica la configuración de popups en tu navegador
   - Permite popups para `localhost:3000`

3. **Refresca y vuelve a intentar:**
   - Cierra todas las pestañas de la dApp
   - Abre Core Wallet y desbloquéalo
   - Vuelve a abrir `http://localhost:3000`
   - Intenta conectar de nuevo

## Verificar en la Consola

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Verificar si Core Wallet está disponible
console.log('window.ethereum:', window.ethereum);
console.log('window.avalanche:', window.avalanche);

// Intentar conectar manualmente
if (window.ethereum) {
  window.ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => console.log('Cuentas:', accounts))
    .catch(error => console.error('Error:', error));
}
```

## Nota Importante

Si Core Wallet aparece en el modal de RainbowKit, **ese es el método correcto**. El botón personalizado es solo un fallback. Usa siempre el modal de RainbowKit primero.

