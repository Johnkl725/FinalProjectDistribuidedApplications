# 📚 Documentación de la API

## 🔗 Base URL

**Desarrollo**: `http://localhost:3000`
**Producción**: `https://your-domain.com`

Todas las rutas están prefijadas con `/api/`

---

## 🔐 Autenticación

Todas las rutas (excepto registro y login) requieren un token JWT en el header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Endpoints

### **Auth Service** - `/api/auth`

#### 1. Registrar Usuario
```http
POST /api/auth/register
```

**Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer"  // opcional: "customer" | "admin"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "customer",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

#### 2. Login
```http
POST /api/auth/login
```

**Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "customer",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

#### 3. Obtener Perfil 🔒
```http
GET /api/auth/me
```

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "customer",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### **Life Insurance Service** - `/api/life-insurance`

#### 4. Obtener Cotización 🔒
```http
POST /api/life-insurance/quote
```

**Headers**:
```
Authorization: Bearer <token>
```

**Body**:
```json
{
  "coverage_amount": 100000,
  "start_date": "2024-01-01",
  "end_date": "2025-01-01",
  "age": 35,
  "smoker": false
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "premium": 1320.00,
    "details": {
      "coverage_amount": 100000,
      "age": 35,
      "smoker": false,
      "duration_months": 12
    }
  },
  "message": "Quote calculated successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Factores de Cálculo**:
- Base premium: $100
- +2% por cada año sobre 30
- +50% si es fumador
- +$10 por cada $100,000 de cobertura
- Multiplicado por duración en meses

---

#### 5. Crear Póliza de Vida 🔒
```http
POST /api/life-insurance/policies
```

**Headers**:
```
Authorization: Bearer <token>
```

**Body**:
```json
{
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
      "percentage": 60
    },
    {
      "name": "John Doe Jr",
      "relationship": "child",
      "percentage": 40
    }
  ]
}
```

**Validaciones**:
- ✅ Edad entre 18 y 80
- ✅ Beneficiarios deben sumar 100%
- ✅ Al menos 1 beneficiario

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "policy_number": "LIFE-1234567890-1234",
    "user_id": 1,
    "insurance_type_id": 1,
    "status": "pending",
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2025-01-01T00:00:00.000Z",
    "premium_amount": 1320.00,
    "coverage_amount": 100000,
    "life_details": {
      "age": 35,
      "medical_history": "None",
      "smoker": false,
      "beneficiaries": [...]
    },
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "message": "Life insurance policy created successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

#### 6. Obtener Mis Pólizas 🔒
```http
GET /api/life-insurance/policies/my
```

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "policy_number": "LIFE-1234567890-1234",
      "user_id": 1,
      "status": "active",
      "premium_amount": 1320.00,
      "coverage_amount": 100000,
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2025-01-01T00:00:00.000Z",
      "life_details": {...},
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

#### 7. Obtener Póliza por Número 🔒
```http
GET /api/life-insurance/policies/:policyNumber
```

**Headers**:
```
Authorization: Bearer <token>
```

**Ejemplo**:
```
GET /api/life-insurance/policies/LIFE-1234567890-1234
```

**Response** (200): Similar a la respuesta de creación

---

#### 8. Cancelar Póliza 🔒
```http
PUT /api/life-insurance/policies/:id/cancel
```

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "cancelled",
    ...
  },
  "message": "Policy cancelled successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

#### 9. Activar Póliza (Admin) 🔒👑
```http
PUT /api/life-insurance/policies/:id/activate
```

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Nota**: Solo usuarios con rol `admin` pueden activar pólizas.

---

### **Rent Insurance Service** - `/api/rent-insurance`

Endpoints similares a Life Insurance pero con datos específicos de renta:

```json
{
  "coverage_amount": 50000,
  "start_date": "2024-01-01",
  "end_date": "2025-01-01",
  "address": "123 Main St, City, State 12345",
  "property_value": 250000,
  "usage_type": "residential",  // "residential" | "commercial"
  "square_meters": 120
}
```

**Factores de Cálculo**:
- Base premium: $50
- +$5 por cada $100,000 de valor de propiedad
- +30% si es comercial
- +$3 por cada 100 m²

---

### **Vehicle Insurance Service** - `/api/vehicle-insurance`

Endpoints similares pero con datos de vehículo:

```json
{
  "coverage_amount": 30000,
  "start_date": "2024-01-01",
  "end_date": "2025-01-01",
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "vin": "1HGBH41JXMN109186",
  "license_plate": "ABC123"
}
```

**Validaciones**:
- ✅ VIN debe tener exactamente 17 caracteres
- ✅ Año entre 1900 y año actual + 1

**Factores de Cálculo**:
- Base premium: $75
- +30% si el vehículo tiene más de 10 años
- +20% si es nuevo (menos de 3 años)
- +$8 por cada $50,000 de cobertura

---

## ❌ Errores Comunes

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: email, password",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid or expired token. Please login again.",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied. Admin privileges required.",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Policy not found",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 503 Service Unavailable
```json
{
  "success": false,
  "error": "Life insurance service unavailable",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🧪 Colección Postman

Importa esta colección para probar todos los endpoints:

[Descargar Colección Postman](./postman-collection.json) *(crear este archivo)*

---

## 📊 Rate Limiting

- **Window**: 15 minutos
- **Max Requests**: 100 por IP
- **Respuesta al exceder**: 503 Service Unavailable

```json
{
  "success": false,
  "error": "Too many requests. Please try again later.",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## 🔍 Health Checks

Todos los servicios exponen un endpoint de health:

```http
GET /api/auth/health
GET /api/life-insurance/health
GET /api/rent-insurance/health
GET /api/vehicle-insurance/health
GET /health  (API Gateway)
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "life-insurance-service"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
