# Cubetive

A web-based application designed to help speedcubing enthusiasts track, analyze, and improve their Rubik's cube solving abilities.

## About

Cubetive is a professional-grade timing and analytics platform for Rubik's cube enthusiasts of all skill levels, from absolute beginners to advanced competitive speedcubers. The platform provides a standardized WCA-compliant timer, comprehensive performance statistics, and social sharing capabilities to create an engaging community experience.

### Key Features

- **WCA-Standard Timer**: Spacebar-activated timer following World Cube Association standards
- **Scramble Generation**: Automatic WCA-compliant 3x3 scrambles for each solve
- **Comprehensive Statistics**: Track your Ao5, Ao12, Ao100, and personal best times
- **Visual Analytics**: Line charts and progress tracking to visualize improvement trends
- **User Accounts**: Secure authentication with email verification and password reset
- **Social Sharing**: Public profiles to share your achievements with the community
- **Persistent Storage**: Save up to 10,000 solve records per user

## Tech Stack

### Frontend

- **React 19.2.0** - Modern UI library with React Compiler enabled
- **TypeScript 5.9.3** - Type-safe development
- **Material UI** - Component library for consistent design
- **Vite** - Fast build tool and development server

### Backend

- **Supabase** - All-in-one backend solution providing:
  - PostgreSQL database
  - Authentication and email verification
  - Row Level Security (RLS)
  - Auto-generated REST API
  - Real-time subscriptions

### Testing

- **Vitest 4** - Modern, fast unit test runner with ESM support
- **React Testing Library 16** - Component testing with user-centric queries
- **happy-dom** - Lightweight DOM implementation for Node.js testing
- **Coverage**: V8 provider for code coverage reporting

### Hosting & CI/CD

- **Vercel** - Frontend hosting with automatic deployments
- **GitHub Actions** - Continuous integration and deployment
- **Husky 9** - Git hooks for pre-commit testing and linting

### Architecture

```
User → React App (Vercel) → Supabase (Database + Auth + API)
```

