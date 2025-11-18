# 🚀 Guía de Instalación y Ejecución

## 📋 Requisitos Previos

- **Docker**: 20.10+ y Docker Compose 2.0+
- **Node.js**: 20+ (solo para desarrollo local sin Docker)
- **Git**: Para clonar el repositorio

## 🔧 Instalación

### 1️⃣ Clonar el Proyecto
```powershell
git clone <your-repo-url>
cd insurance-platform
```

### 2️⃣ Configurar Variables de Entorno (Desarrollo)
Las variables de desarrollo ya están configuradas en `docker-compose.dev.yml`. No requiere configuración adicional.

### 3️⃣ Configurar Variables de Entorno (Producción)
```powershell
cd docker
cp .env.example .env
# Edita .env y cambia todos los valores de seguridad
```

## 🏃 Ejecutar el Proyecto

### Modo Desarrollo (con Hot-Reloading)

```powershell
# Desde la raíz del proyecto
npm run dev

# O directamente con docker-compose
docker-compose -f docker/docker-compose.dev.yml up --build
```

**Servicios disponibles:**
- 🚪 API Gateway: http://localhost:3000
- 🔐 Auth Service: http://localhost:3001
- 🏥 Life Insurance: http://localhost:3002
- 🏠 Rent Insurance: http://localhost:3003
- 🚗 Vehicle Insurance: http://localhost:3004
- 🐘 PostgreSQL: localhost:5432

### Modo Producción

```powershell
# Asegúrate de haber configurado el .env en /docker
docker-compose -f docker/docker-compose.prod.yml up --build -d
```

### Ver Logs

```powershell
# Todos los servicios
npm run logs

# O con docker-compose
docker-compose -f docker/docker-compose.dev.yml logs -f

# Solo un servicio específico
docker-compose -f docker/docker-compose.dev.yml logs -f api-gateway
```

### Detener los Servicios

```powershell
# Modo desarrollo
npm run down:dev

# Modo producción
npm run down:prod
```

## 🧪 Probar la API

### 1. Registrar un Usuario
```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 2. Login
```powershell
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Guarda el token que recibes en la respuesta.**

### 3. Cotizar un Seguro de Vida
```powershell
curl -X POST http://localhost:3000/api/life-insurance/quote `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d '{
    "coverage_amount": 100000,
    "start_date": "2024-01-01",
    "end_date": "2025-01-01",
    "age": 35,
    "smoker": false
  }'
```

### 4. Crear una Póliza de Vida
```powershell
curl -X POST http://localhost:3000/api/life-insurance/policies `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN_HERE" `
  -d '{
    "coverage_amount": 100000,
    "start_date": "2024-01-01",
    "end_date": "2025-01-01",
    "age": 35,
    "medical_history": "None",
    "smoker": false,
    "beneficiaries": [
      {
        "name": "Jane Doe",
        "relationship": "spouse",
        "percentage": 100
      }
    ]
  }'
```

### 5. Ver Mis Pólizas
```powershell
curl -X GET http://localhost:3000/api/life-insurance/policies/my `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🐛 Troubleshooting

### Problema: El contenedor no inicia
```powershell
# Ver logs del contenedor problemático
docker logs insurance-auth-dev

# Reconstruir sin caché
docker-compose -f docker/docker-compose.dev.yml build --no-cache
docker-compose -f docker/docker-compose.dev.yml up
```

### Problema: Error de conexión a la base de datos
```powershell
# Verificar que postgres esté corriendo
docker ps | Select-String postgres

# Reiniciar postgres
docker-compose -f docker/docker-compose.dev.yml restart postgres
```

### Problema: Puerto ya en uso
```powershell
# Ver qué proceso usa el puerto 3000
netstat -ano | Select-String ":3000"

# Detener el proceso o cambiar el puerto en docker-compose
```

### Limpiar Todo y Empezar de Cero
```powershell
# Detener y eliminar todos los contenedores, redes y volúmenes
docker-compose -f docker/docker-compose.dev.yml down -v

# Eliminar imágenes
docker rmi $(docker images -q 'insurance*')

# Volver a construir
docker-compose -f docker/docker-compose.dev.yml up --build
```

## 📊 Health Checks

Verifica el estado de todos los servicios:

```powershell
# Gateway
curl http://localhost:3000/health

# Auth Service
curl http://localhost:3001/auth/health

# Life Insurance
curl http://localhost:3002/life-insurance/health
```

## 🔒 Seguridad en Producción

**⚠️ IMPORTANTE:** Antes de desplegar a producción:

1. Cambia todas las contraseñas en `docker/.env`
2. Genera un JWT_SECRET fuerte (mínimo 32 caracteres)
3. Usa HTTPS (configura un reverse proxy como Nginx)
4. Habilita rate limiting más estricto
5. Configura backups automáticos de PostgreSQL
6. Usa secrets de Docker para variables sensibles
