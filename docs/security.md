_Template placeholder. Replace or remove once your project defines this content._

# Security Policy

## Environment Variables

### Required Variables
- `GITHUB_TOKEN`: GitHub API token for issue sync (optional for local runs)

### Security Best Practices
1. Never commit `.env` files to version control
2. Use strong, unique tokens for each environment
3. Rotate tokens regularly
4. Use least-privilege access for tokens

## Development Security

### Code Security
- All code runs through ESLint with security rules
- TypeScript strict mode prevents many runtime issues
- No hardcoded secrets in source code

### Dependencies
- Regular security audits with `pnpm audit`
- Automated vulnerability scanning in CI
- Prompt updates for security patches

## Future Security Considerations

### Frontend Security
- Content Security Policy (CSP) headers
- HTTPS enforcement
- Input validation and sanitization
- XSS prevention

### Backend Security
- Input validation with Zod
- Rate limiting
- Authentication and authorization
- Secure session management

### Infrastructure Security
- Environment-specific configurations
- Secrets management
- Monitoring and alerting
- Incident response procedures

---

**Last Updated:** 2025-01-27  
**Next Review:** 2025-04-27
