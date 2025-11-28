# MedRescue Hospital - Appointment System

A modern, mobile-responsive doctor appointment booking system for MedRescue Hospital. Built with React and designed for seamless patient-doctor interactions.

## Features

- **Patient Portal**: Book appointments, upload medical documents, view doctor's instructions
- **Doctor Portal**: Manage appointments, add prescriptions, provide medical opinions
- **Admin Portal**: Manage doctors, users, and appointments
- **Mobile-First Design**: Fully responsive interface optimized for mobile devices
- **Document Management**: Upload and manage medical reports, prescriptions, and images
- **Real-time Updates**: Instant appointment status updates and notifications

## Technology Stack

- **Frontend**: React 18, React Router, Redux Toolkit
- **UI Framework**: Ant Design (antd)
- **Styling**: CSS3, Bootstrap 5
- **Icons**: Font Awesome 6
- **Date/Time**: Moment.js, Day.js
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

#### `npm start`

Runs the app in development mode on `http://localhost:3052`.
The page will reload when you make changes.

#### `npm run build`

Builds the app for production to the `build` folder.
Optimizes the build for best performance.

#### `npm test`

Launches the test runner in interactive watch mode.

## Project Structure

```
client/
├── public/           # Static files
├── src/
│   ├── components/   # Reusable components
│   ├── pages/        # Page components
│   ├── styles/       # CSS files
│   └── redux/        # Redux store and slices
```

## Configuration

The app uses a proxy to connect to the backend API server running on `http://localhost:3051`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

© 2025 MedRescue Hospital. All rights reserved.
