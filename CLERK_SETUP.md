# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for the IMS application.

## Steps to Set Up Clerk

1. **Create a Clerk Account**
   - Go to [https://clerk.com](https://clerk.com)
   - Sign up for a free account
   - Create a new application

2. **Get Your API Keys**
   - In your Clerk Dashboard, go to "API Keys"
   - Copy your `Publishable Key` and `Secret Key`

3. **Configure Environment Variables**
   - Create a `.env.local` file in the root of your project (if it doesn't exist)
   - Add the following variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

4. **Configure Sign-In/Sign-Up URLs**
   - In your Clerk Dashboard, go to "Paths"
   - Set the following paths:
     - Sign-in path: `/sign-in`
     - Sign-up path: `/sign-up`
     - After sign-in: `/` (root - will redirect to dashboard)
     - After sign-up: `/` (root - will redirect to dashboard)

5. **Configure Allowed Origins (if needed)**
   - In Clerk Dashboard, go to "Settings" > "Allowed Origins"
   - Add your development URL (e.g., `http://localhost:3000`)
   - Add your production URL when deploying

## How It Works

- When a user visits the app without being authenticated, they are redirected to `/sign-in`
- After successful sign-in or sign-up, users are redirected to the dashboard (`/`)
- The middleware protects all routes except `/sign-in` and `/sign-up`
- Users can sign out using the logout button in the header

## Testing

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to the sign-in page
4. Create an account or sign in
5. You should be redirected to the dashboard

