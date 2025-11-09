# IMS Project Setup Guide

This guide will help you set up the Inventory Management System (IMS) with Clerk authentication and Supabase database.

## Prerequisites

- Node.js 18+ installed
- A Clerk account (free tier available)
- A Supabase account (free tier available)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env.local` file in the root directory with the following variables:

   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Set Up Clerk**
   - Follow the instructions in `CLERK_SETUP.md`
   - Get your API keys from the Clerk Dashboard
   - Configure sign-in/sign-up paths

4. **Set Up Supabase**
   - Follow the instructions in `SUPABASE_SETUP.md`
   - Create the required database tables
   - Set up Row Level Security (RLS) policies
   - Insert sample data (optional)

## Running the Application

1. **Start the Development Server**
   ```bash
   npm run dev
   ```

2. **Open Your Browser**
   - Navigate to `http://localhost:3000`
   - You will be redirected to the sign-in page if not authenticated
   - After signing in, you'll be redirected to the dashboard

## Features

- ✅ Clerk authentication (sign-up/sign-in)
- ✅ Protected routes (middleware)
- ✅ Supabase database integration
- ✅ Products management
- ✅ Delivery partners management
- ✅ Analytics dashboard
- ✅ Real-time data fetching

## Project Structure

```
ims/
├── app/
│   ├── components/        # React components
│   ├── lib/              # API services and Supabase client
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript types
│   ├── sign-in/          # Clerk sign-in page
│   ├── sign-up/          # Clerk sign-up page
│   └── page.tsx          # Main dashboard page
├── middleware.ts         # Clerk middleware for route protection
└── .env.local            # Environment variables (create this)
```

## Troubleshooting

### Clerk Issues
- Make sure your API keys are correct
- Check that sign-in/sign-up paths are configured in Clerk Dashboard
- Verify allowed origins are set correctly

### Supabase Issues
- Ensure all required tables are created
- Check RLS policies are set up correctly
- Verify your Supabase URL and anon key are correct
- Check browser console for specific error messages

### Database Connection Issues
- Verify your Supabase project is active
- Check that RLS policies allow authenticated users
- Ensure tables exist and have the correct schema

## Next Steps

1. Customize the dashboard to your needs
2. Add more features (branches, reports, etc.)
3. Set up proper RLS policies for production
4. Deploy to Vercel or your preferred hosting platform

## Support

For issues or questions:
- Clerk Documentation: https://clerk.com/docs
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs

