// @ts-nocheck

import { StateGraph } from "@langchain/langgraph";
import { runApiDocsAgent } from "agents-api-docs";
import { runDiagramsAgent } from "agents-diagrams";
import { runReadmeAgent } from "agents-readme";
import type {
  FinalDocKind,
  GenerateRequest,
  GenerateResult,
  WizardFeature,
} from "core-runtime";
import { detectStack } from "core-runtime";
import { classifyIntentWithLLM } from "./chains/intentClassifier.chain";
import type { GraphState } from "./types";

async function detectStackNode(state: GraphState): Promise<GraphState> {
  try {
    const stack = await detectStack(state.request.project);
    return {
      ...state,
      stack,
    };
  } catch {
    // Em caso de erro de IO ou parsing, seguimos sem stack detectada.
    return state;
  }
}

async function intentClassifierNode(state: GraphState): Promise<GraphState> {
  const features = state.request.wizard.features;

  // Caso trivial: apenas uma feature selecionada.
  if (features.length === 1) {
    return { ...state, intent: features[0] as FinalDocKind };
  }

  // Se não houver API key configurada, fazemos um fallback simples.
  if (!process.env.OPENAI_API_KEY) {
    const fallback = (features[0] as FinalDocKind) ?? "readme";
    return { ...state, intent: fallback };
  }

  // Usa LangChain para decidir a intenção prioritária.
  let intent: FinalDocKind;
  try {
    intent = await classifyIntentWithLLM(
      features as WizardFeature[],
      state.request.wizard.style,
    );
  } catch {
    intent = (features[0] as FinalDocKind) ?? "readme";
  }

  return { ...state, intent };
}

function buildStubResult(kind: FinalDocKind, state: GraphState) {
  const base = state.request.wizard;

  const suggestedPath =
    kind === "readme"
      ? "README.md"
      : kind === "api-docs"
        ? "docs/api.md"
        : kind === "diagram"
          ? "docs/architecture-diagram.md"
          : "docs/repository-summary.md";

  return {
    kind,
    content: `# DXGen (stub)\n\nTipo: ${kind}\n\nEstilo: ${base.style}\n\nOutput dir: ${base.outputDir}`,
    suggestedPath,
  };
}

async function readmeAgentNode(state: GraphState): Promise<GraphState> {
  const result = await runReadmeAgent({
    request: state.request,
    stack: state.stack,
  });
  return { ...state, result };
}

async function apiDocsAgentNode(state: GraphState): Promise<GraphState> {
  const result = await runApiDocsAgent({
    request: state.request,
    stack: state.stack,
  });
  return { ...state, result };
}

async function diagramAgentNode(state: GraphState): Promise<GraphState> {
  const result = await runDiagramsAgent({
    request: state.request,
    stack: state.stack,
  });
  return { ...state, result };
}

async function summaryAgentNode(state: GraphState): Promise<GraphState> {
  // Ainda não temos um agents-summary, então mantemos um stub interno.
  const result = buildStubResult("summary", state);
  return { ...state, result };
}

export function createGenerateGraph() {
  const builder = new StateGraph<GraphState, string>({
    channels: {
      request: null,
      stack: null,
      intent: null,
      result: null,
    },
  });

  builder.addNode("detectStack", detectStackNode);
  builder.addNode("intentClassifier", intentClassifierNode);
  builder.addNode("readmeAgent", readmeAgentNode);
  builder.addNode("apiDocsAgent", apiDocsAgentNode);
  builder.addNode("diagramAgent", diagramAgentNode);
  builder.addNode("summaryAgent", summaryAgentNode);

  builder.addEdge("__start__", "detectStack");
  builder.addEdge("detectStack", "intentClassifier");

  builder.addConditionalEdges(
    "intentClassifier",
    (state) => state.intent ?? "readme",
    {
      readme: "readmeAgent",
      "api-docs": "apiDocsAgent",
      diagram: "diagramAgent",
      summary: "summaryAgent",
    },
  );

  builder.addEdge("readmeAgent", "__end__");
  builder.addEdge("apiDocsAgent", "__end__");
  builder.addEdge("diagramAgent", "__end__");
  builder.addEdge("summaryAgent", "__end__");

  return builder.compile();
}

const app = createGenerateGraph();

export async function runGenerateGraph(
  request: GenerateRequest,
): Promise<GenerateResult> {
  const finalState = (await (app as any).invoke({
    request,
  })) as { result?: GenerateResult };

  if (!finalState.result) {
    throw new Error("Graph finished without a result");
  }

  return finalState.result;
}
