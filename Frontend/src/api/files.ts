import { authApi } from '../lib/auth';

export interface PresignRequest {
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface PresignResponse {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

export interface ConfirmRequest {
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export const presignUpload = async (data: PresignRequest): Promise<PresignResponse> => {
  const response = await authApi.post('/files/presign', data);
  return response.data.data || response.data;
};

export const confirmUpload = async (data: ConfirmRequest): Promise<any> => {
  const response = await authApi.post('/files/confirm', data);
  return response.data.data || response.data;
};
