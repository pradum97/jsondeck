export interface WorkspaceInput {
  name: string;
  description?: string;
}

export interface ProjectInput {
  workspaceId: string;
  name: string;
  description?: string;
}

export interface CollectionInput {
  projectId: string;
  name: string;
  description?: string;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface ApiRequestInput {
  collectionId: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  isJson: boolean;
}
