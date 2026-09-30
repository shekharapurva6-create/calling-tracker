-- =====================================================================
-- NexGenAi Database Schema & Row Level Security (RLS)
-- Target: Supabase PostgreSQL
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums (safe creation if not exists)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'WORKER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('NEW', 'CALLED', 'CONNECTED', 'FOLLOW-UP', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lead_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE call_status AS ENUM ('INITIATED', 'RINGING', 'CONNECTED', 'COMPLETED', 'NO_ANSWER', 'BUSY', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE follow_up_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'WORKER',
    daily_target INTEGER NOT NULL DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure daily_target exists if table was previously created without it
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS daily_target INTEGER NOT NULL DEFAULT 15;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

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
    assigned_worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure assigned_worker_id exists if table was previously created
DO $$ BEGIN
    ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Index for phone search and duplicate check
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone_number);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_worker ON public.leads(assigned_worker_id);

-- 5. Lead Assignments Table (Historical & multi-assignment audit)
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
    outcome lead_status,
    notes TEXT,
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

-- 9. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    company_name TEXT NOT NULL DEFAULT 'NexGenAi',
    default_daily_target INTEGER NOT NULL DEFAULT 15,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    telephony_provider TEXT NOT NULL DEFAULT 'MOCK',
    auto_email_dispatch BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================================
-- HELPER FUNCTIONS FOR SECURITY DEFINER CHECKS
-- =====================================================================

-- Helper function to check if current authenticated user is ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current authenticated user is active WORKER
CREATE OR REPLACE FUNCTION public.is_active_worker()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'WORKER' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- ROLE ESCALATION PREVENTION TRIGGER
-- Normal users can never change their own role or active status.
-- Only ADMIN users can assign role = 'ADMIN' or change is_active.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- If not an admin, prevent changing role or is_active
  IF NOT public.is_admin() THEN
    IF NEW.role <> OLD.role THEN
      RAISE EXCEPTION 'Access Denied: You are not authorized to modify user roles.';
    END IF;
    IF NEW.is_active <> OLD.is_active THEN
      RAISE EXCEPTION 'Access Denied: You are not authorized to modify user active status.';
    END IF;
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 1. Profiles Policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view and manage all profiles" ON public.profiles;
CREATE POLICY "Admins can view and manage all profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Workers can view their own profile" ON public.profiles;
CREATE POLICY "Workers can view their own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Workers can update their own safe profile data" ON public.profiles;
CREATE POLICY "Workers can update their own safe profile data"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------
-- 2. Leads Policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can do everything on leads" ON public.leads;
CREATE POLICY "Admins can do everything on leads"
    ON public.leads FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Workers can view assigned leads" ON public.leads;
