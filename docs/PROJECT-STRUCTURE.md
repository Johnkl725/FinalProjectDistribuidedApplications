# 📁 Estructura Completa del Proyecto

```
insurance-platform/
│
├── 📄 README.md                          # Documentación principal
├── 📄 package.json                       # Scripts npm del proyecto
├── 📄 .gitignore                         # Archivos a ignorar en git
│
├── 📂 docs/                              # 📚 DOCUMENTACIÓN
│   ├── INSTALLATION.md                   # Guía de instalación
│   ├── ARCHITECTURE.md                   # Arquitectura del sistema
│   └── API.md                            # Documentación de API
│
├── 📂 database/                          # 🗄️ BASE DE DATOS
│   └── init.sql                          # Script de inicialización PostgreSQL
│
├── 📂 shared/                            # 🔗 CÓDIGO COMPARTIDO
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── src/
│       ├── index.ts                      # Exportaciones principales
│       ├── database/
│       │   ├── connection.ts             # ✅ Singleton Pattern - DB Connection
│       │   └── base-repository.ts        # ✅ Repository Pattern
│       ├── patterns/
│       │   └── insurance-factory.ts      # ✅ Factory Pattern
│       └── utils/
│           ├── jwt.ts                    # Utilidades JWT
│           ├── api-response.ts           # Formateadores de respuesta
│           └── validators.ts             # Validadores comunes
│
├── 📂 api-gateway/                       # 🚪 API GATEWAY (Puerto 3000)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── src/
│       ├── index.ts                      # ✅ API Gateway Pattern - Entry point
│       ├── config/
│       │   └── proxy.config.ts           # Configuración de proxies
│       └── middleware/
│           ├── auth.middleware.ts        # Autenticación JWT global
│           ├── rate-limiter.middleware.ts # Rate limiting
│           └── logger.middleware.ts      # Request logger
│
├── 📂 auth-service/                      # 🔐 AUTH SERVICE (Puerto 3001)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── src/
│       ├── index.ts                      # Entry point
│       ├── models/
│       │   └── user.model.ts             # Modelo de usuario
│       ├── repositories/
│       │   └── user.repository.ts        # ✅ Repository Pattern - User data
│       ├── services/
│       │   └── auth.service.ts           # ✅ Layered Architecture - Business logic
│       ├── controllers/
│       │   └── auth.controller.ts        # ✅ Layered Architecture - HTTP handler
│       ├── routes/
│       │   └── auth.routes.ts            # Definición de rutas
│       └── middleware/
│           ├── auth.middleware.ts        # JWT validation
│           └── admin.middleware.ts       # Role-based access
│
├── 📂 life-insurance-service/            # 🏥 LIFE INSURANCE (Puerto 3002)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── src/
│       ├── index.ts
│       ├── models/
│       │   └── life-insurance.model.ts
│       ├── repositories/
│       │   └── life-insurance.repository.ts  # ✅ Repository Pattern
│       ├── services/
│       │   └── life-insurance.service.ts     # ✅ Factory Pattern usage
│       ├── controllers/
│       │   └── life-insurance.controller.ts  # ✅ Layered Architecture
│       ├── routes/
│       │   └── life-insurance.routes.ts
│       └── middleware/
│           ├── auth.middleware.ts
│           └── admin.middleware.ts
│
├── 📂 rent-insurance-service/            # 🏠 RENT INSURANCE (Puerto 3003)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── src/
│       ├── index.ts
│       ├── models/
│       │   └── rent-insurance.model.ts
│       ├── repositories/
│       │   └── rent-insurance.repository.ts  # ✅ Repository Pattern
│       ├── services/
│       │   └── rent-insurance.service.ts     # ✅ Factory Pattern usage
│       ├── controllers/
│       │   └── rent-insurance.controller.ts
│       ├── routes/
│       │   └── rent-insurance.routes.ts
│       └── middleware/
│           ├── auth.middleware.ts
│           └── admin.middleware.ts
│
├── 📂 vehicle-insurance-service/         # 🚗 VEHICLE INSURANCE (Puerto 3004)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   └── src/
│       ├── index.ts
│       ├── models/
│       │   └── vehicle-insurance.model.ts
│       ├── repositories/
│       │   └── vehicle-insurance.repository.ts  # ✅ Repository Pattern
│       ├── services/
│       │   └── vehicle-insurance.service.ts     # ✅ Factory Pattern usage
│       ├── controllers/
│       │   └── vehicle-insurance.controller.ts
│       ├── routes/
│       │   └── vehicle-insurance.routes.ts
│       └── middleware/
│           ├── auth.middleware.ts
│           └── admin.middleware.ts
│
└── 📂 docker/                            # 🐳 CONFIGURACIÓN DOCKER
    ├── docker-compose.dev.yml            # Desarrollo con hot-reloading
    ├── docker-compose.prod.yml           # ✅ Multi-stage builds
    └── .env.example                      # Variables de entorno producción
```

