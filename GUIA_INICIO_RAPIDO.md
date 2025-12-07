# 🚀 GUÍA RÁPIDA - Cómo Levantar la Aplicación

## ⚡ Inicio Rápido (3 Pasos)

### Paso 1: Iniciar Docker Desktop
1. Abre **Docker Desktop** en Windows
2. Espera a que veas el ícono de Docker en la barra de tareas (esquina inferior derecha)
3. Verifica que diga "Docker Desktop is running"

### Paso 2: Abrir Terminal en VSCode
1. En VSCode, presiona `Ctrl + Shift + Ñ` (o `Ctrl + '` para abrir terminal)
2. Asegúrate de estar en la carpeta raíz del proyecto:
   ```
   C:\Users\HP\Pictures\UNIVERSIDAD\8VO CICLO\TALLER DE APLICACIONES DISTRIBUIDAS\PROYECTO\OFICIAL\FinalProjectDistribuidedApplications
   ```

### Paso 3: Levantar Todo
Ejecuta este comando:
```powershell
npm run dev
```

**¡Eso es TODO!** 🎉

---

## 📊 ¿Qué Levanta Este Comando?

El comando `npm run dev` levanta **TODO** automáticamente:

1. ✅ **PostgreSQL** (Base de datos) → Puerto 5432
2. ✅ **Auth Service** (Autenticación) → Puerto 3001
3. ✅ **Life Insurance Service** → Puerto 3002
4. ✅ **Rent Insurance Service** → Puerto 3003
5. ✅ **Vehicle Insurance Service** → Puerto 3004
6. ✅ **API Gateway** (Punto de entrada) → Puerto 3000
7. ✅ **Frontend React** → Puerto 5173

---

## 🌐 URLs Disponibles

Una vez que todo esté levantado, podrás acceder a:

- 🌍 **Frontend (Interfaz Web)**: http://localhost:5173
- 🚪 **API Gateway**: http://localhost:3000
- 🔐 **Auth Service**: http://localhost:3001
- 🏥 **Life Insurance**: http://localhost:3002
- 🏠 **Rent Insurance**: http://localhost:3003
- 🚗 **Vehicle Insurance**: http://localhost:3004

---

## 🔍 Verificar que Todo Funciona

### 1. Ver Logs en Tiempo Real
En otra terminal, ejecuta:
```powershell
npm run logs
```

### 2. Verificar Health Check
Abre tu navegador y visita:
```
http://localhost:3000/health
```

Deberías ver una respuesta JSON con el estado del sistema.

### 3. Abrir el Frontend
Abre en tu navegador:
```
http://localhost:5173
```

---

## ⏹️ Detener la Aplicación

Para detener todo:
```powershell
Ctrl + C  (en la terminal donde está corriendo)
```

O usar el comando:
```powershell
npm run down:dev
```

---

## 🐛 Problemas Comunes

### Error: "Docker Desktop no está corriendo"
**Solución**: Abre Docker Desktop y espera a que inicie completamente.

### Error: "Puerto 3000 ya está en uso"
**Solución**: Algo más está usando ese puerto. Cierra otras aplicaciones o cambia el puerto en `docker-compose.dev.yml`.

### Error: "Cannot connect to Docker daemon"
**Solución**: 
1. Reinicia Docker Desktop
2. Verifica que Docker Desktop esté corriendo (icono en la barra de tareas)

### Los contenedores no inician
**Solución**: Reconstruye todo desde cero:
```powershell
npm run down:dev
docker system prune -f
npm run dev
```

---

## 📝 Notas Importantes

1. **No necesitas instalar Node.js localmente** - Todo corre en Docker
2. **No necesitas instalar PostgreSQL** - Todo corre en Docker
3. **Los cambios en el código se reflejan automáticamente** (hot-reload activado)
4. **La base de datos persiste** - Los datos se guardan en un volumen de Docker

---

## 🎓 ¿Por Qué Todo Junto?

Esta aplicación usa **arquitectura de microservicios** con **Docker Compose**:

- ✅ **Facilidad**: Un solo comando levanta todo
- ✅ **Consistencia**: Todos usan las mismas versiones
- ✅ **Aislamiento**: Cada servicio en su contenedor
- ✅ **Desarrollo**: Hot-reload automático
- ✅ **Testing**: Fácil probar todo el sistema junto

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:
1. Revisa los logs: `npm run logs`
2. Verifica que Docker Desktop esté corriendo
3. Revisa que los puertos no estén ocupados
4. Consulta `docs/INSTALLATION.md` para más detalles

