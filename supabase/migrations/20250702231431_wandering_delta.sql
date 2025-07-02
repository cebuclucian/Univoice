-- Create notifications table for system-wide notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('success', 'warning', 'info', 'error')),
    title text NOT NULL,
    message text NOT NULL,
    action_label text,
    action_url text,
    is_read boolean DEFAULT false,
    is_persistent boolean DEFAULT true,
    auto_close boolean DEFAULT false,
    duration integer DEFAULT 5000,
    created_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON public.notifications
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON public.notifications (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_expires 
ON public.notifications (expires_at) 
WHERE expires_at IS NOT NULL;

-- Function to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id uuid,
    p_type text,
    p_title text,
    p_message text,
    p_action_label text DEFAULT NULL,
    p_action_url text DEFAULT NULL,
    p_is_persistent boolean DEFAULT true,
    p_auto_close boolean DEFAULT false,
    p_duration integer DEFAULT 5000,
    p_expires_in_hours integer DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_id uuid;
    expires_at_value timestamptz;
BEGIN
    -- Calculate expiration time if specified
    IF p_expires_in_hours IS NOT NULL THEN
        expires_at_value := now() + (p_expires_in_hours || ' hours')::interval;
    END IF;

    -- Insert notification
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        action_label,
        action_url,
        is_persistent,
        auto_close,
        duration,
        expires_at,
        metadata
    ) VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_action_label,
        p_action_url,
        p_is_persistent,
        p_auto_close,
        p_duration,
        expires_at_value,
        p_metadata
    ) RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(
    p_notification_id uuid,
    p_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count integer;
BEGIN
    UPDATE public.notifications
    SET is_read = true
    WHERE id = p_notification_id 
      AND user_id = p_user_id
      AND is_read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count > 0;
END;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    updated_count integer;
BEGIN
    UPDATE public.notifications
    SET is_read = true
    WHERE user_id = p_user_id
      AND is_read = false;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    unread_count integer;
BEGIN
    SELECT COUNT(*)::integer
    INTO unread_count
    FROM public.notifications
    WHERE user_id = p_user_id
      AND is_read = false
      AND (expires_at IS NULL OR expires_at > now());
    
    RETURN COALESCE(unread_count, 0);
END;
$$;

-- Function to clean up expired notifications
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.notifications
    WHERE expires_at IS NOT NULL 
      AND expires_at < now();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Function to create system-wide notifications for all users
CREATE OR REPLACE FUNCTION public.create_system_notification(
    p_type text,
    p_title text,
    p_message text,
    p_action_label text DEFAULT NULL,
    p_action_url text DEFAULT NULL,
    p_expires_in_hours integer DEFAULT 24,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    notification_count integer := 0;
    user_record RECORD;
BEGIN
    -- Create notification for all active users
    FOR user_record IN 
        SELECT DISTINCT u.id
        FROM auth.users u
        JOIN public.user_profiles up ON u.id = up.id
        WHERE u.email_confirmed_at IS NOT NULL
    LOOP
        PERFORM public.create_notification(
            user_record.id,
            p_type,
            p_title,
            p_message,
            p_action_label,
            p_action_url,
            true, -- persistent
            false, -- auto_close
            5000, -- duration
            p_expires_in_hours,
            p_metadata || jsonb_build_object('system_wide', true)
        );
        
        notification_count := notification_count + 1;
    END LOOP;
    
    RETURN notification_count;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text, text, boolean, boolean, integer, integer, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_notifications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_system_notification(text, text, text, text, text, integer, jsonb) TO service_role;

-- Create a trigger to automatically create welcome notification for new users
CREATE OR REPLACE FUNCTION public.create_welcome_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create welcome notification
    PERFORM public.create_notification(
        NEW.id,
        'success',
        'Bine ai venit la Univoice! 🎉',
        'Contul tău a fost creat cu succes. Începe prin a-ți defini vocea brandului pentru a genera conținut personalizat.',
        'Definește vocea brandului',
        '/app/onboarding',
        true, -- persistent
        false, -- auto_close
        5000, -- duration
        72, -- expires in 72 hours
        jsonb_build_object('welcome', true, 'onboarding_step', 1)
    );
    
    RETURN NEW;
END;
$$;

-- Create trigger for welcome notifications
DROP TRIGGER IF EXISTS create_welcome_notification_trigger ON public.user_profiles;
CREATE TRIGGER create_welcome_notification_trigger
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.create_welcome_notification();

-- Create a function to send plan generation notifications
CREATE OR REPLACE FUNCTION public.notify_plan_generated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create notification for successful plan generation
    PERFORM public.create_notification(
        NEW.user_id,
        'success',
        'Plan de marketing generat cu succes! 🚀',
        'Planul "' || NEW.title || '" a fost creat și este gata de utilizare. Poți începe să implementezi strategiile recomandate.',
        'Vezi planul',
        '/app/plans',
        true, -- persistent
        false, -- auto_close
        5000, -- duration
        NULL, -- no expiration
        jsonb_build_object('plan_id', NEW.id, 'plan_title', NEW.title)
    );
    
    RETURN NEW;
END;
$$;

-- Create trigger for plan generation notifications
DROP TRIGGER IF EXISTS notify_plan_generated_trigger ON public.marketing_plans;
CREATE TRIGGER notify_plan_generated_trigger
    AFTER INSERT ON public.marketing_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_plan_generated();

-- Insert some sample system notifications for testing
INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    action_label,
    action_url,
    is_persistent,
    metadata
) 
SELECT 
    up.id,
    'info',
    'Funcționalități noi disponibile! ✨',
    'Am adăugat analiza vocii brandului și sistemul de notificări pentru o experiență îmbunătățită.',
    'Explorează noutățile',
    '/app/dashboard',
    true,
    jsonb_build_object('feature_update', true, 'version', '1.2.0')
FROM public.user_profiles up
WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = up.id AND u.email_confirmed_at IS NOT NULL)
ON CONFLICT DO NOTHING;