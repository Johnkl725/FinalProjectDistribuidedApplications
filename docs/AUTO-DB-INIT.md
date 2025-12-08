# 🗄️ Inicialización Automática de Base de Datos

## ¿Cómo funciona?

El proyecto está configurado para inicializar automáticamente la base de datos de producción (Render PostgreSQL) al ejecutar `docker-compose.prod.yml`.

### Flujo de inicialización:

```
docker-compose up
       ↓
  db-init inicia
       ↓
Verifica si tabla 'users' existe
       ↓
   ┌────NO────┐        ┌────SÍ────┐
   ↓          ↓        ↓          ↓
Ejecuta   Completa  Salta    Completa
init.sql   (exit 0)  init.sql  (exit 0)
   ↓                     ↓
   └─────────┬───────────┘
             ↓
    Servicios inician
    (auth, life, rent,
     vehicle, gateway,
     frontend)
```

## Archivos involucrados:

### 1. `scripts/init-db.sh`
Script bash que:
- Espera a que la BD de Render esté disponible
- Verifica si las tablas ya existen
- Ejecuta `init.sql` solo si es necesario
- Proporciona logging claro

### 2. `docker-compose.prod.yml`
Servicio `db-init`:
```yaml
db-init:
  image: postgres:16-alpine
  environment:
    - DB_HOST=${DB_HOST}
    - DB_PORT=${DB_PORT:-5432}
    - DB_NAME=${DB_NAME}
    - DB_USER=${DB_USER}
    - DB_PASSWORD=${DB_PASSWORD}
  volumes:
    - ./database:/app/database
    - ./scripts/init-db.sh:/app/init-db.sh
  command: sh /app/init-db.sh
  restart: "no"  # Solo se ejecuta una vez
```

### 3. Dependencias en servicios
Todos los servicios esperan a `db-init`:
```yaml
depends_on:
  db-init:
    condition: service_completed_successfully
```

## Uso:

### Primera vez (BD vacía):
```bash
docker-compose up -d
```

**Output esperado:**
```
🔍 Checking if database needs initialization...
⏳ Waiting for database to be ready...
✅ Database is ready!
📦 Tables not found. Initializing database...
✅ Database initialized successfully!
🚀 Starting application...
```

### Siguientes veces (BD ya inicializada):
```bash
docker-compose up -d
```

**Output esperado:**
```
🔍 Checking if database needs initialization...
✅ Database is ready!
✅ Database already initialized. Skipping init.sql
🚀 Starting application...
```

## Ver logs de inicialización:

```bash
# Ver logs del servicio de inicialización
docker-compose logs db-init

# Ver logs de todos los servicios
docker-compose logs -f
```

## Verificar estado:

```bash
# Ver contenedores
docker ps -a

# db-init debe mostrar: Exited (0)
# Otros servicios deben mostrar: Up
```

## Reinicializar base de datos:

Si necesitas ejecutar `init.sql` nuevamente:

### Opción 1: Limpiar manualmente
```bash
# Conecta a la BD con VS Code Database Client
# Ejecuta: DROP SCHEMA public CASCADE; CREATE SCHEMA public;
# Luego reinicia:
docker-compose -f docker-compose.prod.yml restart db-init
```

### Opción 2: Forzar recreación
```bash
docker-compose down
docker-compose up -d
```

## Ventajas:

✅ **Automático**: No necesitas ejecutar comandos SQL manualmente
✅ **Idempotente**: Puedes ejecutar `up` múltiples veces sin duplicar datos
✅ **Seguro**: Solo inicializa si la BD está vacía
✅ **Logging**: Mensajes claros de lo que está sucediendo
✅ **Sin dependencias**: Usa la imagen oficial de PostgreSQL

## Troubleshooting:

### Error: "connection refused"
**Causa**: La BD de Render no está accesible
**Solución**: Verifica las credenciales en `.env` y que SSL esté habilitado

### Error: "relation already exists"
**Causa**: Las tablas ya existen y el script intentó crearlas
**Solución**: Este error no debería ocurrir. Si ocurre, revisa el script `init-db.sh`

### db-init queda en estado "Restarting"
**Causa**: El script está fallando
**Solución**: 
```bash
docker logs insurance-db-init
# Revisa el error específico
```

### Los servicios no inician
**Causa**: `db-init` no completó exitosamente
**Solución**:
```bash
docker-compose -f docker-compose.prod.yml ps
# Si db-init muestra Exit 1, revisa sus logs:
docker logs insurance-db-init
```

## Archivos de configuración:

### `.env`
```env
DB_HOST=dpg-d4qv94ndiees739i1sjg-a.virginia-postgres.render.com
DB_PORT=5432
DB_NAME=insurance_db_udk3
DB_USER=insurance_db_udk3_user
DB_PASSWORD=w3lFMKRRLSri83xpOnV18VJH9wkgBSA0
```

### `.gitattributes`
```
*.sh text eol=lf
```
Asegura que los scripts bash usen line endings Unix (LF) en todos los sistemas.

---

Para más detalles, consulta: [DATABASE-PRODUCTION-SETUP.md](./DATABASE-PRODUCTION-SETUP.md)
