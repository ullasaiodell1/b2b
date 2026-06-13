import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile, uploadMulptipleFiles } from "@/services/api/file";

export const uploadFileKeys = {
  all: ['upload'] as const,
  lists: () => [...uploadFileKeys.all, 'list'] as const,
  list: () => [...uploadFileKeys.lists()] as const,
  multiple: () => [...uploadFileKeys.lists(), 'multiple'] as const,
};

export type UploadData = { uri: string; type?: string; fileName?: string } | string;

export const useUpload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: any) => uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadFileKeys.lists() });
    },
  });
};

export const useUploadMultiple = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: any) => uploadMulptipleFiles(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadFileKeys.multiple() });
    },
  });
};