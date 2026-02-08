"use client";

import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";

export type Project = {
  id: string;
  name: string;
  description?: string;
};

const fetchProjects = async (): Promise<Project[]> => {
  const response = await api.get<Project[]>("/api/projects");
  return response.data;
};

export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects
  });
