"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/api";

export type Document = {
  _id: string;
  title: string;
  content?: string;
  projectId: string;
  updatedAt?: string;
};

type DocumentResponse = { document: Document };
type DocumentsResponse = { documents: Document[] };

export const useDocuments = (projectId: string) =>
  useQuery({
    queryKey: ["documents", projectId],
    queryFn: async () => {
      const response = await api.get<DocumentsResponse>("/api/documents", { params: { projectId } });
      return response.data.documents;
    },
    enabled: Boolean(projectId),
  });

export const useDocument = (documentId: string) =>
  useQuery({
    queryKey: ["documents", documentId],
    queryFn: async () => {
      const response = await api.get<DocumentResponse>(`/api/documents/${documentId}`);
      return response.data.document;
    },
    enabled: Boolean(documentId),
  });

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { projectId: string; title: string; content?: string }) => {
      const response = await api.post<DocumentResponse>("/api/documents", input);
      return response.data.document;
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: ["documents", document.projectId] });
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { documentId: string; title?: string; content?: string }) => {
      const response = await api.patch<DocumentResponse>(`/api/documents/${input.documentId}`, {
        title: input.title,
        content: input.content,
      });
      return response.data.document;
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: ["documents", document.projectId] });
      queryClient.invalidateQueries({ queryKey: ["documents", document._id] });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { documentId: string; projectId: string }) => {
      await api.delete(`/api/documents/${input.documentId}`);
      return input;
    },
    onSuccess: (input) => {
      queryClient.invalidateQueries({ queryKey: ["documents", input.projectId] });
    },
  });
};
