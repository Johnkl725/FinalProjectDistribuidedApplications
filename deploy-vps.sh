#!/bin/bash
# ===============================================
# VPS DEPLOYMENT SCRIPT
# Automated deployment for Insurance Platform
# ===============================================

set -e  # Exit on error

echo "🚀 Insurance Platform - VPS Deployment Script"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env file with your configuration before continuing!${NC}"
    echo "Press Enter to continue after editing .env, or Ctrl+C to cancel..."
    read
fi

# Validate required environment variables
echo "🔍 Validating environment variables..."
source .env

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" == "YourSecureJWTSecretKeyMinimum32CharactersLong2024" ]; then
    echo -e "${RED}❌ ERROR: JWT_SECRET not configured!${NC}"
    echo "Generate a secure secret with: openssl rand -base64 32"
    exit 1
fi

if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" == "postgres_secure_password_2024" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Using default DB_PASSWORD. Consider changing it!${NC}"
fi

echo -e "${GREEN}✅ Environment variables validated${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Install Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    echo "Install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true
echo ""

# Pull latest images
echo "📥 Pulling latest base images..."
docker-compose pull postgres 2>/dev/null || true
echo ""

# Build images
echo "🔨 Building application images..."
docker-compose build --no-cache
echo ""

# Start services
echo "🚀 Starting services..."
docker-compose up -d
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps
echo ""

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=20
echo ""

# Get VPS IP
VPS_IP=$(grep VPS_IP .env | cut -d '=' -f2)

echo ""
echo "=============================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=============================================="
echo ""
echo "🌐 Access your application:"
echo "   Frontend:    http://${VPS_IP}"
echo "   API Gateway: http://${VPS_IP}:3000"
echo ""
echo "📊 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Service status:   docker-compose ps"
echo ""
echo "🔐 Security Reminders:"
echo "   1. Change default passwords in .env"
echo "   2. Configure firewall (ufw/iptables)"
echo "   3. Set up SSL/TLS with Let's Encrypt"
echo "   4. Regular backups of postgres-data volume"
echo ""
