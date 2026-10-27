import createClient from "openapi-fetch";
import type { paths } from "./schema";
import type { InfraList, Profile, Project, ProjectList, SkillList, Workflow } from "./types";

const client = createClient<paths>({ baseUrl: "" });

async function unwrap<T>(
  pending: Promise<{ data?: T; response: Response }>,
): Promise<T> {
  const result = await pending;
  if (result.data === undefined) {
    throw new Error(`The portfolio API returned ${result.response.status}.`);
  }
  return result.data;
}

export function getProfile(): Promise<Profile> {
  return unwrap(client.GET("/api/v1/profile"));
}

export function getProjects(): Promise<ProjectList> {
  return unwrap(client.GET("/api/v1/projects"));
}

export function getProject(slug: string): Promise<Project> {
  return unwrap(client.GET("/api/v1/projects/{slug}", { params: { path: { slug } } }));
}

export function getSkills(): Promise<SkillList> {
  return unwrap(client.GET("/api/v1/skills"));
}

export function getWorkflow(): Promise<Workflow> {
  return unwrap(client.GET("/api/v1/workflow"));
}

export function getInfra(): Promise<InfraList> {
  return unwrap(client.GET("/api/v1/infra"));
}
