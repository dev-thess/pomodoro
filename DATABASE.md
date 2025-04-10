# Database Configuration

This application uses Prisma ORM with a PostgreSQL database on Supabase. This document provides guidance on setting up and troubleshooting database connections.

## Connection Types

We use two different connection methods:

1. **Connection Pooler (DATABASE_URL)** - Used for API routes and serverless functions (Required)
2. **Direct Connection (DIRECT_DATABASE_URL)** - Used for migrations and schema changes (Optional)

## Environment Setup

### Local Development

For local development, copy `.env.example` to `.env.local` and fill in your database credentials:

```env
# Connection pooler (for normal operations) - REQUIRED
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Direct connection (for migrations) - OPTIONAL
DIRECT_DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
```

### Production (Vercel)

In your Vercel project settings, add the following environment variables:

1. `DATABASE_URL` - Using the Supabase connection pooler URL (Required)
2. `DIRECT_DATABASE_URL` - Using the direct database connection URL (Optional, but required for migrations)

## Connection Pooling

Vercel's serverless functions benefit from connection pooling to prevent database connection limits. The Supabase Pooler helps manage connection limits efficiently.

## Migrations in Production

There are two ways to handle migrations in production:

1. **With DIRECT_DATABASE_URL**: Set this variable in Vercel to run migrations during deployment
2. **Without DIRECT_DATABASE_URL**: Run migrations manually before deploying:
   ```bash
   # Apply migrations locally first
   npx prisma migrate deploy
   ```

## Common Issues and Troubleshooting

### Connection Timeout Errors

If you see errors like `Database connection error: Timed out fetching a new connection from the connection pool`:

1. **Check your connection limits**:

   - Supabase Free tier has limited concurrent connections
   - Consider upgrading your Supabase plan

2. **Ensure proper connection release**:

   - Use Prisma to release connections with `$disconnect()`
   - Avoid unnecessary connections in serverless functions

3. **Verify SSL settings**:
   - Ensure `sslmode=require` is in your connection string

### Migration Issues

If migrations fail:

1. Make sure `DIRECT_DATABASE_URL` is correctly set if you want to run migrations during deployment
2. Run migrations locally first: `npx prisma migrate dev`
3. Deploy to production

## Best Practices

1. **Reduce Connection Overhead**:

   - Reuse Prisma clients when possible
   - Group database operations

2. **Optimize Query Performance**:

   - Use Prisma's data loader pattern
   - Implement pagination for large datasets

3. **Monitor Database Usage**:
   - Check Supabase dashboard for connection metrics
   - Set up alerts for high connection usage
