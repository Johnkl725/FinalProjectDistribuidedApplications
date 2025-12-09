# 📊 Guía de Implementación - Database Views

**Fecha de creación**: 9 de Diciembre, 2025  
**Autor**: Equipo Backend  
**Objetivo**: Implementar endpoints REST para consumir las vistas de base de datos

---

## 📑 Tabla de Contenidos

1. [Resumen de Views Disponibles](#resumen-de-views-disponibles)
2. [Estado de Implementación](#estado-de-implementación)
3. [Código Pendiente por Servicio](#código-pendiente-por-servicio)
4. [Testing en Desarrollo](#testing-en-desarrollo)

---

## 📊 Resumen de Views Disponibles

Las siguientes vistas SQL están disponibles en `database/init.sql`:

### 1. `current_policies`
**Propósito**: Obtener pólizas actuales con indicadores de expiración

**Campos disponibles**:
- `id`, `policy_number`, `user_id`, `insurance_type_id`
- `status` ('issued', 'active', 'cancelled')
- `start_date`, `end_date`
- `premium_amount`, `coverage_amount`
- `life_details`, `rent_details`, `vehicle_details` (JSONB)
- `is_expired` (BOOLEAN - calculado)
- `days_until_expiration` (INTEGER - calculado)

**Casos de uso**:
- Dashboard de usuario mostrando pólizas vigentes
- Alertas de pólizas próximas a vencer
- Filtrado de pólizas expiradas

---

### 2. `active_policies_summary`
**Propósito**: Resumen de pólizas activas con información de usuario (Admin/Employee)

**Campos disponibles**:
- `email`, `first_name`, `last_name`
- `insurance_type` ('life', 'rent', 'vehicle')
- `policy_number`
- `premium_amount`, `coverage_amount`
- `start_date`, `end_date`, `status`

**Casos de uso**:
- Panel de administración con todas las pólizas activas
- Reportes de ventas por tipo de seguro
- Auditoría de pólizas vigentes

---

### 3. `user_policy_stats`
**Propósito**: Estadísticas agregadas por usuario

**Campos disponibles**:
- `id`, `email`, `first_name`, `last_name`
- `total_policies` (conteo total)
- `active_policies` (conteo activas)
- `total_premium` (suma total)

**Casos de uso**:
- Widget de estadísticas en dashboard
- Perfil de usuario con resumen
- Ranking de clientes (admin)

---

## ✅ Estado de Implementación

### Life Insurance Service
- ✅ Middleware `employee.middleware.ts` creado
- ✅ Rutas actualizadas con 3 nuevos endpoints
- ✅ Controlador con métodos: `getCurrentPolicies`, `getUserStats`, `getActivePoliciesSummary`
- ✅ Servicio con métodos delegando a repository
- ✅ Repository con queries a las views

### Rent Insurance Service
- ✅ Middleware `employee.middleware.ts` creado
- ✅ Rutas actualizadas con 3 nuevos endpoints
- ⏳ **PENDIENTE**: Controlador (copiar métodos de life)
- ⏳ **PENDIENTE**: Servicio (copiar métodos de life)
- ⏳ **PENDIENTE**: Repository (cambiar 'life' por 'rent' en queries)

### Vehicle Insurance Service
- ✅ Middleware `employee.middleware.ts` creado
- ✅ Rutas actualizadas con 3 nuevos endpoints
- ⏳ **PENDIENTE**: Controlador (copiar métodos de life)
- ⏳ **PENDIENTE**: Servicio (copiar métodos de life)
- ⏳ **PENDIENTE**: Repository (cambiar 'life' por 'vehicle' en queries)

---

## 🔧 Código Pendiente por Servicio

### RENT INSURANCE SERVICE

#### 1. Controlador (`rent-insurance-service/src/controllers/rent-insurance.controller.ts`)

Agregar al final del archivo, antes del cierre de la clase:

```typescript
  // ========================================
  // NEW ENDPOINTS - DATABASE VIEWS
  // ========================================

  /**
   * Get current policies with expiration indicators
   * GET /rent-insurance/policies/current
   */
  getCurrentPolicies = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const policies = await this.service.getCurrentPolicies(userId);

      res.status(HTTP_STATUS.OK).json(
        successResponse(policies, 'Current policies retrieved successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Get user policy statistics
   * GET /rent-insurance/users/stats
   */
  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const stats = await this.service.getUserStats(userId);

      res.status(HTTP_STATUS.OK).json(
        successResponse(stats, 'User statistics retrieved successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Get active policies summary (Admin/Employee only)
   * GET /rent-insurance/admin/policies/summary
   */
  getActivePoliciesSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { insurance_type, email } = req.query;
      const filters = {
        insurance_type: insurance_type as string,
        email: email as string,
      };

      const summary = await this.service.getActivePoliciesSummary(filters);

      res.status(HTTP_STATUS.OK).json(
        successResponse(summary, 'Active policies summary retrieved successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };
```

#### 2. Servicio (`rent-insurance-service/src/services/rent-insurance.service.ts`)

Agregar al final del archivo, antes del cierre de la clase:

```typescript
  // ========================================
  // NEW METHODS - DATABASE VIEWS
  // ========================================

  /**
   * Get current policies with expiration indicators
   */
  async getCurrentPolicies(userId: number): Promise<any[]> {
    return await this.repository.getCurrentPolicies(userId);
  }

  /**
   * Get user policy statistics
   */
  async getUserStats(userId: number): Promise<any> {
    return await this.repository.getUserStats(userId);
  }

  /**
   * Get active policies summary (Admin/Employee)
   */
  async getActivePoliciesSummary(filters: { insurance_type?: string; email?: string }): Promise<any[]> {
    return await this.repository.getActivePoliciesSummary(filters);
  }
```

#### 3. Repository (`rent-insurance-service/src/repositories/rent-insurance.repository.ts`)

Agregar al final del archivo, antes del cierre de la clase:

```typescript
  // ========================================
  // NEW METHODS - DATABASE VIEWS
  // ========================================

  /**
   * Get current policies with expiration indicators
   */
  async getCurrentPolicies(userId: number): Promise<any[]> {
    const query = `
      SELECT 
        id, policy_number, user_id, insurance_type_id, status,
        start_date, end_date, premium_amount, coverage_amount,
        life_details, rent_details, vehicle_details,
        created_at, updated_at, is_expired, days_until_expiration
      FROM current_policies 
      WHERE user_id = $1 AND insurance_type_id = (SELECT id FROM insurance_types WHERE name = 'rent')
      ORDER BY created_at DESC
    `;

    const result = await this.executeQuery<any>(query, [userId]);
    return result.rows;
  }

  /**
   * Get user policy statistics
   */
  async getUserStats(userId: number): Promise<any> {
    const query = `
      SELECT 
        id, email, first_name, last_name,
        total_policies, active_policies, total_premium
      FROM user_policy_stats 
      WHERE id = $1
    `;

    const result = await this.executeQuery<any>(query, [userId]);
    
    // Return default stats if user has no policies
    if (result.rows.length === 0) {
      return {
        id: userId,
        total_policies: 0,
        active_policies: 0,
        total_premium: 0
      };
    }

    return result.rows[0];
  }

  /**
   * Get active policies summary (Admin/Employee)
   */
  async getActivePoliciesSummary(filters: { insurance_type?: string; email?: string }): Promise<any[]> {
    let query = `
      SELECT 
        email, first_name, last_name, insurance_type, policy_number,
        premium_amount, coverage_amount, start_date, end_date, status
      FROM active_policies_summary 
      WHERE insurance_type = 'rent'
    `;

    const params: any[] = [];

    // Add email filter if provided
    if (filters.email) {
      params.push(`%${filters.email}%`);
      query += ` AND email ILIKE $${params.length}`;
    }

    query += ` ORDER BY start_date DESC`;

    const result = await this.executeQuery<any>(query, params);
    return result.rows;
  }
```

---

### VEHICLE INSURANCE SERVICE

#### 1. Controlador (`vehicle-insurance-service/src/controllers/vehicle-insurance.controller.ts`)

```typescript
// COPIAR EXACTAMENTE LO MISMO QUE RENT, solo cambia el nombre del servicio
  // ========================================
  // NEW ENDPOINTS - DATABASE VIEWS
  // ========================================

  /**
   * Get current policies with expiration indicators
   * GET /vehicle-insurance/policies/current
   */
  getCurrentPolicies = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const policies = await this.service.getCurrentPolicies(userId);

      res.status(HTTP_STATUS.OK).json(
        successResponse(policies, 'Current policies retrieved successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Get user policy statistics
   * GET /vehicle-insurance/users/stats
   */
  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const stats = await this.service.getUserStats(userId);

      res.status(HTTP_STATUS.OK).json(
        successResponse(stats, 'User statistics retrieved successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };

  /**
   * Get active policies summary (Admin/Employee only)
   * GET /vehicle-insurance/admin/policies/summary
   */
  getActivePoliciesSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const { insurance_type, email } = req.query;
      const filters = {
        insurance_type: insurance_type as string,
        email: email as string,
      };

      const summary = await this.service.getActivePoliciesSummary(filters);

      res.status(HTTP_STATUS.OK).json(
        successResponse(summary, 'Active policies summary retrieved successfully')
      );
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(error.message)
      );
    }
  };
```

#### 2. Servicio (`vehicle-insurance-service/src/services/vehicle-insurance.service.ts`)

```typescript
// COPIAR EXACTAMENTE LO MISMO QUE RENT
  // ========================================
  // NEW METHODS - DATABASE VIEWS
  // ========================================

  /**
   * Get current policies with expiration indicators
   */
  async getCurrentPolicies(userId: number): Promise<any[]> {
    return await this.repository.getCurrentPolicies(userId);
  }

  /**
   * Get user policy statistics
   */
  async getUserStats(userId: number): Promise<any> {
    return await this.repository.getUserStats(userId);
  }

  /**
   * Get active policies summary (Admin/Employee)
   */
  async getActivePoliciesSummary(filters: { insurance_type?: string; email?: string }): Promise<any[]> {
    return await this.repository.getActivePoliciesSummary(filters);
  }
```

#### 3. Repository (`vehicle-insurance-service/src/repositories/vehicle-insurance.repository.ts`)

**IMPORTANTE**: Cambiar **'rent'** por **'vehicle'** en las queries:

```typescript
  // ========================================
  // NEW METHODS - DATABASE VIEWS
  // ========================================

  /**
   * Get current policies with expiration indicators
   */
  async getCurrentPolicies(userId: number): Promise<any[]> {
    const query = `
      SELECT 
        id, policy_number, user_id, insurance_type_id, status,
        start_date, end_date, premium_amount, coverage_amount,
        life_details, rent_details, vehicle_details,
        created_at, updated_at, is_expired, days_until_expiration
      FROM current_policies 
      WHERE user_id = $1 AND insurance_type_id = (SELECT id FROM insurance_types WHERE name = 'vehicle')
      ORDER BY created_at DESC
    `;

    const result = await this.executeQuery<any>(query, [userId]);
    return result.rows;
  }

  /**
   * Get user policy statistics
   */
  async getUserStats(userId: number): Promise<any> {
    const query = `
      SELECT 
        id, email, first_name, last_name,
        total_policies, active_policies, total_premium
      FROM user_policy_stats 
      WHERE id = $1
    `;

    const result = await this.executeQuery<any>(query, [userId]);
    
    // Return default stats if user has no policies
    if (result.rows.length === 0) {
      return {
        id: userId,
        total_policies: 0,
        active_policies: 0,
        total_premium: 0
      };
    }

    return result.rows[0];
  }

  /**
   * Get active policies summary (Admin/Employee)
   */
  async getActivePoliciesSummary(filters: { insurance_type?: string; email?: string }): Promise<any[]> {
    let query = `
      SELECT 
        email, first_name, last_name, insurance_type, policy_number,
        premium_amount, coverage_amount, start_date, end_date, status
      FROM active_policies_summary 
      WHERE insurance_type = 'vehicle'
    `;

    const params: any[] = [];

    // Add email filter if provided
    if (filters.email) {
      params.push(`%${filters.email}%`);
      query += ` AND email ILIKE $${params.length}`;
    }

    query += ` ORDER BY start_date DESC`;

    const result = await this.executeQuery<any>(query, params);
    return result.rows;
  }
```

---

## 🧪 Testing en Desarrollo

### 1. Levantar entorno de desarrollo

```bash
# En la raíz del proyecto
docker-compose -f docker/docker-compose.dev.yml up --build
```

### 2. Verificar que las views existan

```bash
# Conectarse a PostgreSQL
docker exec -it insurance-platform-postgres-1 psql -U insurance_user -d insurance_db

# Verificar views
\dv

# Debería mostrar:
# Schema | Name                       | Type  | Owner
#--------+----------------------------+-------+------------------
# public | active_policies_summary    | view  | insurance_user
# public | current_policies           | view  | insurance_user
# public | user_policy_stats          | view  | insurance_user
```

### 3. Obtener token de autenticación

```bash
# Login como usuario customer
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@email.com",
    "password": "Password123!"
  }'

# Guardar el token de la respuesta
```

### 4. Probar endpoints de Life Insurance

```bash
# 1. Current Policies
curl -X GET http://localhost:3000/api/life-insurance/policies/current \
  -H "Authorization: Bearer <TOKEN>"

# 2. User Stats
curl -X GET http://localhost:3000/api/life-insurance/users/stats \
  -H "Authorization: Bearer <TOKEN>"

# 3. Active Summary (requiere token de employee o admin)
curl -X GET http://localhost:3000/api/life-insurance/admin/policies/summary \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>"
```

### 5. Probar endpoints de Rent Insurance

```bash
# Repetir los mismos tests cambiando /life-insurance por /rent-insurance
curl -X GET http://localhost:3000/api/rent-insurance/policies/current \
  -H "Authorization: Bearer <TOKEN>"

curl -X GET http://localhost:3000/api/rent-insurance/users/stats \
  -H "Authorization: Bearer <TOKEN>"

curl -X GET http://localhost:3000/api/rent-insurance/admin/policies/summary \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>"
```

### 6. Probar endpoints de Vehicle Insurance

```bash
# Repetir los mismos tests cambiando /rent-insurance por /vehicle-insurance
curl -X GET http://localhost:3000/api/vehicle-insurance/policies/current \
  -H "Authorization: Bearer <TOKEN>"

curl -X GET http://localhost:3000/api/vehicle-insurance/users/stats \
  -H "Authorization: Bearer <TOKEN>"

curl -X GET http://localhost:3000/api/vehicle-insurance/admin/policies/summary \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>"
```

### 7. Validar respuestas esperadas

**Current Policies** (debe incluir `is_expired` y `days_until_expiration`):
```json
{
  "success": true,
  "message": "Current policies retrieved successfully",
  "data": [
    {
      "id": 1,
      "policy_number": "LIFE-1733762400000-1234",
      "user_id": 3,
      "status": "active",
      "is_expired": false,
      "days_until_expiration": 350
    }
  ]
}
```

**User Stats** (debe incluir conteos y suma):
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "id": 3,
    "email": "john.doe@email.com",
    "first_name": "John",
    "last_name": "Doe",
    "total_policies": 3,
    "active_policies": 2,
    "total_premium": 450.00
  }
}
```

**Active Summary** (solo admin/employee):
```json
{
  "success": true,
  "message": "Active policies summary retrieved successfully",
  "data": [
    {
      "email": "john.doe@email.com",
      "first_name": "John",
      "last_name": "Doe",
      "insurance_type": "life",
      "policy_number": "LIFE-1733762400000-1234",
      "premium_amount": 150.00,
      "coverage_amount": 50000.00,
      "start_date": "2023-12-09",
      "status": "active"
    }
  ]
}
```

---

## ✅ Checklist de Finalización

### Rent Insurance Service
- [ ] Copiar métodos del controlador
- [ ] Copiar métodos del servicio
- [ ] Copiar métodos del repository (cambiar 'life' → 'rent')
- [ ] Compilar TypeScript: `npm run build`
- [ ] Probar los 3 endpoints con cURL

### Vehicle Insurance Service
- [ ] Copiar métodos del controlador
- [ ] Copiar métodos del servicio
- [ ] Copiar métodos del repository (cambiar 'life' → 'vehicle')
- [ ] Compilar TypeScript: `npm run build`
- [ ] Probar los 3 endpoints con cURL

### Testing Final
- [ ] Todos los endpoints responden 200 OK con token válido
- [ ] Endpoint admin/summary responde 403 con token de customer
- [ ] Sin token responde 401
- [ ] Views devuelven datos correctos
- [ ] Filtros de email funcionan en summary

---

**Última actualización**: 9 de Diciembre, 2025  
**Versión**: 1.0.0  
**Próximos pasos**: Después de testing, integrar con frontend
