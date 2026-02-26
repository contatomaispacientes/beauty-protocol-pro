import { useBrandingContext } from "@/contexts/BrandingContext";

interface BrandingLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "w-7 h-7", text: "text-xs" },
  md: { container: "w-8 h-8", text: "text-xs" },
  lg: { container: "w-10 h-10", text: "text-sm" },
};

const BrandingLogo = ({ size = "md", className = "" }: BrandingLogoProps) => {
  const { branding } = useBrandingContext();
  const s = sizeMap[size];

  if (branding.logo_url) {
    return (
      <img
        src={branding.logo_url}
        alt={branding.site_name}
        className={`${s.container} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`${s.container} rounded-full bg-primary flex items-center justify-center ${className}`}>
      <span className={`text-primary-foreground font-serif ${s.text} font-bold`}>
        {branding.site_name.charAt(0)}
      </span>
    </div>
  );
};

export default BrandingLogo;
