# 🚀 INICIO RÁPIDO - VPS 178.128.70.171

## ⚡ Deployment en 3 Pasos

### 1️⃣ Preparar el Servidor

```bash
# Conectar al VPS
ssh root@178.128.70.171

# Instalar Docker (si no está instalado)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Verificar instalación
docker --version
docker compose version
```

### 2️⃣ Clonar y Configurar

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/FinalProjectDistribuidedApplications.git
cd FinalProjectDistribuidedApplications

# Copiar archivo de configuración
cp .env.example .env

# Editar configuración (IMPORTANTE: Cambiar JWT_SECRET y DB_PASSWORD)
nano .env
```

**Configuración mínima en `.env`:**

```env
# Database
DB_PASSWORD=TuPasswordSeguro123!

# JWT (generar con: openssl rand -base64 32)
JWT_SECRET=TuSecretKeyGeneradoConOpenSSL

# VPS IP (ya configurado)
VPS_IP=178.128.70.171
VITE_API_URL=http://178.128.70.171:3000/api
```

### 3️⃣ Desplegar

```bash
# Opción A: Deployment automático (recomendado)
chmod +x deploy-vps.sh
./deploy-vps.sh

# Opción B: Deployment manual
docker-compose build
docker-compose up -d
```

---

## ✅ Verificar Deployment

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs
docker-compose logs -f

# Probar frontend
curl http://178.128.70.171

# Probar API
curl http://178.128.70.171:3000/health
```

---

## 🌐 Acceder a la Aplicación

- **Frontend**: http://178.128.70.171
- **API Gateway**: http://178.128.70.171:3000
- **Swagger/Docs**: http://178.128.70.171:3000/api-docs (si está configurado)

---

## 🔧 Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Actualizar código
git pull && docker-compose build && docker-compose up -d
```

---

## 🔐 Seguridad Básica

```bash
# Configurar firewall
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # Frontend
sudo ufw allow 3000/tcp # API Gateway
sudo ufw enable

# Cambiar contraseñas por defecto en .env
nano .env
docker-compose down && docker-compose up -d
```

---

## 📚 Documentación Completa

Para más detalles, consulta:
- [VPS-DEPLOYMENT.md](docs/VPS-DEPLOYMENT.md) - Guía completa de deployment
- [README.md](README.md) - Documentación general del proyecto

---

**¿Problemas?** Revisa los logs: `docker-compose logs -f`
