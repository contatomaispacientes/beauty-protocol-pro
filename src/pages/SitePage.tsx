import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";

const SitePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("site_pages")
        .select("html_content, title, meta_description")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (data) {
        setHtml((data as any).html_content);
        document.title = `${(data as any).title} — DermAI`;
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 text-center">
          <h1 className="text-3xl font-serif font-bold text-foreground">Página não encontrada</h1>
          <p className="text-muted-foreground mt-2">
            <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4">
        <div className="container mx-auto max-w-5xl py-12">
          <div
            className="prose prose-sm sm:prose max-w-none"
            dangerouslySetInnerHTML={{ __html: html || "" }}
          />
        </div>
      </div>
    </div>
  );
};

export default SitePage;
