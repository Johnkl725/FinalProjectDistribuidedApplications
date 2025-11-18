# 📐 Arquitectura del Sistema

## 🎯 Visión General

El sistema implementa una **arquitectura de microservicios** donde cada tipo de seguro es un servicio independiente en su propio contenedor Docker. El API Gateway actúa como punto de entrada único que maneja autenticación global y enrutamiento.

## 🏗️ Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                             │
│                    (React / Mobile App)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP/HTTPS
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   🚪 API GATEWAY :3000                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  - Autenticación JWT Global                          │   │
│  │  - Rate Limiting                                     │   │
│  │  - Request Logging                                   │   │
│  │  - Proxy a Microservicios                           │   │
│  └──────────────────────────────────────────────────────┘   │
└───┬─────────┬─────────────┬─────────────┬──────────────────┘
    │         │             │             │
    │         │             │             │
┌───▼─────┐ ┌─▼──────────┐ ┌▼───────────┐ ┌▼──────────────┐
│   🔐    │ │    🏥      │ │    🏠      │ │      🚗       │
│  Auth   │ │   Life     │ │   Rent     │ │   Vehicle     │
│ Service │ │ Insurance  │ │ Insurance  │ │  Insurance    │
│  :3001  │ │   :3002    │ │   :3003    │ │    :3004      │
└────┬────┘ └─────┬──────┘ └─────┬──────┘ └───────┬───────┘
     │            │              │                 │
     └────────────┴──────────────┴─────────────────┘
                           │
                           │
                    ┌──────▼──────┐
                    │      🐘      │
                    │  PostgreSQL  │
                    │    :5432     │
                    └─────────────┘
```

## 🔄 Flujo de una Request

### 1. Request de Creación de Póliza

```
Cliente
   │
   │ POST /api/life-insurance/policies
   │ Headers: Authorization: Bearer <token>
   ▼
API Gateway (puerto 3000)
   │
   │ 1. Middleware: Rate Limiter
   │ 2. Middleware: Request Logger
   │ 3. Middleware: Auth (verifica JWT)
   │    └─> Si falla: 401 Unauthorized
   │    └─> Si OK: Adjunta user data al request
   │
   │ 4. Proxy: Redirige a Life Insurance Service
   ▼
Life Insurance Service (puerto 3002)
   │
   │ 1. Router: /life-insurance/policies
   │ 2. Middleware: Verifica token (doble capa)
   │ 3. Controller: createPolicy()
   │    │
   │    │ 4. Service: LifeInsuranceService
   │    │    │
   │    │    │ 5. Factory Pattern: Crea instancia LifeInsurance
   │    │    │ 6. Valida datos con insurance.validate()
   │    │    │ 7. Calcula premium con insurance.calculatePremium()
   │    │    │
   │    │    │ 8. Repository: LifeInsuranceRepository
   │    │    │    │
   │    │    │    │ 9. Query SQL a PostgreSQL
   │    │    │    ▼
   │    │    │  PostgreSQL (puerto 5432)
   │    │    │    │
   │    │    │    │ 10. INSERT INTO policies...
   │    │    │    │ 11. RETURNING *
   │    │    │    ▼
   │    │    │  Policy creada
   │    │    ▲
   │    │
   │    │ 12. Response: { success: true, data: policy }
   │    ▲
   │
   │ 13. HTTP 201 Created
   ▼
API Gateway
   │
   │ 14. Devuelve respuesta al cliente
   ▼
