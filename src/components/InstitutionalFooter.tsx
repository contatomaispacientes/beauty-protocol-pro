import { Link } from "react-router-dom";
import BrandingLogo from "@/components/BrandingLogo";
import { useBrandingContext } from "@/contexts/BrandingContext";

const InstitutionalFooter = () => {
  const { branding } = useBrandingContext();

  return (
    <footer className="bg-foreground text-background py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif text-sm font-bold">
                  {branding.site_name.charAt(0)}
                </span>
              </div>
              <span className="font-serif text-lg font-semibold">{branding.site_name}</span>
            </div>
            <p className="text-sm opacity-60 leading-relaxed">
              A plataforma de IA mais avançada para dermatologia personalizada e ciência do skincare.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-serif font-semibold mb-4">Explorar</h4>
            <ul className="space-y-3 text-sm opacity-60">
              <li><Link to="/signup" className="hover:opacity-100 transition-opacity">Análise por IA</Link></li>
              <li><Link to="/signup" className="hover:opacity-100 transition-opacity">Rotina de Skincare</Link></li>
              <li><Link to="/signup" className="hover:opacity-100 transition-opacity">Colorimetria</Link></li>
              <li><Link to="/signup" className="hover:opacity-100 transition-opacity">Produtos</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-serif font-semibold mb-4">Empresa</h4>
            <ul className="space-y-3 text-sm opacity-60">
              <li><Link to="/about" className="hover:opacity-100 transition-opacity">Sobre Nós</Link></li>
              <li><Link to="/professionals" className="hover:opacity-100 transition-opacity">Para Profissionais</Link></li>
              <li><Link to="/contact" className="hover:opacity-100 transition-opacity">Contato</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-serif font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm opacity-60">
              <li><a href="#" className="hover:opacity-100 transition-opacity">Política de Privacidade</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Termos de Uso</a></li>
              <li><a href="#" className="hover:opacity-100 transition-opacity">Aviso Médico</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs opacity-40">
            © 2026 {branding.site_name}. Todos os direitos reservados.
          </p>
          <p className="text-xs opacity-40">
            Desenvolvido para uma pele mais saudável.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default InstitutionalFooter;
