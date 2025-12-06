# 🔌 Guía de Integración x402 Real con Thirdweb

## ✅ ¿Qué se ha implementado?

He integrado el facilitator real de Thirdweb x402 en tu backend. Ahora puedes:

1. **Verificar pagos reales** usando Thirdweb
2. **Modo simulado** si no configuras Thirdweb (para desarrollo)
3. **Funciona automáticamente** con tus endpoints existentes

## 📦 Instalación

```bash
cd backend
npm install
```

Esto instalará el paquete `thirdweb` necesario.

## ⚙️ Configuración

### Opción 1: Con Thirdweb (Pagos Reales) ✅ Recomendado para Hackathon

Agrega estas variables a `backend/.env`:

```env
# Thirdweb x402 Configuration
THIRDWEB_SECRET_KEY=v2-tu-secret-key-completo
THIRDWEB_SERVER_WALLET_ADDRESS=0x4DE893AF2077552E539Cd926b660159bBb1e0413
```

**Nota**: El `THIRDWEB_SERVER_WALLET_ADDRESS` es tu Project Wallet de Thirdweb (la que viste en el dashboard).

### Opción 2: Sin Thirdweb (Modo Simulado) - Para Desarrollo

Si NO configuras las variables de Thirdweb, el sistema funcionará en **modo simulado**:
- Acepta cualquier header `X-Payment`
- No verifica pagos reales
- Útil para desarrollo y testing

## 🔄 Cómo Funciona

### Flujo con x402 Real:

1. **Usuario hace request** → Backend responde HTTP 402
2. **Frontend detecta 402** → Muestra modal de pago
3. **Usuario paga** → Thirdweb facilitator procesa el pago
4. **Frontend reintenta** → Con header `X-Payment` del facilitator
5. **Backend verifica** → Usa `settlePayment()` de Thirdweb
6. **Si pago válido** → Procesa la request
7. **Si pago inválido** → Devuelve 402 nuevamente

### Flujo en Modo Simulado:

1. **Usuario hace request** → Backend responde HTTP 402
2. **Frontend detecta 402** → Muestra confirmación simulada
3. **Usuario confirma** → Frontend envía header `X-Payment: simulated`
4. **Backend acepta** → Procesa la request (sin verificación real)

## 📝 Archivos Modificados

### 1. `backend/src/services/x402Facilitator.js` (NUEVO)

Servicio que:
- Inicializa el facilitator de Thirdweb
- Verifica pagos usando `settlePayment()`
- Funciona en modo simulado si Thirdweb no está configurado

### 2. `backend/src/routes/score.js` (ACTUALIZADO)

El middleware `checkX402Payment` ahora:
- Usa el servicio x402 real
- Verifica pagos con Thirdweb
- Mantiene compatibilidad con modo simulado

## 🧪 Testing

### Test 1: Sin Configurar Thirdweb (Modo Simulado)

```bash
# No configures THIRDWEB_SECRET_KEY en .env
# El sistema funcionará en modo simulado
curl -X POST http://localhost:3001/api/score/calculate \
  -H "Content-Type: application/json" \
  -H "X-Payment: simulated-payment" \
  -d '{"walletAddress": "0x..."}'
```

### Test 2: Con Thirdweb Configurado (Pagos Reales)

```bash
# Configura THIRDWEB_SECRET_KEY en .env
# El sistema verificará pagos reales
curl -X POST http://localhost:3001/api/score/calculate \
  -H "Content-Type: application/json" \
  -H "X-Payment: <payment-data-from-thirdweb>" \
  -d '{"walletAddress": "0x..."}'
```

## 🎯 Para el Hackathon

### Recomendación: Configura Thirdweb

**Ventajas:**
- ✅ Demuestra integración REAL de x402
- ✅ Más impresionante para los jueces
- ✅ Cumple con el objetivo del hackathon (Payments x402)
- ✅ Funciona con pagos reales de USDC

**Pasos:**
1. Obtén tu Secret Key de Thirdweb
2. Agrega a `backend/.env`:
   ```env
   THIRDWEB_SECRET_KEY=v2-tu-secret-key
   THIRDWEB_SERVER_WALLET_ADDRESS=0x4DE893AF2077552E539Cd926b660159bBb1e0413
   ```
3. Reinicia el backend
4. ¡Listo! Los pagos se verificarán automáticamente

### Alternativa: Modo Simulado

Si prefieres no configurar Thirdweb:
- El sistema funcionará en modo simulado
- Aún demuestra el flujo x402
- Menos impresionante pero funcional

## 🔍 Verificación

Para verificar que está funcionando:

1. **Sin Thirdweb configurado:**
   ```bash
   # Deberías ver en los logs:
   ⚠️  THIRDWEB_SECRET_KEY no configurado, x402 usará modo simulado
   ```

2. **Con Thirdweb configurado:**
   ```bash
   # Deberías ver en los logs:
   ✅ x402 Facilitator inicializado correctamente
   ```

## 📚 Referencias

- [Thirdweb x402 Docs](https://portal.thirdweb.com/x402)
- [Thirdweb x402 API](https://portal.thirdweb.com/references/x402/v1/overview)
- [Thirdweb SDK](https://portal.thirdweb.com/sdk)

## ⚠️ Notas Importantes

1. **Chain ID**: El código usa `avalancheFuji` (43113), no `arbitrumSepolia` (421614)
2. **Price Format**: Debe ser `"$0.50"` (con símbolo de dólar)
3. **Network**: Asegúrate de que tu Project Wallet esté en Avalanche Fuji
4. **USDC**: Los usuarios necesitan USDC en Avalanche Fuji para pagar

## 🚀 Próximos Pasos

1. **Instalar dependencias**: `cd backend && npm install`
2. **Configurar Thirdweb** (opcional pero recomendado)
3. **Reiniciar backend**
4. **Probar endpoints** en `/test`
5. **Verificar pagos** funcionan correctamente

---

**¡Ahora tienes integración REAL de x402!** 🎉

