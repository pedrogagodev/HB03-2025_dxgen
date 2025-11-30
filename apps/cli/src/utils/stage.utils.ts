import type { Stage, StageStatus } from "../types/progress.types";

export function initializeStages(): Stage[] {
  return [
    {
      id: "detecting-stack",
      label: "Detecting stack",
      status: "pending",
    },
    {
      id: "indexing",
      label: "Indexing files",
      status: "pending",
    },
    {
      id: "understanding",
      label: "Understanding architecture",
      status: "pending",
    },
    {
      id: "generating",
      label: "Generating documentation",
      status: "pending",
    },
  ];
}

export function getStatusSymbol(status: StageStatus): string {
  switch (status) {
    case "pending":
      return "○";
    case "completed":
      return "✓";
    case "failed":
      return "✗";
    case "in_progress":
      return "◐";
    default:
      return "○";
  }
}

export function getStatusColor(
  status: StageStatus,
): "cyan" | "green" | "red" | "gray" {
  switch (status) {
    case "pending":
      return "gray";
    case "in_progress":
      return "cyan";
    case "completed":
      return "green";
    case "failed":
      return "red";
    default:
      return "gray";
  }
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