Cliente recibe póliza creada
```

## 🧩 Patrones de Diseño Implementados

### 1. **Singleton Pattern** - Database Connection

**Ubicación**: `shared/src/database/connection.ts`

**Propósito**: Asegurar una única instancia de conexión a PostgreSQL compartida por toda la aplicación.

```typescript
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  
  private constructor() {
    // Configuración de Pool
  }
  
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}
```

**Ventajas**:
- ✅ Gestión eficiente del pool de conexiones
- ✅ Evita múltiples conexiones innecesarias
- ✅ Punto central de configuración

---

### 2. **Repository Pattern** - Data Access Layer

**Ubicación**: `shared/src/database/base-repository.ts`

**Propósito**: Abstraer la lógica de acceso a datos de la lógica de negocio.

```typescript
export abstract class BaseRepository<T> {
  async findById(id: number): Promise<T | null> { }
  async findAll(): Promise<T[]> { }
  async create(data: Partial<T>): Promise<T> { }
  async update(id: number, data: Partial<T>): Promise<T | null> { }
  async delete(id: number): Promise<boolean> { }
}
```

**Implementaciones**:
- `UserRepository` → Operaciones sobre tabla `users`
- `LifeInsuranceRepository` → Operaciones sobre tabla `policies` (life)

**Ventajas**:
- ✅ Separa concerns (negocios vs datos)
- ✅ Facilita testing (mock del repository)
- ✅ Reusabilidad de queries comunes

---

### 3. **Factory Method Pattern** - Insurance Creation

**Ubicación**: `shared/src/patterns/insurance-factory.ts`

**Propósito**: Crear instancias de diferentes tipos de seguros de forma polimórfica.

```typescript
// Clase Base
export abstract class BaseInsurance implements IInsurance {
  abstract calculatePremium(): number;
  abstract validate(): boolean;
  abstract getDetails(): Record<string, any>;
}

// Implementaciones Concretas
export class LifeInsurance extends BaseInsurance { }
export class RentInsurance extends BaseInsurance { }
export class VehicleInsurance extends BaseInsurance { }

// Factory
export class InsuranceFactory {
  static createInsurance(
    type: 'life' | 'rent' | 'vehicle',
    data: any
  ): IInsurance {
    switch (type) {
      case 'life': return new LifeInsurance(data);
      case 'rent': return new RentInsurance(data);
      case 'vehicle': return new VehicleInsurance(data);
    }
  }
}
```

**Uso en Service**:
```typescript
const insurance = InsuranceFactory.createInsurance('life', data);
if (!insurance.validate()) throw new Error('Invalid data');
const premium = insurance.calculatePremium();
```

**Ventajas**:
- ✅ Extensibilidad: Agregar nuevos tipos de seguro sin modificar código existente
- ✅ Polimorfismo: Mismo interface para todos los tipos
- ✅ Encapsulación: Lógica de cálculo dentro de cada clase

---

### 4. **API Gateway Pattern** - Single Entry Point

**Ubicación**: `api-gateway/src/index.ts`

**Propósito**: Punto de entrada único que maneja:
- Autenticación centralizada
- Rate limiting
- Logging
- Enrutamiento a microservicios

```typescript
// Autenticación Global
app.use('/api/life-insurance', gatewayAuthMiddleware, lifeServiceProxy);
app.use('/api/rent-insurance', gatewayAuthMiddleware, rentServiceProxy);
app.use('/api/vehicle-insurance', gatewayAuthMiddleware, vehicleServiceProxy);
```

**Ventajas**:
- ✅ Seguridad centralizada (un solo punto de validación JWT)
- ✅ Simplifica el cliente (solo conoce una URL)
- ✅ Cross-cutting concerns en un solo lugar

---

### 5. **Layered Architecture** - Separation of Concerns

Cada microservicio sigue la estructura:

```
src/
├── routes/         # Definición de endpoints
├── controllers/    # Manejo de HTTP requests/responses
├── services/       # Lógica de negocio
├── repositories/   # Acceso a datos
└── models/         # Definición de tipos
```

**Flujo**:
```
Route → Controller → Service → Repository → Database
         ↓            ↓          ↓
       HTTP        Business    Data
      Handler       Logic      Access
