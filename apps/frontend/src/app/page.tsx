import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { ProductMockup } from "@/components/ProductMockup";

const NAV_LINKS = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Recursos", href: "#recursos" },
  { label: "CLI", href: "#cli" },
  { label: "Docs", href: "#docs" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-slate-100">
      <div className="starfield" />
      <div className="aurora-overlay" />

      <Navbar
        links={NAV_LINKS}
        primaryCtaLabel="Começar grátis"
        secondaryCtaLabel="Entrar"
      />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pb-32 pt-32 md:pt-36">
        <HeroSection
          title="CLI inteligente de documentação"
          titleSuffix="AI Powered"
          subtitle="O DxGen transforma seu repositório em documentação bonita, atualizada e completa. Uma CLI focada em developers, para que o seu time nunca mais se perca entre PRs, serviços e APIs."
        />

        <ProductMockup
          heading="Quickstart – gerando docs em minutos"
          description="O DxGen lê sua codebase, entende módulos, rotas e contratos, e produz documentação pronta para humanos e LLMs. Sem templates manuais, sem perda de contexto."
          features={[
            {
              title: "Mapas de serviços",
              description:
                "Visualize dependências entre serviços, filas e bancos automaticamente.",
              accent: "emerald",
            },
            {
              title: "API & contratos",
              description:
                "Gere referências de endpoints, schemas e eventos em um só comando.",
              accent: "sky",
            },
            {
              title: "Pronto para IA",
              description:
                "Estruturas amigáveis para llms.txt, MCP e agentes internos.",
              accent: "neutral",
            },
          ]}
        />
      </main>
    </div>
  );
}