---

## 🎯 Convenciones de Nomenclatura

### Archivos
- **Models**: `*.model.ts` - Definiciones de tipos/interfaces
- **Repositories**: `*.repository.ts` - Acceso a datos
- **Services**: `*.service.ts` - Lógica de negocio
- **Controllers**: `*.controller.ts` - Manejo de HTTP
- **Routes**: `*.routes.ts` - Definición de endpoints
- **Middleware**: `*.middleware.ts` - Funciones intermedias

### Directorios
- Nombres en **singular** para código: `src/model/`, `src/service/`
- Nombres en **plural** para documentación: `docs/`, `scripts/`

---

## 🔍 Búsqueda Rápida por Patrón

### Singleton Pattern
```
📂 shared/src/database/connection.ts
```

### Repository Pattern
```
📂 shared/src/database/base-repository.ts
📂 auth-service/src/repositories/user.repository.ts
📂 life-insurance-service/src/repositories/life-insurance.repository.ts
📂 rent-insurance-service/src/repositories/rent-insurance.repository.ts
📂 vehicle-insurance-service/src/repositories/vehicle-insurance.repository.ts
```

### Factory Pattern
```
📂 shared/src/patterns/insurance-factory.ts
   └─ Usado en: */src/services/*.service.ts
```

### API Gateway Pattern
```
📂 api-gateway/src/index.ts
📂 api-gateway/src/config/proxy.config.ts
📂 api-gateway/src/middleware/auth.middleware.ts
```

### Layered Architecture
```
Cada microservicio sigue:
📂 */src/routes/*.routes.ts        → Capa de Routing
📂 */src/controllers/*.controller.ts → Capa de Presentación
📂 */src/services/*.service.ts      → Capa de Negocio
📂 */src/repositories/*.repository.ts → Capa de Datos
📂 */src/models/*.model.ts          → Capa de Dominio
```

---

## 📊 Estadísticas del Proyecto

- **Total de Microservicios**: 4 (Auth, Life, Rent, Vehicle) + 1 Gateway
- **Líneas de Código Estimadas**: ~5,000
- **Patrones de Diseño**: 5 (Singleton, Repository, Factory, Gateway, Layered)
- **Tecnologías**: TypeScript, Node.js, Express, PostgreSQL, Docker
- **Puertos Utilizados**: 5 (3000-3004 + 5432)
- **Contenedores Docker**: 6 (5 servicios + 1 DB)

---

## 🚀 Próximos Pasos de Desarrollo

1. ✅ **Backend Completo** (HECHO)
2. ⏳ **Frontend React** (Siguiente fase)
3. ⏳ **Testing** (Unit, Integration, E2E)
4. ⏳ **CI/CD Pipeline** (GitHub Actions)
5. ⏳ **Monitoring** (Prometheus + Grafana)
6. ⏳ **Documentation** (Swagger/OpenAPI)
