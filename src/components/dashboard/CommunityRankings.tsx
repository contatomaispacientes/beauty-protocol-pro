import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Star, Search, MessageSquare, User } from "lucide-react";
import { motion } from "framer-motion";

type Period = "today" | "7d" | "30d" | "90d";

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
];

function sinceOf(p: Period): string {
  const d = new Date();
  if (p === "today") {
    d.setHours(0, 0, 0, 0);
  } else {
    const days = p === "7d" ? 7 : p === "30d" ? 30 : 90;
    d.setDate(d.getDate() - days);
  }
  return d.toISOString();
}

function PeriodTabs({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="inline-flex bg-muted/60 rounded-full p-1">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`text-[11px] font-semibold px-3 py-1 rounded-full transition ${
            value === p.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function SectionHeader({
  title,
  period,
  onChange,
}: {
  title: string;
  period: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <h2 className="font-display italic text-2xl text-foreground">{title}</h2>
      <PeriodTabs value={period} onChange={onChange} />
    </div>
  );
}

interface ProductRow {
  product_id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  avg_rating: number | null;
  reviews_count: number | null;
  searches?: number;
}

function ProductCard({ p, badge }: { p: ProductRow; badge?: string }) {
  return (
    <Link
      to={`/produtos/${p.product_id}`}
      className="flex-shrink-0 w-40 bg-card rounded-2xl border border-border/50 overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <FlaskIcon />
        )}
      </div>
      <div className="p-3">
        {p.brand && (
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{p.brand}</p>
        )}
        <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug mt-0.5">{p.name}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-[11px] font-semibold text-foreground">
              {p.avg_rating ? Number(p.avg_rating).toFixed(1) : "—"}
            </span>
            <span className="text-[10px] text-muted-foreground">({p.reviews_count ?? 0})</span>
          </div>
          {badge && <span className="text-[10px] text-primary font-semibold">{badge}</span>}
        </div>
      </div>
    </Link>
  );
}

function FlaskIcon() {
  return <div className="w-8 h-8 rounded-full bg-primary/10" />;
}

function Carousel({ children, empty }: { children: React.ReactNode; empty: boolean }) {
  if (empty) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground bg-muted/30 rounded-2xl">
        Sem dados neste período ainda.
      </div>
    );
  }
  return <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4">{children}</div>;
}

function Skeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex-shrink-0 w-40 h-56 rounded-2xl bg-muted/50 animate-pulse" />
      ))}
    </div>
  );
}

function TopSearched() {
  const [period, setPeriod] = useState<Period>("7d");
  const [data, setData] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    supabase
      .rpc("get_top_searched_products", { _since: sinceOf(period), _lim: 12 })
      .then(({ data, error }) => {
        if (cancel) return;
        if (error) console.error(error);
        setData((data as ProductRow[]) ?? []);
        setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [period]);

  return (
    <section>
      <SectionHeader title="Mais pesquisados" period={period} onChange={setPeriod} />
      {loading ? (
        <Skeleton />
      ) : (
        <Carousel empty={data.length === 0}>
          {data.map((p) => (
            <div key={p.product_id} className="snap-start">
              <ProductCard p={p} badge={p.searches ? `${p.searches} buscas` : undefined} />
            </div>
          ))}
        </Carousel>
      )}
    </section>
  );
}

function TopRated() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    supabase
      .rpc("get_top_rated_products", { _since: sinceOf(period), _min_reviews: 2, _lim: 12 })
      .then(({ data, error }) => {
        if (cancel) return;
        if (error) console.error(error);
        setData((data as ProductRow[]) ?? []);
        setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [period]);

  return (
    <section>
      <SectionHeader title="Melhor avaliados" period={period} onChange={setPeriod} />
      {loading ? (
        <Skeleton />
      ) : (
        <Carousel empty={data.length === 0}>
          {data.map((p) => (
            <div key={p.product_id} className="snap-start">
              <ProductCard p={p} />
            </div>
          ))}
        </Carousel>
      )}
    </section>
  );
}

interface UserRow {
  user_id: string;
  display_name: string | null;
  searches: number;
  reviews: number;
  score: number;
}

function TopUsers() {
  const [period, setPeriod] = useState<Period>("30d");
  const [data, setData] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    supabase
      .rpc("get_top_community_users", { _since: sinceOf(period), _lim: 10 })
      .then(({ data, error }) => {
        if (cancel) return;
        if (error) console.error(error);
        setData((data as UserRow[]) ?? []);
        setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [period]);

  return (
    <section>
      <SectionHeader title="Top da comunidade" period={period} onChange={setPeriod} />
      {loading ? (
        <Skeleton />
      ) : data.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground bg-muted/30 rounded-2xl">
          Sem dados neste período ainda.
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4">
          {data.map((u, idx) => {
            const initial = (u.display_name || "?").trim().charAt(0).toUpperCase();
            return (
              <div
                key={u.user_id}
                className="snap-start flex-shrink-0 w-40 bg-card rounded-2xl border border-border/50 p-4 flex flex-col items-center text-center"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif text-xl font-semibold">
                    {initial === "?" ? <User className="w-6 h-6" /> : initial}
                  </div>
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-foreground truncate w-full">
                  {u.display_name || "Anônimo"}
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Search className="w-3 h-3" /> {u.searches}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MessageSquare className="w-3 h-3" /> {u.reviews}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function CommunityRankings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="space-y-6"
    >
      <TopSearched />
      <TopRated />
      <TopUsers />
    </motion.div>
  );
}
