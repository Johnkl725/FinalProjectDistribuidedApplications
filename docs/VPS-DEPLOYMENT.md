# 🚀 Guía de Deployment en VPS

## 📋 Información del Servidor

- **IP del VPS**: `178.128.70.171`
- **Sistema Operativo**: Ubuntu/Debian (recomendado)
- **Puertos Requeridos**: 80, 3000-3005, 5432

---

## ✅ Pre-requisitos

### 1. Instalar Docker

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Reiniciar sesión o ejecutar
newgrp docker

# Verificar instalación
docker --version
```

### 2. Instalar Docker Compose

```bash
# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Verificar instalación
docker compose version
```

### 3. Configurar Firewall

```bash
# Instalar UFW (si no está instalado)
sudo apt install ufw -y

# Permitir SSH (IMPORTANTE: hazlo primero para no perder acceso)
sudo ufw allow 22/tcp

# Permitir puertos de la aplicación
sudo ufw allow 80/tcp      # Frontend
sudo ufw allow 3000/tcp    # API Gateway
sudo ufw allow 5432/tcp    # PostgreSQL (opcional, solo si necesitas acceso externo)

# Habilitar firewall
sudo ufw enable

# Verificar estado
sudo ufw status
```

---

## 🚀 Deployment

### Opción 1: Deployment Automático (Recomendado)

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/FinalProjectDistribuidedApplications.git
cd FinalProjectDistribuidedApplications

# 2. Copiar y configurar variables de entorno
cp .env.example .env
nano .env  # Editar con tus valores

# 3. Ejecutar script de deployment
chmod +x deploy-vps.sh
./deploy-vps.sh
```

### Opción 2: Deployment Manual

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/FinalProjectDistribuidedApplications.git
cd FinalProjectDistribuidedApplications

# 2. Crear archivo .env
cat > .env << 'EOF'
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=insurance_db
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_SEGURO_AQUI

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h

# VPS Configuration
VPS_IP=178.128.70.171
VITE_API_URL=http://178.128.70.171:3000/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# 3. Generar JWT Secret seguro
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# 4. Construir y levantar servicios
docker-compose build
docker-compose up -d

# 5. Verificar estado
docker-compose ps
docker-compose logs -f
```

---

## 🔧 Configuración del Archivo `.env`

Edita el archivo `.env` con los siguientes valores:

```env
# Database Configuration
DB_HOST=postgres                    # Nombre del servicio en docker-compose
DB_PORT=5432
DB_NAME=insurance_db
DB_USER=postgres
DB_PASSWORD=CAMBIA_ESTE_PASSWORD    # ⚠️ IMPORTANTE: Cambiar por uno seguro

# JWT Configuration
JWT_SECRET=GENERA_UNO_SEGURO        # ⚠️ IMPORTANTE: Generar con: openssl rand -base64 32
JWT_EXPIRES_IN=24h

# VPS Configuration
VPS_IP=178.128.70.171
VITE_API_URL=http://178.128.70.171:3000/api

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000         # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100         # 100 requests por ventana
```

### Generar JWT Secret Seguro

```bash
openssl rand -base64 32
```

---

## 📊 Verificación del Deployment

### 1. Verificar que todos los servicios estén corriendo

```bash
docker-compose ps
```

Deberías ver algo como:

```
NAME                        STATUS          PORTS
insurance-postgres-prod     Up (healthy)    0.0.0.0:5432->5432/tcp
insurance-auth-prod         Up              0.0.0.0:3001->3001/tcp
insurance-life-prod         Up              0.0.0.0:3002->3002/tcp
insurance-rent-prod         Up              0.0.0.0:3003->3003/tcp
insurance-vehicle-prod      Up              0.0.0.0:3004->3004/tcp
insurance-claims-prod       Up              0.0.0.0:3005->3005/tcp
insurance-gateway-prod      Up              0.0.0.0:3000->3000/tcp
insurance-frontend-prod     Up              0.0.0.0:80->80/tcp
```

### 2. Probar endpoints

```bash
# Health check del API Gateway
curl http://178.128.70.171:3000/health

# Frontend
curl http://178.128.70.171

