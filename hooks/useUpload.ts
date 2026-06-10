import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadFile, uploadMulptipleFiles } from "@/services/api/file";

const uploadFileKeys = {
  all: ['upload'],
  multiple: ['upload', 'multiple'],
}

export type UploadData = { uri: string; type?: string; fileName?: string } | string;

export const useUpload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: any) => uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadFileKeys.all });
    },
  });
};

export const useUploadMultiple = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: any) => uploadMulptipleFiles(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uploadFileKeys.multiple });
    },
  });
};