```

**Ventajas**:
- ✅ Responsabilidades claras
- ✅ Fácil mantenimiento
- ✅ Testeable por capas

---

## 🗄️ Base de Datos

### Modelo de Datos

```sql
users (1) ──────────── (N) policies
  id                      id
  email                   policy_number
  password_hash           user_id (FK)
  first_name              insurance_type_id (FK)
  last_name               status
  role                    start_date
  is_active               end_date
  created_at              premium_amount
  updated_at              coverage_amount
                          life_details (JSONB)
                          rent_details (JSONB)
                          vehicle_details (JSONB)
                          created_at
                          updated_at

insurance_types
  id
  name ('life', 'rent', 'vehicle')
  description
  base_premium
  is_active
```

### Decisiones de Diseño

**¿Por qué JSONB para detalles específicos?**
- ✅ Flexibilidad: Cada tipo de seguro tiene campos únicos
- ✅ Sin migraciones: Agregar campos no requiere ALTER TABLE
- ✅ Consultas: PostgreSQL permite queries sobre JSONB

**¿Por qué una tabla `policies` unificada?**
- ✅ Queries cross-insurance (reportes globales)
- ✅ Relaciones FK más simples
- ✅ Migración más fácil

---

## 🐳 Docker y Microservicios

### ¿Por qué Microservicios?

1. **Escalabilidad Independiente**: Si Life Insurance tiene más carga, escalo solo ese servicio
2. **Despliegue Independiente**: Puedo actualizar Vehicle Insurance sin tocar Life
3. **Fault Isolation**: Si Rent Insurance falla, Life y Vehicle siguen funcionando
4. **Technology Diversity**: Cada servicio puede usar su stack óptimo

### Comunicación entre Servicios

Actualmente: **HTTP REST** via Docker network interno

```yaml
networks:
  insurance-network:
    driver: bridge
```

Todos los servicios en la misma red pueden comunicarse usando nombres de contenedor:
- `http://auth-service:3001`
- `http://life-insurance-service:3002`

**Futuras mejoras**:
- ✅ Message Queue (RabbitMQ/Kafka) para eventos asíncronos
- ✅ Service Mesh (Istio) para observabilidad
- ✅ API Gateway con Kong o Traefik

---

## 🔐 Seguridad

### Capas de Seguridad

1. **API Gateway**: Primera validación JWT
2. **Cada Microservicio**: Segunda validación (defense in depth)
3. **Rate Limiting**: Prevención de abuso
4. **Helmet.js**: Headers de seguridad HTTP
5. **CORS**: Control de orígenes

### Flujo de Autenticación

```
1. Usuario → POST /api/auth/login
2. Auth Service valida credenciales
3. Auth Service genera JWT con:
   {
     userId: 123,
     email: "user@example.com",
     role: "customer",
     iat: 1234567890,
     exp: 1234654290
   }
4. Cliente guarda token
5. Cliente envía: Authorization: Bearer <token>
6. Gateway valida firma JWT
7. Gateway extrae user data y adjunta al request
8. Microservicio recibe request con user data
```

---

## 📦 Shared Module

Código compartido entre todos los microservicios:

```
shared/
├── database/
│   ├── connection.ts      # Singleton DB
│   └── base-repository.ts # Repository Pattern
├── patterns/
│   └── insurance-factory.ts # Factory Pattern
└── utils/
    ├── jwt.ts             # JWT utilities
    ├── api-response.ts    # Response formatters
    └── validators.ts      # Validadores comunes
```

**Ventajas**:
- ✅ DRY: No duplicar código
- ✅ Consistencia: Mismo comportamiento en todos los servicios
- ✅ Mantenibilidad: Un cambio se propaga a todos

---

## 🚀 Escalabilidad

### Horizontal Scaling con Docker

```bash
# Escalar Life Insurance a 3 instancias
docker-compose up --scale life-insurance-service=3

# Agregar Load Balancer (Nginx/Traefik)
```

### Vertical Scaling

Aumentar recursos del contenedor:

```yaml
life-insurance-service:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
```

---

## 📊 Monitoreo (Futuro)

Integraciones recomendadas:
- **Prometheus**: Métricas
- **Grafana**: Dashboards
- **Jaeger**: Distributed tracing
- **ELK Stack**: Logs centralizados
