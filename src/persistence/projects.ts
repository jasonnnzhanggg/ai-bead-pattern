import Dexie, { type Table } from "dexie";
import type { BeadProject } from "../domain/project";

export interface ProjectRepository {
  save(project: BeadProject): Promise<void>;
  load(id: string): Promise<BeadProject | undefined>;
  list(): Promise<BeadProject[]>;
  delete(id: string): Promise<void>;
}

interface StoredImage {
  id: string;
  projectId: string;
  blob: Blob;
}

interface StoredSetting {
  key: string;
  value: unknown;
}

class BeadProjectDatabase extends Dexie {
  projects!: Table<BeadProject, string>;
  images!: Table<StoredImage, string>;
  settings!: Table<StoredSetting, string>;

  constructor(name = "ai-bead-pattern") {
    super(name);
    this.version(1).stores({
      projects: "id, updatedAt",
      images: "id, projectId",
      settings: "key"
    });
  }
}

function cloneProject(project: BeadProject): BeadProject {
  return JSON.parse(JSON.stringify(project)) as BeadProject;
}

class MemoryProjectRepository implements ProjectRepository {
  private readonly projects = new Map<string, BeadProject>();

  async save(project: BeadProject): Promise<void> {
    this.projects.set(project.id, cloneProject(project));
  }

  async load(id: string): Promise<BeadProject | undefined> {
    const project = this.projects.get(id);
    return project ? cloneProject(project) : undefined;
  }

  async list(): Promise<BeadProject[]> {
    return [...this.projects.values()]
      .map(cloneProject)
      .sort((left, right) => right.updatedAt - left.updatedAt);
  }

  async delete(id: string): Promise<void> {
    this.projects.delete(id);
  }
}

class DexieProjectRepository implements ProjectRepository {
  constructor(private readonly database = new BeadProjectDatabase()) {}

  async save(project: BeadProject): Promise<void> {
    await this.database.projects.put(cloneProject(project));
  }

  async load(id: string): Promise<BeadProject | undefined> {
    const project = await this.database.projects.get(id);
    return project ? cloneProject(project) : undefined;
  }

  async list(): Promise<BeadProject[]> {
    const projects = await this.database.projects
      .orderBy("updatedAt")
      .reverse()
      .toArray();
    return projects.map(cloneProject);
  }

  async delete(id: string): Promise<void> {
    await this.database.transaction(
      "rw",
      this.database.projects,
      this.database.images,
      async () => {
        await this.database.projects.delete(id);
        await this.database.images.where("projectId").equals(id).delete();
      }
    );
  }
}

export function createProjectRepository(): ProjectRepository {
  if (typeof indexedDB === "undefined") {
    return new MemoryProjectRepository();
  }
  return new DexieProjectRepository();
}

export function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.code === 22)
  );
}

export function createAutoSave(
  repository: ProjectRepository,
  delayMs = 500,
  onQuotaExceeded?: (project: BeadProject) => void
) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return {
    schedule(project: BeadProject) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        void repository.save(project).catch((error: unknown) => {
          if (isQuotaError(error)) {
            onQuotaExceeded?.(project);
            return;
          }
          throw error;
        });
      }, delayMs);
    },
    cancel() {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    }
  };
}
