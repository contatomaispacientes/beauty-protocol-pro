import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import {
  Users,
  UserPlus,
  Search,
  Star,
  MessageSquare,
  Sparkles,
  Loader2,
  Droplets,
  Target,
  MapPin,
} from "lucide-react";

type Period = "today" | "7d" | "30d" | "90d" | "all";

const PERIODS: { key: Period; label: string }[] = [
  { key: "today", label: "Hoje" },
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "all", label: "Todos" },
];

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(346 45% 55%)",
  "hsl(20 40% 65%)",
  "hsl(160 30% 55%)",
  "hsl(260 35% 60%)",
  "hsl(35 65% 65%)",
  "hsl(200 45% 55%)",
];

function sinceOf(p: Period): string {
  if (p === "all") return "1970-01-01T00:00:00.000Z";
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
    <div className="inline-flex bg-muted/60 rounded-full p-1 flex-wrap">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
            value === p.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

function KpiCard({ title, value, icon: Icon, description }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface ProfileRow {
  user_id: string;
  age: number | null;
  gender: string | null;
  region: string | null;
  created_at: string;
  questionnaire_completed: boolean;
  questionnaire_answers: any;
}

interface ProductAgg {
  product_id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  avg_rating: number | null;
  reviews_count: number | null;
  searches?: number;
}

interface UserAgg {
  user_id: string;
  display_name: string | null;
  searches: number;
  reviews: number;
  score: number;
}

function normalizeLabel(v: any): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ageBucket(age: number | null): string {
  if (!age || age <= 0) return "Não informado";
  if (age < 18) return "< 18";
  if (age < 25) return "18–24";
  if (age < 35) return "25–34";
  if (age < 45) return "35–44";
  if (age < 55) return "45–54";
  return "55+";
}

function countBy<T>(items: T[], get: (i: T) => string | string[] | null | undefined) {
  const map: Record<string, number> = {};
  for (const it of items) {
    const val = get(it);
    if (val == null) continue;
    const arr = Array.isArray(val) ? val : [val];
    for (const raw of arr) {
      const label = normalizeLabel(raw);
      if (!label) continue;
      map[label] = (map[label] || 0) + 1;
    }
  }
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function bucketByDay(dates: string[], since: Date, days: number) {
  const buckets: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }
  for (const iso of dates) {
    const key = new Date(iso).toISOString().slice(0, 10);
    if (key in buckets) buckets[key] += 1;
  }
  return Object.entries(buckets).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    count,
  }));
}

interface Props {
  compact?: boolean;
}

