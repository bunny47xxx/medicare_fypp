# Medicare Backend API

A comprehensive healthcare management system backend built with Node.js, Express, and Sequelize.

## Features

- **User Management**: Registration, login, and email verification for patients, doctors, and admins
- **Email Verification**: Real Gmail SMTP integration for email verification
- **Appointment Booking**: Complete appointment management system
- **Role-based Access**: Separate endpoints for patients, doctors, and admins
- **Doctor Scheduling**: Doctors can manage their availability
- **Email Notifications**: Automatic email confirmations for appointments

## Setup Instructions

### 1. Environment Configuration

Update the `.env` file with your Gmail SMTP credentials:

```env
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**Important**: Use Gmail App Password, not your regular password:
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate an app password for "Mail"
4. Use this app password in `SMTP_PASS`

### 2. Database Setup

Make sure PostgreSQL is running and update database credentials in `.env`:

```env
DB_HOST=localhost
DB_NAME=medicare
DB_USER=your_username
DB_PASSWORD=your_password
```

### 3. Install Dependencies & Run

```bash
bun install
bun dev
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login

### Patient Routes (`/api/patient`)
- `POST /verify-email` - Verify email with OTP
- `POST /resend-verification` - Resend verification email
- `GET /profile` - Get patient profile
- `PUT /profile` - Update patient profile
- `GET /doctors` - Get all available doctors
- `GET /doctors/:id/schedule` - Get doctor schedule
- `POST /appointments` - Book appointment
- `GET /appointments` - Get patient appointments
- `PUT /appointments/:id/cancel` - Cancel appointment

### Doctor Routes (`/api/doctor`)
- `GET /profile` - Get doctor profile
- `PUT /profile` - Update doctor profile
- `GET /schedule` - Get doctor schedule
- `POST /schedule` - Update doctor schedule
- `GET /appointments` - Get doctor appointments
- `PUT /appointments/:id/status` - Update appointment status
- `POST /appointments/:id/note` - Add appointment note

### Admin Routes (`/api/admin`)
- `GET /dashboard` - Get dashboard statistics
- `GET /users` - Get all users
- `GET /doctors` - Get all doctors
- `GET /appointments` - Get all appointments
- `PUT /users/:id/status` - Update user status

## User Roles

1. **Patient (user)**: Can book appointments, manage profile
2. **Doctor**: Can manage schedule, view appointments, add notes
3. **Admin**: Can manage all users, doctors, and appointments

## Email Features

- **Registration**: Automatic OTP email verification
- **Appointment Booking**: Confirmation emails to patients
- **Resend OTP**: Rate-limited OTP resending

## Security Features

- JWT authentication
- Password hashing with bcryptjs
- Role-based access control
- Email verification required for booking
- Rate limiting on OTP requests

## Development

The server runs on `http://localhost:5000` with hot reload enabled.

Health check endpoint: `GET /health`