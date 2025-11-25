# ChandraHoro V2.1 - AI-Powered Vedic Astrology Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2+-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> Experience the future of Vedic astrology with AI-powered insights, personalized readings, and comprehensive chart analysis.

## 🌟 Features

- **🤖 AI-Powered Insights**: Advanced AI models for personalized astrological interpretations
- **📊 Comprehensive Charts**: Support for all major divisional charts (D1, D9, D10, etc.)
- **⏰ Real-time Transits**: Live planetary transit tracking and predictions
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🌙 Dark Mode**: Beautiful dark and light theme support
- **🔒 Secure & Private**: Enterprise-grade security with data encryption
- **🌐 Multilingual**: Support for English and Telugu languages
- **⚡ Performance**: Optimized for speed with modern web technologies

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or later
- **npm** 8.0 or later (or **yarn** 1.22+)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/chandrahoro-v2.git
   cd chandrahoro-v2/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ANTHROPIC_API_KEY=your-api-key-here
   # ... other variables
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth routes group
│   │   ├── (dashboard)/       # Dashboard routes group
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Layout components
│   │   ├── features/          # Feature-specific components
│   │   └── charts/            # Chart components
│   ├── lib/
│   │   ├── utils.ts           # Utility functions
│   │   ├── constants.ts       # App constants
│   │   └── api.ts             # API client
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   └── styles/
│       └── globals.css        # Global styles
├── public/
│   ├── images/                # Static images
│   └── fonts/                 # Custom fonts
├── docs/                      # Documentation
├── .env.example               # Environment template
├── package.json               # Dependencies
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── next.config.js             # Next.js configuration
```

## 🛠️ Development

### Available Scripts

- **`npm run dev`** - Start development server
- **`npm run build`** - Build for production
- **`npm run start`** - Start production server
- **`npm run lint`** - Run ESLint
- **`npm run lint:fix`** - Fix ESLint issues
- **`npm run type-check`** - Run TypeScript checks
- **`npm run test`** - Run tests
- **`npm run test:watch`** - Run tests in watch mode
- **`npm run test:coverage`** - Run tests with coverage

### Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for git hooks (coming in S1.T3)

### Design System

ChandraHoro follows a strict design system:

- **Colors**: Saffron (#FF6B35), Celestial Deep (#1E3A5F), Celestial Medium (#2E5C8A)
- **Typography**: Poppins (headings), Inter (body), Noto Sans Telugu (Telugu)
- **Spacing**: 8px grid system
- **Border Radius**: 4px, 8px, 16px, 24px
- **Animations**: Max 300ms for UI, 500ms for complex

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | Yes |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | For AI features |
| `OPENAI_API_KEY` | OpenAI API key | For AI features |
| `NEXTAUTH_URL` | NextAuth.js URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Yes |

### API Integration

The frontend communicates with the FastAPI backend:

```typescript
// Example API call
import { apiClient } from '@/lib/api'

const chartData = await apiClient.get('/charts/123')
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit tests**: Component and utility function tests
- **Integration tests**: API integration tests
- **E2E tests**: End-to-end user flow tests

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Setup

1. **Staging**: Copy `.env.example` to `.env.staging`
2. **Production**: Copy `.env.example` to `.env.production`

Update environment-specific values in each file.

### Deployment Platforms

Recommended platforms:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** (see `Dockerfile`)

## 📚 Documentation

- [API Reference](../docs/apiquickref2.1.md)
- [Product Requirements](../docs/prd2.1.md)
- [Design System](../docs/visualdesignguide2.1.md)
- [Screen Layouts](../docs/screenlayoutv2.1.md)
- [Development Roadmap](../docs/roadmap2.1.md)

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the established design system
- Write TypeScript with strict mode
- Add tests for new features
- Update documentation as needed
- Follow conventional commit messages

## 🐛 Troubleshooting

### Common Issues

**1. Port already in use**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**2. Module not found errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**3. TypeScript errors**
```bash
# Run type checking
npm run type-check
```

**4. Build failures**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Getting Help

- Check the [Issues](https://github.com/your-org/chandrahoro-v2/issues) page
- Review the [Documentation](../docs/)
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **shadcn/ui** for beautiful UI components
- **Anthropic** for Claude AI integration
- **Vedic Astrology** community for domain expertise

---

**Built with ❤️ by the ChandraHoro Team**

For more information, visit [chandrahoro.com](https://chandrahoro.com)
