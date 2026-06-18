import { authApi } from '../lib/auth';

export interface Job {
  id: string;
  status: string;
  fileKey: string;
  caption?: string;
  labels?: string[];
  flagged?: boolean;
  flaggedCategory?: string;
  createdAt: string;
  [key: string]: any;
}

export const getJobs = async (): Promise<Job[]> => {
  const response = await authApi.get('/jobs');
  return response.data.data || response.data;
};

export const getJob = async (id: string): Promise<Job> => {
  const response = await authApi.get(`/jobs/${id}`);
  return response.data.data || response.data;
};

export const createJob = async (fileKey: string): Promise<{ jobId: string, status: string }> => {
  const response = await authApi.post('/jobs', { fileKey });
  return response.data.data || response.data;
};

export const retryJob = async (id: string): Promise<any> => {
  const response = await authApi.post(`/jobs/${id}/retry`);
  return response.data.data || response.data;
};

export const deleteJob = async (id: string): Promise<any> => {
  const response = await authApi.delete(`/jobs/${id}`);
  return response.data.data || response.data;
};
