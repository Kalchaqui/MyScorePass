# Instrucciones para Corregir Errores de Privy

## Problemas Identificados:

1. **404 en `/api/auth/privy-login`** - El backend no está corriendo o necesita reiniciarse
2. **Error `this.walletProvider?.on is not a function`** - Conflicto entre Privy y Thirdweb

## Soluciones Aplicadas:

### 1. Mejorado manejo de errores
- El frontend ahora muestra mensajes más claros si el backend no está disponible

### 2. Configuración de Privy actualizada
- Deshabilitados completamente los wallets externos de Privy
- Solo se usa email para login

## Pasos para Resolver:

### Paso 1: Verificar que el Backend esté corriendo

Abre una terminal y ejecuta:

```bash
cd backend
npm start
```

Deberías ver:
```
🚀 MyScorePass Backend running on port 3001
```

### Paso 2: Verificar que el endpoint existe

El endpoint `/api/auth/privy-login` está en `backend/src/routes/auth.js` línea 113.

Si el backend está corriendo pero sigue dando 404, reinicia el backend:

```bash
# En la terminal del backend
Ctrl+C  # Detener
npm start  # Reiniciar
```

### Paso 3: Verificar variables de entorno

Asegúrate de que `frontend/.env.local` tenga:
```
NEXT_PUBLIC_PRIVY_APP_ID=cmix50iqa00d7l90c8nmrshne
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Paso 4: Reiniciar Frontend

Después de que el backend esté corriendo:

```bash
# En la terminal del frontend
Ctrl+C  # Detener
npm run dev  # Reiniciar
```

## Si el Error de walletProvider Persiste:

Si aún ves `this.walletProvider?.on is not a function`, puede ser necesario deshabilitar completamente Thirdweb cuando se usa Privy, o viceversa. Pero primero verifica que el backend esté corriendo.


