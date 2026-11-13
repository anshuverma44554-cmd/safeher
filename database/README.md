# SafeHer Database Architecture & Supabase Guide

This directory contains the production-grade PostgreSQL / Supabase database architecture for **SafeHer**.

## Files
1. `schema.sql`: Full DDL script creating all 12 relational tables, primary/foreign keys, indexes, and Row-Level Security (RLS) policies.
2. `seed.sql`: Pre-configured demo data including verified guardians, police assistance booths, 24/7 trauma hospitals, and sample journeys.

## Setting Up With Supabase
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `database/schema.sql` and click **Run**.
4. Paste the contents of `database/seed.sql` and click **Run**.
5. Copy your Project URL, anon public key, and service_role secret key from **Project Settings > API**.
6. Paste them into your `.env` file:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
7. Restart the SafeHer backend. SafeHer will automatically detect your Supabase credentials and transition into live Supabase mode!

