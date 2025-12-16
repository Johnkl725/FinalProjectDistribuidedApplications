# 🧪 Guía de Prueba en Desarrollo Local

## 📋 Pre-requisitos

Asegúrate de tener:
- ✅ Docker Desktop corriendo
- ✅ Todos los cambios guardados en tu código
- ✅ Puerto 5432 (PostgreSQL) libre

---

## 🚀 Paso 1: Detener servicios actuales

```powershell
# En la raíz del proyecto
cd c:\insurance-platform

# Detener contenedores actuales
docker-compose -f docker-compose.dev.yml down

# Opcional: Limpiar volúmenes si quieres empezar fresh
docker-compose -f docker-compose.dev.yml down -v
```

---

## 🏗️ Paso 2: Rebuild con los nuevos cambios

```powershell
# Rebuild todos los servicios (incluye shared actualizado)
docker-compose -f docker-compose.dev.yml build

# Esto puede tomar 3-5 minutos
```

**Lo que se está buildeando:**
- ✅ Shared module con: `pool-monitor.ts`, `retry-handler.ts`, `request-queue.ts`
- ✅ Connection pool optimizado (5 conexiones en dev)
- ✅ Frontend con caché optimizado (5 min TTL)
- ✅ Todos los microservicios con las nuevas dependencias

---

## ▶️ Paso 3: Iniciar servicios

```powershell
# Iniciar en modo detached (background)
docker-compose -f docker-compose.dev.yml up -d

# Ver los logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f
```

**Esperar a que todos los servicios estén listos:**
```
✅ insurance-postgres-dev ... healthy
✅ insurance-auth-dev ... started
✅ insurance-life-dev ... started
✅ insurance-vehicle-dev ... started
✅ insurance-rent-dev ... started
✅ insurance-claims-dev ... started
✅ insurance-gateway-dev ... started
✅ insurance-frontend-dev ... started
```

---

## 🔍 Paso 4: Verificar que todo funciona

### **4.1 Verificar Backend (Logs):**

```powershell
# Ver logs de auth service
docker-compose -f docker-compose.dev.yml logs -f auth-service
```

**Buscar en logs:**
```
✅ Database connection established
🚀 Auth Service started
📡 Listening on port 3001
🌍 Environment: development
```

### **4.2 Verificar PostgreSQL:**

```powershell
# Conectar a PostgreSQL
docker exec -it insurance-postgres-dev psql -U postgres -d insurance_db

# Dentro de psql, verificar tablas:
\dt

# Salir
\q
```

### **4.3 Verificar Frontend:**

Abrir navegador: **http://localhost:5173**

---

## 🧪 Paso 5: Probar el Sistema de Caché

### **5.1 Abrir Browser Console (F12)**

### **5.2 Login:**
- Usuario: admin (o crea uno nuevo)
- Password: password

**Esperar logs en consola:**
```javascript
🌐 Cache MISS: login - Fetching...
✅ Login successful
```

### **5.3 Navegar a Dashboard:**

**Primera vez - verás:**
```javascript
🌐 Cache MISS: admin-life-policies - Fetching...
🌐 Cache MISS: admin-vehicle-policies - Fetching...
🌐 Cache MISS: admin-rent-policies - Fetching...
🌐 Cache MISS: all-life-policies - Fetching...
... (10-15 requests)
```

**Navegar a otra página (ej: All Policies) y VOLVER al Dashboard:**

**Segunda vez - deberías ver:**
```javascript
🎯 Cache HIT: admin-life-policies
🎯 Cache HIT: admin-vehicle-policies
🎯 Cache HIT: admin-rent-policies
🎯 Cache HIT: all-life-policies
... (0 requests al backend) ⚡
```

### **5.4 Cada minuto verás estadísticas:**
```javascript
📊 Cache Stats: { 
  cacheSize: 12, 
  hits: 35, 
  misses: 15, 
  deduplicated: 5,
  hitRate: "70.0%" 
}
```

**✅ SI VES ESTO = CACHÉ FUNCIONA CORRECTAMENTE**

---

## 🔍 Paso 6: Verificar Connection Pool

### **6.1 Ver logs del backend:**

```powershell
# Logs de cualquier servicio (ej: life-insurance)
docker-compose -f docker-compose.dev.yml logs -f life-insurance-service
```

**Buscar:**
```
🔌 Connection acquired: total=1, idle=0, waiting=0
📊 Query executed in 15ms: SELECT * FROM life_insurance_policies...
🔓 Connection released: total=1, idle=1, waiting=0
```

**✅ SI VES acquire → release = CONEXIONES SE LIBERAN CORRECTAMENTE**

### **6.2 Opcional - Pool Monitor:**

Si activaste el pool monitor en los servicios, cada 30s verás:
```
📊 Pool Status:
   Total: 2
   Active: 1
   Idle: 1
   Waiting: 0
   Utilization: 50.0%
```

---

## 🎯 Paso 7: Prueba de Estrés (Simular navegación rápida)

### **7.1 En el navegador:**
1. Login
2. Dashboard
3. All Policies
4. Dashboard (rápido)
5. Pending Policies
6. Dashboard (rápido)
7. Create Policy
8. Dashboard (rápido)

**Repetir este ciclo 3-5 veces rápidamente**

### **7.2 Verificar en Console:**

