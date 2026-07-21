import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarIcon,
  Mail,
  Loader2,
  Camera,
  Bell,
  MapPin,
  Check,
  Sparkles,
  Droplet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import productScan from "@/assets/product-scan.png";

// ============= Types =============

interface OnboardingData {
  name: string;
  birthDate?: string; // ISO
  gender?: string;
  skin_type?: string;
  sensitivity?: string;
  concerns: string[];
  goals: string[];
  timeframe?: string;
  current_routine: string[];
  budget?: string;
  frequency?: string;
  email?: string;
}

const DRAFT_KEY = "luz.onboarding.draft";
const TOTAL_STEPS = 12;

const defaultData: OnboardingData = {
  name: "",
  concerns: [],
  goals: [],
  current_routine: [],
};

function loadDraft(): OnboardingData {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return { ...defaultData, ...JSON.parse(raw) };
  } catch {}
  return defaultData;
}

function computeSkinScore(d: OnboardingData): number {
  let s = 60;
  if (d.current_routine.includes("Protetor solar")) s += 10;
  if (d.current_routine.includes("Hidratante")) s += 8;
  if (d.current_routine.includes("Limpeza")) s += 5;
  if (d.current_routine.includes("Sérum")) s += 4;
  if (d.sensitivity === "Baixa") s += 3;
  if (d.concerns.includes("Nenhuma em especial")) s += 5;
  return Math.min(95, s);
}

// ============= Shared primitives =============

function Shell({
  step,
  onBack,
  showBack = true,
  children,
  footer,
}: {
  step: number;
  onBack?: () => void;
  showBack?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const progress = (step / TOTAL_STEPS) * 100;
  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 1rem)",
        paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
      }}
    >
      <div className="w-full max-w-sm mx-auto px-6 flex-1 flex flex-col">
        {step > 1 && (
          <header className="flex items-center gap-3 py-3">
            {showBack && onBack ? (
              <button
                onClick={onBack}
                className="w-8 h-8 -ml-2 flex items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8" />
            )}
            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </header>
        )}

        <AnimatePresence mode="wait">
          <motion.main
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col pt-4"
          >
            {children}
          </motion.main>
        </AnimatePresence>

        {footer && <div className="pt-4 pb-2 sticky bottom-0 bg-background">{footer}</div>}
      </div>
    </div>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl leading-tight text-foreground">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-card text-foreground border-border hover:border-primary/40",
        className,
      )}
    >
      {children}
    </button>
  );
}

function OptionCard({
  active,
  onClick,
  icon,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-2xl border transition-all",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-card text-foreground border-border hover:border-primary/40",
      )}
    >
      {icon && (
        <div className={cn("w-6 h-6", active ? "opacity-100" : "opacity-70")}>{icon}</div>
      )}
      <span className="text-sm font-medium">{title}</span>
      {hint && (
        <span className={cn("text-[10px]", active ? "opacity-90" : "text-muted-foreground")}>
          {hint}
        </span>
      )}
    </button>
  );
}

function CheckRow({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 py-3 px-4 rounded-xl border transition-colors text-left",
        active ? "border-primary bg-primary/5" : "border-border bg-card",
      )}
    >
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="flex-1 text-sm text-foreground">{label}</span>
      <span
        className={cn(
          "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
          active ? "bg-primary border-primary" : "border-border",
        )}
      >
        {active && <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />}
      </span>
    </button>
  );
}

function PrimaryButton({
  children,
  disabled,
  loading,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full h-12 text-base font-medium rounded-xl"
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </Button>
  );
}

// ============= The wizard =============

