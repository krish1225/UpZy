# Supabase Database Setup

This document contains the SQL commands to create all necessary tables for the UpZy application.

## Setup Instructions

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Click on your project
3. Navigate to the **SQL Editor** section
4. Create a new query
5. Copy and paste the SQL commands below
6. Click "Run"

---

## SQL Commands to Create Tables

### 1. Create Users Table
```sql
CREATE TABLE IF NOT EXISTS public.users (
  email TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Create Participants Table
```sql
CREATE TABLE IF NOT EXISTS public.participants (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  joined_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (email) REFERENCES public.users(email) ON DELETE CASCADE
);
```

### 3. Create Submissions Table
```sql
CREATE TABLE IF NOT EXISTS public.submissions (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  submission_date DATE NOT NULL,
  steps INTEGER NOT NULL DEFAULT 0,
  calories INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email, submission_date),
  FOREIGN KEY (email) REFERENCES public.users(email) ON DELETE CASCADE
);
```

### 4. Create Invite Codes Table
```sql
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP,
  FOREIGN KEY (email) REFERENCES public.users(email) ON DELETE SET NULL
);
```

### 5. Create Challenges Table
```sql
CREATE TABLE IF NOT EXISTS public.challenges (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  start_date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. Create User Challenge Progress Table
```sql
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  challenge_id BIGINT NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  total_steps INTEGER DEFAULT 0,
  total_calories INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email, challenge_id),
  FOREIGN KEY (email) REFERENCES public.users(email) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE
);
```

---

## Create Indexes for Performance

```sql
-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_email ON public.submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_date ON public.submissions(submission_date);
CREATE INDEX IF NOT EXISTS idx_submissions_email_date ON public.submissions(email, submission_date);

-- Invite codes indexes
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_email ON public.invite_codes(email);

-- Challenges indexes
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);

-- User challenge progress indexes
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_email ON public.user_challenge_progress(email);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_challenge_id ON public.user_challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_email_challenge ON public.user_challenge_progress(email, challenge_id);
```

---

## Enable Row Level Security (Optional but Recommended)

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (adjust as needed for your security requirements)
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert for public" ON public.users FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Enable insert for public" ON public.participants FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Enable insert for public" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for public" ON public.submissions FOR UPDATE USING (true);

CREATE POLICY "Enable read for all" ON public.invite_codes FOR SELECT USING (true);
CREATE POLICY "Enable insert for public" ON public.invite_codes FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Enable insert for public" ON public.challenges FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all" ON public.user_challenge_progress FOR SELECT USING (true);
CREATE POLICY "Enable insert for public" ON public.user_challenge_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for public" ON public.user_challenge_progress FOR UPDATE USING (true);
```

---

## Run All at Once

If you want to run all commands together, copy this complete script:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  email TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  joined_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (email) REFERENCES public.users(email) ON DELETE CASCADE
);

-- Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  submission_date DATE NOT NULL,
  steps INTEGER NOT NULL DEFAULT 0,
  calories INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email, submission_date),
  FOREIGN KEY (email) REFERENCES public.users(email) ON DELETE CASCADE
);

-- Invite codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  used_at TIMESTAMP,
  FOREIGN KEY (email) REFERENCES public.users(email) ON DELETE SET NULL
);

-- Challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  start_date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User challenge progress table
CREATE TABLE IF NOT EXISTS public.user_challenge_progress (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  challenge_id BIGINT NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  total_steps INTEGER DEFAULT 0,
  total_calories INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(email, challenge_id),
  FOREIGN KEY (email) REFERENCES public.users(email) ON DELETE CASCADE,
  FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON public.submissions(email);
CREATE INDEX IF NOT EXISTS idx_submissions_date ON public.submissions(submission_date);
CREATE INDEX IF NOT EXISTS idx_submissions_email_date ON public.submissions(email, submission_date);
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_email ON public.invite_codes(email);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_email ON public.user_challenge_progress(email);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_challenge_id ON public.user_challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_email_challenge ON public.user_challenge_progress(email, challenge_id);
```

---

## Table Relationships

```
users (1) ──→ (∞) participants
users (1) ──→ (∞) submissions
users (1) ──→ (∞) invite_codes
users (1) ──→ (∞) user_challenge_progress
challenges (1) ──→ (∞) user_challenge_progress
```

## Verification

After running the SQL, you should see these tables in your Supabase dashboard:
- ✅ users
- ✅ participants
- ✅ submissions
- ✅ invite_codes
- ✅ challenges
- ✅ user_challenge_progress

All your app features should now work with database persistence!
