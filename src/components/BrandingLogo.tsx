import { useBrandingContext } from "@/contexts/BrandingContext";

interface BrandingLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "h-7", text: "text-xs", fallback: "w-7 h-7" },
  md: { container: "h-8", text: "text-xs", fallback: "w-8 h-8" },
  lg: { container: "h-10", text: "text-sm", fallback: "w-10 h-10" },
};

const BrandingLogo = ({ size = "md", className = "" }: BrandingLogoProps) => {
  const { branding, loading } = useBrandingContext();
  const s = sizeMap[size];

  if (loading) {
    return <div className={`${s.fallback} ${className}`} />;
  }

  if (branding.logo_url) {
    return (
      <img
        src={branding.logo_url}
        alt={branding.site_name}
        className={`${s.container} w-auto object-contain ${className}`}
      />
    );
  }

  return (
    <div className={`${s.fallback} rounded-full bg-primary flex items-center justify-center ${className}`}>
      <span className={`text-primary-foreground font-serif ${s.text} font-bold`}>
        {branding.site_name.charAt(0)}
      </span>
    </div>
  );
};

export default BrandingLogo;
