# 🚀 Desplegar Frontend en Vercel

## 📋 Configuración Necesaria

Para desplegar el frontend en Vercel mientras el backend está en tu VPS, necesitas:

1. **Frontend en Vercel** → http://tu-app.vercel.app
2. **Backend en VPS** → http://178.128.70.171:3000

---

## ⚡ Opción 1: Deployment Automático desde GitHub (Recomendado)

### 1. Preparar el proyecto

Crea un archivo de configuración de Vercel en la raíz del proyecto:

```bash
# En tu proyecto local
nano vercel.json
```

Contenido del `vercel.json`:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "installCommand": "cd frontend && npm install",
  "devCommand": "cd frontend && npm run dev",
  "env": {
    "VITE_API_URL": "http://178.128.70.171:3000/api"
  }
}
```

### 2. Desplegar en Vercel

1. **Ve a [vercel.com](https://vercel.com)** y haz login con GitHub
2. **Click en "Add New Project"**
3. **Importa tu repositorio** de GitHub
4. **Configuración**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Variables de Entorno**:
   - Click en "Environment Variables"
   - Agrega: `VITE_API_URL` = `http://178.128.70.171:3000/api`

6. **Click en "Deploy"**

---

## ⚡ Opción 2: Deployment Manual con Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Ir al directorio del frontend
cd frontend

# 4. Configurar variables de entorno
# Crear archivo .env.production
echo "VITE_API_URL=http://178.128.70.171:3000/api" > .env.production

# 5. Desplegar
vercel --prod

# Seguir las instrucciones en pantalla
```

---

## 🔧 Configuración CORS en el Backend

**IMPORTANTE**: Como el frontend estará en un dominio diferente (Vercel), necesitas configurar CORS en tu backend.

En tu VPS, edita el API Gateway para permitir el dominio de Vercel:

```bash
# En el VPS
cd ~/FinalProjectDistribuidedApplications
nano api-gateway/src/index.ts
```

Busca la configuración de CORS y agrega el dominio de Vercel:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://178.128.70.171',
    'https://tu-app.vercel.app',  // ← Agregar tu dominio de Vercel
    'https://*.vercel.app'         // ← O permitir todos los subdominios de Vercel
  ],
  credentials: true
}));
```

Luego reconstruye y reinicia:

```bash
docker-compose build api-gateway
docker-compose up -d api-gateway
```

---

## 📁 Estructura de Archivos para Vercel

Crea estos archivos en la raíz del proyecto:

### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "VITE_API_URL": "http://178.128.70.171:3000/api"
  }
}
```

### `frontend/.vercelignore`

```
node_modules
.env.local
.env.development
dist
```

---

## 🔐 Variables de Entorno en Vercel

En el dashboard de Vercel:

1. Ve a tu proyecto
2. Settings → Environment Variables
3. Agrega:

```
VITE_API_URL = http://178.128.70.171:3000/api
```

**Nota**: Si más adelante quieres usar HTTPS, necesitarás:
- Configurar un dominio en Vercel (gratis)
- Configurar SSL en tu VPS con Let's Encrypt
- Cambiar la URL a `https://tu-dominio.com/api`

---

## ✅ Verificación

Después del deployment:

1. **Vercel te dará una URL**: `https://tu-app.vercel.app`
2. **Abre la URL** en el navegador
3. **Abre la consola del navegador** (F12)
4. **Verifica que las peticiones** vayan a `http://178.128.70.171:3000/api`

---

## 🐛 Troubleshooting

### Error: CORS blocked

**Solución**: Agrega el dominio de Vercel al CORS del backend (ver sección arriba)

### Error: API not responding

**Solución**: Verifica que el VPS esté accesible:
```bash
curl http://178.128.70.171:3000/health
```

### Error: Build failed

**Solución**: Verifica que `frontend/package.json` tenga el script de build:
```json
{
  "scripts": {
    "build": "vite build"
  }
}
```

---

## 🌐 Arquitectura Final

```
┌─────────────────────────────────┐
│   Frontend (Vercel)             │
│   https://tu-app.vercel.app     │
└────────────┬────────────────────┘
             │ HTTP Requests
             ▼
┌─────────────────────────────────┐
│   Backend (VPS)                 │
│   http://178.128.70.171:3000    │
│   ┌──────────────────────────┐  │
│   │  API Gateway             │  │
│   │  Auth, Life, Rent, etc.  │  │
│   │  PostgreSQL              │  │
│   └──────────────────────────┘  │
└─────────────────────────────────┘
```

---

## 📝 Comandos Útiles

```bash
# Ver logs de deployment
vercel logs

# Ver lista de deployments
vercel ls

# Eliminar deployment
vercel rm [deployment-url]

# Ver variables de entorno
vercel env ls
```

---

## 🎯 Siguiente Paso: HTTPS (Opcional)

Si quieres usar HTTPS en el backend:

1. **Comprar un dominio** (o usar uno gratis de Freenom)
2. **Configurar DNS** apuntando a `178.128.70.171`
3. **Instalar Certbot** en el VPS:
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d tu-dominio.com
   ```
4. **Configurar Nginx** como reverse proxy con SSL
5. **Actualizar VITE_API_URL** en Vercel a `https://tu-dominio.com/api`

---

**¿Necesitas ayuda con algún paso específico?**
