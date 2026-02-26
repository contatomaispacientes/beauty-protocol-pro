import SuperAdminLayout from "@/components/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Loader2, Palette, FileText, Sparkles, Save, Eye, Code } from "lucide-react";

interface Branding {
  id: string;
  site_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_heading: string;
  font_body: string;
}

interface SitePage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  html_content: string;
  is_published: boolean;
}

const SuperAdminPlatform = () => {
  const { toast } = useToast();

  // Branding state
  const [branding, setBranding] = useState<Branding | null>(null);
  const [brandingLoading, setBrandingLoading] = useState(true);
  const [savingBranding, setSavingBranding] = useState(false);

  // Pages state
  const [pages, setPages] = useState<SitePage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<SitePage | null>(null);
  const [editedHtml, setEditedHtml] = useState("");
  const [savingPage, setSavingPage] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchBranding();
    fetchPages();
  }, []);

  const fetchBranding = async () => {
    const { data } = await supabase.from("platform_branding").select("*").limit(1).maybeSingle();
    if (data) setBranding(data as unknown as Branding);
    setBrandingLoading(false);
  };

  const fetchPages = async () => {
    const { data } = await supabase.from("site_pages").select("*").order("slug");
    if (data) {
      setPages(data as unknown as SitePage[]);
      if (!selectedPage && data.length > 0) {
        const first = data[0] as unknown as SitePage;
        setSelectedPage(first);
        setEditedHtml(first.html_content);
      }
    }
    setPagesLoading(false);
  };

  const saveBranding = async () => {
    if (!branding) return;
    setSavingBranding(true);
    const { error } = await supabase
      .from("platform_branding")
      .update({
        site_name: branding.site_name,
        logo_url: branding.logo_url,
        primary_color: branding.primary_color,
        secondary_color: branding.secondary_color,
        accent_color: branding.accent_color,
        font_heading: branding.font_heading,
        font_body: branding.font_body,
      })
      .eq("id", branding.id);

    setSavingBranding(false);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      toast({ title: "Branding salvo! ✨" });
    }
  };

  const selectPage = (page: SitePage) => {
    setSelectedPage(page);
    setEditedHtml(page.html_content);
    setAiInstruction("");
    setPreviewMode(false);
  };

  const savePage = async () => {
    if (!selectedPage) return;
    setSavingPage(true);
    const { error } = await supabase
      .from("site_pages")
      .update({ html_content: editedHtml })
      .eq("id", selectedPage.id);

    setSavingPage(false);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      toast({ title: "Página salva! ✨" });
      setSelectedPage({ ...selectedPage, html_content: editedHtml });
      fetchPages();
    }
  };

  const applyAi = async () => {
    if (!aiInstruction.trim() || !selectedPage) return;
    setAiLoading(true);

    const { data, error } = await supabase.functions.invoke("edit-page-ai", {
      body: {
        currentHtml: editedHtml,
        instruction: aiInstruction,
        pageTitle: selectedPage.title,
      },
    });

    setAiLoading(false);

    if (error || data?.error) {
      toast({
        variant: "destructive",
        title: "Erro da IA",
        description: data?.error || error?.message || "Erro ao processar",
      });
    } else if (data?.html) {
      setEditedHtml(data.html);
      setPreviewMode(true);
      toast({ title: "IA aplicou as alterações! 🎉", description: "Revise o preview e salve se estiver satisfeito." });
    }
  };

  return (
    <SuperAdminLayout title="Configurações da Plataforma">
      <div className="max-w-7xl mx-auto space-y-6">
        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="w-4 h-4" /> Branding
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <FileText className="w-4 h-4" /> Páginas
            </TabsTrigger>
          </TabsList>

          {/* === BRANDING TAB === */}
          <TabsContent value="branding">
            {brandingLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : branding ? (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Identidade Visual</CardTitle>
                    <CardDescription>Altere o nome, logo e cores da plataforma</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome da Plataforma</Label>
                      <Input
                        value={branding.site_name}
                        onChange={(e) => setBranding({ ...branding, site_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>URL do Logo</Label>
                      <Input
                        value={branding.logo_url || ""}
                        onChange={(e) => setBranding({ ...branding, logo_url: e.target.value || null })}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Cor Primária</Label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={branding.primary_color}
                            onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border border-border"
                          />
                          <Input
                            value={branding.primary_color}
                            onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                            className="font-mono text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Cor Secundária</Label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={branding.secondary_color}
                            onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border border-border"
                          />
                          <Input
                            value={branding.secondary_color}
                            onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                            className="font-mono text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Cor Accent</Label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={branding.accent_color}
                            onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                            className="w-10 h-10 rounded cursor-pointer border border-border"
                          />
                          <Input
                            value={branding.accent_color}
                            onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })}
                            className="font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fonte de Títulos</Label>
                        <Input
                          value={branding.font_heading}
                          onChange={(e) => setBranding({ ...branding, font_heading: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fonte do Corpo</Label>
                        <Input
                          value={branding.font_body}
                          onChange={(e) => setBranding({ ...branding, font_body: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button onClick={saveBranding} disabled={savingBranding} className="w-full">
                      {savingBranding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Salvar Branding
                    </Button>
                  </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Preview</CardTitle>
                    <CardDescription>Visualize como ficará a identidade visual</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-border p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        {branding.logo_url ? (
                          <img src={branding.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-serif font-bold"
                            style={{ backgroundColor: branding.primary_color }}
                          >
                            {branding.site_name.charAt(0)}
                          </div>
                        )}
                        <span className="text-xl font-serif font-semibold" style={{ fontFamily: branding.font_heading }}>
                          {branding.site_name}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1 rounded-lg p-4 text-white text-center text-sm font-medium" style={{ backgroundColor: branding.primary_color }}>
                          Primária
                        </div>
                        <div className="flex-1 rounded-lg p-4 text-center text-sm font-medium" style={{ backgroundColor: branding.secondary_color }}>
                          Secundária
                        </div>
                        <div className="flex-1 rounded-lg p-4 text-white text-center text-sm font-medium" style={{ backgroundColor: branding.accent_color }}>
                          Accent
                        </div>
                      </div>
                      <p className="text-sm" style={{ fontFamily: branding.font_body }}>
                        Exemplo de texto com a fonte <strong>{branding.font_body}</strong>. Os títulos usam{" "}
                        <span style={{ fontFamily: branding.font_heading }} className="font-semibold">{branding.font_heading}</span>.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <p className="text-muted-foreground">Erro ao carregar branding.</p>
            )}
          </TabsContent>

          {/* === PAGES TAB === */}
          <TabsContent value="pages">
            {pagesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Page selector */}
                <div className="flex flex-wrap gap-2">
                  {pages.map((page) => (
                    <Button
                      key={page.id}
                      variant={selectedPage?.id === page.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => selectPage(page)}
                    >
                      {page.title}
                      {page.is_published && <Badge variant="secondary" className="ml-2 text-xs">Publicada</Badge>}
                    </Button>
                  ))}
                </div>

                {selectedPage && (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Editor */}
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="font-serif text-base flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            HTML — {selectedPage.title}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPreviewMode(!previewMode)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {previewMode ? "Código" : "Preview"}
                            </Button>
                            <Button size="sm" onClick={savePage} disabled={savingPage}>
                              {savingPage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                              Salvar
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {previewMode ? (
                          <div
                            className="prose prose-sm max-w-none min-h-[400px] rounded-lg border border-border p-4 overflow-auto bg-background"
                            dangerouslySetInnerHTML={{ __html: editedHtml }}
                          />
                        ) : (
                          <Textarea
                            value={editedHtml}
                            onChange={(e) => setEditedHtml(e.target.value)}
                            className="font-mono text-xs min-h-[400px] resize-y"
                            placeholder="HTML da página..."
                          />
                        )}
                      </CardContent>
                    </Card>

                    {/* AI Instruction */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="font-serif text-base flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          Solicitação de Alteração com IA
                        </CardTitle>
                        <CardDescription>
                          Descreva o que deseja alterar, adicionar ou remover na página. A IA irá modificar o HTML automaticamente.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Textarea
                          value={aiInstruction}
                          onChange={(e) => setAiInstruction(e.target.value)}
                          placeholder="Ex: Adicione uma seção de depoimentos com 3 cards. Mude o título do hero para 'Cuide da sua pele com tecnologia'. Remova a seção de preços..."
                          className="min-h-[200px] resize-y"
                        />
                        <Button
                          onClick={applyAi}
                          disabled={aiLoading || !aiInstruction.trim()}
                          className="w-full"
                        >
                          {aiLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Processando com IA...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Aplicar Alteração com IA
                            </>
                          )}
                        </Button>

                        <div className="bg-muted/50 rounded-lg p-3 border border-border">
                          <p className="text-xs text-muted-foreground">
                            💡 <strong>Dicas:</strong> Seja específico na descrição. Você pode pedir para adicionar seções,
                            mudar textos, reorganizar elementos, trocar cores, etc. Após a IA gerar o novo HTML,
                            revise o preview e clique em "Salvar" para confirmar.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminPlatform;
