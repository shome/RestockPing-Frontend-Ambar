# RestockPing - Complete Inventory Management System

A full-stack inventory management system with React frontend and Node.js backend, featuring team PIN management, SMS notifications, and comprehensive admin controls.

## 🚀 Features

### Frontend Features
- **Modern React 18** with TypeScript
- **Responsive Design** - Mobile-first approach with Tailwind CSS + ShadCN UI
- **Component-Based Architecture** - Modular and maintainable code
- **Real-time API Integration** - Product search with debouncing
- **Multi-level Authentication** - Customer, Team, and Admin access levels
- **Phone Number Masking** - Privacy protection for sensitive data

### Backend Features
- **Team PIN Management** - Create, rotate, and disable PINs with database persistence
- **SMS Integration** - Twilio-powered SMS with comprehensive error handling and logging
- **Webhook Processing** - Secure webhook handling with validation and logging
- **Database Logging** - Complete audit trail for SMS and webhook activities
- **Error Handling** - Robust error handling with detailed logging
- **RESTful API** - Well-structured API endpoints with authentication

## 🎨 Landing Page Sections

- **Hero Section** - Compelling headline with call-to-action buttons
- **Features Showcase** - Interactive feature cards with rotating highlights
- **Call-to-Action** - Conversion-focused section
- **Footer** - Comprehensive site navigation and information

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + ShadCN UI components
- **State Management**: TanStack Query for API management
- **Routing**: React Router
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js + Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **SMS Provider**: Twilio API
- **Logging**: Winston
- **Validation**: Zod schemas

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **PostgreSQL** (v13.0 or higher)
- **Twilio Account** (for SMS functionality)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd RestockPing-Frontend-Ambar-main
```

### 2. Backend Setup

#### Install Backend Dependencies
```bash
cd backend
npm install
```

#### Database Setup
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your database credentials and Twilio settings
# DATABASE_URL="postgresql://username:password@localhost:5432/restockping"
# TWILIO_ACCOUNT_SID="your-twilio-account-sid"
# TWILIO_AUTH_TOKEN="your-twilio-auth-token"
# TWILIO_PHONE_NUMBER="your-twilio-phone-number"

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

#### Start Backend Server
```bash
npm run dev
# Backend will run on http://localhost:3000
```

### 3. Frontend Setup

#### Install Frontend Dependencies
```bash
cd .. # Go back to root directory
npm install
```

#### Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env if needed (default should work for local development)
# VITE_API_BASE_URL=http://localhost:3000
```

#### Start Frontend Development Server
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

## 🔧 API Endpoints

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/pins` - Get all team PINs
- `POST /api/admin/team-pins` - Create new team PIN
- `PATCH /api/admin/pins/:id/rotate` - Rotate team PIN
- `PATCH /api/admin/pins/:id/disable` - Disable team PIN
- `GET /api/admin/sms-logs` - View SMS logs

### Team Endpoints
- `POST /api/team/login` - Team login with PIN
- `GET /api/team/dashboard` - Team dashboard data
- `POST /api/team/scan` - Scan product
- `POST /api/team/send` - Send alerts to subscribers

### Public Endpoints
- `GET /api/locations` - Get all locations
- `GET /api/labels` - Search labels
- `POST /api/requests` - Create customer request

## 🧪 Testing

### Run Frontend Tests
```bash
npm test
```

### Run Backend Tests
```bash
cd backend
npm test
```

## 🚀 Default Credentials

### Admin Login
- **Username**: `admin`
- **Password**: `admin123`

### Sample Team PINs
Team PINs can be created through the Admin dashboard after logging in.

## 📱 Features Overview

### Customer Flow
1. Search for products
2. Submit requests with phone number
3. Receive SMS notifications when available

### Team Dashboard
1. Login with location-specific PIN
2. Scan products (barcode/manual)
3. Send alerts to subscribers
4. View audit logs

### Admin Panel
1. Manage team PINs (create/rotate/disable)
2. View all requests and labels
3. Monitor SMS logs and system health
4. Import/export data via CSV

## 🔒 Security Features

- **PIN-based Authentication**: Location-specific team access
- **Phone Number Masking**: Privacy protection in admin views
- **JWT Tokens**: Secure API authentication
- **Input Validation**: Zod schemas for all endpoints
- **Error Logging**: Comprehensive audit trails

Configure your environment variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Environment
VITE_NODE_ENV=development
```

