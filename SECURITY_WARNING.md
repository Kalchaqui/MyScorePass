# ⚠️ ADVERTENCIA DE SEGURIDAD

## 🔐 Secret Key de Thirdweb

**IMPORTANTE**: Has compartido tu Secret Key de Thirdweb públicamente.

### ⚠️ Acciones Inmediatas Requeridas:

1. **ROTAR la Secret Key INMEDIATAMENTE**
   - Ve a tu dashboard de Thirdweb
   - Genera una nueva Secret Key
   - La clave anterior quedará invalidada

2. **NUNCA compartas Secret Keys públicamente**
   - No en chats
   - No en repositorios públicos
   - No en screenshots
   - Solo en archivos `.env` locales (que están en .gitignore)

3. **Verifica tu cuenta**
   - Revisa si hay actividad sospechosa
   - Cambia contraseñas si es necesario

### ✅ Configuración Correcta:

El Secret Key debe estar SOLO en:
- `backend/.env` (archivo local, NO en git)
- NUNCA en el código fuente
- NUNCA en repositorios públicos

### 📝 Formato Correcto:

El Secret Key de Thirdweb generalmente tiene el formato:
```
v2-... (prefijo v2- seguido de caracteres)
```

Si tu clave no tiene el prefijo `v2-`, agrega:
```env
THIRDWEB_SECRET_KEY=v2-PUcYKHrbU8um7_8EPGsICFpqYSEasqzPxniMjyCB44X-FnRzjEzwarccfwfUa-pkaNXbTTER6jp3zcJtLaVj0Q
```

### 🔒 Mejores Prácticas:

1. **Usa variables de entorno** (✅ ya lo estás haciendo)
2. **Agrega `.env` a `.gitignore`** (✅ debería estar)
3. **Usa `.env.example`** para documentar sin exponer valores reales
4. **Rota keys regularmente** en producción

---

**RECUERDA**: Rota tu Secret Key ahora mismo en el dashboard de Thirdweb.

