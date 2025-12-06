# 📝 Explicación de Variables de Entorno

## 1. ADMIN_SECRET en Backend

### ¿Qué es?
`ADMIN_SECRET` es una clave secreta simple que protege los endpoints administrativos del backend.

### ¿Dónde se usa?
Se usa en `backend/src/routes/verification.js` para proteger el endpoint:
- `POST /api/verification/approve` - Para aprobar verificaciones de identidad

### ¿Puedo cambiarlo?
**SÍ**, puedes cambiarlo a cualquier valor que quieras. Es solo para autenticación básica.

```env
# backend/.env
ADMIN_SECRET=tu-clave-secreta-personal-2024
```

### ¿Es seguro?
Para el MVP del hackathon está bien. En producción, deberías usar:
- JWT tokens
- OAuth
- O un sistema de autenticación más robusto

### Ejemplo de uso:
```bash
curl -X POST http://localhost:3001/api/verification/approve \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x...",
    "verificationLevel": 2,
    "adminKey": "myscorepass-admin-secret-2024"
  }'
```

---

## 2. NEXT_PUBLIC_THIRDWEB_CLIENT_ID en Frontend

### ¿Qué es?
Es el Client ID de tu proyecto en Thirdweb. Se usa para inicializar el `ThirdwebProvider` en el frontend.

### ¿Necesitas el Client ID?
**SÍ**, necesitas el Client ID real para que funcione correctamente.

Tu Client ID: `95c681fed611038183e9f022713f6212`

### Configuración correcta:

```env
# frontend/.env.local
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=95c681fed611038183e9f022713f6212
```

### ¿Qué hace?
- Permite que el frontend use el SDK de Thirdweb
- Habilita funciones como wallet connection
- Necesario para futuras integraciones de x402 con Thirdweb facilitator

---

## 3. Secret Key de Thirdweb

### ¿Necesitas el Secret Key?
**NO** para el MVP básico. El Secret Key se usa para:
- Llamar a las APIs de Thirdweb desde el backend
- Enviar transacciones usando el Project Wallet
- Funciones avanzadas del facilitator

### ¿Cuándo lo necesitarías?
Solo si quisieras:
- Usar el Project Wallet de Thirdweb para pagar gas
- Usar las APIs de Thirdweb para transacciones
- Integrar el facilitator de x402 completamente

Para el MVP, **no es necesario**.

---

## 4. Project Wallet de Thirdweb

### ¿Qué es?
Es una wallet gestionada por Thirdweb que puedes usar para enviar transacciones.

### ¿Necesitas usarla?
**NO** para el MVP. Ya tienes tu propia wallet (`0x5d7282E3fe75956E2E1a1625a17c26e9766662FA`) que:
- Desplegó los contratos
- Es owner de los contratos
- Puede mintear SBTs

### ¿Cuándo la usarías?
Solo si quisieras:
- Que Thirdweb pague el gas por ti
- Usar el facilitator de Thirdweb para x402
- Delegar la gestión de transacciones a Thirdweb

Para el MVP, **no es necesario**.

---

## 📋 Resumen de Configuración

### Backend (.env)
```env
ADMIN_SECRET=myscorepass-admin-secret-2024  # Puedes cambiarlo
# No necesitas Secret Key de Thirdweb para el MVP
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=95c681fed611038183e9f022713f6212  # ✅ Usa tu Client ID real
# No necesitas Secret Key ni Project Wallet para el MVP
```

---

## 🎯 Para el Hackathon MVP

**Mínimo necesario:**
- ✅ Client ID de Thirdweb en frontend
- ✅ ADMIN_SECRET en backend (puede ser cualquier valor)
- ❌ Secret Key de Thirdweb (no necesario)
- ❌ Project Wallet (no necesario)

**Opcional (para futuro):**
- Secret Key si quieres usar APIs de Thirdweb
- Project Wallet si quieres que Thirdweb pague gas

