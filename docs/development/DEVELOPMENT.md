# Development Guide

## Prerequisites
- Node.js 18+
- pnpm package manager
- Git with proper configuration
- Cursor IDE with MCP setup

## Setup Process
1. Clone repository
2. Install dependencies with pnpm
3. Configure environment variables
4. Set up MCP tools
5. Run development server

## Development Workflow
- GitHub Issues-first development
- Automatic git workflow
- Comprehensive testing
- Production deployment process

## Code Standards
- Follow project linting rules
- Write comprehensive tests
- Document all changes
- Use conventional commit messages

## Troubleshooting
- Common setup issues
- Development environment problems
- Testing failures
- Build and deployment issues

## Available Scripts

### Root Level Commands
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development servers |
| `pnpm test` | Run tests with coverage |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm build` | Build all packages |

### Frontend Commands
| Command | Description |
|---------|-------------|
| `pnpm frontend:dev` | Start frontend development server |
| `pnpm frontend:build` | Build frontend for production |
| `pnpm frontend:start` | Start production frontend server |
| `pnpm frontend:lint` | Lint frontend code |

### Backend Commands
| Command | Description |
|---------|-------------|
| `pnpm backend:dev` | Start backend development server |
| `pnpm backend:build` | Build backend for production |
| `pnpm backend:start` | Start production backend server |

## Project Structure
```
project/
├── frontend/          # Frontend application
├── backend/           # Backend API
├── shared/            # Shared TypeScript types
├── scripts/           # Development and build scripts
├── docs/              # Project documentation
└── tests/             # Integration tests
```

## Development Workflow

### 1. Starting Development
```bash
# Quick start (recommended for daily development)
pnpm dev

# Full environment with quality checks
pnpm dev:full
```

### 2. Testing
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run specific test suite
pnpm test:unit
pnpm test:integration
pnpm test:e2e
```

### 3. Code Quality
```bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm typecheck
```

### 4. Building
```bash
# Build all packages
pnpm build

# Build specific package
pnpm frontend:build
pnpm backend:build
```

## Environment Variables
Create a `.env.local` file in the project root with the following variables:

```env
# Database
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# External Services
GITHUB_TOKEN=your_github_token
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## MCP Setup
1. Install MCP tools via npm
2. Configure environment variables
3. Set up tool permissions and scopes
4. Test tool integration

## Best Practices
- Use TypeScript for type safety
- Write tests for all new features
- Follow conventional commit messages
- Keep dependencies up to date
- Document all changes
- Use MCP tools when they add value

## Common Issues

### Setup Issues
- **Node.js version**: Ensure you're using Node.js 18+
- **pnpm not found**: Install pnpm globally with `npm install -g pnpm`
- **Permission errors**: Check file permissions and user access

### Development Issues
- **Port conflicts**: Check if ports 3000/3001 are available
- **Build failures**: Clear node_modules and reinstall dependencies
- **Type errors**: Run `pnpm typecheck` to identify issues

### Testing Issues
- **Test failures**: Check test environment setup
- **Coverage issues**: Ensure all code paths are tested
- **E2E failures**: Verify browser setup and test data

## Getting Help
- Check the documentation in `docs/`
- Review existing issues in GitHub
- Ask questions in team channels
- Consult the troubleshooting guide
