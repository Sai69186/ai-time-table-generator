# Deployment Guide

## GitHub Upload Instructions

Your project is now ready for GitHub! Follow these steps:

### 1. Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click "New repository" or the "+" icon
3. Name your repository: `ai-timetable-generator`
4. Add description: "AI-powered timetable generation system for educational institutions"
5. Keep it public (or private if preferred)
6. **DO NOT** initialize with README, .gitignore, or license (we already have them)
7. Click "Create repository"

### 2. Connect Local Repository to GitHub
```bash
# Add GitHub remote (replace 'yourusername' with your GitHub username)
git remote add origin https://github.com/yourusername/ai-timetable-generator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Verify Upload
- Check that all files are visible on GitHub
- Verify README.md displays properly
- Ensure images and assets are uploaded

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### Quick Start
```bash
# Clone the repository
git clone https://github.com/yourusername/ai-timetable-generator.git
cd ai-timetable-generator

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

## Production Deployment

### Option 1: Netlify (Frontend Only)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build` (if you add a build script)
3. Set publish directory: `/` (root directory)
4. Deploy automatically on git push

### Option 2: Heroku (Full Stack)
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set NODE_ENV=production`
4. Deploy: `git push heroku main`

### Option 3: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts to deploy

## Environment Variables

Create a `.env` file with:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=production
```

## Troubleshooting

### Common Issues:
1. **Image paths**: Use forward slashes `/` not backslashes `\`
2. **Case sensitivity**: Ensure file names match exactly on Linux servers
3. **Dependencies**: Run `npm install` after cloning
4. **Environment**: Copy `.env.example` to `.env` and update values

### Git Issues:
- If you get authentication errors, use GitHub Personal Access Token
- For large files, consider using Git LFS
- Always check `.gitignore` before committing sensitive files