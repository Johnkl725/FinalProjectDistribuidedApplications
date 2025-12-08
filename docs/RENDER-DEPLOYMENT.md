# 🚀 Deployment en Render desde GitHub

Esta guía te mostrará cómo deployar automáticamente desde GitHub a Render.

---

## 🎯 **Cómo funciona el Auto-Deploy**

```
GitHub (main branch)
       ↓
   git push
       ↓
Render detecta cambios
       ↓
Build automático con docker-compose.yml
       ↓
Deploy de todos los servicios
       ↓
✅ Aplicación en producción
```

---

## ✅ **Lo que ya tienes configurado**

- ✅ `docker-compose.yml` (detectado automáticamente por Render)
- ✅ Base de datos PostgreSQL en Render
- ✅ Variables de entorno en `.env`
- ✅ Dockerfiles de producción
- ✅ Script de inicialización automática (`init-db.sh`)

---

## 🚀 **Opción 1: Deploy Simple (Recomendado)**

### **Render detecta `docker-compose.yml` automáticamente**

1. **Ve a [Render Dashboard](https://dashboard.render.com)**

2. **Click "New +" → "Blueprint"**

3. **Conectar GitHub:**
   - Autoriza Render en tu GitHub
   - Selecciona el repo: `FinalProjectDistribuidedApplications`
   - Branch: `main`

4. **Render detecta `docker-compose.yml` y crea:**
   - ✅ auth-service
   - ✅ life-insurance-service
   - ✅ rent-insurance-service
   - ✅ vehicle-insurance-service
   - ✅ api-gateway
   - ✅ frontend
   - ✅ db-init (inicialización automática)

5. **Configurar variables de entorno globales:**
   - En "Environment" → "Environment Groups"
   - Crear grupo: `insurance-platform-env`
   - Copiar variables de `.env`

6. **Deploy!**
   - Render construye y despliega automáticamente
   - Cada `git push` = nuevo deploy

---

## 📝 **Comandos útiles**

### **Desarrollo local:**
```bash
npm run dev              # Levantar entorno de desarrollo
npm run dev:clean        # Limpiar y levantar desarrollo
npm run down:dev         # Detener desarrollo
```

### **Producción local:**
```bash
npm run prod             # Levantar producción localmente
npm run prod:detached    # Levantar en segundo plano
npm run prod:build       # Solo construir imágenes
npm run down:prod        # Detener producción
npm run logs:prod        # Ver logs de producción
```

### **Desde Render Dashboard:**
- Ver logs en tiempo real
- Reiniciar servicios
- Escalar servicios
- Ver métricas

---

## 🔐 **Variables de Entorno en Render**

### **Configurar en Render Dashboard:**

1. Ve a cada servicio
2. Click en "Environment"
3. Agrega las variables:

```env
# Database (Render PostgreSQL)
DB_HOST=dpg-d4qv94ndiees739i1sjg-a.virginia-postgres.render.com
DB_PORT=5432
DB_NAME=insurance_db_udk3
DB_USER=insurance_db_udk3_user
DB_PASSWORD=w3lFMKRRLSri83xpOnV18VJH9wkgBSA0

# JWT
JWT_SECRET=<generar-con-openssl-rand-base64-32>
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🎉 **Ventajas de este setup**

✅ **Auto-deploy**: Cada push a `main` = deploy automático
✅ **Zero downtime**: Render hace rolling updates
✅ **SSL gratis**: HTTPS automático
✅ **Health checks**: Monitoreo automático
✅ **Logs centralizados**: Todos los logs en un lugar
✅ **Rollback fácil**: Volver a versión anterior en 1 click
✅ **Escalado horizontal**: Añadir más instancias fácilmente

---

## 📊 **Monitoreo y Logs**

### **Ver logs en tiempo real:**
```bash
# Desde Render Dashboard → Servicio → Logs
# O usando Render CLI:
render logs -s insurance-api-gateway -f
```

### **Health checks:**
- Render verifica automáticamente los endpoints de health
- Si falla 3 veces → reinicia el servicio
- Configurado en cada `Dockerfile.prod`

---

## 🔧 **Troubleshooting**

### **Error: "Build failed"**
**Solución:**
1. Verifica que todos los Dockerfiles tengan la ruta correcta
2. Revisa los logs de build en Render
3. Prueba localmente: `npm run prod:build`

### **Error: "Database connection failed"**
**Solución:**
1. Verifica las variables `DB_HOST`, `DB_USER`, `DB_PASSWORD`
2. Asegúrate de que SSL está habilitado en `connection.ts`
3. Verifica que la IP de Render no esté bloqueada

### **Servicio no inicia**
**Solución:**
1. Revisa los logs: `render logs -s <service-name>`
2. Verifica health check path
3. Asegúrate de que el puerto expuesto coincide con `PORT` env var

---

## 📚 **Recursos**

- [Render Docs: Docker Compose](https://render.com/docs/docker)
- [Render Docs: Environment Variables](https://render.com/docs/environment-variables)
- [Render Docs: Health Checks](https://render.com/docs/health-checks)

---

**Última actualización:** Diciembre 7, 2025
