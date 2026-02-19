import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const seasons = {
  Primavera: { colors: ["#F4A460", "#FFB6C1", "#FFDAB9", "#FF6347", "#FFD700", "#FAFAD2", "#98FB98", "#87CEEB"], description: "Tons quentes e vibrantes que refletem a energia e frescor da estação." },
  Verão: { colors: ["#B0C4DE", "#DDA0DD", "#C0C0C0", "#778899", "#ADD8E6", "#E6E6FA", "#F0E68C", "#FFDEAD"], description: "Tons frios e suaves, com nuances delicadas e elegantes." },
  Outono: { colors: ["#8B4513", "#D2691E", "#CD853F", "#B8860B", "#556B2F", "#8B0000", "#DAA520", "#A0522D"], description: "Tons terrosos e profundos, ricos e acolhedores." },
  Inverno: { colors: ["#000080", "#800020", "#2F4F4F", "#4B0082", "#C0C0C0", "#FFFFFF", "#DC143C", "#191970"], description: "Tons intensos e contrastantes, dramáticos e sofisticados." },
};

const makeupRecommendations = [
  { category: "Base", recommendation: "Tom médio com subtom quente dourado" },
  { category: "Corretivo", recommendation: "Meio tom mais claro que a base, subtom pêssego" },
  { category: "Blush", recommendation: "Pêssego ou coral suave" },
  { category: "Batom", recommendation: "Nude rosado ou terracota" },
  { category: "Sombra", recommendation: "Tons terrosos: bronze, cobre, marrom quente" },
  { category: "Contorno", recommendation: "Marrom médio com subtom quente" },
];

const Colorimetry = () => {
  const userSeason = "Outono"; // placeholder
  const season = seasons[userSeason];

  return (
    <DashboardLayout title="Colorimetria">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Sua Estação: {userSeason}</CardTitle>
            <CardDescription>{season.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {season.colors.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-lg shadow-sm border border-border" style={{ backgroundColor: color }} />
                  <span className="text-xs text-muted-foreground">{color}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Paleta Completa por Estação</CardTitle>
            <CardDescription>Veja todas as estações e compare</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(seasons).map(([name, s]) => (
              <div key={name}>
                <p className={`font-medium text-sm mb-2 ${name === userSeason ? "text-primary" : "text-foreground"}`}>
                  {name} {name === userSeason && "⭐"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {s.colors.map((color, i) => (
                    <div key={i} className="w-10 h-10 rounded-md shadow-sm border border-border" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Recomendações de Maquiagem</CardTitle>
            <CardDescription>Com base na sua estação e tom de pele</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {makeupRecommendations.map((item) => (
                <div key={item.category} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground font-medium">{item.category}</p>
                  <p className="text-sm font-medium mt-1">{item.recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Colorimetry;
