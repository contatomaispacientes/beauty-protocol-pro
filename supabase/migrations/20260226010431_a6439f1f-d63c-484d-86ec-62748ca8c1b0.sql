-- Allow super admins to update any profile
CREATE POLICY "Super admins can update all profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super admins to delete profiles
CREATE POLICY "Super admins can delete profiles"
ON public.profiles FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Allow super admins to delete user roles
CREATE POLICY "Super admins can delete roles"
ON public.user_roles FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));