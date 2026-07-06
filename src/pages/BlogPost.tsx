import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import InstitutionalFooter from "@/components/InstitutionalFooter";
import { ArrowLeft, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Post {
  id: string;
  title: string;
  content: string;
  cover_image: string | null;
  author: string | null;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("id,title,content,cover_image,author,created_at")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }) => {
        setPost((data as Post) || null);
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar para o blog
          </Link>

          {loading ? (
            <div className="text-center py-16"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : !post ? (
            <p className="text-center py-16 text-muted-foreground">Artigo não encontrado.</p>
          ) : (
            <article>
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="w-full h-64 object-cover rounded-2xl mb-8" />
              )}
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3">{post.title}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
                {post.author && <span>{post.author}</span>}
                <span>·</span>
                <time>{new Date(post.created_at).toLocaleDateString("pt-BR")}</time>
              </div>
              <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:font-serif">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </article>
          )}
        </div>
      </main>
      <InstitutionalFooter />
    </div>
  );
};

export default BlogPost;
