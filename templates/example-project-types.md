# Example Project Types Template

This template provides examples of different project types that can be created using this cursor-template-project with Spec Kit integration.

## Frontend-Only Projects

### React Application
```bash
# Example: E-commerce frontend
- React with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Zustand for state management
- React Query for data fetching
- Vitest for testing
```

### Vue.js Application
```bash
# Example: Dashboard application
- Vue 3 with TypeScript
- Vite for build tooling
- Pinia for state management
- Vue Router for navigation
- Tailwind CSS for styling
- Vitest for testing
```

### Next.js Application
```bash
# Example: Blog/CMS application
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Prisma for database
- NextAuth.js for authentication
- Vercel for deployment
```

## Backend-Only Projects

### Node.js API
```bash
# Example: REST API service
- Express.js with TypeScript
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Swagger documentation
- Jest for testing
```

### Fastify API
```bash
# Example: High-performance API
- Fastify with TypeScript
- MongoDB database
- Mongoose ODM
- Redis for caching
- Rate limiting
- OpenAPI documentation
```

### GraphQL API
```bash
# Example: GraphQL server
- Apollo Server
- TypeScript
- PostgreSQL with Prisma
- GraphQL Code Generator
- Authentication middleware
- Subscription support
```

## Full-Stack Applications

### React + Node.js
```bash
# Example: Social media platform
- Frontend: React, TypeScript, Tailwind
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Authentication: JWT
- Real-time: Socket.io
- Deployment: Docker
```

### Next.js Full-Stack
```bash
# Example: SaaS application
- Next.js 14 with App Router
- TypeScript throughout
- Prisma + PostgreSQL
- NextAuth.js
- Stripe for payments
- Vercel deployment
```

### Vue + Express
```bash
# Example: Project management tool
- Frontend: Vue 3, TypeScript, Vite
- Backend: Express, TypeScript
- Database: MongoDB
- Authentication: Passport.js
- Real-time: WebSockets
```

## Monorepo Projects

### Multi-Package Library
```bash
# Example: UI component library
- Shared TypeScript types
- React components package
- Vue components package
- Storybook for documentation
- Lerna for package management
- Automated publishing
```

### Microservices Architecture
```bash
# Example: E-commerce platform
- User service (Node.js)
- Product service (Node.js)
- Order service (Node.js)
- Payment service (Node.js)
- API Gateway (Express)
- Shared utilities package
```

### Multi-Framework Project
```bash
# Example: Multi-platform application
- Web app (React)
- Mobile app (React Native)
- Desktop app (Electron)
- Shared business logic
- Common API client
- Unified design system
```

## Specialized Projects

### Data Processing Pipeline
```bash
# Example: Analytics platform
- Python for data processing
- Node.js for API
- React for dashboard
- PostgreSQL for storage
- Redis for caching
- Docker for deployment
```

### Real-time Application
```bash
# Example: Chat application
- React frontend
- Node.js backend
- Socket.io for real-time
- Redis for session storage
- MongoDB for message history
- WebRTC for video calls
```

### Machine Learning API
```bash
# Example: AI-powered service
- Python ML models
- FastAPI for ML endpoints
- React for admin interface
- PostgreSQL for data
- Redis for caching
- Docker for ML deployment
```

## Getting Started

1. **Choose your project type** from the examples above
2. **Clone this template** and customize it
3. **Use Spec Kit** for complex features:
   ```bash
   # Spec Kit will automatically detect complexity and guide you
   npm run spec:clarify  # For requirements clarification
   npm run spec:plan     # For implementation planning
   npm run spec:implement # For guided implementation
   ```
4. **Follow the constitution** in `memory/constitution.md`
5. **Use the templates** in `templates/` directory
6. **Reference examples** in `specs/` directory

## Customization

This template automatically adapts to your chosen project type:

- **Frontend detection**: Automatically configures React/Vue/Next.js
- **Backend detection**: Sets up Express/Fastify/Node.js
- **Database detection**: Configures PostgreSQL/MongoDB/Redis
- **Testing setup**: Configures Vitest/Jest based on framework
- **Deployment**: Sets up Docker/Vercel/Netlify based on needs

## Spec Kit Integration

For complex features, Spec Kit will automatically:

1. **Analyze complexity** and determine if Spec Kit workflow is needed
2. **Review constitution** to ensure alignment with project principles
3. **Clarify requirements** with structured questioning
4. **Create implementation plan** with detailed tasks
5. **Guide implementation** with validation and quality gates
6. **Integrate with git workflow** for automated PR creation

---

*This template demonstrates the flexibility and power of the cursor-template-project with Spec Kit integration for any type of project.*
