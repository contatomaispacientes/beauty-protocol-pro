import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import InstitutionalFooter from "@/components/InstitutionalFooter";
import { Loader2, Sparkles } from "lucide-react";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  author: string | null;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id,slug,title,excerpt,cover_image,author,created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data as Post[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-primary mb-3">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-[0.25em]">Blog</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground">Dicas Luz Skin</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Artigos científicos, práticos e acessíveis sobre skincare, ingredientes e cuidados diários.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">Em breve publicaremos artigos aqui.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="group block bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {p.cover_image ? (
                    <img src={p.cover_image} alt={p.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-primary/40" />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {p.title}
                    </h2>
                    {p.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>}
                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                      {p.author && <span>{p.author}</span>}
                      <span>·</span>
                      <time>{new Date(p.created_at).toLocaleDateString("pt-BR")}</time>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <InstitutionalFooter />
    </div>
  );
};

export default Blog;
