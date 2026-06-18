import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, getJob, createJob, retryJob, deleteJob } from '../api/jobs';
import { presignUpload, confirmUpload } from '../api/files';
import axios from 'axios';

export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  });
};

export const useJobDetails = (id: string) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => getJob(id),
    refetchInterval: (query) => {
      const status = query.state?.data?.status;
      if (status === 'COMPLETED' || status === 'FAILED') {
        return false;
      }
      return 5000;
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (fileKey: string) => createJob(fileKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useRetryJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => retryJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', id] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useUploadJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const { key, uploadUrl } = await presignUpload({
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });

      await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      await confirmUpload({
        key,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      });

      return await createJob(key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
