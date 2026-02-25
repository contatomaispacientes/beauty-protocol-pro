
-- 1. Create tenants table (clinics/doctors)
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#8B5CF6',
  secondary_color text DEFAULT '#F3E8FF',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Tenant feature toggles
CREATE TABLE public.tenant_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  feature_key text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, feature_key)
);
ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;

-- 3. Tenant usage limits
CREATE TABLE public.tenant_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
  max_patients integer DEFAULT 50,
  max_analyses_per_month integer DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_limits ENABLE ROW LEVEL SECURITY;

-- 4. Patient-tenant relationship (many-to-many)
CREATE TABLE public.tenant_patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL,
  invite_code text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, patient_id)
);
ALTER TABLE public.tenant_patients ENABLE ROW LEVEL SECURITY;

-- 5. Invite codes
CREATE TABLE public.tenant_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  max_uses integer DEFAULT 1,
  uses integer DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_invite_codes ENABLE ROW LEVEL SECURITY;

-- 6. Triggers
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tenant_limits_updated_at BEFORE UPDATE ON public.tenant_limits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. RLS - tenants
CREATE POLICY "Super admins can manage all tenants" ON public.tenants
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can view own tenant" ON public.tenants
FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Admins can update own tenant" ON public.tenants
FOR UPDATE TO authenticated USING (owner_id = auth.uid());

-- 8. RLS - tenant_features
CREATE POLICY "Super admins manage all features" ON public.tenant_features
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can view own tenant features" ON public.tenant_features
FOR SELECT TO authenticated
USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()));

-- 9. RLS - tenant_limits
CREATE POLICY "Super admins manage all limits" ON public.tenant_limits
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can view own limits" ON public.tenant_limits
FOR SELECT TO authenticated
USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()));

-- 10. RLS - tenant_patients
CREATE POLICY "Super admins manage all patients" ON public.tenant_patients
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can manage own tenant patients" ON public.tenant_patients
FOR ALL TO authenticated
USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()));
CREATE POLICY "Patients can view own links" ON public.tenant_patients
FOR SELECT TO authenticated USING (patient_id = auth.uid());

-- 11. RLS - tenant_invite_codes
CREATE POLICY "Super admins manage all codes" ON public.tenant_invite_codes
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins can manage own codes" ON public.tenant_invite_codes
FOR ALL TO authenticated
USING (tenant_id IN (SELECT id FROM public.tenants WHERE owner_id = auth.uid()));
CREATE POLICY "Anyone authenticated can read valid codes" ON public.tenant_invite_codes
FOR SELECT TO authenticated USING (true);

-- 12. Assign super_admin role to the user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role FROM auth.users WHERE email = 'jssouza.n10@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
