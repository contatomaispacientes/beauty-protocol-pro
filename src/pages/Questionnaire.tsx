import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: string;
  question: string;
  type: "single" | "multiple";
  options: string[];
  conditionalOn?: { questionId: string; answer: string };
}

const allQuestions: Question[] = [
  { id: "skin_type", question: "Qual é o tipo da sua pele?", type: "single", options: ["Oleosa", "Seca", "Mista", "Normal", "Sensível", "Não sei"] },
  { id: "main_concern", question: "Qual sua principal preocupação com a pele?", type: "single", options: ["Acne e espinhas", "Manchas e melasma", "Rugas e linhas finas", "Poros dilatados", "Olheiras", "Desidratação", "Rosácea", "Nenhuma em especial"] },
  { id: "acne_severity", question: "Qual a gravidade da sua acne?", type: "single", options: ["Leve (poucos cravos)", "Moderada (espinhas frequentes)", "Severa (inflamações profundas)"], conditionalOn: { questionId: "main_concern", answer: "Acne e espinhas" } },
  { id: "sun_exposure", question: "Qual seu nível de exposição solar diária?", type: "single", options: ["Baixa (fico em ambientes fechados)", "Moderada (saio eventualmente)", "Alta (trabalho ao ar livre)"] },
  { id: "sunscreen", question: "Você usa protetor solar diariamente?", type: "single", options: ["Sim, todos os dias", "Às vezes", "Raramente", "Nunca"] },
  { id: "current_routine", question: "O que você já usa na sua rotina?", type: "multiple", options: ["Sabonete facial", "Hidratante", "Protetor solar", "Sérum/tratamento", "Esfoliante", "Ácidos", "Nada específico"] },
  { id: "allergies", question: "Você tem alguma alergia ou sensibilidade conhecida?", type: "multiple", options: ["Fragrâncias", "Parabenos", "Álcool", "Ácidos", "Óleos essenciais", "Nenhuma alergia"] },
  { id: "diet_habits", question: "Como você descreveria sua alimentação?", type: "single", options: ["Equilibrada", "Rica em açúcar/gordura", "Vegana/Vegetariana", "Irregular"] },
  { id: "water_intake", question: "Quanto de água você bebe por dia?", type: "single", options: ["Menos de 1 litro", "1 a 2 litros", "Mais de 2 litros"] },
  { id: "sleep_quality", question: "Como é a qualidade do seu sono?", type: "single", options: ["Boa (7-9h por noite)", "Regular (5-7h)", "Ruim (menos de 5h)"] },
];

const Questionnaire = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [completed, setCompleted] = useState(false);

  const visibleQuestions = allQuestions.filter((q) => {
    if (!q.conditionalOn) return true;
    const parentAnswer = answers[q.conditionalOn.questionId];
    return parentAnswer === q.conditionalOn.answer;
  });

  const current = visibleQuestions[currentStep];
  const progress = ((currentStep + 1) / visibleQuestions.length) * 100;

  const handleSingleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  };

  const handleMultipleAnswer = (value: string, checked: boolean) => {
    setAnswers((prev) => {
      const existing = (prev[current.id] as string[]) || [];
      if (checked) return { ...prev, [current.id]: [...existing, value] };
      return { ...prev, [current.id]: existing.filter((v) => v !== value) };
    });
  };

  const canAdvance = current && (answers[current.id] !== undefined && (Array.isArray(answers[current.id]) ? (answers[current.id] as string[]).length > 0 : true));

  const next = () => {
    if (currentStep < visibleQuestions.length - 1) setCurrentStep((s) => s + 1);
    else setCompleted(true);
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  if (completed) {
    return (
      <DashboardLayout title="Questionário">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-16 h-16 rounded-full bg-sage flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-foreground/70" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-3">Perfil dermatológico traçado!</h2>
          <p className="text-muted-foreground mb-8">
            Com base nas suas respostas, criamos seu perfil. Agora faça a análise por IA para resultados ainda mais precisos.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <a href="/skin-analysis">Fazer análise por IA</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/routine">Ver minha rotina</a>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Questionário de Pele">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Pergunta {currentStep + 1} de {visibleQuestions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl">{current.question}</CardTitle>
                <CardDescription>{current.type === "multiple" ? "Selecione todas que se aplicam" : "Selecione uma opção"}</CardDescription>
              </CardHeader>
              <CardContent>
                {current.type === "single" ? (
                  <RadioGroup value={(answers[current.id] as string) || ""} onValueChange={handleSingleAnswer} className="space-y-3">
                    {current.options.map((opt) => (
                      <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[current.id] === opt ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                        <RadioGroupItem value={opt} />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-3">
                    {current.options.map((opt) => {
                      const checked = ((answers[current.id] as string[]) || []).includes(opt);
                      return (
                        <label key={opt} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                          <Checkbox checked={checked} onCheckedChange={(c) => handleMultipleAnswer(opt, !!c)} />
                          <span className="text-sm">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prev} disabled={currentStep === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
          </Button>
          <Button onClick={next} disabled={!canAdvance}>
            {currentStep === visibleQuestions.length - 1 ? "Finalizar" : "Próxima"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Questionnaire;
