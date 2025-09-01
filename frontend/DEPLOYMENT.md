# Vercel Deployment Guide for Hiky Frontend

This guide will help you deploy your Hiky chat application frontend to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your backend API deployed and accessible via HTTPS
3. Git repository with your code

## Step 1: Prepare Your Project

### 1.1 Environment Variables
Your app uses the `VITE_API_URL` environment variable. You'll need to set this to your deployed backend URL.

**For local development:**
```bash
# Copy the example file
cp env.example .env.local

# Edit .env.local and set your backend URL
VITE_API_URL=http://localhost:5000
```

**For production deployment:**
You'll set this in Vercel's dashboard (see Step 3).

### 1.2 Test Your Build
Before deploying, make sure your app builds successfully:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test the build locally
npm run preview
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from your frontend directory:**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project? (Choose "No" for first deployment)
   - Project name: `hiky-frontend` (or your preferred name)
   - Directory: `./` (current directory)
   - Override settings? (Choose "No" unless you have specific needs)

### Option B: Deploy via GitHub Integration

1. **Push your code to GitHub** (if not already done)

2. **Go to [vercel.com](https://vercel.com) and sign in**

3. **Click "New Project"**

4. **Import your GitHub repository**

5. **Configure the project:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Step 3: Configure Environment Variables

1. **In your Vercel dashboard, go to your project**

2. **Navigate to Settings → Environment Variables**

3. **Add the following variable:**
   - **Name:** `VITE_API_URL`
   - **Value:** Your deployed backend URL (e.g., `https://your-backend.vercel.app`)
   - **Environment:** Production, Preview, Development

4. **Click "Save"**

## Step 4: Configure CORS (Backend)

Make sure your backend allows requests from your Vercel domain. Add your Vercel URL to the CORS configuration:

```javascript
// In your backend CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://your-app-name.vercel.app' // Your Vercel domain
  ],
  credentials: true
};
```

## Step 5: Redeploy

After setting environment variables, redeploy your project:

```bash
vercel --prod
```

Or trigger a new deployment from the Vercel dashboard.

## Step 6: Test Your Deployment

1. **Visit your deployed URL**
2. **Test the following features:**
   - User registration
   - User login
   - Chat functionality
   - WebSocket connections

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   - Check that all dependencies are in `package.json`
   - Ensure your build command works locally
   - Check Vercel build logs for specific errors

2. **API Connection Issues:**
   - Verify `VITE_API_URL` is set correctly
   - Ensure your backend is deployed and accessible
   - Check CORS configuration on your backend

3. **WebSocket Issues:**
   - Ensure your backend WebSocket server is accessible
   - Check if your hosting provider supports WebSockets
   - Verify WebSocket URL configuration

### Useful Commands:

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Remove a deployment
vercel rm [deployment-url]
```

## Custom Domain (Optional)

1. **In Vercel dashboard, go to Settings → Domains**
2. **Add your custom domain**
3. **Configure DNS records as instructed**
4. **Enable SSL certificate**

## Environment-Specific Deployments

You can have different environment variables for different deployments:

- **Production:** Your live app
- **Preview:** Automatic deployments for pull requests
- **Development:** Local development with `vercel dev`

## Monitoring and Analytics

Vercel provides built-in analytics and monitoring:
- **Analytics:** View page views, performance metrics
- **Speed Insights:** Core Web Vitals monitoring
- **Function Logs:** Serverless function logs

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure custom domain (if needed)
3. Set up CI/CD for automatic deployments
4. Configure preview deployments for pull requests

---

**Need Help?**
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [React Deployment Best Practices](https://create-react-app.dev/docs/deployment/)
