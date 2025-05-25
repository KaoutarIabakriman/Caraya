# Car Rental System - Frontend Documentation

## Overview

This is the frontend application for the Car Rental System, built with Next.js, React, and Tailwind CSS. It provides separate interfaces for managers and administrators to interact with the car rental platform.

## Technology Stack

- **Next.js**: React framework for server-side rendering and routing
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **js-cookie**: Cookie management

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000.

### Building for Production

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm start
# or
yarn start
```

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── (auth)/             # Authentication routes
│   │   └── login/          # Manager login page
│   ├── admin/              # Admin routes
│   │   ├── dashboard/      # Admin dashboard
│   │   ├── login/          # Admin login page
│   │   └── managers/       # Manager management page
│   ├── dashboard/          # Manager dashboard
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Home page
├── components/             # Reusable components
│   ├── auth/               # Authentication components
│   │   ├── protected-route.tsx        # Manager route protection
│   │   └── protected-admin-route.tsx  # Admin route protection
│   └── ui/                 # UI components
├── lib/                    # Utility libraries
│   ├── auth-provider.tsx   # Manager authentication context
│   └── admin-provider.tsx  # Admin authentication context
├── public/                 # Static files
├── .gitignore
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Authentication System

The frontend uses two separate authentication contexts:

1. **AuthProvider**: For manager authentication
2. **AdminProvider**: For admin authentication

Both providers use JWT tokens stored in cookies for authentication persistence.

## User Interfaces

### Home Page

- Public landing page
- Links to both manager and admin login pages
- Redirects to appropriate dashboard if already logged in

### Manager Authentication

- Login form with email and password
- Form validation using Zod schema
- Error handling for invalid credentials
- JWT token storage in cookies

### Manager Dashboard

- Protected route (requires manager authentication)
- Displays welcome message with manager's name
- Logout functionality

### Admin Authentication

- Login form with email and password
- Form validation using Zod schema
- Error handling for invalid credentials
- JWT token storage in cookies (separate from manager tokens)
- Default admin credentials displayed for convenience

### Admin Dashboard

- Protected route (requires admin authentication)
- Overview of system statistics
- Navigation to manager management page
- Logout functionality

### Manager Management

- Protected route (requires admin authentication)
- List of all managers with details
- Add new manager form
- Edit existing manager functionality
- Delete manager functionality
- Form validation for all inputs

## Protected Routes

The application uses custom route protection components:

- **ProtectedRoute**: Ensures only authenticated managers can access manager routes
- **ProtectedAdminRoute**: Ensures only authenticated admins can access admin routes

Both components redirect unauthenticated users to the appropriate login page.

## API Integration

The frontend communicates with the backend API using Axios. All API calls include:

- Proper error handling
- Loading states
- JWT token authentication for protected routes

### API Endpoints Used

- **Authentication**:
  - `/api/auth/login` - Manager login
  - `/api/auth/profile` - Get manager profile
  - `/api/admin/login` - Admin login
  - `/api/admin/profile` - Get admin profile

- **Manager Management**:
  - `/api/admin/managers` - Get all managers (GET), Create manager (POST)
  - `/api/admin/managers/:id` - Get manager details (GET), Update manager (PUT), Delete manager (DELETE)

## State Management

The application uses React Context API for state management:

- **AuthContext**: Manages manager authentication state
- **AdminContext**: Manages admin authentication state

Each context provides:
- Authentication status
- User information
- Login/logout functions
- Loading states
- Error handling

## Styling

The application uses Tailwind CSS for styling with a consistent design system:

- Responsive design for all screen sizes
- Custom color scheme defined in tailwind.config.js
- Dark mode support
- Component-based styling

## Error Handling

The application includes comprehensive error handling:

- Form validation errors with user-friendly messages
- API error handling with appropriate user feedback
- Authentication errors with clear instructions
- Loading states to indicate processing

## Default Credentials

### Admin
- Email: admin@carental.com
- Password: admin123

## Best Practices

- **TypeScript**: Type safety throughout the application
- **Client-Side Components**: 'use client' directive for interactive components
- **Server-Side Components**: Static parts rendered on the server
- **Form Validation**: Schema-based validation with Zod
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Code Organization**: Clear separation of concerns
- **Error Handling**: Comprehensive error management

## Future Enhancements

- User profile management
- Car inventory management
- Booking system
- Payment integration
- Reporting and analytics
- Multi-language support 