-- Add clinic_name to profiles so we can store the requested clinic name during signup
ALTER TABLE public.profiles ADD COLUMN clinic_name text;

-- Update the trigger to also capture clinic_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, account_type, phone, is_approved, clinic_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'consumer'),
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'account_type', 'consumer') = 'professional' THEN false
      ELSE true
    END,
    NEW.raw_user_meta_data->>'clinic_name'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$function$;