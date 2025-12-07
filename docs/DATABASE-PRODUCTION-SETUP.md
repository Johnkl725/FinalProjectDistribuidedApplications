# Configuración de Base de Datos en Producción (Render PostgreSQL)

Este documento detalla los pasos para conectar y configurar la base de datos PostgreSQL en producción usando Render.

---

## 📋 **Requisitos Previos**

- Cuenta en [Render.com](https://render.com)
- Base de datos PostgreSQL creada en Render
- VS Code con extensión **Database Client** instalada
- Credenciales de acceso a la base de datos

---

## 🔐 **Credenciales de la Base de Datos**

### **Información de Conexión (Render PostgreSQL)**

```
Host:       dpg-d4qv94ndiees739i1sjg-a.virginia-postgres.render.com
Port:       5432
Username:   insurance_db_udk3_user
Password:   w3lFMKRRLSri83xpOnV18VJH9wkgBSA0
Database:   insurance_db_udk3
```

### **Connection Strings**

**Internal URL** (solo para servicios dentro de Render):
```
postgresql://insurance_db_udk3_user:w3lFMKRRLSri83xpOnV18VJH9wkgBSA0@dpg-d4qv94ndiees739i1sjg-a/insurance_db_udk3
```

**External URL** (para conexiones desde fuera de Render):
```
postgresql://insurance_db_udk3_user:w3lFMKRRLSri83xpOnV18VJH9wkgBSA0@dpg-d4qv94ndiees739i1sjg-a.virginia-postgres.render.com:5432/insurance_db_udk3
```

---

## 🔌 **Paso 1: Conectar a la Base de Datos con VS Code**

### **Opción A: Usando Database Client Extension (Recomendado)**

1. **Instalar la extensión** en VS Code:
   - Presiona `Ctrl + Shift + X`
   - Busca **"Database Client"** (cweijan.vscode-database-client2)
   - Click en **"Install"**

2. **Crear nueva conexión:**
   - Click en el ícono de **Database** en la barra lateral izquierda
   - Click en **"+"** o **"Create Connection"**
   - Selecciona **"PostgreSQL"**

3. **Completar los campos:**

   | Campo | Valor |
   |-------|-------|
   | **Host** | `dpg-d4qv94ndiees739i1sjg-a.virginia-postgres.render.com` |
   | **Port** | `5432` |
   | **Username** | `insurance_db_udk3_user` |
   | **Password** | `w3lFMKRRLSri83xpOnV18VJH9wkgBSA0` |
   | **Database** | `insurance_db_udk3` |

4. **Configurar opciones avanzadas:**
   - ✅ Activar **"Use Connection String"** (toggle ON)
   - ✅ Activar **"SSL"** (toggle ON) - **OBLIGATORIO para Render**

5. **Connection String** (auto-generado):
   ```
   postgresql://insurance_db_udk3_user:w3lFMKRRLSri83xpOnV18VJH9wkgBSA0@dpg-d4qv94ndiees739i1sjg-a.virginia-postgres.render.com:5432/insurance_db_udk3
   ```

6. **Guardar y conectar:**
   - Click en **"Save"**
   - Click en **"Connect"**
   - Espera a que aparezca el árbol de la base de datos

---

## 🗄️ **Paso 2: Inicializar la Base de Datos**

### **Ejecutar el script init.sql**

1. **En el explorador de Database Client:**
   - Expande la conexión de Render
   - Click derecho en `insurance_db_udk3` (la base de datos)
   - Selecciona **"Run SQL File..."** o **"Execute SQL File..."**

2. **Seleccionar el archivo:**
   - Navega hasta: `insurance-platform/database/init.sql`
   - Click en **"Open"** o **"Ejecutar"**

3. **Verificar la ejecución:**
   - Revisa el panel de salida para confirmar que no hay errores
   - Deberías ver mensajes de creación de tablas y datos insertados

4. **Refrescar y verificar:**
   - Click derecho en la conexión → **"Refresh"**
   - Expande **"Tables"** y verifica que se crearon:
     - ✅ `users`
     - ✅ `policies`
     - ✅ `insurance_types`
     - ✅ `departments`
     - ✅ `policy_claims`

---

## ✅ **Paso 3: Verificar los Datos Iniciales**

### **Verificar usuarios demo:**

```sql
SELECT id, email, role, first_name, last_name FROM users;
```

**Usuarios esperados:**

| Email | Password | Role |
|-------|----------|------|
| `admin@insurance.com` | `Password123!` | `admin` |
| `employee@insurance.com` | `Password123!` | `employee` |
| `john.doe@email.com` | `Password123!` | `customer` |
| `jane.smith@email.com` | `Password123!` | `customer` |

### **Verificar tipos de seguro:**

```sql
SELECT * FROM insurance_types;
```

**Tipos esperados:**
- Life Insurance (id: 1)
- Rent Insurance (id: 2)
- Vehicle Insurance (id: 3)

### **Verificar departamentos:**

```sql
SELECT * FROM departments;
```

**Departamentos esperados:**
- Ventas
- Suscripciones
- Reclamos
- Auditoría

---

## 🐳 **Paso 4: Configurar Docker Compose para Producción**

### **El init.sql se ejecuta automáticamente**

El proyecto está configurado para inicializar la base de datos automáticamente al ejecutar `docker-compose.prod.yml`. 

**¿Cómo funciona?**

1. **Servicio `db-init`**: Un contenedor temporal que:
   - Verifica si las tablas ya existen
   - Si no existen, ejecuta el `init.sql`
   - Se detiene automáticamente después de completar

2. **Dependencias**: Todos los servicios esperan a que `db-init` complete exitosamente antes de iniciar

3. **Script inteligente** (`scripts/init-db.sh`):
   ```bash
   # Verifica si la tabla 'users' existe
   # Si NO existe → Ejecuta init.sql
   # Si SÍ existe → Salta la inicialización
   ```

**Ventajas:**
- ✅ No necesitas ejecutar init.sql manualmente
- ✅ Idempotente: Puedes ejecutar `docker-compose up` múltiples veces sin problemas
- ✅ Los servicios solo inician cuando la BD está lista
- ✅ Logs claros del proceso de inicialización

### **Actualizar el archivo .env**

Crea o actualiza el archivo `.env` en la raíz del proyecto:

```env
# ===============================================
# PRODUCTION ENVIRONMENT VARIABLES
# For production deployment with Render PostgreSQL
# ===============================================

# Database Configuration - Render PostgreSQL (Cloud)
# Using External Database URL for connections outside Render
DB_HOST=dpg-d4qv94ndiees739i1sjg-a.virginia-postgres.render.com
DB_PORT=5432
DB_NAME=insurance_db_udk3
DB_USER=insurance_db_udk3_user
DB_PASSWORD=w3lFMKRRLSri83xpOnV18VJH9wkgBSA0

# Alternative: Full Database URL (for tools that accept connection strings)
DATABASE_URL=postgresql://insurance_db_udk3_user:w3lFMKRRLSri83xpOnV18VJH9wkgBSA0@dpg-d4qv94ndiees739i1sjg-a.virginia-postgres.render.com/insurance_db_udk3

# JWT Configuration
JWT_SECRET=your-production-jwt-secret-min-32-chars-long
JWT_EXPIRES_IN=24h

# JWT Refresh Token Configuration (Optional)
# REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-chars
# REFRESH_TOKEN_EXPIRES_IN=7d

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **⚠️ IMPORTANTE: Seguridad**

1. **NUNCA** commitees el archivo `.env` a Git
2. Asegúrate de que `.env` esté en `.gitignore`
3. Usa `.env.example` para documentar las variables necesarias
4. En producción real, genera un `JWT_SECRET` fuerte:
   ```bash
   openssl rand -base64 32
   ```

---

## 🚀 **Paso 5: Ejecutar en Producción**

### **Levantar los servicios con docker-compose.yml:**

```bash
# Construir las imágenes de producción
docker-compose build

# Levantar todos los servicios (incluyendo inicialización de BD)
docker-compose up -d

# Ver los logs de inicialización de la base de datos
docker-compose logs db-init

# Ver todos los logs
docker-compose logs -f

# Detener los servicios
docker-compose down
```

### Lo que sucede al ejecutar `up`:**

1. **db-init** se ejecuta primero:
   ```
   🔍 Checking if database needs initialization...
   ⏳ Waiting for database to be ready...
   ✅ Database is ready!
   📦 Tables not found. Initializing database...
   ✅ Database initialized successfully!
   ```

2. **db-init** se detiene automáticamente (exit code 0)

3. **Los demás servicios** inician en orden:
   - auth-service
   - life-insurance-service
   - rent-insurance-service
   - vehicle-insurance-service
   - api-gateway
   - frontend

### **Verificar que todo está corriendo:**

```bash
# Ver el estado de todos los contenedores
docker ps

# Deberías ver:
# - insurance-auth-prod (Up)
# - insurance-life-prod (Up)
# - insurance-rent-prod (Up)
# - insurance-vehicle-prod (Up)
# - insurance-gateway-prod (Up)
# - insurance-frontend-prod (Up)
# - insurance-db-init (Exited 0) ← Este debe estar "Exited" con código 0
```

### **Verificar la inicialización de la base de datos:**

```bash
# Ver los logs del servicio de inicialización
docker logs insurance-db-init

# Si ves este mensaje, todo está bien:
# ✅ Database initialized successfully!

# Si ves este mensaje, la BD ya estaba inicializada:
# ✅ Database already initialized. Skipping init.sql
```

### **Probar la aplicación:**

```bash
# Probar el API Gateway
curl http://localhost:3000/health

# Probar autenticación
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@insurance.com","password":"Password123!"}'
```

### **Reiniciar la base de datos (si es necesario):**

Si necesitas re-ejecutar el `init.sql`:

```bash
# Opción 1: Eliminar y recrear las tablas manualmente en VS Code
# Luego reiniciar:
docker-compose restart db-init

# Opción 2: Forzar la reinicialización
docker-compose down
docker-compose up -d
```

### **Verificar la conexión:**

Los servicios se conectarán automáticamente a la base de datos de Render usando las variables de entorno del archivo `.env`.

---

## 🔍 **Troubleshooting**

### **Error: "SSL connection required"**

**Solución:** Asegúrate de que SSL está habilitado en:
1. La conexión de Database Client
2. El archivo `shared/src/database/connection.ts` tiene:
   ```typescript
   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
   ```

### **Error: "Connection timeout"**

**Solución:**
1. Verifica que el host sea el **External URL** (con `.virginia-postgres.render.com`)
2. Aumenta el `connectionTimeoutMillis` en `connection.ts` a 10000ms
3. Verifica que tu IP no esté bloqueada por firewall

### **Error: "Authentication failed"**

**Solución:**
1. Verifica las credenciales en Render Dashboard
2. Asegúrate de copiar la contraseña correctamente (sin espacios extras)
3. Verifica que el usuario tenga permisos en la base de datos

### **No aparecen las tablas después de ejecutar init.sql**

**Solución:**
1. Click derecho en la conexión → **"Refresh"**
2. Verifica que no haya errores en el panel de salida
3. Ejecuta manualmente:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

---

## 📊 **Consultas Útiles de Verificación**

### **Ver todas las tablas:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### **Ver total de usuarios:**
```sql
SELECT COUNT(*) as total_users FROM users;
```

### **Ver pólizas por estado:**
```sql
SELECT status, COUNT(*) as count 
FROM policies 
GROUP BY status;
```

### **Ver espacio usado por la base de datos:**
```sql
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'insurance_db_udk3';
```

---

## 🔄 **Backup y Restauración**

### **Crear backup desde VS Code:**

1. Click derecho en la base de datos
2. Selecciona **"Backup"** o **"Export Database"**
3. Guarda el archivo `.sql` en un lugar seguro

### **Restaurar backup:**

1. Click derecho en la base de datos
2. Selecciona **"Import SQL"**
3. Selecciona el archivo de backup `.sql`

### **Backup con pg_dump (si tienes PostgreSQL instalado localmente):**

```bash
# Crear backup
pg_dump "postgresql://insurance_db_udk3_user:w3lFMKRRLSri83xpOnV18VJH9wkgBSA0@dpg-d4qv94ndiees739i1sjg-a.virginia-postgres.render.com:5432/insurance_db_udk3" > backup.sql

# Restaurar backup
psql "postgresql://insurance_db_udk3_user:w3lFMKRRLSri83xpOnV18VJH9wkgBSA0@dpg-d4qv94ndiees739i1sjg-a.virginia-postgres.render.com:5432/insurance_db_udk3" < backup.sql
```

---

## 📚 **Referencias**

- [Render PostgreSQL Documentation](https://render.com/docs/databases)
- [PostgreSQL SSL Connection](https://www.postgresql.org/docs/current/ssl-tcp.html)
- [Node.js pg Pool Configuration](https://node-postgres.com/features/pooling)

---

## 🛡️ **Best Practices**

1. ✅ Siempre usa SSL para conexiones de producción
2. ✅ Mantén las credenciales en variables de entorno, nunca en el código
3. ✅ Realiza backups regulares de la base de datos
4. ✅ Usa transacciones para operaciones críticas
5. ✅ Monitorea el uso de conexiones del pool
6. ✅ Implementa retry logic para conexiones fallidas
7. ✅ Usa índices apropiados para mejorar el performance
8. ✅ Habilita logs de queries lentas en Render

---

**Última actualización:** Diciembre 7, 2025