**Deberías ver MAYORMENTE Cache HITs:**
```javascript
🎯 Cache HIT: admin-life-policies
🎯 Cache HIT: all-life-policies
🌐 Cache MISS: pending-policies-0 (normal si es primera vez)
🎯 Cache HIT: pending-policies-0 (segunda vez)
```

**Estadísticas finales:**
```javascript
📊 Cache Stats: { hitRate: "75.0%" } ← Debería ser >70%
```

### **7.3 Verificar en Backend Logs:**

**NO deberías ver:**
```
❌ CRITICAL: Pool exhausted!
❌ Too many requests
❌ Connection timeout
```

**SÍ deberías ver:**
```
✅ Conexiones acquired y released constantemente
✅ Pool utilization < 80%
✅ No warnings
```

---

## ✅ Paso 8: Resultados Esperados

### **Indicadores de Éxito:**

| Métrica | Esperado | Significado |
|---------|----------|-------------|
| **Cache Hit Rate** | >70% | Caché funciona bien |
| **Backend Requests** | Reducido 50-70% | Frontend no bombardea |
| **Pool Utilization** | <80% | Conexiones disponibles |
| **503 Errors** | 0 | No hay saturación |
| **Acquire/Release** | Balanceados | Conexiones se liberan |

### **Console del Navegador:**
```javascript
✅ Mayoría de navegación muestra "Cache HIT"
✅ Stats muestran hitRate > 70%
✅ No errors 503
✅ Carga rápida (usa caché)
```

### **Logs del Backend:**
```
✅ Conexiones acquired = Conexiones released
✅ Pool utilization < 80%
✅ No "Pool exhausted"
✅ No "Too many requests"
✅ Query times normales (<100ms)
```

---

## ❌ Troubleshooting

### **Problema 1: Cache hit rate < 50%**

**Posible causa:** TTL muy corto o caché se invalida mucho

**Solución:**
```javascript
// Verificar en frontend/src/utils/apiCache.js
set(key, data, ttlMs = 300000) // Debe ser 300000 (5 min)
```

### **Problema 2: Muchos "Cache MISS" en la misma vista**

**Posible causa:** Keys diferentes para la misma data

**Solución:**
```javascript
// En console, buscar logs como:
🌐 Cache MISS: all-life-policies:[]
🌐 Cache MISS: all-life-policies:[undefined]
// ← Diferentes keys para la misma función
```

### **Problema 3: Backend logs muestran Pool exhausted**

**Posible causa:** Connection leak

**Solución:**
```powershell
# Ver qué servicio tiene el problema
docker-compose -f docker-compose.dev.yml logs -f | findstr "Connection"

# Buscar:
🔌 Connection acquired: total=5
... (queries)
# ❌ NO HAY 🔓 Connection released

# Ese servicio tiene leak
```

### **Problema 4: 503 errors todavía aparecen**

**Diagnóstico:**
1. **¿Cuándo aparece?** ¿Inmediato o después de minutos?
2. **Cache stats:** ¿Hit rate < 50%?
3. **Backend logs:** ¿Pool exhausted?

**Si aparece inmediato:**
- Problema: Pool demasiado pequeño para desarrollo
- Solución temporal: En connection.ts cambiar `max: 5` a `max: 10` (solo dev)

**Si aparece después de minutos:**
- Problema: Connection leak
- Ver logs de acquire/release para identificar servicio

---

## 📊 Paso 9: Comparar ANTES vs AHORA

### **Crea un log para comparar:**

```powershell
# ANTES de los cambios (si guardaste logs)
# Contar Cache MISS en 5 minutos: ~50-100

# AHORA con los cambios
# Contar Cache MISS en 5 minutos: Debería ser ~15-30

# Reducción esperada: 60-70%
```

---

## 🎉 Si Todo Funciona en Dev:

1. ✅ Cache hit rate > 70%
2. ✅ No 503 errors
3. ✅ Pool utilization < 80%
4. ✅ Navegación rápida
5. ✅ Acquire/Release balanceados

**= LISTO PARA DEPLOYAR A RENDER** 🚀

---

## 🔄 Comandos Útiles Durante Pruebas

```powershell
# Ver logs de todos los servicios
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs de servicio específico
docker-compose -f docker-compose.dev.yml logs -f auth-service

# Ver solo errores
docker-compose -f docker-compose.dev.yml logs -f | findstr "ERROR|CRITICAL|503"

# Reiniciar un servicio específico
docker-compose -f docker-compose.dev.yml restart auth-service

# Ver estadísticas de recursos
docker stats

# Entrar a un contenedor
docker exec -it insurance-auth-dev sh

# Ver variables de entorno
docker-compose -f docker-compose.dev.yml exec auth-service env

# Ver conexiones PostgreSQL activas
docker exec -it insurance-postgres-dev psql -U postgres -d insurance_db -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"
```

---

## 📝 Checklist Final de Prueba

Antes de deployar a Render, verifica:

- [ ] Build exitoso sin errores
- [ ] Todos los servicios started
- [ ] PostgreSQL healthy
- [ ] Login funciona
- [ ] Dashboard carga sin errores
- [ ] Cache hit rate > 70% después de navegar
- [ ] Stats se muestran cada minuto
- [ ] Backend logs muestran acquire/release
- [ ] No hay "Pool exhausted" en logs
- [ ] No hay 503 errors
- [ ] Navegación rápida entre vistas
- [ ] Datos se muestran correctamente

---

**Una vez TODO FUNCIONE en dev → Proceder con deploy a Render** ✅
