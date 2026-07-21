import { useEffect, useState, useCallback } from "react";
import { Star, Loader2, Trash2, Send } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  productId: string;
  productName: string;
}

interface ReviewRow {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  author?: string | null;
}

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

const MAX_COMMENT = 500;

const StarRow = ({
  value,
  onChange,
  size = 20,
  readOnly = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
  readOnly?: boolean;
}) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= shown;
        const partial = !hover && !Number.isInteger(value) && n === Math.ceil(value);
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onChange?.(n)}
            className={readOnly ? "cursor-default" : "cursor-pointer"}
            aria-label={`${n} estrelas`}
          >
            <Star
              style={{ width: size, height: size }}
              className={active || partial ? "fill-primary text-primary" : "text-muted-foreground/40"}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
};

const ProductReviews = ({ productId, productName }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : undefined;

  const load = useCallback(async () => {
    setLoading(true);
    const { data: reviewsData } = await supabase
      .from("product_reviews")
      .select("id,user_id,rating,comment,created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    const rows = (reviewsData || []) as ReviewRow[];

    // fetch author names
    const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
    let profileMap: Record<string, string> = {};
    if (userIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id,display_name")
        .in("user_id", userIds);
      profileMap = Object.fromEntries(
        (profiles || []).map((p: any) => [p.user_id, p.display_name || ""]),
      );
    }
    const enriched = rows.map((r) => ({ ...r, author: profileMap[r.user_id] || "Usuário" }));
    setReviews(enriched);

    const { data: prod } = await supabase
      .from("products")
      .select("avg_rating,reviews_count")
      .eq("id", productId)
      .maybeSingle();
    if (prod) {
      setAvg(Number(prod.avg_rating) || 0);
      setCount(prod.reviews_count || 0);
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  // prefill form when own review loads / product changes
  useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
  }, [myReview?.id, productId]);

  const submit = async () => {
    if (!user) return;
    const parsed = reviewSchema.safeParse({
      rating,
      comment: comment.trim() ? comment.trim() : undefined,
    });
    if (!parsed.success) {
      toast({
        title: "Avaliação inválida",
        description: parsed.error.issues[0]?.message || "Verifique os campos.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const payload = {
      product_id: productId,
      user_id: user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    };
    const { error } = await supabase
      .from("product_reviews")
      .upsert(payload, { onConflict: "product_id,user_id" });
    setSaving(false);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: myReview ? "Avaliação atualizada" : "Avaliação enviada ✨" });
    load();
  };

  const remove = async () => {
    if (!myReview) return;
    if (!confirm("Excluir sua avaliação?")) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", myReview.id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    setRating(0);
    setComment("");
    load();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-lg">Avaliações da comunidade</CardTitle>
        <div className="flex items-center gap-3 pt-1">
          <StarRow value={avg} readOnly />
          <div className="text-sm">
            <span className="font-semibold text-foreground">{avg.toFixed(1)}</span>
            <span className="text-muted-foreground"> · {count} {count === 1 ? "avaliação" : "avaliações"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Own review form */}
        <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {myReview ? "Sua avaliação" : "Deixe sua avaliação"}
          </p>
          <StarRow value={rating} onChange={setRating} size={26} />
          <div>
            <Textarea
              placeholder={`Conte sua experiência com ${productName}...`}
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
              className="resize-none min-h-[80px]"
              maxLength={MAX_COMMENT}
            />
            <div className="flex justify-end mt-1">
              <span className="text-[10px] text-muted-foreground">
                {comment.length}/{MAX_COMMENT}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={submit}
              disabled={saving || rating < 1}
              size="sm"
              className="flex-1"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-2" />
                  {myReview ? "Atualizar" : "Publicar"}
                </>
              )}
            </Button>
            {myReview && (
              <Button variant="outline" size="sm" onClick={remove}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="text-center py-6">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-center text-muted-foreground py-4">
            Seja a primeira pessoa a avaliar este produto.
          </p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="p-3 rounded-xl border border-border/60 bg-card">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {(r.author || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {r.author || "Usuário"}
                        {user && r.user_id === user.id && (
                          <span className="text-[10px] text-muted-foreground ml-1">(você)</span>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <StarRow value={r.rating} readOnly size={14} />
                </div>
                {r.comment && (
                  <p className="text-sm text-foreground/90 mt-2 whitespace-pre-wrap">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductReviews;
