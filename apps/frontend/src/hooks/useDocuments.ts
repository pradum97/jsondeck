"use client";

import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";

export type Document = {
  id: string;
  title: string;
  updatedAt?: string;
};

const fetchDocuments = async (): Promise<Document[]> => {
  const response = await api.get<Document[]>("/api/documents");
  return response.data;
};

export const useDocuments = () =>
  useQuery({
    queryKey: ["documents"],
    queryFn: fetchDocuments
  });
