export type WizardFeature = "readme" | "api-docs" | "diagram" | "summary";

/**
 * Estilo desejado da documentação.
 * No CLI atual esse valor vem como texto livre (ex.: "onboarding", "técnica"),
 * então mantemos como string para máxima flexibilidade.
 */
export type DocStyle = string;

export interface WizardAnswers {
  /**
   * Diretório base onde os arquivos gerados devem ser escritos.
   * Geralmente relativo ao root do projeto (ex.: ".", "docs", "docs/generated").
   */
  outputDir: string;

  /**
   * Se o usuário deseja sincronizar o projeto com o Pinecone.
   */
  sync: boolean;

  /**
   * Quais tipos de documentação o usuário deseja gerar.
   * Mapeia diretamente as escolhas do wizard de CLI.
   */
  feature: WizardFeature;

  /**
   * Texto livre descrevendo o estilo desejado para a documentação.
   * Ex.: "onboarding para novos devs", "documentação técnica", etc.
   */
  style: DocStyle;
}

export interface ProjectMetadata {
  /**
   * Caminho absoluto (ou relativo ao processo atual) da raiz do projeto.
   * Usado pelo Core Runtime para leitura de arquivos, AST, etc.
   */
  rootPath: string;

  /**
   * Campo de extensão futura para informações adicionais detectadas
   * (stack, rotas, ORM, etc.). Mantido opcional para não travar o contrato.
   */
  extra?: Record<string, unknown>;
}

export interface GenerateRequest {
  /**
   * Respostas do wizard de CLI.
   */
  wizard: WizardAnswers;

  /**
   * Metadados básicos do projeto, controlados pelo CLI/Core Runtime.
   */
  project: ProjectMetadata;
}

export type FinalDocKind = "readme" | "api-docs" | "diagram" | "summary";

export interface GenerateResult {
  /**
   * Tipo de documentação que foi de fato gerada.
   */
  kind: FinalDocKind;

  /**
   * Conteúdo textual completo da documentação gerada.
   */
  content: string;

  /**
   * Caminho sugerido (relativo a `project.rootPath` ou a `wizard.outputDir`)
   * onde essa documentação deve ser salva.
   * Ex.: "README.md", "docs/api.md", "docs/architecture.md".
   */
  suggestedPath: string;
}

export interface DetectedStack {
  language: "ts" | "js" | "py" | "go" | "other";
  framework?: string;
  notes?: string;
}
