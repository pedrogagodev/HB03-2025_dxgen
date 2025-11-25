export type WizardDocType =
  | "auto"
  | "readme"
  | "repoSummary"
  | "architectureDiagram"
  | "apiDocs";

export type DocStyle = "onboarding" | "technical" | "mixed";

export interface WizardAnswers {
  /**
   * Diretório base onde os arquivos gerados devem ser escritos.
   * Geralmente relativo ao root do projeto (ex.: ".", "docs", "docs/generated").
   */
  outputDir: string;

  /**
   * Tipo de documentação desejada.
   * Quando "auto", o grafo/IA decide com base no contexto.
   */
  docType: WizardDocType;

  /**
   * Estilo de documentação desejado.
   * Ex.: onboarding para novos devs, mais técnica, etc.
   */
  docStyle: DocStyle;
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

export type FinalDocKind =
  | "readme"
  | "repoSummary"
  | "architectureDiagram"
  | "apiDocs";

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
