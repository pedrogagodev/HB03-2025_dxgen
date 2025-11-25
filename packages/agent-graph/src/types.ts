import type {
  DetectedStack,
  FinalDocKind,
  GenerateRequest,
  GenerateResult,
} from "core-runtime";

export interface GraphState {
  request: GenerateRequest;
  stack?: DetectedStack; // resultado da IA
  intent?: FinalDocKind; // decisão de qual agente usar
  result?: GenerateResult; // doc final
}
