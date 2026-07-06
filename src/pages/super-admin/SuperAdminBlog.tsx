import { useEffect, useState } from "react";
import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2, Pencil, Trash2, Sparkles, Eye } from "lucide-react";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author: string | null;
  published: boolean;
  created_at: string;
}

const slugify = (s: string) =>
  s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

const emptyForm = {
  id: undefined as string | undefined,
  slug: "", title: "", excerpt: "", content: "", cover_image: "", author: "Dra. Luz", published: false,
};

const SuperAdminBlog = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts((data as Post[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setOpen(true); };
  const openEdit = (p: Post) => {
    setForm({
      id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt || "",
      content: p.content, cover_image: p.cover_image || "", author: p.author || "", published: p.published,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Título e conteúdo são obrigatórios", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      slug: form.slug || slugify(form.title),
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content,
      cover_image: form.cover_image.trim() || null,
      author: form.author.trim() || null,
      published: form.published,
    };
    const { error } = form.id
      ? await supabase.from("blog_posts").update(payload).eq("id", form.id)
      : await supabase.from("blog_posts").insert(payload);
    setSaving(false);
    if (error) { toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); return; }
    toast({ title: form.id ? "Artigo atualizado" : "Artigo criado" });
    setOpen(false);
    load();
  };

  const remove = async (p: Post) => {
    if (!confirm(`Excluir "${p.title}"?`)) return;
    await supabase.from("blog_posts").delete().eq("id", p.id);
    load();
  };

  const generateWithAI = async () => {
    if (!aiTopic.trim()) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-post", { body: { topic: aiTopic } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setForm({
        id: undefined, slug: data.slug || slugify(data.title),
        title: data.title, excerpt: data.excerpt || "", content: data.content,
        cover_image: "", author: "Dra. Luz (IA)", published: false,
      });
      setAiTopic("");
      setOpen(true);
      toast({ title: "Rascunho gerado — revise antes de publicar" });
    } catch (e: any) {
      toast({ title: "Erro na IA", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SuperAdminLayout title="Blog Dicas Luz Skin">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-3 items-end justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold">Dicas Luz Skin</h1>
            <p className="text-sm text-muted-foreground">Gerencie os artigos do blog institucional.</p>
          </div>
          <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Novo artigo</Button>
        </div>

        <Card className="p-4 space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider">Gerar com IA</Label>
          <div className="flex gap-2">
            <Input placeholder="Ex: Ácido hialurônico para pele oleosa" value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} />
            <Button variant="outline" onClick={generateWithAI} disabled={generating || !aiTopic.trim()}>
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">A IA gera um rascunho — você revisa e escolhe publicar.</p>
        </Card>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : (
          <div className="space-y-2">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground truncate">/{p.slug}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${p.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {p.published ? "Publicado" : "Rascunho"}
                </span>
                {p.published && (
                  <Button size="icon" variant="ghost" asChild>
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer"><Eye className="w-4 h-4" /></a>
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(p)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            ))}
            {posts.length === 0 && <p className="text-center text-muted-foreground py-12">Nenhum artigo ainda.</p>}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{form.id ? "Editar artigo" : "Novo artigo"}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label>Slug (URL)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder={slugify(form.title)} /></div>
                <div><Label>Autor</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
              </div>
              <div><Label>Imagem de capa (URL)</Label><Input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." /></div>
              <div><Label>Resumo</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
              <div><Label>Conteúdo (Markdown)</Label><Textarea rows={16} className="font-mono text-xs" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
              <div className="flex items-center gap-3">
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                <Label>Publicado</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminBlog;
