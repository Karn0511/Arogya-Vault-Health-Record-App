# 🏥 Arogya Vault - Digital Healthcare Records System

> **A comprehensive, secure, and modern healthcare management platform for India**

[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![Angular](https://img.shields.io/badge/Angular-18-red)](https://angular.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen)](https://www.mongodb.com/)

## 🚀 Quick Start

**Everything runs in Docker - no local setup required!**

```bash
# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:4200
# Backend:  http://localhost:5000
# DB UI:    http://localhost:8081
```

Or use the startup script:
- **Windows:** `.\start-docker.ps1`
- **Linux/Mac:** `./start-docker.sh`

## 🌐 Live Access

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:4200 | See below |
| **Backend API** | http://localhost:5000 | - |
| **Mongo Express** | http://localhost:8081 | admin/admin123 |
| **MongoDB** | localhost:27017 | admin/admin123 |

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@arogya.com | admin123 |
| **Patient** | amit.kumar@example.com | patient123 |
| **Doctor** | rajesh.kumar@arogya.com | doctor123 |

## ✨ Features

### For Patients
- 📋 Complete medical records management
- 📅 Appointment scheduling with doctors
- 💊 Prescription tracking and reminders
- 🏥 Health metrics monitoring (BP, sugar, weight)
- 💉 Vaccination records
- 📊 Health analytics and insights
- 🤖 AI-powered health assistant (Gemini AI)

### For Doctors
- 👥 Patient management dashboard
- 📝 Digital prescription generation
- 📅 Appointment management
- 📊 Patient health history access
- 💬 Secure patient communication
- 📈 Analytics and reporting

### For Administrators
- 👨‍⚕️ Doctor verification and approval
- 👥 User management
- 💊 Medicine database management
- 📊 System analytics
- 🔒 Access control and logs
- 🗄️ Data management

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Arogya Vault Platform                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Frontend   │  │  Backend    │  │  Database   │     │
│  │  Angular 18 │─▶│  Node.js    │─▶│  MongoDB    │     │
│  │  + Nginx    │  │  + Express  │  │   7.0       │     │
│  │  Port 4200  │  │  Port 5000  │  │  Port 27017 │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
│                            │                              │
│                    ┌───────┴────────┐                    │
│                    │                 │                    │
│              ┌─────────┐      ┌──────────┐              │
│              │Gemini AI│      │ AWS S3   │              │
│              │ Service │      │ Storage  │              │
│              └─────────┘      └──────────┘              │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Framework:** Angular 18
- **UI:** Tailwind CSS + Custom Components
- **Charts:** ECharts
- **Auth:** Firebase Authentication
- **PWA:** Service Worker enabled
- **Server:** Nginx (in Docker)

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Database:** MongoDB 7.0 with Mongoose
- **Auth:** JWT + Firebase
- **AI:** Google Gemini AI
- **Storage:** AWS S3
- **File Upload:** Multer

### DevOps
- **Containers:** Docker + Docker Compose
- **Health Checks:** Built-in for all services
- **Networking:** Bridge network with service discovery
- **Volumes:** Persistent storage for database and uploads

## 📦 Project Structure

```
arogya-vault/
├── backend/
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic
│   ├── middleware/     # Auth & validation
│   ├── database/       # Seed scripts
│   └── server.js       # Entry point
├── src/
│   ├── app/
│   │   ├── features/   # Feature modules
│   │   ├── core/       # Services & guards
│   │   ├── shared/     # Shared components
│   │   └── models/     # TypeScript interfaces
│   └── assets/         # Static files
├── docker-compose.yml  # Docker orchestration
├── start-docker.ps1    # Windows startup script
├── start-docker.sh     # Linux/Mac startup script
└── START_APP.md        # Detailed documentation
```

## 📊 Database Schema

The system includes comprehensive data models:
- Users (Patients, Doctors, Admins)
- Appointments & Scheduling
- Medical Reports & Prescriptions
- Medications & Pharmacy
- Health Metrics & Vitals
- Vaccinations & Immunizations
- Access Logs & Audit Trail
- File Storage & Documents

**Pre-seeded with 236+ sample records for testing!**

## 🔒 Security Features

- JWT-based authentication
- Password hashing (PBKDF2)
- Role-based access control (RBAC)
- CORS protection
- Input validation & sanitization
- Secure file uploads
- Audit logging
- Two-factor authentication support

## 🚀 Deployment

### Docker (Production Ready)
```bash
# Start all services
docker-compose up -d --build

# Scale services (if needed)
docker-compose up -d --scale backend=3

# Stop all services
docker-compose down
```

### Environment Configuration
All configuration is done through environment variables:
- `backend/.env.docker` - Backend configuration
- See `START_APP.md` for all options

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - OTP verification

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/doctors` - List all doctors
- `POST /api/admin/verify-doctor` - Verify doctor

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Prescriptions
- `GET /api/prescriptions` - List prescriptions
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions/:id` - Get prescription details

*See `START_APP.md` for complete API reference*

## 🧪 Testing

### Pre-seeded Test Data
- 26 Users (1 admin + 15 patients + 10 doctors)
- 20 Appointments
- 20 Prescriptions
- 15 Medicines
- 30 Vaccination records
- And more...

### Re-seed Database
```bash
docker exec arogya-backend node database/seed-fixed.js
```

## 🛠️ Development

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker logs -f arogya-backend
```

### Rebuild Services
```bash
# Backend only
docker-compose up -d --build backend

# Frontend only
docker-compose up -d --build frontend
```

### Access Database
```bash
# Via Mongo Express UI
http://localhost:8081

# Via MongoDB Shell
docker exec -it arogya-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

## 🤝 Contributing

This is a private project for healthcare management in India.

## 📄 License

Proprietary - All Rights Reserved

## 🆘 Support & Troubleshooting

See `START_APP.md` for detailed troubleshooting guide.

### Common Issues

**Services won't start:**
```bash
docker-compose down
docker-compose up -d --build
```

**Port conflicts:**
```bash
# Check ports
netstat -ano | findstr "4200 5000 8081 27017"

# Stop services
docker-compose down
```

**Database issues:**
```bash
# Re-seed database
docker exec arogya-backend node database/seed-fixed.js
```

## 📞 Contact

For support or inquiries, please contact the development team.

---

**Made with ❤️ for better healthcare in India** 🇮🇳