# Auth service
curl http://178.128.70.171:3001/health
```

### 3. Ver logs

```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs de un servicio específico
docker-compose logs -f api-gateway
docker-compose logs -f postgres
```

---

## 🔐 Seguridad Post-Deployment

### 1. Cambiar Contraseñas por Defecto

```bash
# Editar .env y cambiar:
# - DB_PASSWORD
# - JWT_SECRET
nano .env

# Recrear servicios
docker-compose down
docker-compose up -d
```

### 2. Configurar SSL/TLS (Opcional pero Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado (requiere dominio)
sudo certbot --nginx -d tudominio.com
```

### 3. Configurar Backups Automáticos

```bash
# Crear script de backup
cat > backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup de la base de datos
docker exec insurance-postgres-prod pg_dump -U postgres insurance_db > $BACKUP_DIR/db_backup_$DATE.sql

# Mantener solo los últimos 7 backups
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql"
EOF

chmod +x backup-db.sh

# Agregar a crontab (backup diario a las 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /ruta/al/backup-db.sh") | crontab -
```

---

## 🛠️ Comandos Útiles

### Gestión de Servicios

```bash
# Ver estado
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar todos los servicios
docker-compose restart

# Reiniciar un servicio específico
docker-compose restart api-gateway

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ CUIDADO: Elimina la base de datos)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Actualizar y reiniciar
git pull
docker-compose build
docker-compose up -d
```

### Monitoreo

```bash
# Ver uso de recursos
docker stats

# Ver logs de un servicio
docker-compose logs -f postgres
docker-compose logs -f api-gateway

# Ejecutar comando en contenedor
docker exec -it insurance-postgres-prod psql -U postgres -d insurance_db
```

### Limpieza

```bash
# Limpiar contenedores detenidos
docker container prune -f

# Limpiar imágenes no usadas
docker image prune -a -f

# Limpiar todo (⚠️ CUIDADO)
docker system prune -a -f
```

---

## 🐛 Troubleshooting

### Problema: Servicio no inicia

```bash
# Ver logs detallados
docker-compose logs nombre-del-servicio

# Verificar configuración
docker-compose config

# Reiniciar servicio
docker-compose restart nombre-del-servicio
```

### Problema: Error de conexión a base de datos

```bash
# Verificar que postgres esté corriendo
docker-compose ps postgres

# Ver logs de postgres
docker-compose logs postgres

# Verificar variables de entorno
docker-compose exec auth-service env | grep DB_
```

### Problema: Frontend no carga

```bash
# Verificar que el frontend esté corriendo
docker-compose ps frontend

# Reconstruir frontend con nueva URL
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Problema: Puerto ya en uso

```bash
# Ver qué proceso usa el puerto
sudo lsof -i :80
sudo lsof -i :3000

# Matar proceso
sudo kill -9 PID
```

---

## 📈 Monitoreo y Mantenimiento

### Logs Centralizados

Los logs están configurados con rotación automática:
- Tamaño máximo: 10MB por archivo
- Archivos máximos: 3
- Ubicación: `/var/lib/docker/containers/`

### Health Checks

Todos los servicios tienen health checks configurados. Verificar con:

```bash
docker-compose ps
```

### Actualizaciones

```bash
# 1. Hacer backup
./backup-db.sh

# 2. Obtener últimos cambios
git pull

# 3. Reconstruir y reiniciar
docker-compose build
docker-compose up -d

# 4. Verificar
docker-compose ps
docker-compose logs -f
```

---

## 🌐 URLs de Acceso

Una vez deployado, tu aplicación estará disponible en:

- **Frontend**: http://178.128.70.171
- **API Gateway**: http://178.128.70.171:3000
- **Auth Service**: http://178.128.70.171:3001
- **Life Insurance**: http://178.128.70.171:3002
- **Rent Insurance**: http://178.128.70.171:3003
- **Vehicle Insurance**: http://178.128.70.171:3004
- **Claims Service**: http://178.128.70.171:3005

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica la configuración: `docker-compose config`
3. Consulta la documentación: `README.md`

---

**Última actualización**: Diciembre 2024
