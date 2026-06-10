import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Branding {
  id: string;
  site_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
}

const defaultBranding: Branding = {
  id: "",
  site_name: "DermAI",
  logo_url: null,
  primary_color: "#8B5CF6",
  secondary_color: "#F3E8FF",
  accent_color: "#D946EF",
  font_heading: "Playfair Display",
  font_body: "Inter",
};

interface BrandingContextType {
  branding: Branding;
  loading: boolean;
  refetch: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  loading: true,
  refetch: async () => {},
});

export const useBrandingContext = () => useContext(BrandingContext);

export const BrandingProvider = ({ children }: { children: ReactNode }) => {
  const [branding, setBranding] = useState<Branding>(defaultBranding);
  const [loading, setLoading] = useState(true);

  const fetchBranding = async () => {
    const { data } = await supabase
      .from("platform_branding")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (data) {
      setBranding(data as unknown as Branding);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading, refetch: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};
