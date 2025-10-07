# 💒 WedLedger

A modern wedding gift tracking application built with Next.js, Material-UI, and Supabase.

## ✨ Features

- 🎁 **Gift Tracking**: Track wedding gifts with amounts, dates, and recipients
- 👨‍👩‍👧‍👦 **Family Management**: Organize gifts by family members
- 💱 **Multi-Currency Support**: Support for 9 major currencies (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR)
- 🔐 **Secure Authentication**: Phone-based OTP authentication (demo mode available)
- 📱 **Responsive Design**: Beautiful UI that works on all devices
- 🎨 **Modern UI**: Material-UI components with custom styling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/AmirMGhanem/WedLedger.git
cd wedledger

# Install dependencies
npm install

# Set up environment variables (see .env file)

# Run database migrations (see SETUP.md)

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Demo Login

For demo purposes, use:
- **Phone**: Any phone number (e.g., +1234567890)
- **OTP**: `666666`

## 🏗️ Tech Stack

- **Framework**: Next.js 13 (App Router)
- **UI Library**: Material-UI (MUI) v7
- **Styling**: Emotion CSS-in-JS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Mock mode for demo)
- **TypeScript**: Full type safety
- **State Management**: React Hooks

## 📁 Project Structure

```
wedledger/
├── app/                    # Next.js 13 app directory
│   ├── add-gift/          # Add gift page
│   ├── dashboard/         # Dashboard page
│   ├── family/            # Family management page
│   ├── login/             # Login page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── AppLayout.tsx     # Main layout component
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility libraries
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
├── supabase/            # Database migrations
│   └── migrations/      # SQL migration files
└── public/              # Static assets
```

## 🗄️ Database Schema

### Tables

- **users**: User accounts with phone authentication
- **family_members**: Family member records linked to users
- **gifts**: Gift records with amount, date, recipient, and source

### Row Level Security (RLS)

All tables have RLS enabled to ensure data isolation between users.

## 🎨 UI/UX Highlights

- **Toggle Button Groups**: Select personal or family member gifts with beautiful toggle buttons
- **Inline Currency Selection**: Amount and currency selector in a single row
- **Responsive Cards**: Gift cards that adapt to all screen sizes
- **Loading States**: Smooth loading indicators throughout the app
- **Form Validation**: Comprehensive form validation with helpful error messages

## 📝 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run typecheck
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- User data isolation
- Secure authentication flow
- Environment variables for sensitive data

## 📚 Documentation

See [SETUP.md](./SETUP.md) for detailed setup instructions including:
- Database migration steps
- Supabase configuration
- Authentication setup
- Environment variables

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

Amir M. Ghanem

---

Built with ❤️ using Next.js and Material-UI

