
-- Super admin can view all profiles
CREATE POLICY "Super admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Super admin can manage all user_roles
CREATE POLICY "Super admins can manage all roles" ON public.user_roles
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));

-- Admin can view profiles of their patients
CREATE POLICY "Admins can view patient profiles" ON public.profiles
FOR SELECT TO authenticated
USING (user_id IN (
  SELECT tp.patient_id FROM public.tenant_patients tp
  JOIN public.tenants t ON t.id = tp.tenant_id
  WHERE t.owner_id = auth.uid()
));
