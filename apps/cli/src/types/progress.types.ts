export type StageStatus = "pending" | "in_progress" | "completed" | "failed";

export interface Stage {
  id: string;
  label: string;
  status: StageStatus;
  details?: string;
  startTime?: number;
  endTime?: number;
}

export interface ProgressState {
  stages: Stage[];
  currentStageIndex: number;
  startTime: number;
  endTime?: number;
  generatedFiles: string[];
}
