export type FileHint = {
  path: string;
  ext: string;
  firstLine?: string;
};

export interface ProjectSnapshot {
  rootPath: string;
  files: FileHint[];
  extCounts: Record<string, number>;
  manifests: {
    packageJson?: Record<string, unknown> | null;
    pyprojectToml?: string | null;
    goMod?: string | null;
    cargoToml?: string | null;
  };
}
