# Vercel Deployment Checklist

## 🛠️ Pre-Deployment Checks

1. [ ] Verify the `.env.production.example` has been updated with correct format
2. [ ] Ensure `schema.prisma` has the optional marker (`?`) on `directUrl`
3. [ ] Confirm `package.json` build script is `prisma generate && next build`

## 🔐 Vercel Environment Variables

Set the following in your Vercel project settings under "Environment Variables":

- [ ] `DATABASE_URL`: Points to Supabase pooler

  ```
  postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
  ```

- [ ] `NEXTAUTH_URL`: Set to your actual deployment URL

  ```
  https://your-app-name.vercel.app
  ```

- [ ] `NEXTAUTH_SECRET`: Generate a secure secret

  ```
  Run locally: openssl rand -base64 32
  ```

- [ ] `GOOGLE_CLIENT_ID`: From Google Cloud Console

- [ ] `GOOGLE_CLIENT_SECRET`: From Google Cloud Console

## 🔄 Google OAuth Setup

1. [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
2. [ ] Navigate to your project → APIs & Services → Credentials
3. [ ] Edit your OAuth 2.0 Client ID
4. [ ] Ensure the following are correctly set:
   - [ ] **Authorized JavaScript origins**: Add your Vercel deployment URL
     ```
     https://your-app-name.vercel.app
     ```
   - [ ] **Authorized redirect URIs**: Add the auth callback URL
     ```
     https://your-app-name.vercel.app/api/auth/callback/google
     ```
5. [ ] Save changes

## 🚀 Deployment Process

1. [ ] Push code changes to your repository
2. [ ] Vercel should automatically detect and deploy
3. [ ] Check deployment logs for any errors
4. [ ] Test Google OAuth sign-in in production
5. [ ] Verify database connection is working

## 🔍 Troubleshooting

If you encounter issues:

1. **NextAuth Configuration Errors**:

   - Check that all environment variables are set correctly
   - Ensure Google OAuth redirect URIs are properly configured

2. **Database Connection Issues**:

   - Verify the DATABASE_URL is using the pooler connection
   - Check Supabase dashboard to make sure your database is active

3. **General Deployment Issues**:
   - Review Vercel build logs for specific errors
   - Try a manual redeployment after fixing issues