export default function OnboardingFlow() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const initialStep = Math.max(1, Math.min(TOTAL_STEPS, Number(params.get("step") || 1)));
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<OnboardingData>(loadDraft);
  const [emailMode, setEmailMode] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Persist draft
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {}
  }, [data]);

  // If already logged in and starting fresh, skip auth steps
  useEffect(() => {
    if (user && step < 3) setStep(3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Sync step in URL
  useEffect(() => {
    setParams({ step: String(step) }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const update = (patch: Partial<OnboardingData>) => setData((d) => ({ ...d, ...patch }));

  const next = () => setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  // ============= Actions =============

  const submitEmailSignup = async () => {
    if (!data.email || !password) return;
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Senha muito curta", description: "Mínimo 8 caracteres." });
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password,
      options: {
        data: { name: data.name || data.email.split("@")[0], account_type: "consumer" },
        emailRedirectTo: `${window.location.origin}/onboarding?step=3`,
      },
    });
    setBusy(false);
    if (error) {
      toast({ variant: "destructive", title: "Erro ao criar conta", description: error.message });
      return;
    }
    toast({ title: "Conta criada!", description: "Continuando sua jornada..." });
    next();
  };

  const finish = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Sessão expirada", description: "Faça login novamente." });
      navigate("/login");
      return;
    }
    setBusy(true);
    const age = data.birthDate
      ? Math.floor((Date.now() - new Date(data.birthDate).getTime()) / 3.15576e10)
      : null;
    const answers = {
      skin_type: data.skin_type ? [data.skin_type] : [],
      sensitivity: data.sensitivity ? [data.sensitivity] : [],
      main_concern: data.concerns,
      goals: data.goals,
      timeframe: data.timeframe ? [data.timeframe] : [],
      current_routine: data.current_routine,
      budget: data.budget ? [data.budget] : [],
      frequency: data.frequency ? [data.frequency] : [],
      initial_skin_score: computeSkinScore(data),
    };
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: data.name || undefined,
        age: age && age > 0 ? age : undefined,
        gender: data.gender || undefined,
        questionnaire_completed: true,
        questionnaire_answers: answers,
      })
      .eq("user_id", user.id);
    setBusy(false);
    if (error) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: error.message });
      return;
    }
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    navigate("/dashboard");
  };

  const requestPermissions = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {}
    }
    next();
  };

  // ============= Screens =============

  const skinScore = useMemo(() => computeSkinScore(data), [data]);

  // 1 — Boas-vindas
  if (step === 1) {
    return (
      <Shell step={1} showBack={false}>
        <div className="flex-1 flex flex-col justify-center items-center text-center py-8">
          <div className="mb-16">
            <p className="font-display text-4xl tracking-wide text-primary">LUZ</p>
            <p className="text-[10px] tracking-[0.4em] text-muted-foreground mt-1">SKIN</p>
          </div>
          <Sparkles className="w-6 h-6 text-primary mb-8" strokeWidth={1.5} />
          <h1 className="font-display text-4xl leading-tight text-foreground">
            Decisões
            <br />
            mais inteligentes
            <br />
            para uma pele
            <br />
            mais saudável.
          </h1>
          <p className="text-sm text-muted-foreground mt-6 max-w-xs">
            Analise produtos, descubra o que realmente funciona para você e acompanhe sua jornada.
          </p>
        </div>
        <div className="pb-2 space-y-3">
          <PrimaryButton onClick={next}>Começar</PrimaryButton>
          <p className="text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </Shell>
    );
  }

  // 2 — Criar conta
  if (step === 2) {
    return (
      <Shell step={2} onBack={back}>
        <div className="flex-1 flex flex-col justify-center pt-6">
          <h1 className="font-display text-3xl text-center text-foreground">Vamos começar!</h1>
          <p className="text-sm text-muted-foreground text-center mt-2 mb-8">
            Crie sua conta para ter uma experiência personalizada.
          </p>

          {!emailMode ? (
            <div className="space-y-3">
              <button
                onClick={() =>
                  toast({ title: "Em breve", description: "Login com Google chegará em breve." })
                }
                className="w-full h-12 rounded-xl border border-border bg-card flex items-center justify-center gap-3 text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
              >
                <GoogleIcon />
                Continuar com Google
              </button>
              <button
                onClick={() => setEmailMode(true)}
                className="w-full h-12 rounded-xl border border-border bg-card flex items-center justify-center gap-3 text-sm font-medium text-foreground hover:border-primary/40 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Continuar com e-mail
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                type="email"
                inputMode="email"
                placeholder="seu@email.com"
                value={data.email || ""}
                onChange={(e) => update({ email: e.target.value })}
                className="h-12"
              />
              <Input
                type="password"
                placeholder="Senha (mín. 8 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
              />
              <PrimaryButton
                onClick={submitEmailSignup}
                loading={busy}
                disabled={!data.email || !password}
              >
                Criar conta
              </PrimaryButton>
              <button
                onClick={() => setEmailMode(false)}
                className="w-full text-xs text-muted-foreground"
              >
                Voltar
              </button>
            </div>
          )}

          <p className="text-[11px] text-center text-muted-foreground mt-8">
            Ao continuar, você concorda com os Termos de Uso e Política de Privacidade.
          </p>
        </div>
      </Shell>
    );
  }

  // 3 — Sobre você
  if (step === 3) {
    const canAdvance = !!data.name && !!data.gender;
    return (
      <Shell step={3} onBack={back} footer={<PrimaryButton onClick={next} disabled={!canAdvance}>Continuar</PrimaryButton>}>
        <Heading title="Para personalizar sua experiência, precisamos te conhecer." />

        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-foreground">Qual seu nome?</label>
            <Input
              value={data.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Seu nome"
              className="h-12 mt-2"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Qual sua data de nascimento?</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 mt-2 justify-start text-left font-normal rounded-md",
                    !data.birthDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {data.birthDate
                    ? format(new Date(data.birthDate), "dd/MM/yyyy", { locale: ptBR })
                    : "dd/mm/aaaa"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={data.birthDate ? new Date(data.birthDate) : undefined}
                  onSelect={(d) => update({ birthDate: d?.toISOString() })}
                  defaultMonth={data.birthDate ? new Date(data.birthDate) : new Date(1995, 0)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Qual seu gênero?</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {["Feminino", "Masculino", "Prefiro não dizer"].map((g) => (
                <Pill key={g} active={data.gender === g} onClick={() => update({ gender: g })}>
                  {g}
                </Pill>
              ))}
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // 4 — Sua pele
  if (step === 4) {
    const canAdvance = !!data.skin_type && !!data.sensitivity;
    const concerns = ["Acne", "Manchas", "Oleosidade", "Sensibilidade", "Rugas", "Poros", "Ressecamento", "Vermelhidão"];
    return (
      <Shell step={4} onBack={back} footer={<PrimaryButton onClick={next} disabled={!canAdvance}>Continuar</PrimaryButton>}>
        <Heading title="Como é a sua pele?" subtitle="Selecione as características que mais se aplicam a você." />

        <div className="mb-6">
          <p className="text-xs font-semibold text-foreground mb-2">Tipo de pele</p>
          <div className="grid grid-cols-4 gap-2">
            {["Oleosa", "Seca", "Mista", "Normal"].map((t) => (
              <OptionCard
                key={t}
                active={data.skin_type === t}
                onClick={() => update({ skin_type: t })}
                icon={<Droplet className="w-full h-full" strokeWidth={1.5} />}
                title={t}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-foreground mb-2">Sensibilidade</p>
          <div className="grid grid-cols-3 gap-2">
            {["Baixa", "Moderada", "Alta"].map((s) => (
              <Pill key={s} active={data.sensitivity === s} onClick={() => update({ sensitivity: s })}>
                {s}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-foreground mb-2">Principais preocupações</p>
          <div className="flex flex-wrap gap-2">
            {concerns.map((c) => {
              const active = data.concerns.includes(c);
              return (
                <Pill
                  key={c}
                  active={active}
                  onClick={() =>
                    update({
                      concerns: active
                        ? data.concerns.filter((x) => x !== c)
                        : [...data.concerns, c],
                    })
                  }
                >
                  {c}
                </Pill>
              );
            })}
          </div>
        </div>
      </Shell>
    );
  }

  // 5 — Objetivos
  if (step === 5) {
    const options = [
      "Controlar acne",
      "Clarear manchas",
      "Reduzir oleosidade",
      "Melhorar textura e poros",
      "Prevenir envelhecimento",
      "Hidratar e fortalecer a pele",
    ];
    const canAdvance = data.goals.length > 0 && !!data.timeframe;
    return (
      <Shell step={5} onBack={back} footer={<PrimaryButton onClick={next} disabled={!canAdvance}>Continuar</PrimaryButton>}>
        <Heading title="Quais são seus principais objetivos?" subtitle="Você pode escolher mais de um." />
        <div className="space-y-2 mb-6">
          {options.map((o) => {
            const active = data.goals.includes(o);
            return (
              <CheckRow
                key={o}
                active={active}
                onClick={() =>
                  update({
                    goals: active ? data.goals.filter((x) => x !== o) : [...data.goals, o],
                  })
                }
                label={o}
              />
            );
          })}
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">Qual seu prazo?</p>
          <div className="grid grid-cols-1 gap-2">
            {["Curto prazo (até 3 meses)", "Médio prazo (3 a 6 meses)", "Longo prazo (mais de 6 meses)"].map((t) => (
              <Pill key={t} active={data.timeframe === t} onClick={() => update({ timeframe: t })}>
                {t}
              </Pill>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  // 6 — Rotina atual
  if (step === 6) {
    const options = ["Limpeza", "Tônico", "Sérum", "Hidratante", "Protetor solar", "Tratamento", "Óleo facial", "Nenhum / Estou começando"];
    return (
      <Shell step={6} onBack={back} footer={<PrimaryButton onClick={next}>Continuar</PrimaryButton>}>
        <Heading title="Como está sua rotina atualmente?" subtitle="Selecione os produtos que você usa com frequência." />
        <div className="space-y-2">
          {options.map((o) => {
            const active = data.current_routine.includes(o);
            return (
              <CheckRow
                key={o}
                active={active}
                onClick={() =>
                  update({
                    current_routine: active
                      ? data.current_routine.filter((x) => x !== o)
                      : [...data.current_routine, o],
                  })
                }
                label={o}
                icon={<Droplet className="w-4 h-4" strokeWidth={1.5} />}
              />
            );
          })}
        </div>
      </Shell>
    );
  }

  // 7 — Preferências
  if (step === 7) {
    const canAdvance = !!data.budget && !!data.frequency;
    return (
      <Shell step={7} onBack={back} footer={<PrimaryButton onClick={next} disabled={!canAdvance}>Continuar</PrimaryButton>}>
        <Heading title="Quase lá! Algumas preferências finais." />
        <div className="mb-6">
          <p className="text-xs font-semibold text-foreground mb-2">Qual sua faixa de investimento em skincare?</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "Econômico", hint: "Até R$150" },
              { key: "Intermediário", hint: "R$150 – R$400" },
              { key: "Premium", hint: "Acima de R$400" },
            ].map((b) => (
              <OptionCard
                key={b.key}
                active={data.budget === b.key}
                onClick={() => update({ budget: b.key })}
                title={b.key}
                hint={b.hint}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">Com que frequência pretende usar o app?</p>
          <div className="space-y-2">
            {["Todos os dias", "Algumas vezes na semana", "Quando for comprar"].map((f) => (
              <Pill
                key={f}
                active={data.frequency === f}
                onClick={() => update({ frequency: f })}
                className="w-full"
              >
                {f}
              </Pill>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  // 8 — Permissões
  if (step === 8) {
    return (
      <Shell step={8} onBack={back} footer={<PrimaryButton onClick={requestPermissions}>Autorizar e continuar</PrimaryButton>}>
        <Heading title="Para te ajudar ainda mais, precisamos de algumas permissões." />
        <div className="space-y-3">
          {[
            { icon: Camera, title: "Câmera", desc: "Para escanear produtos e ingredientes." },
            { icon: Bell, title: "Notificações", desc: "Para te lembrar da rotina, novidades e dicas." },
            { icon: MapPin, title: "Localização (opcional)", desc: "Para mostrar produtos disponíveis perto de você e promoções." },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <Check className="w-5 h-5 text-primary" />
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  // 9-11 — Tour
  if (step === 9 || step === 10 || step === 11) {
    const idx = step - 9;
    const tourContent = [
      {
        title: "Escaneie produtos",
        desc: "Aponte a câmera para o código de barras ou ingredientes e receba uma análise completa.",
        visual: (
          <div className="w-full aspect-square rounded-2xl bg-secondary/40 overflow-hidden flex items-center justify-center">
            <img src={productScan} alt="Escanear produto" className="w-full h-full object-cover" />
          </div>
        ),
        heading: "1. Escaneie produtos",
      },
      {
        title: "Receba análise personalizada",
        desc: "Nossa IA avalia ativos, segurança e compatibilidade com sua pele e seus objetivos.",
        visual: <CompatibilityRing />,
        heading: "2. Receba análise personalizada",
      },
      {
        title: "Acompanhe sua evolução",
        desc: "Monitore sua pele, rotina e resultados ao longo do tempo.",
        visual: <ProgressChart />,
        heading: "3. Acompanhe sua evolução",
      },
    ][idx];

    return (
      <Shell step={step} onBack={back} footer={<PrimaryButton onClick={next}>Próximo</PrimaryButton>}>
        <h1 className="font-display text-3xl leading-tight text-foreground mb-6">
          Conheça o que você pode fazer na LUZ.
        </h1>
        {tourContent.visual}
        <div className="mt-6 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <p className="text-sm font-semibold text-foreground">{tourContent.heading}</p>
          </div>
          <p className="text-sm text-muted-foreground">{tourContent.desc}</p>
        </div>
        <div className="flex justify-center gap-1.5 mb-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === idx ? "w-5 bg-primary" : "w-1.5 bg-muted",
              )}
            />
          ))}
        </div>
      </Shell>
    );
  }

  // 12 — Pronto
  return (
    <Shell step={12} onBack={back} showBack={false} footer={<PrimaryButton onClick={finish} loading={busy}>Ir para meu dashboard</PrimaryButton>}>
      <div className="text-center pt-4">
        <h1 className="font-display text-3xl text-foreground">
          Tudo pronto, {data.name || "você"}!{" "}
          <Sparkles className="inline w-6 h-6 text-primary" />
        </h1>
        <p className="text-sm text-muted-foreground mt-2">Sua jornada com a LUZ começa agora.</p>
      </div>

      <div className="mt-8 p-6 rounded-2xl bg-card border border-border text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
          Seu Skin Score inicial
        </p>
        <SkinScoreRing score={skinScore} />
        <p className="font-display text-xl text-foreground mt-4">
          {skinScore >= 85 ? "Excelente!" : skinScore >= 70 ? "Muito bom!" : "Vamos evoluir juntas!"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Vamos juntas evoluir ainda mais.</p>
      </div>

      <div className="mt-6 space-y-3">
        {[
          "Recomendações personalizadas",
          "Análises inteligentes",
          "Acompanhamento diário",
        ].map((f) => (
          <div key={f} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
            </div>
            <p className="text-sm text-foreground">{f}</p>
          </div>
        ))}
      </div>
    </Shell>
  );
}

// ============= Small SVG visuals =============

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function CompatibilityRing() {
  const pct = 96;
  const r = 60;
  const c = 2 * Math.PI * r;
  return (
    <div className="w-full aspect-square rounded-2xl bg-card border border-border flex flex-col items-center justify-center">
      <p className="text-xs text-muted-foreground mb-3">Compatibilidade para você</p>
      <div className="relative">
        <svg width="160" height="90" viewBox="0 0 160 90">
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <motion.path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={c / 2}
            initial={{ strokeDashoffset: c / 2 }}
            animate={{ strokeDashoffset: (c / 2) * (1 - pct / 100) }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <p className="absolute inset-0 flex items-end justify-center pb-1 font-display text-3xl text-foreground">
          {pct}%
        </p>
      </div>
      <p className="text-xs font-semibold text-primary mt-2">Excelente para você</p>
    </div>
  );
}

function ProgressChart() {
  const points = [
    [10, 70],
    [40, 60],
    [70, 55],
    [100, 45],
    [130, 30],
    [160, 20],
  ];
  const d = points.map((p, i) => (i === 0 ? `M${p[0]} ${p[1]}` : `L${p[0]} ${p[1]}`)).join(" ");
  return (
    <div className="w-full aspect-square rounded-2xl bg-card border border-border flex flex-col items-center justify-center p-4">
      <p className="text-xs text-muted-foreground mb-2">Seu progresso</p>
      <p className="font-display text-4xl text-primary mb-3">+28%</p>
      <svg viewBox="0 0 180 90" className="w-full">
        <motion.path
          d={d}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="hsl(var(--primary))" />
        ))}
      </svg>
      <p className="text-xs text-muted-foreground mt-2">de melhora geral</p>
    </div>
  );
}

function SkinScoreRing({ score }: { score: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          transform="rotate(-90 64 64)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-4xl text-foreground leading-none">{score}</p>
        <p className="text-[10px] text-muted-foreground mt-1">/100</p>
      </div>
    </div>
  );
}
