# EduSync - Smart Timetable Management System

EduSync is a comprehensive web-based application for managing academic timetables, classes, labs, and faculty schedules. Built with React and Node.js, it provides an intuitive interface for administrators and teachers to manage educational scheduling.

## Features

### For Administrators
- **Class Management**: Create, edit, and delete classes with subjects, teachers, rooms, and time slots
- **Faculty Management**: Manage teacher information and assignments
- **Lab Management**: Schedule and manage laboratory sessions with resource allocation
- **Timetable Generation**: AI-powered timetable optimization
- **Department Management**: Organize subjects and departments
- **Data Import**: Import class data from Excel files
- **User Management**: Create and manage teacher accounts

### For Teachers
- **Daily Schedule**: View today's classes and labs at a glance
- **Weekly Overview**: See complete weekly schedule
- **Class Notifications**: Get notified about upcoming classes
- **Profile Management**: Update personal information

## Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL (hosted on Supabase)
- **Authentication**: JWT-based authentication
- **State Management**: React Context API
- **Icons**: Font Awesome
- **Deployment**: Modern web deployment

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (or use the provided Supabase connection)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Group_PPA
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env` file and configure your database connection
   - Set JWT secret and other required variables
   - Configure SMTP (see **Email Notifications** section) so leave request emails can be delivered

4. Start the development servers:
```bash
# Terminal 1 - Backend
npm run start-backend

# Terminal 2 - Frontend
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
Group_PPA/
├── backend/                 # Node.js backend API
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   └── server.js           # Main server file
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API service functions
│   ├── utils/             # Utility functions
│   └── api.js             # Main API client
└── public/                # Static assets
```

## Key Components

- **Header**: Navigation with search functionality and user menu
- **Dashboard**: Overview cards and quick actions for admins
- **Classes**: Class management interface
- **Faculty**: Teacher management
- **Labs**: Laboratory session management
- **Timetable**: Visual timetable display
- **Toast Notifications**: User feedback system

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/token` - User login
- `GET /auth/me` - Get current user info

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Labs
- `GET /api/labs` - Get all lab sessions
- `POST /api/labs` - Create new lab session

### Teachers
- `GET /auth/teachers` - Get all teachers

### AI Scheduler
- `POST /api/scheduler/generate-from-excel` *(admin, multipart form with `file` field)* - Generate class schedule from Excel via OpenAI

## Automated Class Generator

Upload an Excel file containing teacher assignments (columns: `Teacher`, `Subject`, `Grade`, optional `Preferred Days`, `Preferred Times`, `Duration`, `Max Students`) to `/api/scheduler/generate-from-excel`. The backend will:

1. Parse the sheet and build scheduling requests.
2. Call OpenAI using `OPENAI_API_KEY` to propose a conflict-free timetable.
3. Create class records that avoid clashes with existing classes/labs.

Environment variables:
```
OPENAI_API_KEY=your-openai-api-key
OPENAI_SCHEDULER_MODEL=gpt-4o-mini   # Optional override
```

If the key is missing the endpoint returns an error. All new subjects generated on the fly receive placeholder codes.

## Email Notifications

Leave management emails (submission confirmations and approval/rejection notices) use SMTP credentials defined in `backend/.env`. Provide the following values for your mail provider:

```
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false   # true for SSL (e.g. port 465)
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password-or-app-password
EMAIL_FROM="EduSync <no-reply@yourdomain.com>"
```

If these variables are omitted, the application logs the notification attempt but skips sending the email so other features continue to work.

### Gmail Quick Start

1. Enable two-factor authentication on the Gmail account.
2. Generate a **16-character App Password** (Google Account → Security → App passwords → Select "Mail" + "Other").
3. Update `backend/.env` with:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465        # use 587 with SMTP_SECURE=false if preferred
   SMTP_SECURE=true
   SMTP_USER=your-gmail-address@gmail.com
   SMTP_PASS=the-16-character-app-password
   EMAIL_FROM="EduSync <your-gmail-address@gmail.com>"
   ```
4. Restart the backend server so the new credentials are loaded.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@edusync.com or join our Slack channel.
