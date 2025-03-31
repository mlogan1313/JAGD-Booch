# Development Rules & Guidelines

## 📝 Documentation Rules

### Project Overview
- [ ] Update PROJECT_OVERVIEW.md after every significant change
- [ ] Keep the checklist current and accurate
- [ ] Update the project structure when adding new files
- [ ] Mark completed items with [x]
- [ ] Add new items as they are identified

### Code Documentation
- [ ] Add JSDoc comments for all functions and components
- [ ] Document complex logic with inline comments
- [ ] Keep README.md updated with setup instructions
- [ ] Document any environment variables needed

### Environment Files
- [ ] Never create redundant environment files
- [ ] Use a single .env file for all environment variables
- [ ] Document environment variables in README.md instead of separate example files
- [ ] Never commit sensitive data in environment files

## 🔄 Development Process

### Before Starting Work
1. Review PROJECT_OVERVIEW.md
2. Identify current priorities
3. Create a task checklist for the current work
4. Update PROJECT_OVERVIEW.md if needed

### During Development
1. Follow TypeScript best practices
2. Write clean, maintainable code
3. Test changes locally
4. Keep commits focused and descriptive

### After Changes
1. Update PROJECT_OVERVIEW.md
2. Update any relevant documentation
3. Test the changes
4. Create a descriptive commit message

## 🧪 Testing Requirements

### Local Testing
- [ ] Test on multiple devices
- [ ] Verify offline functionality
- [ ] Check mobile responsiveness
- [ ] Test data sync

### Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge

## 🔒 Security Guidelines

### Authentication
- [ ] Use Firebase Auth
- [ ] Implement proper session management
- [ ] Handle token refresh
- [ ] Secure sensitive data

### Data Security
- [ ] Set up proper Firebase rules
- [ ] Validate all user input
- [ ] Sanitize data before storage
- [ ] Implement proper error handling

## 📱 Mobile Considerations

### PWA Requirements
- [ ] Ensure offline functionality
- [ ] Implement proper caching
- [ ] Add to home screen capability
- [ ] Handle mobile gestures

### Mobile UI
- [ ] Mobile-first design
- [ ] Touch-friendly interfaces
- [ ] Proper viewport settings
- [ ] Responsive layouts

## 🔄 Version Control

### Commit Messages
- [ ] Use conventional commits
- [ ] Include ticket/issue references
- [ ] Describe changes clearly
- [ ] Keep commits focused

### Branch Strategy
- [ ] Main branch for production
- [ ] Feature branches for development
- [ ] Clean up branches after merge
- [ ] Regular commits

## 📦 Dependencies

### Package Management
- [ ] Keep dependencies updated
- [ ] Document dependency purposes
- [ ] Regular security audits
- [ ] Clean up unused dependencies

### Environment Variables
- [ ] Document all env vars
- [ ] Use .env file only
- [ ] Never commit sensitive data
- [ ] Validate env vars at startup 