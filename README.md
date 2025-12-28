# Arogya Vault - Health Record Management System

A modern, secure health record management application built with Angular and Node.js.

## 📁 Project Structure

```
arogya-vault/
├── backend/              # Node.js/Express backend
│   ├── database/        # Database seed scripts
│   ├── middleware/      # Express middlewares
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── uploads/        # File uploads
│   ├── utils/          # Helper utilities
│   └── server.js       # Main server file
├── src/                 # Angular frontend
│   ├── app/            # Application components
│   └── environments/   # Environment configs
├── .env                # Environment variables
└── package.json        # Frontend dependencies

```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- NPM or Yarn

### Backend Setup

```bash
cd backend
npm install
npm start
```

Backend runs on: `http://localhost:5001`

### Frontend Setup

```bash
npm install
npm start
```

Frontend runs on: `http://localhost:4200`

## 🔑 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5001
MONGODB_URI=mongodb://admin:admin123@localhost:27017/arogya?authSource=admin
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## 🏥 Features

- Patient health record management
- Admin dashboard
- AI-powered health insights (Gemini AI)
- Secure authentication
- File upload (AWS S3)
- Real-time data visualization

## 📦 Technologies

**Frontend:**
- Angular 18
- TypeScript
- Tailwind CSS
- ECharts
- RxJS

**Backend:**
- Node.js
- Express
- MongoDB/Mongoose
- JWT Authentication
- Google Gemini AI
- AWS S3

## 🔒 Security

- JWT-based authentication
- Password hashing
- CORS protection
- Input validation
- Secure file uploads

## 📄 License

MIT License
