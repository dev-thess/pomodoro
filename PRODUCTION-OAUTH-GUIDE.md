# Google OAuth Setup for Production

## Error: Connection Refused on OAuth Callback

If you're seeing the "This site can't be reached" error with "ERR_CONNECTION_REFUSED" when Google OAuth redirects back to your application, follow these steps to fix it:

## 1. Update Google OAuth Configuration

1. Go to the [Google Developer Console](https://console.developers.google.com/)
2. Select your project
3. Navigate to "Credentials" → "OAuth 2.0 Client IDs"
4. Edit your OAuth client
5. Under "Authorized redirect URIs", ensure you have:
   - `https://pomodoro-alpha-snowy.vercel.app/api/auth/callback/google`
   - For local testing: `http://localhost:3000/api/auth/callback/google`

## 2. Set Up Production Environment Variables

### For Vercel Deployments:

Go to your project settings in the Vercel dashboard:

1. Navigate to "Settings" → "Environment Variables"
2. Add the following variables:

```
NEXTAUTH_URL=https://pomodoro-alpha-snowy.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-secure-secret
```

**Important notes for Vercel:**

- If you don't set NEXTAUTH_URL explicitly, the app will try to use `https://${VERCEL_URL}` which might be a preview URL
- For production domains with custom domains, always set NEXTAUTH_URL explicitly
- Make sure to redeploy after updating environment variables

### For Other Hosting Providers:

Set the same environment variables according to your hosting provider's instructions.

### About NEXTAUTH_URL

This variable is **critical**. It must match exactly with your production URL, including:

- The protocol (`https://`)
- Any subdomain (`www.` if applicable)
- The exact domain name
- No trailing slash at the end

## 3. Common Problems & Solutions

### Problem: ERR_CONNECTION_REFUSED

- **Cause**: Redirect URL is incorrect or server is not running
- **Fix**: Verify NEXTAUTH_URL is set correctly in production

### Problem: Invalid Redirect URI

- **Cause**: Google doesn't recognize the callback URL
- **Fix**: Make sure the exact URL is added to Google Developer Console

### Problem: PKCE Issues

- **Cause**: OAuth state is lost during redirect
- **Fix**: Ensure cookies are properly configured for your domain

### Problem: Localhost Redirect in Production

- **Cause**: `.env.local` file with localhost URL is being used in production
- **Fix**: This has been fixed in the codebase - the app now correctly prioritizes:
  1. `NEXTAUTH_URL` environment variable
  2. `VERCEL_URL` for Vercel deployments
  3. Falls back to localhost only in development

## 4. Test in Production

After making these changes:

1. Deploy to production
2. Clear browser cookies and cache
3. Try logging in again
4. Check server logs for NextAuth debugging output
5. Verify the redirect URL in the browser address bar during the OAuth flow

## 5. Vercel-Specific Debug Steps

If you're still having issues on Vercel:

1. Enable detailed logging:

   - Add `NEXTAUTH_DEBUG=true` to your environment variables
   - Deploy and check the Function Logs in the Vercel dashboard

2. Check for any build-time environment issues:

   - Review the build logs in Vercel dashboard
   - Make sure no `.env.local` file is included in your repository

3. Verify your domain settings:
   - Make sure your custom domain is correctly set up in Vercel
   - Check that your NEXTAUTH_URL matches the primary domain (`pomodoro-alpha-snowy.vercel.app`)

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/configuration/options)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
