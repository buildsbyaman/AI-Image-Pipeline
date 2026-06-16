export function createResponse<T>(
  success: boolean,
  message: string,
  data?: T,
  errors?: any[]
) {
  return {
    success,
    message,
    ...(data !== undefined && { data }),
    ...(errors !== undefined && { errors }),
  };
}
