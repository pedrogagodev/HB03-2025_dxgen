/**
 * Landing Page - DxGen
 * 
 * ARQUITETURA REFATORADA:
 * - Componentes de seção separados em /components/sections
 * - Animações centralizadas em /lib/animations
 * - Dados estáticos definidos no topo do arquivo
 * - Layout limpo e responsivo mobile-first
 * 
 * ANIMAÇÕES APLICADAS:
 * - Navbar: entrada suave, menu mobile animado
 * - Hero: staggered fade-in com blur
 * - Features: cards com stagger e hover scale
 * - Testimonials: cards com hover lift
 * - CTA: entrada com scale
 * - Background: orbs flutuantes, grid pulsante
 */

import {
  Navbar,
  HeroSection,
  ProductMockup,
  FeatureGrid,
  Testimonials,
  CTASection,
  Footer,
} from "@/components/sections";

// ============================================
// DADOS ESTÁTICOS
// ============================================

const NAV_LINKS = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Recursos", href: "#recursos" },
  { label: "CLI", href: "#cli" },
  { label: "Docs", href: "#docs" },
];

const FEATURES = [
  {
    title: "Análise inteligente",
    description:
      "Entende a estrutura do seu código: módulos, dependências, rotas e contratos automaticamente.",
    accent: "emerald" as const,
  },
  {
    title: "Multi-formato",
    description:
      "Gera Markdown, JSON, llms.txt e formatos prontos para RAG e agentes de IA.",
    accent: "sky" as const,
  },
  {
    title: "Incremental",
    description:
      "Atualiza apenas o que mudou. Integra com git hooks e CI/CD sem reprocessar tudo.",
    accent: "violet" as const,
  },
  {
    title: "Extensível",
    description:
      "Plugins e presets para frameworks populares: Next.js, NestJS, FastAPI e mais.",
    accent: "neutral" as const,
  },
];

const MOCKUP_FEATURES = [
  {
    title: "Mapas de serviços",
    description: "Visualize dependências entre serviços, filas e bancos automaticamente.",
    accent: "emerald" as const,
  },
  {
    title: "API & contratos",
    description: "Gere referências de endpoints, schemas e eventos em um só comando.",
    accent: "sky" as const,
  },
  {
    title: "Pronto para IA",
    description: "Estruturas amigáveis para llms.txt, MCP e agentes internos.",
    accent: "neutral" as const,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Finalmente uma ferramenta que entende que documentação é código. O DxGen mudou como nosso time mantém contexto.",
    author: "Tech Lead",
    role: "Engineering",
    company: "Startup Series A",
  },
  {
    quote:
      "Integramos no CI e agora toda PR já vem com docs atualizadas. Zero esforço manual.",
    author: "Staff Engineer",
    role: "Platform",
    company: "Scale-up B2B",
  },
  {
    quote:
      "O output para LLMs é perfeito. Nossos agentes internos finalmente têm contexto real da codebase.",
    author: "AI Engineer",
    role: "ML Platform",
    company: "AI-first Company",
  },
];

// ============================================
// COMPONENTE DE BACKGROUND
// ============================================

function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Grid */}
      <div className="grid-bg" />
      
      {/* Aurora */}
      <div className="aurora-overlay" />
      
      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function Home() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      {/* Background animado */}
      <AnimatedBackground />

      {/* Navbar */}
      <Navbar links={NAV_LINKS} />

      {/* Main content */}
      <main className="relative z-10">
        {/* Container com max-width e padding consistente */}
        <div className="mx-auto max-w-6xl space-y-24 px-4 pb-24 pt-32 sm:px-6 md:space-y-32 md:pt-40 lg:px-8">
          
          {/* Hero Section */}
          <section id="como-funciona">
            <HeroSection
              title="CLI inteligente de documentação"
              titleSuffix="AI Powered"
              subtitle="O DxGen transforma seu repositório em documentação bonita, atualizada e completa. Uma CLI focada em developers, para que o seu time nunca mais se perca entre PRs, serviços e APIs."
            />
          </section>

          {/* Product Mockup */}
          <section id="recursos">
            <ProductMockup
              heading="Quickstart – gerando docs em minutos"
              description="O DxGen lê sua codebase, entende módulos, rotas e contratos, e produz documentação pronta para humanos e LLMs. Sem templates manuais, sem perda de contexto."
              features={MOCKUP_FEATURES}
            />
          </section>

          {/* Features Grid */}
          <FeatureGrid
            badge="Features"
            title="Tudo que você precisa para documentar"
            description="Do init à produção, o DxGen cobre todo o ciclo de vida da documentação técnica."
            features={FEATURES}
            columns={4}
          />

          {/* CLI Section */}
          <section id="cli" className="space-y-6">
            <div className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm md:p-8">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Text */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white md:text-2xl">
                    Pensado como uma CLI de developer experience
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-400">
                    O fluxo do DxGen é inspirado em CLIs que você já usa no dia a dia. 
                    Do init à geração recorrente, o foco é ser previsível, scriptável e 
                    fácil de automatizar em pipelines.
                  </p>
                  <p className="text-sm leading-relaxed text-slate-400">
                    Combine subcomandos, flags e presets para ter um fluxo de documentação 
                    que acompanha a evolução real da sua codebase.
                  </p>
                </div>

                {/* Code example */}
                <div className="rounded-2xl border border-slate-800/50 bg-slate-950/50 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Exemplo de uso</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                      CLI workflow
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-xs text-slate-300">
                    <p><span className="text-slate-500">$</span> npx dxgen init</p>
                    <p><span className="text-slate-500">$</span> npx dxgen generate --from ./services --out ./docs</p>
                    <p><span className="text-slate-500">$</span> npx dxgen watch --on-change "npx dxgen generate"</p>
                  </div>
                  <p className="mt-4 text-[11px] text-slate-500">
                    Pronto para rodar localmente, em CI/CD ou como parte de um fluxo de agentes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Docs Section */}
          <section id="docs" className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl space-y-4">
                <h2 className="text-xl font-bold text-white md:text-2xl">
                  Documentação pronta para humanos e LLMs
                </h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  O output do DxGen é pensado tanto para ser lido por pessoas quanto 
                  para ser consumido por agentes, RAG e ferramentas como llms.txt e MCP.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/50 px-4 py-2 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Docs versionadas junto com o código
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/50 px-4 py-2 text-xs text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Pronto para indexação em RAG
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <Testimonials
            title="Times que levam DX a sério"
            description="Veja o que engenheiros estão dizendo sobre o DxGen."
            testimonials={TESTIMONIALS}
          />

          {/* CTA */}
          <CTASection
            title="Pronto para documentar sua codebase?"
            description="Comece agora com um único comando. Sem configuração complexa, sem vendor lock-in."
            primaryCta={{ label: "npx dxgen init" }}
            secondaryCta={{ label: "Ver documentação" }}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
