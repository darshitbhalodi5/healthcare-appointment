# MedRescue Hospital - Appointment Management System

A comprehensive, mobile-first doctor appointment management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Designed for MedRescue Hospital to streamline patient care and appointment scheduling.

## 🏥 Overview

MedRescue Hospital's appointment system provides a complete digital healthcare platform with three distinct portals:
- **Patient Portal**: Book appointments, upload documents, view doctor's instructions
- **Doctor Portal**: Manage appointments, add prescriptions, provide medical opinions
- **Admin Portal**: Oversee doctors, users, and system operations

## ✨ Key Features

### Patient Features
- Search and book appointments with doctors
- Upload medical documents and reports
- View doctor's prescriptions and instructions
- Manage appointment history
- Real-time appointment status updates
- Mobile-optimized interface

### Doctor Features
- Manage appointment schedules
- Approve/reject appointment requests
- Add general notes for patients (diagnosis, treatment plans)
- Upload prescriptions and medical opinions
- Comment on patient documents
- View patient medical history

### Admin Features
- Manage doctor registrations and profiles
- Oversee all appointments system-wide
- User management and access control
- System monitoring and reports

## 🛠️ Technologies

### Frontend
- **React 18** - Modern UI library
- **Redux Toolkit** - State management
- **Ant Design** - UI components
- **Bootstrap 5** - Responsive layout
- **Font Awesome 6** - Icons
- **Axios** - HTTP client
- **Moment.js** - Date/time handling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Nodemailer** - Email notifications
- **bcrypt** - Password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Installation and Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd health1
```

### 2. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3051
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 4. Start the Application

#### Development Mode (Both Client & Server)
```bash
npm run dev
```

#### Server Only
```bash
npm run server
```

#### Client Only
```bash
npm run client
```

### 5. Access the Application
- **Frontend**: http://localhost:3052
- **Backend API**: http://localhost:3051

## 📁 Project Structure

```
health1/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS files
│   │   └── redux/         # Redux store
│   └── package.json
├── models/                # MongoDB models
├── routes/                # Express routes
├── controllers/           # Route controllers
├── middleware/            # Custom middleware
├── config/                # Configuration files
├── uploads/               # File uploads directory
├── server.js              # Express server
└── package.json

```

## 🔐 Default Accounts

After setup, you can create accounts or use seed data:
- **Admin**: Access admin panel for system management
- **Doctor**: Manage appointments and patients
- **Patient**: Book appointments and upload documents

## 🎨 Features in Detail

### Mobile-First Design
- Fully responsive across all devices
- Touch-optimized interface
- Compact layouts for mobile screens
- Progressive Web App (PWA) support

### Document Management
- Upload PDFs, JPGs, PNGs (max 10MB)
- Pre-appointment and post-appointment document categorization
- Doctor comments on patient documents
- Secure file storage

### Appointment Workflow
1. Patient books appointment
2. Doctor reviews and approves/rejects
3. Doctor adds notes and prescriptions
4. Patient views instructions and downloads prescriptions
5. Complete appointment history maintained

## 🔧 Configuration

### Client Proxy
The React app proxies API requests to `http://localhost:3051` (configured in `client/package.json`)

### File Upload Limits
- Max file size: 10MB
- Supported formats: PDF, JPG, JPEG, PNG
- Max files per upload: 10

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

This is a proprietary system for MedRescue Hospital. For internal development contributions, please follow the established coding standards and review process.

## 📄 License

© 2025 MedRescue Hospital. All rights reserved.

## 🆘 Support

For technical support or questions, please contact the MedRescue Hospital IT department.

---

**Built with ❤️ for MedRescue Hospital**
