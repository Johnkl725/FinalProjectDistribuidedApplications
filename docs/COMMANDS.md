# 🛠️ Comandos Útiles - Cheat Sheet

## 🚀 Comandos de Inicio Rápido

### Iniciar todo el sistema (Desarrollo)
```powershell
npm run dev
# O
docker-compose -f docker/docker-compose.dev.yml up --build
```

### Iniciar en modo detached (background)
```powershell
docker-compose -f docker/docker-compose.dev.yml up -d
```

### Ver logs en tiempo real
```powershell
npm run logs
# O
docker-compose -f docker/docker-compose.dev.yml logs -f
```

### Detener todo
```powershell
npm run down:dev
# O
docker-compose -f docker/docker-compose.dev.yml down
```

---

## 🐳 Docker Commands

### Ver contenedores activos
```powershell
docker ps
```

### Ver todas las imágenes
```powershell
docker images
```

### Reconstruir sin caché
```powershell
docker-compose -f docker/docker-compose.dev.yml build --no-cache
```

### Eliminar contenedores parados
```powershell
docker container prune
```

### Eliminar imágenes sin usar
```powershell
docker image prune -a
```

### Limpiar todo (⚠️ CUIDADO)
```powershell
docker system prune -a --volumes
```

### Ver uso de recursos
```powershell
docker stats
```

### Ejecutar comando en contenedor
```powershell
# Ejemplo: Acceder a bash del contenedor de auth
docker exec -it insurance-auth-dev sh
```

---

## 🗄️ PostgreSQL Commands

### Conectar a la base de datos
```powershell
docker exec -it insurance-postgres-dev psql -U postgres -d insurance_db
```

### Queries SQL útiles desde psql:
```sql
-- Ver todas las tablas
\dt

-- Describir estructura de tabla
\d policies

-- Ver usuarios
SELECT * FROM users;

-- Ver pólizas
SELECT * FROM policies;

-- Ver pólizas con datos del usuario
SELECT 
  p.policy_number,
  p.status,
  p.premium_amount,
  u.email,
  u.first_name
FROM policies p
JOIN users u ON p.user_id = u.id;

-- Salir de psql
\q
```

### Backup de la base de datos
```powershell
docker exec -t insurance-postgres-dev pg_dump -U postgres insurance_db > backup.sql
```

### Restaurar backup
```powershell
Get-Content backup.sql | docker exec -i insurance-postgres-dev psql -U postgres -d insurance_db
```

---

## 📡 API Testing con PowerShell

### Variables de entorno para testing
```powershell
$BASE_URL = "http://localhost:3000"
$TOKEN = ""  # Guardarás el token aquí después del login
```

### 1. Registrar usuario
```powershell
$registerBody = @{
    email = "test@example.com"
    password = "Test123!"
    first_name = "Test"
    last_name = "User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $registerBody
```

### 2. Login
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "Test123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody

# Guardar token
$TOKEN = $response.data.token
Write-Host "Token: $TOKEN"
```

### 3. Obtener perfil
```powershell
$headers = @{
    "Authorization" = "Bearer $TOKEN"
}

Invoke-RestMethod -Uri "$BASE_URL/api/auth/me" `
  -Method GET `
  -Headers $headers