export default function PlatformAnalytics({ compact = false }: Props) {
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [searchDates, setSearchDates] = useState<string[]>([]);
  const [reviewDates, setReviewDates] = useState<string[]>([]);
  const [totals, setTotals] = useState({
    users: 0,
    onboarded: 0,
    products: 0,
    reviews: 0,
    searches: 0,
    chatMessages: 0,
  });

  const [topSearched, setTopSearched] = useState<ProductAgg[]>([]);
  const [topRated, setTopRated] = useState<ProductAgg[]>([]);
  const [topUsers, setTopUsers] = useState<UserAgg[]>([]);

  const since = useMemo(() => sinceOf(period), [period]);

  useEffect(() => {
    let cancel = false;
    setLoading(true);

    (async () => {
      const [
        profilesRes,
        productsCountRes,
        reviewsCountRes,
        searchesCountRes,
        chatCountRes,
        searchesInPeriodRes,
        reviewsInPeriodRes,
        topSearchedRes,
        topRatedRes,
        topUsersRes,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, age, gender, region, created_at, questionnaire_completed, questionnaire_answers"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("product_reviews").select("id", { count: "exact", head: true }),
        supabase.from("product_search_history").select("id", { count: "exact", head: true }),
        supabase.from("chat_messages").select("id", { count: "exact", head: true }),
        supabase
          .from("product_search_history")
          .select("created_at")
          .gte("created_at", since)
          .limit(5000),
        supabase.from("product_reviews").select("created_at").gte("created_at", since).limit(5000),
        supabase.rpc("get_top_searched_products", { _since: since, _lim: 10 }),
        supabase.rpc("get_top_rated_products", { _since: since, _min_reviews: 1, _lim: 10 }),
        supabase.rpc("get_top_community_users", { _since: since, _lim: 10 }),
      ]);

      if (cancel) return;

      const profs = (profilesRes.data ?? []) as ProfileRow[];
      setProfiles(profs);
      setSearchDates((searchesInPeriodRes.data ?? []).map((r: any) => r.created_at));
      setReviewDates((reviewsInPeriodRes.data ?? []).map((r: any) => r.created_at));
      setTotals({
        users: profs.length,
        onboarded: profs.filter((p) => p.questionnaire_completed).length,
        products: productsCountRes.count ?? 0,
        reviews: reviewsCountRes.count ?? 0,
        searches: searchesCountRes.count ?? 0,
        chatMessages: chatCountRes.count ?? 0,
      });
      setTopSearched((topSearchedRes.data as ProductAgg[]) ?? []);
      setTopRated((topRatedRes.data as ProductAgg[]) ?? []);
      setTopUsers((topUsersRes.data as UserAgg[]) ?? []);
      setLoading(false);
    })();

    return () => {
      cancel = true;
    };
  }, [since]);

  // Derived distributions
  const skinTypeData = useMemo(
    () =>
      countBy(profiles, (p) => {
        const st = p.questionnaire_answers?.skin_type;
        if (Array.isArray(st)) return st[0] ?? null;
        return st ?? null;
      }),
    [profiles]
  );

  const sensitivityData = useMemo(
    () => countBy(profiles, (p) => p.questionnaire_answers?.sensitivity ?? null),
    [profiles]
  );

  const goalsData = useMemo(
    () =>
      countBy(profiles, (p) => {
        const g = p.questionnaire_answers?.goals ?? p.questionnaire_answers?.goal;
        return g ?? null;
      }).slice(0, 8),
    [profiles]
  );

  const ageData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of profiles) {
      const b = ageBucket(p.age);
      map[b] = (map[b] || 0) + 1;
    }
    const order = ["< 18", "18–24", "25–34", "35–44", "45–54", "55+", "Não informado"];
    return order.filter((k) => map[k]).map((k) => ({ name: k, value: map[k] }));
  }, [profiles]);

  const genderData = useMemo(
    () => countBy(profiles, (p) => p.gender ?? null),
    [profiles]
  );

  const regionData = useMemo(
    () => countBy(profiles, (p) => p.region ?? null).slice(0, 8),
    [profiles]
  );

  // Time series
  const signupsSeries = useMemo(() => {
    if (period === "all") {
      // group by month across all profiles
      const map: Record<string, number> = {};
      for (const p of profiles) {
        const d = new Date(p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        map[key] = (map[key] || 0) + 1;
      }
      return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, count]) => {
          const [y, m] = k.split("-");
          return {
            date: new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("pt-BR", {
              month: "short",
              year: "2-digit",
            }),
            count,
          };
        });
    }
    const sinceDate = new Date(since);
    const days = Math.max(1, Math.ceil((Date.now() - sinceDate.getTime()) / 86400000));
    return bucketByDay(
      profiles.filter((p) => new Date(p.created_at) >= sinceDate).map((p) => p.created_at),
      sinceDate,
      period === "today" ? 1 : days
    );
  }, [profiles, since, period]);

  const searchesSeries = useMemo(() => {
    if (period === "all") {
      const map: Record<string, number> = {};
      for (const iso of searchDates) {
        const key = iso.slice(0, 7);
        map[key] = (map[key] || 0) + 1;
      }
      return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, count]) => ({ date: k, count }));
    }
    const sinceDate = new Date(since);
    const days = Math.max(1, Math.ceil((Date.now() - sinceDate.getTime()) / 86400000));
    return bucketByDay(searchDates, sinceDate, period === "today" ? 1 : days);
  }, [searchDates, since, period]);

  const reviewsSeries = useMemo(() => {
    if (period === "all") {
      const map: Record<string, number> = {};
      for (const iso of reviewDates) {
        const key = iso.slice(0, 7);
        map[key] = (map[key] || 0) + 1;
      }
      return Object.entries(map)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, count]) => ({ date: k, count }));
    }
    const sinceDate = new Date(since);
    const days = Math.max(1, Math.ceil((Date.now() - sinceDate.getTime()) / 86400000));
    return bucketByDay(reviewDates, sinceDate, period === "today" ? 1 : days);
  }, [reviewDates, since, period]);

  const newUsersInPeriod = useMemo(() => {
    if (period === "all") return profiles.length;
    const sinceDate = new Date(since);
    return profiles.filter((p) => new Date(p.created_at) >= sinceDate).length;
  }, [profiles, since, period]);

  const onboardingPct = totals.users
    ? Math.round((totals.onboarded / totals.users) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Analytics da Plataforma</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Dados agregados de todos os usuários LUZ.
          </p>
        </div>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Usuários" value={totals.users} icon={Users} />
        <KpiCard
          title="Novos no período"
          value={newUsersInPeriod}
          icon={UserPlus}
          description={period === "all" ? "Total geral" : PERIODS.find((p) => p.key === period)?.label}
        />
        <KpiCard title="Produtos no catálogo" value={totals.products} icon={Sparkles} />
        <KpiCard title="Pesquisas totais" value={totals.searches} icon={Search} />
        <KpiCard title="Avaliações totais" value={totals.reviews} icon={Star} />
        <KpiCard
          title="Onboarding"
          value={`${onboardingPct}%`}
          icon={Target}
          description={`${totals.onboarded} de ${totals.users} completaram`}
        />
      </div>

      {/* Time series */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-serif flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Novos cadastros
            </CardTitle>
            <CardDescription>Evolução de novos usuários no período</CardDescription>
          </CardHeader>
          <CardContent>
            {signupsSeries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados no período.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={signupsSeries}>
                  <defs>
                    <linearGradient id="signupsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    fill="url(#signupsGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-serif flex items-center gap-2">
              <Search className="w-4 h-4" /> Pesquisas de produtos
            </CardTitle>
            <CardDescription>Volume diário de análises no período</CardDescription>
          </CardHeader>
          <CardContent>
            {searchesSeries.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sem pesquisas no período.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={searchesSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {compact ? null : (
        <>
          {/* Profile distributions */}
          <div>
            <h3 className="text-lg font-serif font-semibold mb-3 flex items-center gap-2">
              <Droplets className="w-4 h-4" /> Perfil dos usuários
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-serif">Tipo de pele</CardTitle>
                </CardHeader>
                <CardContent>
                  {skinTypeData.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">Sem dados.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={skinTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {skinTypeData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-serif">Sensibilidade</CardTitle>
                </CardHeader>
                <CardContent>
                  {sensitivityData.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">Sem dados.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={sensitivityData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis allowDecimals={false} className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-serif">Faixa etária</CardTitle>
                </CardHeader>
                <CardContent>
                  {ageData.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">Sem dados.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={ageData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis allowDecimals={false} className="text-xs" />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-serif">Gênero</CardTitle>
                </CardHeader>
                <CardContent>
                  {genderData.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">Sem dados.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {genderData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm font-serif flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" /> Principais objetivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {goalsData.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">Sem dados.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={goalsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" allowDecimals={false} className="text-xs" />
                        <YAxis type="category" dataKey="name" width={110} className="text-[10px]" />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm font-serif flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Top regiões
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {regionData.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">Sem dados.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={regionData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" allowDecimals={false} className="text-xs" />
                        <YAxis type="category" dataKey="name" width={140} className="text-[11px]" />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews per day */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-serif flex items-center gap-2">
                <Star className="w-4 h-4" /> Avaliações publicadas
              </CardTitle>
              <CardDescription>Novas avaliações da comunidade no período</CardDescription>
            </CardHeader>
            <CardContent>
              {reviewsSeries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sem avaliações no período.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={reviewsSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis allowDecimals={false} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Rankings */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <Search className="w-4 h-4" /> Top produtos pesquisados
                </CardTitle>
                <CardDescription>Mais analisados pelos usuários no período</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductRankingList items={topSearched} metric="searches" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <Star className="w-4 h-4" /> Top produtos avaliados
                </CardTitle>
                <CardDescription>Melhores notas da comunidade</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductRankingList items={topRated} metric="rating" />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-serif flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Usuários mais ativos
                </CardTitle>
                <CardDescription>Pesquisas + avaliações no período</CardDescription>
              </CardHeader>
              <CardContent>
                {topUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Sem atividade neste período.
                  </p>
                ) : (
                  <div className="divide-y divide-border">
                    {topUsers.map((u, idx) => (
                      <div
                        key={u.user_id}
                        className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {u.display_name || "Usuário sem nome"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {u.searches} pesquisas · {u.reviews} avaliações
                          </p>
                        </div>
                        <div className="text-sm font-bold text-primary">{u.score}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function ProductRankingList({
  items,
  metric,
}: {
  items: ProductAgg[];
  metric: "searches" | "rating";
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Sem dados neste período ainda.
      </p>
    );
  }
  return (
    <div className="divide-y divide-border">
      {items.map((p, idx) => (
        <Link
          key={p.product_id}
          to={`/produtos/${p.product_id}`}
          className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 hover:bg-muted/40 rounded-md -mx-1 px-1 transition"
        >
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {idx + 1}
          </div>
          <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            {p.brand && (
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                {p.brand}
              </p>
            )}
            <p className="text-sm font-medium truncate">{p.name}</p>
          </div>
          <div className="text-right">
            {metric === "searches" ? (
              <div className="text-sm font-bold text-primary">{p.searches ?? 0}</div>
            ) : (
              <div className="flex items-center gap-1 text-sm font-bold text-primary">
                <Star className="w-3 h-3 fill-primary" />
                {p.avg_rating ? Number(p.avg_rating).toFixed(1) : "—"}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground">
              {metric === "searches" ? "buscas" : `${p.reviews_count ?? 0} avaliações`}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
