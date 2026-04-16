# Contributing to Clipa AI

Thank you for your interest in contributing to Clipa AI! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Git
- Basic knowledge of TypeScript, React, and Next.js

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/yourusername/viral-podcast-clip.git
   cd viral-podcast-clip/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Start development**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### 1. Create an Issue

Before starting work, create an issue to discuss your proposed changes:

- Search existing issues to avoid duplicates
- Use clear, descriptive titles
- Provide detailed descriptions of the problem or feature
- Include screenshots/mockups if applicable

### 2. Branch Naming

Use consistent branch naming:

- `feature/feature-name` for new features
- `bugfix/bug-description` for bug fixes
- `docs/documentation-update` for documentation
- `refactor/code-refactoring` for refactoring

### 3. Making Changes

#### Code Style

We use ESLint and TypeScript for code quality:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint -- --fix
```

#### TypeScript

- All new code must be written in TypeScript
- Use proper type annotations
- Avoid `any` types when possible
- Use interfaces for complex objects

#### Component Structure

Follow our component structure:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ComponentProps {
  // Define props here
}

export function Component({ ...props }: ComponentProps) {
  // Component logic here
  
  return (
    <div>
      {/* JSX here */}
    </div>
  );
}
```

### 4. Testing

Before submitting a pull request:

1. **Test your changes thoroughly**
   ```bash
   npm run build
   npm start
   ```

2. **Check for TypeScript errors**
   ```bash
   npx tsc --noEmit
   ```

3. **Run linting**
   ```bash
   npm run lint
   ```

4. **Test database changes**
   ```bash
   npx prisma migrate dev
   npx prisma studio
   ```

## 🏗️ Project Structure

Understanding the project structure will help you navigate the codebase:

```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── checkout/      # Payment processing
│   │   └── webhook/       # Webhook handlers
│   ├── dashboard/         # Dashboard pages
│   ├── pricing/           # Pricing page
│   └── sign-in/           # Authentication pages
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   └── webcomponents/    # Custom components
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication configuration
│   ├── auth-client.ts    # Client-side auth
│   ├── prisma.ts         # Database client
│   └── utils.ts          # Utility functions
├── actions/              # Server actions
│   ├── generation.ts     # Video processing
│   ├── s3.ts            # S3 operations
│   └── polar.ts         # Payment operations
├── inngest/              # Background jobs
│   ├── client.ts        # Inngest client
│   └── functions.ts     # Job functions
├── prisma/               # Database
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
└── public/               # Static assets
```

## 🎯 Types of Contributions

### 🐛 Bug Reports

When reporting bugs:

1. Use the bug report template
2. Provide clear steps to reproduce
3. Include environment details
4. Add screenshots if applicable
5. Check if the bug exists in the latest version

### ✨ Feature Requests

When requesting features:

1. Use the feature request template
2. Describe the use case clearly
3. Explain why the feature is valuable
4. Consider implementation complexity
5. Provide mockups if applicable

### 📝 Documentation

Documentation improvements are always welcome:

- Fix typos and grammatical errors
- Improve code comments
- Add examples to the README
- Update API documentation
- Create tutorials or guides

### 🎨 UI/UX Improvements

For UI/UX changes:

- Follow the existing design system
- Use Shadcn UI components when possible
- Ensure responsive design
- Test on different screen sizes
- Consider accessibility

## 🔧 Development Guidelines

### Database Changes

When modifying the database:

1. Update `prisma/schema.prisma`
2. Create a migration: `npx prisma migrate dev --name your-migration-name`
3. Update TypeScript types if needed
4. Test the migration locally
5. Include migration files in your PR

### API Changes

When modifying API routes:

1. Follow RESTful conventions
2. Include proper error handling
3. Add input validation
4. Update TypeScript types
5. Document new endpoints

### Component Development

When creating components:

1. Use TypeScript interfaces for props
2. Follow the existing naming conventions
3. Make components reusable
4. Add proper error boundaries
5. Include accessibility attributes

### Environment Variables

Never commit sensitive environment variables:

1. Use `.env.local` for local development
2. Add new variables to `.env.example`
3. Update documentation in README.md
4. Use proper naming conventions

## 📤 Pull Request Process

### 1. Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] TypeScript compilation succeeds
- [ ] Linting passes
- [ ] Documentation is updated
- [ ] Commit messages are clear

### 2. Pull Request Template

Use this template for your PR:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added tests (if applicable)
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Environment variables documented (if needed)
```

### 3. Commit Messages

Follow conventional commit format:

```
type(scope): description

feat(dashboard): add clip download button
fix(auth): resolve session timeout issue
docs(readme): update installation instructions
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

## 🧪 Testing Guidelines

### Manual Testing

Test your changes in different scenarios:

1. **Authentication flow**
   - Sign up, sign in, sign out
   - Session persistence
   - Protected routes

2. **File upload system**
   - Different file formats
   - Large files
   - Network failures

3. **Payment integration**
   - Checkout flow
   - Credit granting
   - Error handling

4. **Dashboard functionality**
   - Upload tracking
   - Clip display
   - Status updates

### Automated Testing

While we don't have comprehensive test coverage yet, consider adding:

- Unit tests for utility functions
- Integration tests for API routes
- Component tests for UI interactions

## 🚀 Deployment

### Staging

Before deploying to production:

1. Test in a staging environment
2. Verify database migrations
3. Check environment variables
4. Monitor error logs

### Production

- Deployment is handled via Vercel
- Ensure all environment variables are set
- Monitor the deployment process
- Check for any runtime errors

## 🆘 Getting Help

If you need help:

1. Check existing issues and discussions
2. Read the project documentation
3. Join our community discussions
4. Ask questions in your PR
5. Contact maintainers directly

## 📋 Review Process

### What We Look For

- Code quality and style
- Proper error handling
- Security considerations
- Performance implications
- Documentation completeness
- Test coverage

### Review Timeline

- Initial review within 2-3 days
- Additional reviews as needed
- Merge after approval and checks pass

## 🏆 Recognition

Contributors are recognized in:

- README.md contributors section
- Release notes
- Community highlights
- Special contributor badges

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Clipa AI! Your contributions help make this project better for everyone. 🎉