## Getting Started Locally

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A Supabase account (free tier available at https://supabase.com)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/cubetive.git
cd cubetive
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings at https://app.supabase.com

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the database migrations (coming soon in `/supabase/migrations`)
   - Configure Row Level Security policies

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

### `npm run dev`

Starts the development server with hot module replacement (HMR). The app will automatically reload when you make changes to the source code.

### `npm run build`

Creates an optimized production build. The output will be in the `dist` folder. This command:

- Compiles TypeScript
- Bundles the application with Vite
- Optimizes assets for production

### `npm run lint`

Runs ESLint to check for code quality issues and enforce coding standards.

### `npm run format`

Formats all source files using Prettier.

### `npm run format:check`

Checks if all source files are properly formatted without making changes.

### `npm test`

Runs the unit test suite with Vitest. Tests run in watch mode by default.

### `npm run test:ui`

Runs tests with Vitest's interactive UI for better debugging and visualization.

### `npm run test:coverage`

Runs tests and generates a code coverage report (HTML, JSON, and text formats).

### `npm run preview`

Serves the production build locally for testing before deployment. Run `npm run build` first.

## Project Scope

### MVP Features (In Development)

#### Core Timer System

- WCA-standard spacebar controls with visual ready indicator
- Millisecond-precision timing
- DNF (Did Not Finish) and +2 penalty support
- Automatic WCA-compliant 3x3 scramble generation

#### User Management

- Email/password registration with verification
- Secure password reset flow
- User profile management
- Public/private profile toggle

#### Statistics & Analytics

- Real-time calculation of Ao5, Ao12, and Ao100
- Personal best tracking (single, Ao5, Ao12)
- Session-based statistics
- Visual progress charts with trend analysis
- Complete solve history with pagination (up to 10,000 solves)

#### Social Features

- Public profile pages with shareable URLs
- Display of best times and recent activity
- Profile view counter

### Out of Scope for MVP

The following features are planned for future releases:

- Other cube types (2x2, 4x4, 5x5, Pyraminx, Megaminx, etc.)
- Native mobile applications
- Advanced session management and training programs
- Matchmaking and competitions
- Algorithm trainers and video tutorials
- Data import/export functionality
- GDPR compliance features
- Monetization features

### Future Roadmap

**Phase 2** (Post-MVP):

- Support for additional cube types
- Advanced session management
- Mobile application development
- Data import/export

**Phase 3**:

- Competition hosting
- AI-powered improvement recommendations
- Community features (forums, groups)
- WCA competition results integration

## Testing

### Testing Strategy

Cubetive follows a comprehensive testing strategy to ensure reliability, security, and performance:

#### Unit Tests

- **Framework**: Vitest 4 with React Testing Library 16
- **Coverage Target**: >80% for business logic
- **Scope**: Custom hooks, services, utilities, form validation
- **Current Status**: Test infrastructure complete with sample tests

**Existing Tests**:

- ✅ `useAsync` hook - 13 test cases, 100% coverage
- ✅ `profileService.getCurrentUserProfile` - 7 test cases, 100% coverage

**Run Tests**:

```bash
npm test                # Run tests in watch mode
npm run test:ui         # Run with interactive UI
npm run test:coverage   # Generate coverage report
```

#### Integration Tests

- **Scope**: Component interactions, API integration, database operations
- **Key Areas**: Form submission flows, authentication state, Supabase integration
- **Status**: Planned for Phase 2

#### End-to-End Tests

- **Framework**: To be determined (Playwright or Cypress)
- **Scope**: Critical user journeys (registration → solve → stats)
- **Status**: Planned for Phase 4

#### Security Tests

- **RLS Policies**: Verify Row Level Security prevents unauthorized access
- **Authentication**: Session management, token handling, password security
- **Input Validation**: XSS prevention, SQL injection protection (via PostgREST)

#### Performance Tests

- **Timer Accuracy**: <10ms variance validation
- **Page Load**: <3 seconds on 3G connection
- **API Response**: <200ms for 95th percentile

#### Accessibility Tests

- **Target**: WCAG 2.1 Level A compliance
- **Tools**: axe-core for automated testing
- **Manual Testing**: Keyboard navigation, screen reader compatibility

### Test Plan

For detailed testing strategy, scenarios, and schedules, see [TEST_PLAN.md](.ai/TEST_PLAN.md).

### Pre-commit Testing

All commits automatically run:

- ESLint with auto-fix
- Prettier formatting
- Type checking
- Unit tests (via Husky hooks)

## Project Status

**Current Status**: MVP Development in Progress

The project is actively being developed with focus on delivering core functionality:

- ✅ Project initialization and tech stack setup
- ✅ Test infrastructure and initial test coverage
- 🚧 Timer implementation
- 🚧 User authentication system
- 🚧 Statistics calculation engine
- 🚧 Database schema and RLS policies
- 📋 Public profile pages
- 📋 Visual analytics dashboard

## Architecture Decisions

### Why Supabase Instead of Custom Backend?

The project uses Supabase instead of a custom NestJS backend because:

1. **Speed to MVP**: Built-in auth, email verification, and auto-generated API eliminate custom backend development
2. **Lower Complexity**: Direct frontend-to-Supabase connection reduces codebase by ~50%
3. **Cost Effective**: $0-20/month vs $40-50/month with separate backend hosting
4. **Better Security**: Row Level Security (RLS) at database level
5. **Simpler Deployment**: Git push deploys vs managing servers

The application is 90% frontend-focused (timer, scrambles, stats calculations are client-side), making Supabase's serverless approach ideal for the MVP.

## Performance Requirements

The application is designed to meet these performance targets:

- **Timer Precision**: Millisecond accuracy with <10ms variance
- **Timer Response**: <100ms response time for start/stop actions
- **Page Load**: <3 seconds on 3G connections
- **API Response**: <200ms for 95th percentile
- **Animation**: Smooth 60fps animations
- **Uptime**: 99.9% availability target

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Quality Assurance

### Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Enforces coding standards and best practices
- **Prettier**: Consistent code formatting across the project
- **Pre-commit Hooks**: Automated linting and testing before commits

### Test Coverage Goals

- **Unit Tests**: >80% coverage for business logic
- **Integration Tests**: All critical workflows covered
- **E2E Tests**: All user stories from PRD validated
- **Security**: 100% RLS policy coverage
- **Accessibility**: WCAG 2.1 Level A compliance

### Continuous Integration

Tests run automatically on:

- Every pull request
- Every push to main branch
- Pre-deployment checks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- World Cube Association (WCA) for standardized solving rules and notation
- The speedcubing community for inspiration and feedback

---

**Built with** ⚛️ React, 📘 TypeScript, and ⚡ Supabase
