import type { GenerateRequest, GenerateResult } from "core-runtime";
import { createGenerateGraph } from "./graph";

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
