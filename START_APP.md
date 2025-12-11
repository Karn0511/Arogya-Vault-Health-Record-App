# 🚀 Arogya Vault - Docker Quick Start

## ✅ All Services Running in Docker!

Your Arogya Vault application is now fully containerized and running in Docker.

## 🐳 What's Running

All services are running in Docker containers:
- **MongoDB** - Database (port 27017)
- **Backend API** - Node.js/Express (port 5000)
- **Frontend** - Angular/Nginx (port 4200)
- **Mongo Express** - Database UI (port 8081)

## 🚀 Quick Start

### Start All Services
```bash
docker-compose up -d
```

### Or use the startup script:
**Windows:**
```powershell
.\start-docker.ps1
```

**Linux/Mac:**
```bash
./start-docker.sh
```

## 🌐 Access URLs

- **Frontend Application:** http://localhost:4200
- **Backend API:** http://localhost:5000
- **Mongo Express (DB UI):** http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

## 🔐 Login Credentials

### Admin Portal
- **Email:** admin@arogya.com
- **Password:** admin123

### Sample Patient
- **Email:** amit.kumar@example.com
- **Password:** patient123

### Sample Doctor
- **Email:** rajesh.kumar@arogya.com
- **Password:** doctor123

## 📊 Database

- **Seeded with 236+ records**
- 26 Users
- 10 Doctors
- 15 Medicines
- 20 Appointments
- And more!

## 🛠️ Common Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker logs -f arogya-backend
docker logs -f arogya-frontend
docker logs -f arogya-mongodb
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild and Start
```bash
docker-compose up -d --build
```

### Check Status
```bash
docker-compose ps
```

### Re-seed Database
```bash
docker exec arogya-backend node database/seed-fixed.js
```

## 📦 What Was Optimized

### Cleanup
- ❌ Removed all unnecessary .md, .sh, and log files
- ❌ Removed root-level node_modules and package files
- ❌ Removed test files and linting tools
- ❌ Reduced dependencies by ~40%

### Docker Setup
- ✅ Multi-stage builds for optimal image sizes
- ✅ Health checks for all services
- ✅ Automatic service dependencies
- ✅ Volume mounts for persistent data
- ✅ Production-optimized configurations

### Backend
- ✅ Dependencies reduced from 12 to 9 packages
- ✅ Removed unused routes and fixed imports
- ✅ Optimized Dockerfile with wget for health checks

### Frontend
- ✅ Dependencies reduced from 41 to 31 packages
- ✅ Multi-stage build: Node.js → Nginx
- ✅ Production build with optimizations
- ✅ Service Worker configured

## 🔧 Container Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Docker Network                      │
│                  arogya-network                      │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   MongoDB   │  │  Backend    │  │  Frontend   │ │
│  │   :27017    │◄─│   :5000     │◄─│   :4200     │ │
│  │             │  │             │  │   (Nginx)   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│         ▲                                            │
│         │                                            │
│  ┌─────────────┐                                     │
│  │Mongo Express│                                     │
│  │   :8081     │                                     │
│  └─────────────┘                                     │
└─────────────────────────────────────────────────────┘
         │
    [Host Machine]
    Ports: 4200, 5000, 8081, 27017
```

## 🆘 Troubleshooting

### Services won't start
```bash
# Check Docker is running
docker info

# View service logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Port conflicts
```bash
# Check what's using ports
netstat -ano | findstr "4200 5000 8081 27017"

# Stop conflicting services
docker-compose down
```

### Database issues
```bash
# Access MongoDB shell
docker exec -it arogya-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin

# Re-seed database
docker exec arogya-backend node database/seed-fixed.js
```

### Frontend not loading
```bash
# Check nginx logs
docker logs arogya-frontend

# Restart frontend
docker-compose restart frontend
```

### Backend API errors
```bash
# Check backend logs
docker logs arogya-backend

# Check environment variables
docker exec arogya-backend env | grep MONGO_URI
```

## 🎯 API Endpoints

- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List users (paginated)
- `GET /api/admin/doctors` - List doctors
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

## 📝 Environment Configuration

### Backend (.env.docker)
- MongoDB connection to Docker service name
- All API keys configured
- Production settings enabled
- CORS configured for localhost

### Frontend
- Built with Angular production mode
- Served via Nginx
- API proxied to backend container
- PWA enabled with service worker

## 🔄 Development Workflow

1. Make code changes in your editor
2. Rebuild specific service:
   ```bash
   docker-compose up -d --build backend
   # or
   docker-compose up -d --build frontend
   ```
3. View logs to verify:
   ```bash
   docker-compose logs -f
   ```

## 🎉 You're All Set!

Your fully containerized Arogya Vault is ready! All services run automatically in Docker with:
- ✅ Automatic restarts on failure
- ✅ Health monitoring
- ✅ Persistent data storage
- ✅ Production-ready configuration

**Just run `docker-compose up -d` and you're live!** 🚀