```

### 4. Cotizar seguro de vida
```powershell
$quoteBody = @{
    coverage_amount = 100000
    start_date = "2024-01-01"
    end_date = "2025-01-01"
    age = 35
    smoker = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BASE_URL/api/life-insurance/quote" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body $quoteBody
```

### 5. Crear póliza de vida
```powershell
$policyBody = @{
    coverage_amount = 100000
    start_date = "2024-01-01"
    end_date = "2025-01-01"
    age = 35
    medical_history = "None"
    smoker = $false
    beneficiaries = @(
        @{
            name = "Jane Doe"
            relationship = "spouse"
            percentage = 100
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "$BASE_URL/api/life-insurance/policies" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body $policyBody
```

### 6. Ver mis pólizas
```powershell
Invoke-RestMethod -Uri "$BASE_URL/api/life-insurance/policies/my" `
  -Method GET `
  -Headers $headers
```

---

## 🔍 Debugging Commands

### Ver logs de un servicio específico
```powershell
docker-compose -f docker/docker-compose.dev.yml logs -f auth-service
docker-compose -f docker/docker-compose.dev.yml logs -f life-insurance-service
docker-compose -f docker/docker-compose.dev.yml logs -f api-gateway
```

### Ver últimas 100 líneas de logs
```powershell
docker-compose -f docker/docker-compose.dev.yml logs --tail=100 auth-service
```

### Reiniciar un servicio específico
```powershell
docker-compose -f docker/docker-compose.dev.yml restart auth-service
```

### Ver variables de entorno de un contenedor
```powershell
docker exec insurance-auth-dev env
```

### Inspeccionar contenedor
```powershell
docker inspect insurance-auth-dev
```

### Ver red de Docker
```powershell
docker network ls
docker network inspect insurance-network
```

---

## 🧪 Testing Manual Completo

### Script de prueba completo (PowerShell)
```powershell
# Configuración
$BASE_URL = "http://localhost:3000"

# 1. Health Check
Write-Host "=== 1. Health Check ===" -ForegroundColor Green
Invoke-RestMethod -Uri "$BASE_URL/health"

# 2. Registrar usuario
Write-Host "`n=== 2. Registrar Usuario ===" -ForegroundColor Green
$registerBody = @{
    email = "demo@insurance.com"
    password = "Demo123!"
    first_name = "Demo"
    last_name = "User"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $registerBody

Write-Host "Usuario creado: $($registerResponse.data.user.email)"

# 3. Login
Write-Host "`n=== 3. Login ===" -ForegroundColor Green
$loginBody = @{
    email = "demo@insurance.com"
    password = "Demo123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody

$TOKEN = $loginResponse.data.token
Write-Host "Token obtenido: $($TOKEN.Substring(0,20))..."

# 4. Cotizar Life Insurance
Write-Host "`n=== 4. Cotizar Seguro de Vida ===" -ForegroundColor Green
$headers = @{ "Authorization" = "Bearer $TOKEN" }

$quoteBody = @{
    coverage_amount = 100000
    start_date = (Get-Date).ToString("yyyy-MM-dd")
    end_date = (Get-Date).AddYears(1).ToString("yyyy-MM-dd")
    age = 35
    smoker = $false
} | ConvertTo-Json

$quoteResponse = Invoke-RestMethod -Uri "$BASE_URL/api/life-insurance/quote" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body $quoteBody

Write-Host "Premium calculado: `$$($quoteResponse.data.premium)"

# 5. Crear Póliza
Write-Host "`n=== 5. Crear Póliza ===" -ForegroundColor Green
$policyBody = @{
    coverage_amount = 100000
    start_date = (Get-Date).ToString("yyyy-MM-dd")
    end_date = (Get-Date).AddYears(1).ToString("yyyy-MM-dd")
    age = 35
    medical_history = "None"
    smoker = $false
    beneficiaries = @(
        @{
            name = "Jane Doe"
            relationship = "spouse"
            percentage = 100
        }
    )
} | ConvertTo-Json -Depth 3

$policyResponse = Invoke-RestMethod -Uri "$BASE_URL/api/life-insurance/policies" `
  -Method POST `
  -ContentType "application/json" `
  -Headers $headers `
  -Body $policyBody

Write-Host "Póliza creada: $($policyResponse.data.policy_number)"
Write-Host "Estado: $($policyResponse.data.status)"

# 6. Ver mis pólizas
Write-Host "`n=== 6. Mis Pólizas ===" -ForegroundColor Green
$myPolicies = Invoke-RestMethod -Uri "$BASE_URL/api/life-insurance/policies/my" `
  -Method GET `
  -Headers $headers

Write-Host "Total de pólizas: $($myPolicies.data.Count)"

Write-Host "`n=== ✅ PRUEBA COMPLETA EXITOSA ===" -ForegroundColor Green
```

Guarda esto como `test-api.ps1` y ejecútalo:
```powershell
.\test-api.ps1
```

---

## 🔧 Troubleshooting

### Contenedor no inicia
```powershell
# Ver logs detallados
docker logs insurance-auth-dev --tail 50

# Reconstruir sin caché
docker-compose -f docker/docker-compose.dev.yml build --no-cache auth-service
docker-compose -f docker/docker-compose.dev.yml up auth-service
```

### Puerto ocupado
```powershell
# Ver qué proceso usa el puerto
netstat -ano | Select-String ":3000"

# Matar proceso por PID (reemplaza <PID>)
Stop-Process -Id <PID> -Force
```

### Base de datos no conecta
```powershell
# Verificar que postgres esté healthy
docker ps | Select-String postgres

# Ver logs de postgres
docker logs insurance-postgres-dev

# Reiniciar postgres
docker-compose -f docker/docker-compose.dev.yml restart postgres
```

### Error de permisos en Windows
```powershell
# Ejecutar PowerShell como Administrador
# Dar permisos a Docker Desktop
```

---

## 📊 Monitoreo

### Ver uso de CPU/RAM de cada contenedor
```powershell
docker stats --no-stream
```

### Ver tamaño de imágenes
```powershell
docker images | Select-String insurance
```

### Ver espacio usado por Docker
```powershell
docker system df
```

---

## 🔄 Git Commands

### Commit inicial
```powershell
git init
git add .
git commit -m "Initial commit: Insurance platform microservices"
```

### Push to GitHub
```powershell
git remote add origin https://github.com/your-username/insurance-platform.git
git branch -M main
git push -u origin main
```

### Ver estado
```powershell
git status
```

### Ver diferencias
```powershell
git diff
```
