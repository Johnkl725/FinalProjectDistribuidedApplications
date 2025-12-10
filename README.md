# 🏢 Insurance Management Platform - Microservices Architecture

## 🎯 Arquitectura del Sistema

Esta aplicación implementa una arquitectura de **microservicios** para una plataforma Insurtech que maneja múltiples tipos de seguros y reclamos:
- 🏥 **Life Insurance** (Seguros de Vida)
- 🏠 **Rent Insurance** (Seguros de Alquiler)
- 🚗 **Vehicle Insurance** (Seguros de Vehículos)
- 📋 **Claims Management** (Gestión de Reclamos)

## 🏗️ Estructura de Microservicios

```
├── api-gateway/               # Gateway unificado con rate limiting
├── auth-service/              # Autenticación JWT y gestión de usuarios/departamentos
├── life-insurance-service/    # Gestión de pólizas de vida
├── rent-insurance-service/    # Gestión de pólizas de alquiler
├── vehicle-insurance-service/ # Gestión de pólizas vehiculares
├── claims-service/            # Procesamiento de reclamos de seguros
├── frontend/                  # React + Vite SPA
├── shared/                    # Módulo compartido (DB, utils, patterns)
├── database/                  # Esquemas, migraciones y funciones PL/pgSQL
└── docker/                    # Configuraciones Docker multi-ambiente
```

## 🔧 Tech Stack

### Backend
- **Runtime**: Node.js 20 + TypeScript 5
- **Framework**: Express 4 con middleware de seguridad (Helmet, CORS)
- **Base de Datos**: PostgreSQL 16 con índices optimizados
- **Autenticación**: JWT + Bcrypt para hashing
- **Validación**: Custom validators con TypeScript
- **Logging**: Morgan + Winston (desarrollo/producción)

### Frontend
- **Framework**: React 18 + Vite 5
- **UI**: Tailwind CSS + Lucide Icons
- **HTTP Client**: Axios con interceptores
- **State**: React Context API
- **Routing**: React Router v6

### DevOps & Infrastructure
- **Contenedores**: Docker + Docker Compose (multi-stage builds)
- **Reverse Proxy**: Nginx (producción)
- **Cloud Deploy**: Render (Blueprint con render.yaml)
- **CI/CD**: GitHub Actions ready
- **Monitoring**: Health checks + logging centralizado

### Patrones de Diseño
- **Factory Pattern**: Creación polimórfica de seguros
- **Repository Pattern**: Abstracción de capa de datos
- **Singleton Pattern**: Conexión única a BD
- **API Gateway Pattern**: Punto de entrada unificado

### Features Avanzadas
- **SCD Type 2**: Versionamiento histórico de pólizas
- **Database Views**: Consultas pre-optimizadas
- **PL/pgSQL Functions**: Lógica de negocio en BD
- **Triggers**: Validaciones automáticas
- **Multi-environment**: Configs para dev/prod

## 🚀 Comandos Rápidos

### Desarrollo Local
```bash
# Levantar todos los servicios (con hot-reload)
docker-compose -f docker-compose.dev.yml up --build

# Ver logs en tiempo real
docker-compose -f docker-compose.dev.yml logs -f

# Detener servicios
docker-compose -f docker-compose.dev.yml down
```

### Producción (Local)
```bash
# Build optimizado y deploy
docker-compose -f docker-compose.yml up --build -d

# Verificar estado
docker-compose -f docker-compose.yml ps

# Ver logs
docker-compose -f docker-compose.yml logs --tail=100
```

### Deploy en Render
```bash
# 1. Push a GitHub
git push origin main

# 2. Render auto-deploya desde render.yaml
# O usar Manual Deploy en Render Dashboard
```

### Deploy en VPS (Producción)
```bash
# 1. Conectar al VPS
ssh root@178.128.70.171

# 2. Clonar y configurar
git clone <repo-url>
cd FinalProjectDistribuidedApplications
cp .env.example .env
nano .env  # Configurar variables

# 3. Desplegar
chmod +x deploy-vps.sh
./deploy-vps.sh

# Ver guía completa: QUICK-START-VPS.md
```

## 📊 Puertos de Servicios

| Servicio | Puerto | Propósito |
|----------|--------|-----------|
| **Frontend** | `5173` (dev) / `80` (prod) | React SPA |
| **API Gateway** | `3000` | Punto de entrada único |
| **Auth Service** | `3001` | Autenticación y usuarios |
| **Life Insurance** | `3002` | Pólizas de vida |
| **Rent Insurance** | `3003` | Pólizas de alquiler |
| **Vehicle Insurance** | `3004` | Pólizas vehiculares |
| **Claims Service** | `3005` | Gestión de reclamos |
| **PostgreSQL** | `5432` | Base de datos |

## 🔐 Autenticación y Seguridad

### JWT Authentication
Todas las rutas protegidas requieren un token JWT válido:
```http
Authorization: Bearer <token>
```

### Roles de Usuario
- **admin**: Acceso total, gestión de usuarios y empleados
- **employee**: Gestión de pólizas y reclamos
- **customer**: Acceso a pólizas propias

### Endpoints de Auth
```bash
POST /api/auth/register    # Registro de usuarios
POST /api/auth/login       # Login (retorna JWT)
GET  /api/auth/profile     # Perfil del usuario autenticado
```

## 📋 Gestión de Reclamos (Claims)

El nuevo microservicio de reclamos maneja el ciclo completo:

### Estados de Reclamo
- `submitted` → `under_review` → `approved` / `rejected`

### Endpoints Principales
```bash
POST   /api/claims              # Crear reclamo
GET    /api/claims/my           # Mis reclamos
GET    /api/claims/:claimNumber # Detalle por número
PUT    /api/claims/:id/status   # Actualizar estado (admin)
```

## 🗄️ Base de Datos

### Características
- **SCD Type 2**: Historial completo de cambios en pólizas
- **Views Optimizadas**: `current_policies`, `expiring_policies_alert`
- **Funciones PL/pgSQL**: `renew_policy()`, `cancel_policy()`
- **Triggers**: Validación automática de fechas
- **Índices**: Optimizados para consultas frecuentes

### Migraciones
```bash
# Aplicar esquema inicial
docker exec -i postgres-container psql -U user -d db < database/init.sql

# Ver vistas disponibles
\dv
```

## 🌐 Variables de Entorno

### Desarrollo (`.env.development`)
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=insurance_db
DB_USER=postgres
DB_PASSWORD=postgres

# Auth
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Frontend
VITE_API_URL=http://localhost:3000/api
```

### Producción (Render)
```env
# Database (Render PostgreSQL)
DATABASE_URL=postgresql://user:pass@host/db

# Auth
JWT_SECRET=<secure-random-string>

# Frontend
VITE_API_URL=https://insurance-api-gateway.onrender.com/api
```

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📚 Documentación Adicional

- [API Documentation](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es parte de un trabajo académico para la Universidad Nacional Mayor de San Marcos (UNMSM) FISI BASE 22 - Taller de aplicaciones distribuidas.

## 👥 Autores

Desarrollado como proyecto final del curso de Aplicaciones Distribuidas.

---

**🚀 Happy Coding!**
