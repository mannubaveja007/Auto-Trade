# Deployment Guide

## Netlify Deployment

This project is now configured for easy Netlify deployment with the following structure:

```
/
├── api/                 # Backend serverless functions
├── src/                 # Frontend React source
├── dist/                # Frontend build output
├── index.html           # Main HTML file
├── netlify.toml         # Netlify configuration
└── package.json         # Unified dependencies
```

## Steps to Deploy:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy to Netlify**:
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Netlify will automatically detect the `netlify.toml` configuration

## Environment Variables

Make sure to set up the following environment variables in Netlify:
- Database connection strings
- API keys
- Other configuration values from your original `.env` file

## API Endpoints

Your API will be available at:
- `/api/health` - Health check
- `/api/vendors` - Vendor endpoints
- `/api/ai/*` - AI-related endpoints

All API calls are automatically routed to serverless functions.