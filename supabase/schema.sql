-- =====================================================================
-- NexGenAi Database Schema & Row Level Security (RLS)
-- Target: Supabase PostgreSQL
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'WORKER');
CREATE TYPE lead_status AS ENUM ('NEW', 'CALLED', 'CONNECTED', 'FOLLOW-UP', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED');
CREATE TYPE lead_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE call_status AS ENUM ('INITIATED', 'RINGING', 'CONNECTED', 'COMPLETED', 'NO_ANSWER', 'BUSY', 'FAILED');
CREATE TYPE follow_up_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- 3. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'WORKER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    business_name TEXT,
    phone_number TEXT NOT NULL,
    city TEXT,
    business_type TEXT,
    priority lead_priority NOT NULL DEFAULT 'MEDIUM',
    notes TEXT,
    status lead_status NOT NULL DEFAULT 'NEW',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for phone search and duplicate check
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone_number);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- 5. Lead Assignments Table
CREATE TABLE IF NOT EXISTS public.lead_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_assignments_worker ON public.lead_assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignments_lead ON public.lead_assignments(lead_id);

-- 6. Call Logs Table
CREATE TABLE IF NOT EXISTS public.call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    provider_call_id TEXT,
    phone_number TEXT NOT NULL,
    status call_status NOT NULL DEFAULT 'INITIATED',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    answered_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_call_logs_worker ON public.call_logs(worker_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_lead ON public.call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_status ON public.call_logs(status);
CREATE INDEX IF NOT EXISTS idx_call_logs_created ON public.call_logs(created_at);

-- 7. Follow Ups Table
CREATE TABLE IF NOT EXISTS public.follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    follow_up_at TIMESTAMPTZ NOT NULL,
    note TEXT,
    status follow_up_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_worker ON public.follow_ups(worker_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_date ON public.follow_ups(follow_up_at);

-- 8. Daily Targets Table
CREATE TABLE IF NOT EXISTS public.daily_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_calls INTEGER NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(worker_id, target_date)
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Admins can view and manage all profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

CREATE POLICY "Workers can view their own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

-- Leads Policies
CREATE POLICY "Admins can do everything on leads"
    ON public.leads FOR ALL
    USING (public.is_admin());

CREATE POLICY "Workers can view assigned leads"
    ON public.leads FOR SELECT
    USING (
        id IN (
            SELECT lead_id FROM public.lead_assignments
            WHERE worker_id = auth.uid()
        )
    );

CREATE POLICY "Workers can update assigned leads status"
    ON public.leads FOR UPDATE
    USING (
        id IN (
            SELECT lead_id FROM public.lead_assignments
            WHERE worker_id = auth.uid()
        )
    );

-- Lead Assignments Policies
CREATE POLICY "Admins can manage lead assignments"
    ON public.lead_assignments FOR ALL
    USING (public.is_admin());

CREATE POLICY "Workers can view their own assignments"
    ON public.lead_assignments FOR SELECT
    USING (worker_id = auth.uid());

-- Call Logs Policies
CREATE POLICY "Admins can view all call logs"
    ON public.call_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "Workers can view and insert their own call logs"
    ON public.call_logs FOR ALL
    USING (worker_id = auth.uid());

-- Follow Ups Policies
CREATE POLICY "Admins can view all follow ups"
    ON public.follow_ups FOR ALL
    USING (public.is_admin());

CREATE POLICY "Workers can manage their own follow ups"
    ON public.follow_ups FOR ALL
    USING (worker_id = auth.uid());

-- Daily Targets Policies
CREATE POLICY "Admins can manage all daily targets"
    ON public.daily_targets FOR ALL
    USING (public.is_admin());

CREATE POLICY "Workers can view their own daily targets"
    ON public.daily_targets FOR SELECT
    USING (worker_id = auth.uid());

-- Notifications Policies
CREATE POLICY "Users can manage their own notifications"
    ON public.notifications FOR ALL
    USING (user_id = auth.uid());
