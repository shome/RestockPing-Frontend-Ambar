# RestockPing Frontend

A modern, responsive React application for smart inventory management with a beautiful landing page showcasing the platform's features.

## 🚀 Features

- **Modern React 18** with TypeScript
- **Responsive Design** - Mobile-first approach
- **SCSS Styling** - Organized with variables, mixins, and nesting
- **Smooth Animations** - CSS animations and transitions
- **Component-Based Architecture** - Modular and maintainable code
- **Cross-Browser Compatible** - Works on all modern browsers
- **API Integration** - Real-time product search with debouncing
- **Environment Configuration** - Flexible API endpoint configuration

## 🎨 Landing Page Sections

- **Hero Section** - Compelling headline with call-to-action buttons
- **Features Showcase** - Interactive feature cards with rotating highlights
- **Call-to-Action** - Conversion-focused section
- **Footer** - Comprehensive site navigation and information

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.2.0
- **Language**: TypeScript 4.9.5
- **Styling**: SCSS with CSS modules support
- **Build Tool**: Create React App 5.0.1
- **Package Manager**: npm
- **Node.js**: v22.17.0+

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd RestockPing-Frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

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
