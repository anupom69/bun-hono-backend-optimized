type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

export const createResponse = <T>(
  data?: T,
  message?: string,
  success = true
): ApiResponse<T> => ({
  success,
  ...(data && { data }),
  ...(message && { message }),
});
