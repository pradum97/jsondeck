"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";

export type Project = {
  _id: string;
  name: string;
  description?: string;
  workspaceId: string;
};

type ProjectResponse = { project: Project };
type ProjectsResponse = { projects: Project[] };

export const useProjects = (workspaceId: string) =>
  useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      const response = await api.get<ProjectsResponse>("/api/projects", { params: { workspaceId } });
      return response.data.projects;
    },
    enabled: Boolean(workspaceId),
  });

export const useProject = (projectId: string) =>
  useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const response = await api.get<ProjectResponse>(`/api/projects/${projectId}`);
      return response.data.project;
    },
    enabled: Boolean(projectId),
  });

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { workspaceId: string; name: string; description?: string }) => {
      const response = await api.post<ProjectResponse>("/api/projects", input);
      return response.data.project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects", project.workspaceId] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { projectId: string; name?: string; description?: string }) => {
      const response = await api.patch<ProjectResponse>(`/api/projects/${input.projectId}`, {
        name: input.name,
        description: input.description,
      });
      return response.data.project;
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects", project.workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["projects", project._id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { projectId: string; workspaceId: string }) => {
      await api.delete(`/api/projects/${input.projectId}`);
      return input;
    },
    onSuccess: (input) => {
      queryClient.invalidateQueries({ queryKey: ["projects", input.workspaceId] });
    },
  });
};
