import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Camera,
  Sparkles,
  FlaskConical,
  MessageCircle,
  CalendarDays,
  Package,
  ArrowUpRight,
  Sun,
  Moon,
  Check,
  ScanLine,
  Flame,
} from "lucide-react";
import InstallAppButton from "@/components/InstallAppButton";
import { useState } from "react";
import { useRoutineScore } from "@/hooks/useRoutineScore";

const secondaryActions = [
  { title: "Meu Calendário", subtitle: "Check-in diário", icon: CalendarDays, url: "/calendar" },
  { title: "Meu Armário", subtitle: "Seus produtos", icon: Package, url: "/cabinet" },
  { title: "Questionário", subtitle: "Seu perfil", icon: ClipboardList, url: "/questionnaire" },
  { title: "Chat Luz", subtitle: "Tire dúvidas", icon: MessageCircle, url: "/chat" },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

type Period = "AM" | "PM" | "Semanal";

const routineSample: Record<Period, { label: string; sub: string; done: boolean }[]> = {
  AM: [
    { label: "Limpeza Suave", sub: "Gel facial hidratante", done: true },
    { label: "Vitamina C + E", sub: "Antioxidante intensivo", done: false },
    { label: "Protetor Solar FPS 50", sub: "Toque seco", done: false },
  ],
  PM: [
    { label: "Demaquilante", sub: "Óleo micelar", done: false },
    { label: "Ácido Hialurônico", sub: "Hidratação profunda", done: false },
  ],
  Semanal: [
    { label: "Esfoliação Enzimática", sub: "1x por semana", done: false },
    { label: "Máscara Calmante", sub: "2x por semana", done: false },
  ],
};

const Dashboard = () => {
  const { user } = useAuth();
  const name = user?.user_metadata?.name || "bem-vinda";
  const firstName = String(name).split(" ")[0];
  const [period, setPeriod] = useState<Period>("AM");
  const routineScore = useRoutineScore(7);

  const scoreDisplay = routineScore.score ?? 0;
  const dash = 2 * Math.PI * 36;
  const offset = dash - (dash * scoreDisplay) / 100;

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-2"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold tracking-[0.28em] text-muted-foreground uppercase">
                Olá, {firstName}
              </p>
              <h1 className="font-display italic font-medium text-foreground leading-[0.95] text-5xl md:text-6xl">
                Sua pele
                <br />
                hoje.
              </h1>
            </div>
            <InstallAppButton />
          </div>
        </motion.section>

        {/* HERO: Analisar Produto (função principal) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.5 }}
        >
          <Link
            to="/products"
            className="relative block bg-primary text-primary-foreground rounded-[28px] p-7 overflow-hidden shadow-[0_25px_70px_-30px_hsl(var(--primary)/0.7)] group"
          >
            <div className="absolute -top-20 -right-20 w-56 h-56 bg-accent/40 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 opacity-20">
              <ScanLine className="w-full h-full" strokeWidth={0.6} />
            </div>
            <div className="relative z-10 max-w-[75%]">
              <span className="inline-block text-[9px] font-bold uppercase tracking-[0.28em] bg-primary-foreground/15 px-2.5 py-1 rounded-full mb-4">
                Função principal
              </span>
              <h2 className="font-display italic text-4xl leading-[0.95] mb-2">
                Analisar
                <br />
                um produto
              </h2>
              <p className="text-sm text-primary-foreground/80 mb-5 leading-snug">
                Foto ou nome — a IA revela ativos, segurança e se combina com sua pele.
              </p>
              <span className="inline-flex items-center gap-2 bg-primary-foreground text-primary rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider group-hover:gap-3 transition-all">
                <ScanLine className="w-4 h-4" strokeWidth={2} />
                Escanear agora
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Pontuação da Rotina */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-card border border-border rounded-3xl p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Pontuação da rotina
              </span>
              {routineScore.loading ? (
                <div className="mt-2 h-10 w-24 bg-muted animate-pulse rounded" />
              ) : routineScore.score === null ? (
                <>
                  <div className="font-display italic text-3xl text-foreground mt-1">
                    Comece hoje
                  </div>
                  <Link
                    to="/calendar"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-primary mt-2 hover:gap-2 transition-all"
                  >
                    {routineScore.hasRoutine ? "Ativar dias da rotina" : "Criar minha rotina"}
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-display text-5xl leading-none text-foreground">
                      {routineScore.score}
                    </span>
                    <span className="font-display italic text-lg text-muted-foreground">/100</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {routineScore.completed}/{routineScore.expected} passos nos últimos{" "}
                    {routineScore.windowDays} dias
                  </p>
                  {routineScore.streak >= 2 && (
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-accent/25 text-primary rounded-full px-2.5 py-1">
                      <Flame className="w-3 h-3" strokeWidth={2.2} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        {routineScore.streak} dias seguidos
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  className="text-primary"
                  strokeDasharray={dash}
                  initial={{ strokeDashoffset: dash }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary/70" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Consistência gera resultado
            </span>
            <Link
              to="/calendar"
              className="text-[10px] font-semibold text-primary uppercase tracking-widest hover:underline"
            >
              Ver calendário →
            </Link>
          </div>
        </motion.div>

        {/* Routine plan */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display italic text-3xl text-foreground">Plano de Cuidados</h2>
            <Link
              to="/routine"
              className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest hover:text-primary"
            >
              Ver rotina
            </Link>
          </div>

          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
            {(["AM", "PM", "Semanal"] as Period[]).map((p) => {
              const Icon = p === "AM" ? Sun : p === "PM" ? Moon : CalendarDays;
              const active = period === p;
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3 h-3" strokeWidth={2} />
                  {p}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {routineSample[period].map((r) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center p-4 bg-card border border-border/60 rounded-2xl"
              >
                <div className="w-10 h-10 bg-secondary rounded-lg mr-4 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary/60" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground truncate">
                    {r.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{r.sub}</p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    r.done ? "bg-primary border-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {r.done && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Secondary grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3"
        >
          {secondaryActions.map((a) => (
            <motion.div key={a.title} variants={item}>
              <Link
                to={a.url}
                className="group block p-4 bg-secondary/60 rounded-2xl border border-border/40 hover:bg-secondary transition-colors h-full"
              >
                <a.icon className="w-5 h-5 text-primary mb-3" strokeWidth={1.5} />
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-foreground">
                  {a.title}
                </span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">{a.subtitle}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Doctor's tip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="p-6 bg-accent/30 rounded-[28px] border border-accent/40 flex gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-1">
              Dica da Dra. Luz
            </p>
            <p className="font-display italic text-base text-foreground leading-snug">
              "Mais produtos não significam melhores resultados. Consistência sempre vence
              quantidade."
            </p>
          </div>
        </motion.div>

        <p className="text-[10px] text-muted-foreground text-center px-6 pb-4">
          Esta plataforma não substitui consulta dermatológica profissional. Sempre consulte um
          dermatologista para diagnósticos e tratamentos.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