**Important**: Update `VITE_API_BASE_URL` to match your backend API URL.

### 4. Start Development Server

```bash
npm start
```

The application will open in your browser at `http://localhost:5173` (Vite default port).

### 5. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## 📁 Project Structure

```
RestockPing-Frontend/
├── public/
│   ├── index.html          # Main HTML template
│   ├── manifest.json       # PWA manifest
│   └── favicon.ico         # Site icon
├── src/
│   ├── components/
│   │   ├── WelcomePage.tsx # Main landing page component
│   │   └── WelcomePage.scss # SCSS styles with variables & mixins
│   ├── App.tsx             # Main app component
│   ├── App.css             # App-level styles
│   ├── index.tsx           # Application entry point
│   ├── index.css           # Global styles
│   └── reportWebVitals.ts  # Performance monitoring
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## 🎯 Available Scripts

- **`npm start`** - Runs the app in development mode
- **`npm run build`** - Builds the app for production
- **`npm test`** - Launches the test runner
- **`npm run eject`** - Ejects from Create React App (⚠️ irreversible)

## 🔌 API Integration

The application includes a robust API integration layer:

### Features
- **Debounced Search** - 500ms delay prevents excessive API calls
- **Loading States** - Visual feedback during API requests
- **Error Handling** - Graceful error messages and fallbacks
- **Type Safety** - Full TypeScript support for API responses
- **Environment Configuration** - Configurable API endpoints

### API Endpoint
The search functionality calls:
```
GET {VITE_API_BASE_URL}/api/labels?query={searchQuery}&limit=10
```

### Custom Hooks
- `useDebounce` - Debounces any value with configurable delay
- `useSearchProducts` - Combines debouncing with API calls for product search

### Configuration
Update the API base URL in your `.env` file:
```env
VITE_API_BASE_URL=http://your-api-server.com
```

## 🎨 SCSS Architecture

The project uses SCSS for better organization and maintainability:

### Variables
- Color schemes and gradients
- Spacing and sizing
- Shadows and borders
- Transitions and animations

### Mixins
- `@mixin flex-center` - Centered flexbox layout
- `@mixin flex-between` - Space-between flexbox layout
- `@mixin button-base` - Consistent button styling
- `@mixin responsive` - Mobile-first responsive design

### Nesting
- Logical hierarchy for related styles
- Parent selector usage (`&:hover`, `&.active`)
- Organized component structure

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach** - Designed for mobile devices first
- **Breakpoint system** - Custom SCSS mixins for responsive design
- **Flexible layouts** - CSS Grid and Flexbox for adaptive layouts
- **Touch-friendly** - Optimized for touch interactions

## 🔧 Customization

### Colors and Themes
Update the SCSS variables in `src/components/WelcomePage.scss`:

```scss
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$secondary-color: #ff6b6b;
$accent-color: #ffd700;
```

### Content
Modify the content in `src/components/WelcomePage.tsx`:
- Update feature descriptions
- Change call-to-action text
- Modify navigation items
- Update company information

## 🚀 Deployment

### Netlify
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`

### Vercel
1. Import your GitHub repository
2. Framework preset: Create React App
3. Build command: `npm run build`
4. Output directory: `build`

### Traditional Hosting
1. Run `npm run build`
2. Upload contents of `build/` folder to your web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include your Node.js and npm versions
4. Describe the steps to reproduce the problem

## 🔮 Future Enhancements

- [ ] Dark mode toggle
- [ ] Internationalization (i18n)
- [ ] PWA capabilities
- [ ] Advanced animations
- [ ] Performance optimizations
- [ ] Unit and integration tests

---

**Built with ❤️ using React and SCSS**
