# Deploy to Vercel

This guide explains how to deploy the Performance Dashboard to Vercel.

## Method 1: Deploy via Vercel Website (Recommended)

### Step 1: Push Your Code to GitHub

First, create a GitHub repository if you don't have one. Go to github.com, click "New repository", name it something like "performance-dashboard", and click "Create repository".

Then push your code to GitHub using these commands:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
git push -u origin main
```

Replace YOUR-USERNAME and YOUR-REPO-NAME with your actual GitHub username and repository name.

### Step 2: Deploy on Vercel

Go to vercel.com and click "Sign Up" or "Log In". The best option is to sign in with your GitHub account for one-click setup.

Click "Add New Project" or "New Project" button. You'll see a list of your GitHub repositories. Find and click "Import" next to your performance-dashboard repository.

Vercel will auto-detect everything for configuration. The Framework Preset should be Next.js, Root Directory should be "./", Build Command should be "npm run build", Output Directory should be ".next", Install Command should be "npm install", and Node.js Version should be 18.x.

Click the "Deploy" button and wait 2-3 minutes for the build to complete. You'll see the deployment progress in real-time.

Once deployment finishes, click "Visit" or go to https://your-project-name.vercel.app. Your dashboard is now live on the internet.

## Method 2: Deploy via Vercel CLI (Alternative)

If you prefer using the command line, first install Vercel CLI:

```bash
npm install -g vercel
```

Then login:

```bash
vercel login
```

This will open your browser to authenticate.

From your project root directory, run:

```bash
vercel
```

Follow the prompts. When asked "Set up and deploy?", type Y and press Enter. For "Which scope?", select your account (usually just press Enter). For "Link to existing project?", type N and press Enter if this is your first time. For "What's your project's name?", press Enter for default or type a name. For "In which directory is your code located?", press Enter for "./". For "Want to override the settings?", type N and press Enter.

To deploy to production, run:

```bash
vercel --prod
```

Your site will be live at https://your-project-name.vercel.app

## What Happens After Deployment

Your site gets an SSL certificate automatically for HTTPS. It uses a global CDN for fast loading worldwide. Every push to your main branch triggers a new deployment automatically. Pull requests get preview URLs automatically. Built-in performance monitoring is available through analytics.

## Updating Your Deployment

Every time you push changes to your GitHub repository, Vercel automatically detects the changes, builds your project, deploys the new version, and your site updates automatically.

To update, just run:

```bash
git add .
git commit -m "Update dashboard"
git push
```

That's it. Vercel handles the rest.

## Custom Domain (Optional)

To use a custom domain, go to your project on the Vercel dashboard, click "Settings" then "Domains", enter your domain name like "dashboard.yourdomain.com", follow the DNS configuration instructions, and Vercel will automatically set up SSL for your custom domain.

## Environment Variables (If Needed)

If your app needs environment variables, go to your project on the Vercel dashboard, click "Settings" then "Environment Variables", add your variables with name, value, and select the environment (Production, Preview, Development), click "Save", and redeploy your project.

## Troubleshooting

### Build Fails

If the build fails, check that your project needs Node.js 18+. Test locally first by running "npm run build" on your computer to check for errors. Check the build logs by clicking on the failed deployment in the Vercel dashboard to see error details.

### Site Not Loading

If the site isn't loading, wait a few minutes as the first deployment can take 3-5 minutes. Check the deployment status to make sure it shows "Ready" with a green checkmark. Try clearing your browser cache or opening in incognito or private mode.

### Changes Not Appearing

If changes aren't appearing, check that your latest commit is deployed. Try a hard refresh by pressing Ctrl+Shift+R on Windows or Cmd+Shift+R on Mac. Make sure you pushed to the branch connected to Vercel, usually the main branch.

### Performance Issues

If you're experiencing performance issues, check Vercel Analytics in the Analytics tab of your project. Review build logs to see if the build is taking too long. Optimize images by using the Next.js Image component for images.

## Post-Deployment Checklist

After deployment, test these items. Make sure the site loads at the Vercel URL, the dashboard page loads correctly at /dashboard, charts render properly, real-time data streaming works, interactive features like zoom, pan, and filters work, the performance monitor shows metrics, mobile view works when tested on a phone, and HTTPS is enabled (check for the lock icon in the browser).

## Quick Reference

Deploy URL: https://vercel.com
Time to Deploy: About 5 minutes
Cost: Free tier available
Auto-Deploy: Yes, on git push
HTTPS: Automatic
Custom Domain: Supported

That's it. Your Performance Dashboard is now live on the internet.
