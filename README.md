# 🏢 Insurance Management Platform - Microservices Architecture

## 🎯 Arquitectura del Sistema

Esta aplicación implementa una arquitectura de **microservicios** para una plataforma Insurtech que maneja tres tipos de seguros:
- 🏥 **Life Insurance** (Seguros de Vida)
- 🏠 **Rent Insurance** (Seguros de Renta)
- 🚗 **Vehicle Insurance** (Seguros de Vehículos)

## 🏗️ Estructura de Microservicios

```
├── api-gateway/          # Punto de entrada único, enrutamiento y seguridad
├── auth-service/         # Autenticación y gestión de usuarios
├── life-insurance-service/    # Gestión de seguros de vida
├── rent-insurance-service/    # Gestión de seguros de renta
├── vehicle-insurance-service/ # Gestión de seguros de vehículos
├── shared/              # Código compartido (utils, patterns, interfaces)
├── database/            # Scripts de base de datos
└── docker/              # Configuraciones Docker
```

## 🔧 Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT + Bcrypt
- **Contenedores**: Docker + Docker Compose
- **Patrones**: Factory, Repository, Singleton, API Gateway

## 🚀 Comandos Rápidos

### Desarrollo
```bash
docker-compose -f docker/docker-compose.dev.yml up --build
```

### Producción
```bash
docker-compose -f docker/docker-compose.prod.yml up --build
```

## 📊 Puertos de Servicios

- API Gateway: `3000`
- Auth Service: `3001`
- Life Insurance: `3002`
- Rent Insurance: `3003`
- Vehicle Insurance: `3004`
- PostgreSQL: `5432`

## 🔐 Seguridad

Todas las rutas protegidas requieren un JWT válido en el header:
```
Authorization: Bearer <token>
```
