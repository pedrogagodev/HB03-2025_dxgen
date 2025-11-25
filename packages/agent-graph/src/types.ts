import type {
  FinalDocKind,
  GenerateRequest,
  GenerateResult,
} from "core-runtime";

export interface DetectedStack {
  language: "ts" | "js" | "py" | "go" | "other";
  framework?: string; // ex: "next", "express", "fastify"
  notes?: string; // descrição livre
}

export interface GraphState {
  request: GenerateRequest;
  stack?: DetectedStack; // resultado da IA
  intent?: FinalDocKind; // decisão de qual agente usar
  result?: GenerateResult; // doc final
}