CREATE POLICY "Workers can view assigned leads"
    ON public.leads FOR SELECT
    USING (
        public.is_active_worker() AND (
            assigned_worker_id = auth.uid() OR
            id IN (
                SELECT lead_id FROM public.lead_assignments
                WHERE worker_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Workers can update assigned leads" ON public.leads;
CREATE POLICY "Workers can update assigned leads"
    ON public.leads FOR UPDATE
    USING (
        public.is_active_worker() AND (
            assigned_worker_id = auth.uid() OR
            id IN (
                SELECT lead_id FROM public.lead_assignments
                WHERE worker_id = auth.uid()
            )
        )
    )
    WITH CHECK (
        public.is_active_worker() AND (
            assigned_worker_id = auth.uid() OR
            id IN (
                SELECT lead_id FROM public.lead_assignments
                WHERE worker_id = auth.uid()
            )
        )
    );

-- ---------------------------------------------------------------------
-- 3. Lead Assignments Policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage lead assignments" ON public.lead_assignments;
CREATE POLICY "Admins can manage lead assignments"
    ON public.lead_assignments FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Workers can view their own assignments" ON public.lead_assignments;
CREATE POLICY "Workers can view their own assignments"
    ON public.lead_assignments FOR SELECT
    USING (public.is_active_worker() AND worker_id = auth.uid());

-- ---------------------------------------------------------------------
-- 4. Call Logs Policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view and manage all call logs" ON public.call_logs;
CREATE POLICY "Admins can view and manage all call logs"
    ON public.call_logs FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Workers can view their own call logs" ON public.call_logs;
CREATE POLICY "Workers can view their own call logs"
    ON public.call_logs FOR SELECT
    USING (public.is_active_worker() AND worker_id = auth.uid());

DROP POLICY IF EXISTS "Workers can insert their own call logs" ON public.call_logs;
CREATE POLICY "Workers can insert their own call logs"
    ON public.call_logs FOR INSERT
    WITH CHECK (public.is_active_worker() AND worker_id = auth.uid());

-- ---------------------------------------------------------------------
-- 5. Follow Ups Policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view and manage all follow ups" ON public.follow_ups;
CREATE POLICY "Admins can view and manage all follow ups"
    ON public.follow_ups FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Workers can view their own follow ups" ON public.follow_ups;
CREATE POLICY "Workers can view their own follow ups"
    ON public.follow_ups FOR SELECT
    USING (public.is_active_worker() AND worker_id = auth.uid());

DROP POLICY IF EXISTS "Workers can insert their own follow ups" ON public.follow_ups;
CREATE POLICY "Workers can insert their own follow ups"
    ON public.follow_ups FOR INSERT
    WITH CHECK (public.is_active_worker() AND worker_id = auth.uid());

DROP POLICY IF EXISTS "Workers can update their own follow ups" ON public.follow_ups;
CREATE POLICY "Workers can update their own follow ups"
    ON public.follow_ups FOR UPDATE
    USING (public.is_active_worker() AND worker_id = auth.uid())
    WITH CHECK (public.is_active_worker() AND worker_id = auth.uid());

-- ---------------------------------------------------------------------
-- 6. Daily Targets Policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage all daily targets" ON public.daily_targets;
CREATE POLICY "Admins can manage all daily targets"
    ON public.daily_targets FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Workers can view their own daily targets" ON public.daily_targets;
CREATE POLICY "Workers can view their own daily targets"
    ON public.daily_targets FOR SELECT
    USING (public.is_active_worker() AND worker_id = auth.uid());

-- ---------------------------------------------------------------------
-- 7. System Settings Policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings"
    ON public.system_settings FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Workers can read system settings" ON public.system_settings;
CREATE POLICY "Workers can read system settings"
    ON public.system_settings FOR SELECT
    USING (public.is_active_worker());

-- ---------------------------------------------------------------------
-- 8. Notifications Table & Policies
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'LEAD_ASSIGNMENT',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'IN_APP',
    status TEXT NOT NULL DEFAULT 'SENT',
    is_read BOOLEAN NOT NULL DEFAULT false,
    link_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;
CREATE POLICY "Admins can manage all notifications"
    ON public.notifications FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view and update their own notifications" ON public.notifications;
CREATE POLICY "Users can view and update their own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notification read status" ON public.notifications;
CREATE POLICY "Users can update their own notification read status"
    ON public.notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 9. Assignment Notification Logs Table & Policies
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignment_notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id TEXT NOT NULL,
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lead_count INTEGER NOT NULL DEFAULT 1,
    lead_ids JSONB NOT NULL DEFAULT '[]',
    email_status TEXT NOT NULL DEFAULT 'PENDING',
    whatsapp_status TEXT NOT NULL DEFAULT 'PENDING',
    in_app_status TEXT NOT NULL DEFAULT 'SENT',
    email_error TEXT,
    whatsapp_error TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assignment_notif_logs_worker ON public.assignment_notification_logs(worker_id);
CREATE INDEX IF NOT EXISTS idx_assignment_notif_logs_batch ON public.assignment_notification_logs(batch_id);

ALTER TABLE public.assignment_notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage all assignment notification logs" ON public.assignment_notification_logs;
CREATE POLICY "Admins can manage all assignment notification logs"
    ON public.assignment_notification_logs FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Workers can view their own assignment notification logs" ON public.assignment_notification_logs;
CREATE POLICY "Workers can view their own assignment notification logs"
    ON public.assignment_notification_logs FOR SELECT
    USING (public.is_active_worker() AND worker_id = auth.uid());

-- =====================================================================
-- ADMIN ACCOUNT SETUP INSTRUCTIONS:
-- In Supabase SQL Editor, run the following to grant ADMIN role to the
-- two authorized Gmail accounts after they have been created:
--
-- UPDATE public.profiles
-- SET role = 'ADMIN', is_active = true
-- WHERE email IN ('admin1@gmail.com', 'admin2@gmail.com');
-- =====================================================================

